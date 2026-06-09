import { transporter } from "../config/mailer.js";

export const sendPasswordReset = async (
  to: string,
  token: string,
): Promise<void> => {
  await transporter.sendMail({
    from: `"Mendoza Reporta" <${process.env.BREVO_FROM}>`,
    to: to,
    subject: "Recuperar contraseña",
    text: `Tu código para restablecer la contraseña es: ${token}`,
  });
};

export const sendRegisterCode = async (
  to: string,
  token: string,
): Promise<void> => {
  await transporter.sendMail({
    from: `"Mendoza Reporta" <${process.env.BREVO_FROM}>`,
    to: to,
    subject: "Código de registro",
    text: `Tu código de registro es: ${token}`,
  });
};
