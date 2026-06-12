'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      // Provide specific, actionable error messages
      const msg = error.message?.toLowerCase() ?? ''
      
      if (msg.includes('origin')) {
        setError('Origem não autorizada. Atualize a página e tente novamente.')
      } else if (msg.includes('invalid') && msg.includes('password')) {
        setError('Senha incorreta. Verifique e tente novamente.')
      } else if (msg.includes('invalid') && (msg.includes('credential') || msg.includes('email or password'))) {
        setError('Email ou senha incorretos. Verifique e tente novamente.')
      } else if (msg.includes('user') && msg.includes('not found')) {
        setError('Email não cadastrado. Verifique ou crie uma conta.')
      } else if (msg.includes('invalid email') || msg.includes('valid email')) {
        setError('Email inválido. Verifique o formato.')
      } else if (msg.includes('already') || msg.includes('exists')) {
        setError('Este email já está cadastrado. Faça login ou recupere a senha.')
      } else if (msg.includes('rate') || msg.includes('limit') || msg.includes('too many')) {
        setError('Muitas tentativas. Aguarde alguns minutos.')
      } else if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('8'))) {
        setError('Senha muito fraca. Use pelo menos 8 caracteres.')
      } else if (msg.includes('network') || msg.includes('connection') || msg.includes('fetch')) {
        setError('Erro de conexão. Verifique sua internet.')
      } else {
        setError(error.message ?? 'Erro ao processar. Tente novamente.')
      }
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6 bg-card border-border">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ChartIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">TradingBook</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp
              ? 'Crie sua conta para começar'
              : 'Entre para acessar sua plataforma'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-input"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              {!isSignUp && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
            {loading
              ? 'Aguarde...'
              : isSignUp
                ? 'Criar conta'
                : 'Entrar'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Entrar' : 'Criar conta'}
          </Link>
        </p>
      </Card>
    </main>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}
