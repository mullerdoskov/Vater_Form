'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check if token exists
  const hasToken = Boolean(token)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    // Validate minimum length
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    // Validate password strength
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('A senha deve conter letras maiúsculas, minúsculas e números.')
      return
    }

    if (!token) {
      setError('Token não encontrado. Solicite um novo link.')
      return
    }

    setLoading(true)

    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (authError) {
        // Provide specific error messages
        const msg = authError.message?.toLowerCase() ?? ''
        if (msg.includes('expired') || msg.includes('expirado')) {
          setError('Link expirado. Solicite um novo link de recuperação.')
        } else if (msg.includes('invalid') || msg.includes('token')) {
          setError('Link inválido. Verifique se copiou o link completo ou solicite um novo.')
        } else if (msg.includes('used') || msg.includes('already')) {
          setError('Este link já foi utilizado. Solicite um novo link.')
        } else if (msg.includes('password') && msg.includes('weak')) {
          setError('Senha muito fraca. Use uma senha mais forte.')
        } else {
          setError(authError.message ?? 'Erro ao redefinir senha. Tente novamente.')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    }

    setLoading(false)
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-svh bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm p-6 bg-card border-border">
          <div className="stat-box stat-green rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckIcon className="w-6 h-6 text-positive shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Senha alterada!</p>
                <p className="text-sm text-foreground/80">
                  Sua senha foi redefinida com sucesso. Faça login com a nova senha.
                </p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/sign-in">Ir para o login</Link>
          </Button>
        </Card>
      </main>
    )
  }

  // No token state
  if (!hasToken) {
    return (
      <main className="min-h-svh bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm p-6 bg-card border-border">
          <div className="stat-box stat-red rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <XIcon className="w-6 h-6 text-negative shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Link incompleto</p>
                <p className="text-sm text-foreground/80">
                  O link de recuperação está incompleto. Verifique se copiou o link inteiro do email.
                </p>
              </div>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Solicitar novo link</Link>
          </Button>
        </Card>
      </main>
    )
  }

  // Form state
  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6 bg-card border-border">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.68_0.22_300)] flex items-center justify-center shadow-lg">
              <LockIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">TradingBook</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Nova senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina uma nova senha para sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Use letras maiúsculas, minúsculas e números
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Digite novamente"
              className="bg-input"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          <Link
            href="/forgot-password"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Solicitar novo link
          </Link>
          {' · '}
          <Link
            href="/sign-in"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </Card>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-svh bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm p-6 bg-card border-border text-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <p className="text-muted-foreground mt-4">Carregando...</p>
        </Card>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
