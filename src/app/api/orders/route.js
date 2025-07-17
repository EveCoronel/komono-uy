import connectDB from "@/lib/db";
import { sendBusinessOrderNotification, sendUserOrderConfirmation, sendNewAccountEmail } from "@/lib/serverUtils";
import Counter from "@/models/Counter";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product"; // Asegúrate de importar el modelo

// Helper: compara dos direcciones
function sameAddress(a, b) {
    return (
        (a.direccion?.trim().toLowerCase() === b.direccion?.trim().toLowerCase()) &&
        (a.puerta === b.puerta) &&
        (a.apto === b.apto) &&
        (a.esquinas === b.esquinas) &&
        (a.departamento?.toLowerCase() === b.departamento?.toLowerCase())
    );
}

// Helper: agrega dirección al usuario si no existe
async function addAddressIfNotExists(user, newAddress) {
    if (
        !user.addresses.some((addr) => sameAddress(addr, newAddress))
    ) {
        user.addresses.push(newAddress);
        await user.save();
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        // console.log("Received order data:", data);
        // Buscar usuario por email, o crear uno nuevo (con address si corresponde)
        let user = await User.findOne({ email: data.email });
        if (!user) {
            const addresses = [];
            if (data.envioType === "envio") {
                addresses.push({
                    streetName: data.direccion,
                    streetNumber: data.puerta,
                    apartment: data.apto,
                    crossStreets: data.esquinas,
                    city: data.departamento,
                    deliveryCost: data.envioCost
                });
            }
            const userPassword = `from_order_${Math.random().toString(36).slice(2)}`;
            user = await User.create({
                name: data.name,
                email: data.email,
                number: data.phone || "",
                password: userPassword, // Contraseña dummy para invitados
                addresses,
            });
            await sendNewAccountEmail(user.email, user.name, "Debes actualizar tu contraseña ingresando a Olvide mi contraseña en el login.");
        } else {
            // Si ya existe, agregá dirección si es de envío y no la tiene
            if (data.envioType === "envio") {
                const nuevaDireccion = {
                    streetName: data.direccion,
                    streetNumber: data.puerta,
                    apartment: data.apto,
                    crossStreets: data.esquinas,
                    city: data.departamento,
                    deliveryCost: data.envioCost
                };
                console.log("Nueva dirección:", nuevaDireccion);
                await addAddressIfNotExists(user, nuevaDireccion);
            }
        }

        // Validar stock y disminuirlo
        for (const item of data.cart) {
            const product = await Product.findById(item._id);
            if (!product) {
                return Response.json({ error: `Producto no encontrado: ${item._id}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return Response.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 });
            }
        }

        // Disminuir stock
        for (const item of data.cart) {
            await Product.findByIdAndUpdate(
                item._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        let orderNumber;
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'orderNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        orderNumber = orderNumber = counter && counter.seq ? counter.seq : 100;
        console.log("Order number:", orderNumber);
        // Crear la orden
        const order = await Order.create({
            user: user._id,
            orderNumber: orderNumber,
            products: data.cart.map(item => ({
                productId: item._id,
                quantity: item.quantity,
            })),
            deliveryType: data.envioType === "retiro" ? "pickup" : "delivery",
            pickupPoint: data.envioType === "retiro" ? data.puntoRetiro : undefined,
            paymentMethod: data.paymentMethod,
            address: data.envioType === "envio" ? {
                streetName: data.direccion,
                streetNumber: data.puerta,
                apartment: data.apto,
                crossStreets: data.esquinas,
                city: data.departamento,
                deliveryCost: data.envioCost,
            } : undefined,
            total: data.total
        });
        console.log("data", data);
        // Email: detalle de productos

        await sendBusinessOrderNotification(order, data);
        // Email al usuario
        await sendUserOrderConfirmation(order, data);

        return Response.json({ ok: true, orderId: order._id });
    } catch (err) {
        console.error(err);
        return Response.json(
            { error: "Error al procesar la orden" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("id");
        if (orderId) {
            const order = await Order.findById(orderId).populate("user", "name email number addresses");
            if (!order) {
                return Response.json({ error: "Orden no encontrada" }, { status: 404 });
            }
        } else {
            const orders = await Order.find({})
                .sort({ createdAt: -1 })
                .populate("user", "name email number addresses")
                .populate("products.productId", "name images price sale_price stock sale_effective_period");
            return Response.json(orders);
        }
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Error al obtener la orden" }, { status: 500 });
    }
}