'use server'

import { resetTokenStore } from '@/lib/auth'

// Get reset status: whether the email was sent, with fallback link if not
export async function getResetLinkForDev(
  email: string
): Promise<{ url: string; emailSent: boolean } | null> {
  const data = resetTokenStore.get(email)
  if (!data || data.expiresAt < new Date()) {
    return null
  }
  return { url: data.url, emailSent: data.emailSent }
}

// Clear reset token after use
export async function clearResetToken(email: string): Promise<void> {
  resetTokenStore.delete(email)
}
