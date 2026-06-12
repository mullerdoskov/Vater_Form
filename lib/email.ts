import { Resend } from 'resend'

/**
 * Email service using Resend.
 * Requires RESEND_API_KEY env var.
 *
 * Sender uses Resend's shared onboarding domain by default so it works
 * immediately without verifying a custom domain. To use your own domain,
 * verify it in resend.com and update SENDER_EMAIL.
 */

const SENDER_EMAIL = 'TradingBook <onboarding@resend.dev>'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend()

  if (!resend) {
    return {
      sent: false,
      error: 'RESEND_API_KEY não configurado',
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
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

    if (error) {
      console.log('[v0] Resend send error:', error.message)
      return { sent: false, error: error.message }
    }

    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao enviar email'
    console.log('[v0] Email send error:', message)
    return { sent: false, error: message }
  }
}
