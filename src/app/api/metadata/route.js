import { NextResponse } from 'next/server';

export async function GET() {
    // Estos datos podrían venir de la base de datos
    const metadata = {
        orderStates: [
            { id: 'pending_payment', label: 'Pendiente de pago' },
            { id: 'paid', label: 'Pagado' },
            { id: 'preparing', label: 'Preparando' },
            { id: 'ready_pickup', label: 'Listo para retirar' },
            { id: 'shipped', label: 'Enviado' },
            { id: 'delivered', label: 'Entregado' },
            { id: 'cancelled', label: 'Cancelado' }
        ],
        paymentMethods: [
            { id: 'cash', label: 'Efectivo' },
            { id: 'transfer', label: 'Transferencia' },
            { id: 'mercadopago', label: 'MercadoPago' }
        ],
        shippingMethods: [
            { id: 'pickup', label: 'Retiro en local' },
            { id: 'delivery', label: 'Envío a domicilio' }
        ]
    };

    return NextResponse.json(metadata);
}