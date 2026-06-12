import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

// Fallback store: if email sending fails (or EMAIL_PASSWORD is not set),
// the reset link is shown in the UI so the user is never locked out.
export const resetTokenStore = new Map<string, { url: string; email: string; expiresAt: Date; emailSent: boolean }>()

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // Send the reset email from atlas.energy@hotmail.com
      const result = await sendPasswordResetEmail(user.email, url)

      // Always keep the link available as a fallback so the user
      // is never locked out if email delivery fails.
      resetTokenStore.set(user.email, {
        url,
        email: user.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        emailSent: result.sent,
      })

      if (!result.sent) {
        console.log(`[v0] Email not sent (${result.error}). Fallback link for ${user.email}: ${url}`)
      }
    },
  },
  trustedOrigins: [
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // Wildcard patterns are matched against the URL HOST only (no protocol),
    // so these must NOT include "https://".
    '*.vusercontent.net',
    '*.v0.dev',
    '*.vercel.app',
    'http://localhost:3000',
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
