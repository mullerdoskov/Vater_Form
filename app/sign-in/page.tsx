import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// TEMPORARY one-time recovery fix: sets a Better Auth-compatible (scrypt)
// password hash for the locked-out account. Idempotent — only writes when
// the stored hash differs. Remove after the user confirms login works.
const RECOVERY_EMAIL = 'lucasalmir.gigante@hotmail.com'
const RECOVERY_HASH =
  '44c9e01edab79c3cfa4e638d475fbddc:2c2ab64c94b0b33d83de2efdd2afae136713fb9019915749157ac437ca13ea212a7378c1b4bfbb2891c48cc52636915fcb2dc37cfe3dba9a280dc8786604bc31'

async function applyRecoveryFix() {
  try {
    await db.execute(
      sql`UPDATE "account"
          SET "password" = ${RECOVERY_HASH}
          WHERE "userId" = (SELECT id FROM "user" WHERE email = ${RECOVERY_EMAIL})
            AND ("password" IS DISTINCT FROM ${RECOVERY_HASH})`
    )
  } catch {
    // Never block the sign-in page if the fix fails
  }
}

export default async function SignInPage() {
  await applyRecoveryFix()

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')
  
  return <AuthForm mode="sign-in" />
}
