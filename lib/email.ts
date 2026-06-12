import nodemailer from 'nodemailer'

/**
 * Email service using Outlook/Hotmail SMTP
 * Sender: atlas.energy@hotmail.com
 *
 * Requires EMAIL_PASSWORD env var (the Hotmail account password
 * or an app password if 2FA is enabled on the account).
 */

const SENDER_EMAIL = 'atlas.energy@hotmail.com'
const SENDER_NAME = 'TradingBook'

function getTransporter() {
  if (!process.env.EMAIL_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: SENDER_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter()

  if (!transporter) {
    return {
      sent: false,
      error: 'EMAIL_PASSWORD não configurado',
    }
  }

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject: 'Recuperação de senha - TradingBook',
      text: `Você solicitou a recuperação de senha da sua conta TradingBook.\n\nAcesse o link abaixo para redefinir sua senha (válido por 1 hora):\n${resetUrl}\n\nSe você não solicitou esta recuperação, ignore este email.`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0a0e1a; color: #e8eaf0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #111627; padding: 24px 32px; border-bottom: 3px solid #2563eb;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff;">TradingBook</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; font-size: 18px; color: #ffffff;">Recuperação de senha</h2>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #b8bdcc;">
              Você solicitou a recuperação de senha da sua conta TradingBook.
              Clique no botão abaixo para redefinir sua senha. O link é válido por 1 hora.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold;">
              Redefinir senha
            </a>
            <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.6; color: #6b7186;">
              Se o botão não funcionar, copie e cole este link no navegador:<br />
              <a href="${resetUrl}" style="color: #60a5fa; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="margin: 24px 0 0; font-size: 12px; color: #6b7186;">
              Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá inalterada.
            </p>
          </div>
        </div>
      `,
    })

    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao enviar email'
    console.log('[v0] Email send error:', message)
    return { sent: false, error: message }
  }
}
