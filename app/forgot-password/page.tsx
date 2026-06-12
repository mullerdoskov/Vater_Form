'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { getResetLinkForDev } from '@/app/actions/password-reset'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setResetLink(null)
    setLoading(true)

    try {
      const { error: authError } = await authClient.forgetPassword({
        email,
        redirectTo: '/reset-password',
      })

      if (authError) {
        // Provide specific error messages
        const msg = authError.message?.toLowerCase() ?? ''
        if (msg.includes('origin')) {
          setError('Origem não autorizada. Atualize a página e tente novamente.')
        } else if (msg.includes('not found') || msg.includes('user')) {
          setError('Email não encontrado. Verifique se digitou corretamente.')
        } else if (msg.includes('rate') || msg.includes('limit') || msg.includes('too many')) {
          setError('Muitas tentativas. Aguarde alguns minutos.')
        } else if (msg.includes('invalid email') || msg.includes('valid email')) {
          setError('Email inválido. Verifique o formato.')
        } else {
          setError(authError.message ?? 'Erro ao processar. Tente novamente.')
        }
        setLoading(false)
        return
      }

      setSuccess(true)

      // Check whether the email was actually sent; if not, show fallback link
      await new Promise(resolve => setTimeout(resolve, 500))
      const result = await getResetLinkForDev(email)
      if (result) {
        setEmailSent(result.emailSent)
        if (!result.emailSent) {
          setResetLink(result.url)
        }
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6 bg-card border-border">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.68_0.22_300)] flex items-center justify-center shadow-lg">
              <KeyIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">TradingBook</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Recuperar senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Digite seu email para receber o link de recuperação
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
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
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="stat-box stat-green rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-positive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {emailSent ? 'Email enviado!' : 'Solicitação processada!'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {emailSent
                      ? 'Enviamos o link de recuperação de atlas.energy@hotmail.com. Verifique sua caixa de entrada e spam.'
                      : 'Use o link abaixo para redefinir sua senha.'}
                  </p>
                </div>
              </div>
            </div>
            
            {resetLink && (
              <div className="stat-box stat-blue rounded-lg p-4">
                <p className="text-xs font-medium text-info mb-2">
                  O envio de email não está configurado - Clique para redefinir:
                </p>
                <a 
                  href={resetLink} 
                  className="text-sm text-primary hover:underline break-all font-medium"
                >
                  Redefinir minha senha
                </a>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSuccess(false)
                setResetLink(null)
                setEmailSent(false)
                setEmail('')
              }}
              className="w-full"
            >
              Enviar para outro email
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center mt-6">
          Lembrou a senha?{' '}
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

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
