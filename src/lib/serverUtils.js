import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const DOMAIN_URL = process.env.DOMAIN_URL || "https://komono-uy.com";

const isSale = (item) => {
  if (!item.sale_price || !item.sale_effective_period) return false;
  const now = Date.now();
  const start = new Date(item.sale_effective_period.start).getTime();
  const end = new Date(item.sale_effective_period.end).getTime();
  return now >= start && now <= end;
};

const funPaddedNumber = (num) => num.toString().padStart(5, "0");

const getProductsHtml = (products) => {
  return products
    .map(
      (item) =>
        `<li style="display:flex;align-items:center;margin-bottom:12px;">
        <img 
          src="${item.images?.[0] || 'https://via.placeholder.com/40x40?text=No+Img'}" 
          alt="${item.name}" 
          style="width:44px;height:44px;object-fit:cover;border-radius:8px;margin-right:14px;border:1px solid #e5e7eb;box-shadow:0 1px 3px #0001;"
        />
        <div>
          <div style="font-weight:500;color:#111;">${item.name} <span style="color:#475569;font-weight:400;">x${item.quantity}</span></div>
          <div style="font-size:0.95rem;color:#444;">$${isSale(item) ? item.sale_price : item.price}</div>
        </div></li>`
    )
    .join("");
};

const getDeliveryDetailsHTML = (data) => {
  return data.envioType === "retiro"
    ? `<p><b>Punto de retiro:</b> ${data.puntoRetiro}</p>`
    : `<p><b>Dirección:</b> ${data.direccion} N°${data.puerta} ${data.apto ? "Apto " + data.apto : ""} (${data.esquinas}) - ${data.departamento}</p>
           <p><b>Costo de envío:</b> $${data.envioCost}</p>`;
}

export async function sendUserOrderConfirmation(order, data) {
  try {
    const paddedNumber = funPaddedNumber(order.orderNumber);

    let clientHTML = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;padding:32px 24px;border-radius:14px;border:1px solid #eee;">
    <div style="text-align:center;">
      <img src="https://res.cloudinary.com/dqmsvs28j/image/upload/v1752360388/LogoKomono_10_gksvf3.png" alt="KOMONO UY" style="max-width:96px;margin-bottom:16px;" />
      <h2 style="color:#171717;font-size:2rem;margin:12px 0 4px;">¡Gracias por tu compra!</h2>
      <div style="margin:16px 0;">
        <span style="display:inline-block;font-weight:600;font-size:1.1rem;color:#fff;background:#1e293b;padding:8px 20px;border-radius:8px;letter-spacing:2px;">
          N° de pedido: <span style="font-size:1.3rem;letter-spacing:2px;">#${paddedNumber}</span>
        </span>
      </div>
    </div>
    <p style="margin-top:16px;">Hola <b>${data.name}</b>, recibimos tu pedido correctamente.<br>
    Pronto nos pondremos en contacto para coordinar el pago y el envío.</p>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
    <div>
      <p style="font-weight:600;margin-bottom:4px;">Detalle de tu pedido:</p>
      <ul style="padding-left:18px;margin:0 0 8px 0;color:#475569;">
        ${getProductsHtml(data.cart)}
      </ul>
      ${data.discount ? `<p style="margin:0 0 8px 0;"><b>Descuento aplicado:</b> $${data.discount}</p>` : ""}
      <p style="margin:10px 0 0 0;"><b>Total:</b> $${data.total}</p>
      <div style="margin-top:6px;">${getDeliveryDetailsHTML(data)}</div>
    </div>
    <hr style="margin:24px 0 16px 0;border:none;border-top:1px solid #e5e7eb;">
    <p style="font-size:1rem;margin:10px 0 0 0;">
      Ante cualquier consulta, respondé a este mail o escribinos por 
      <a href="https://www.instagram.com/komono.uy" style="color:#16a34a;text-decoration:none;font-weight:500;">Instagram</a>.
    </p>
    <div style="color:#a3a3a3;font-size:0.85rem;margin-top:24px;">KOMONO UY - Pins, llaveros y papelería con onda</div>
  </div>`

    let resp = await transporter.sendMail({
      from: '"KOMONO UY" <ec.business.ia@gmail.com>',
      to: data.email,
      subject: "¡Recibimos tu pedido en KOMONO UY!",
      html: clientHTML,
    });
    console.log("Order confirmation email sent:", resp.messageId);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function sendBusinessOrderNotification(order, data) {
  try {
    const paddedNumber = funPaddedNumber(order.orderNumber);
    const productsHtml = getProductsHtml(data.cart);
    const deliveryDetailsHTML = getDeliveryDetailsHTML(data);

    let resp = await transporter.sendMail({
      from: '"Nueva orden KOMONO UY" <ec.business.ia@gmail.com>',
      to: "ec.business.ia@gmail.com",
      subject: "Nueva orden recibida",
      html: `
        <h2>Nueva orden</h2>
        <p><b>Cliente:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Teléfono:</b> ${data.phone}</p>
        <p><b>Tipo de envío:</b> ${data.envioType}</p>
        ${deliveryDetailsHTML}
        <p><b>Productos:</b></p>
        <ul>${productsHtml}</ul>
        <p><b>Total:</b> $${data.total}</p>
        <p><b>Fecha:</b> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><b>ID de la orden:</b> ${paddedNumber}</p>
      `,
    });
    console.log("Business order notification email sent:", resp.messageId);

  } catch (error) {
    console.error("Error sending business order notification email:", error);
  }
}

export async function sendNewAccountEmail(email, name, additionalMessage = "") {
  try {
    const clientHTML = `
      <html lang="es" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <title>¡Bienvenido a KOMONO UY!</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
  </head>
  <body style="margin:0; padding:0; background-color:#f7fafc;">
    <table width="100%" bgcolor="#f7fafc" cellpadding="0" cellspacing="0" style="padding: 32px 0;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:32px 0 16px 0;max-width:600px;">
            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom:16px;">
                <img src="https://res.cloudinary.com/dqmsvs28j/image/upload/v1752360388/LogoKomono_10_gksvf3.png" alt="KOMONO UY" width="120" style="display:block;border-radius:8px;" />
              </td>
            </tr>
            <!-- Title -->
            <tr>
              <td align="center" style="font-family:Arial, Helvetica, sans-serif; color:#111827;">
                <h1 style="margin:0 0 8px 0; font-size:28px;">¡Bienvenido a KOMONO UY!</h1>
                <p style="margin:0 0 16px 0; font-size:17px;color:#4B5563;">
                  Hola <b>${name}</b>,<br/>
                  ¡Tu cuenta ha sido creada con éxito! <br/>
                  Nos alegra tenerte en nuestra comunidad 😊
                </p>
                ${additionalMessage ? `<p style="color:#6B7280;font-size:14px;">${additionalMessage}</p>` : ""}
              </td>
            </tr>
            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding:24px 0 24px 0;">
                <a href="${DOMAIN_URL}" 
                   style="background:#111827;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-family:Arial,sans-serif;display:inline-block;">
                  Ir a la tienda
                </a>
              </td>
            </tr>
            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none;border-top:1px solid #e5e7eb; margin:16px 0;">
              </td>
            </tr>
            <!-- Info -->
            <tr>
              <td align="center" style="font-family:Arial, Helvetica, sans-serif; color:#6b7280;font-size:14px;padding:0 40px;">
                Si tienes dudas, puedes responder a este email o contactarnos en nuestras redes.<br>
                ¡Que disfrutes tu experiencia!
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td align="center" style="padding:30px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#b0b0b0;">
                © 2025 KOMONO UY<br>
                <a href="${DOMAIN_URL}" style="color:#9ca3af;text-decoration:none;">www.komono-uy.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    let resp = await transporter.sendMail({
      from: '"KOMONO UY" <ec.business.ia@gmail.com>',
      to: email,
      subject: "¡Bienvenido a KOMONO UY!",
      html: clientHTML,
    });
    console.log("New account email sent:", resp.messageId);
  } catch (error) {
    console.error("Error sending new account email:", error);
  }
}


export async function sendPasswordResetEmail(email, resetLink) {
  try {
    const passwordHTML = `<html lang="es" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <title>Restablecé tu contraseña</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0; padding:0; background-color:#f7fafc;">
  <table width="100%" bgcolor="#f7fafc" cellpadding="0" cellspacing="0" style="padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:32px 0 16px 0;max-width:600px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src="https://res.cloudinary.com/dqmsvs28j/image/upload/v1752360388/LogoKomono_10_gksvf3.png" alt="KOMONO UY" width="120" style="display:block;border-radius:8px;" />
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td align="center" style="font-family:Arial, Helvetica, sans-serif; color:#111827;">
              <h1 style="margin:0 0 8px 0; font-size:26px;">¿Olvidaste tu contraseña?</h1>
              <p style="margin:0 0 16px 0; font-size:17px;color:#4B5563;">
                Hola!,<br/>
                Recibimos una solicitud para restablecer tu contraseña. <br/>
                Podés crear una nueva haciendo clic en el siguiente botón:
              </p>
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:24px 0 24px 0;">
              <a href="${resetLink}" 
                 style="background:#111827;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-family:Arial,sans-serif;display:inline-block;">
                Restablecer contraseña
              </a>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td>
              <hr style="border:none;border-top:1px solid #e5e7eb; margin:16px 0;">
            </td>
          </tr>
          <!-- Info -->
          <tr>
            <td align="center" style="font-family:Arial, Helvetica, sans-serif; color:#6b7280;font-size:14px;padding:0 40px;">
              Si no solicitaste este cambio, podés ignorar este correo.<br>
              Tu contraseña actual seguirá funcionando.
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:30px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#b0b0b0;">
              © 2025 KOMONO UY<br>
              <a href="${DOMAIN_URL}" style="color:#9ca3af;text-decoration:none;">www.komono-uy.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    let resp = await transporter.sendMail({
      from: '"KOMONO UY" <ec.business.ia@gmail.com>',
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: passwordHTML,
    });
    console.log("New account email sent:", resp.messageId);
  } catch (error) {
    console.error("Error sending new account email:", error);
  }
}

export async function sendNotificationEmail({ email, type, message, orderNumber }) {
  try {
    // Define título y mensaje según el tipo de notificación
    let title = "Notificación de KOMONO UY";
    let body = message;

    if (type === "order_status") {
      title = "Actualización de tu pedido";
      body = `Tu pedido${orderNumber ? ` #${orderNumber}` : ""} ha cambiado de estado.<br>${message}`;
    } else if (type === "promo") {
      title = "¡Nueva promoción disponible!";
      body = message;
    } else if (type === "reminder") {
      title = "Recordatorio";
      body = message;
    }
    // Puedes agregar más tipos según tu lógica

    const notificationHTML = `
      <html lang="es" style="margin:0;padding:0;">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
      </head>
      <body style="margin:0; padding:0; background-color:#f7fafc;">
        <table width="100%" bgcolor="#f7fafc" cellpadding="0" cellspacing="0" style="padding: 32px 0;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:32px 0 16px 0;max-width:600px;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <img src="https://res.cloudinary.com/dqmsvs28j/image/upload/v1752360388/LogoKomono_10_gksvf3.png" alt="KOMONO UY" width="120" style="display:block;border-radius:8px;" />
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td align="center" style="font-family:Arial, Helvetica, sans-serif; color:#111827;">
                    <h1 style="margin:0 0 8px 0; font-size:22px;">${title}</h1>
                    <p style="margin:0 0 16px 0; font-size:16px;color:#4B5563;">
                      ${body}
                    </p>
                  </td>
                </tr>
                <!-- Divider -->
                <tr>
                  <td>
                    <hr style="border:none;border-top:1px solid #e5e7eb; margin:16px 0;">
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding:20px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#b0b0b0;">
                    © 2025 KOMONO UY<br>
                    <a href="${DOMAIN_URL}" style="color:#9ca3af;text-decoration:none;">www.komono-uy.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    let resp = await transporter.sendMail({
      from: '"KOMONO UY" <ec.business.ia@gmail.com>',
      to: email,
      subject: title,
      html: notificationHTML,
    });
    console.log("Notification email sent:", resp.messageId);
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
}