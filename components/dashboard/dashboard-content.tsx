'use client'

import { Card } from '@/components/ui/card'
import type { StockPosition, DerivativePosition } from '@/lib/db/schema'

interface DashboardContentProps {
  userName: string
  summary: {
    stocks: {
      positions: number
      totalValue: number
      unrealizedPnl: number
      realizedPnl: number
    }
    derivatives: {
      positions: number
      totalValue: number
      unrealizedPnl: number
      realizedPnl: number
    }
    total: {
      positions: number
      totalValue: number
      unrealizedPnl: number
      realizedPnl: number
    }
  }
  stockPositions: StockPosition[]
  derivativePositions: DerivativePosition[]
}

export function DashboardContent({ 
  userName, 
  summary,
  stockPositions,
  derivativePositions,
}: DashboardContentProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  const totalPnl = summary.total.unrealizedPnl + summary.total.realizedPnl

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {userName.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Visão geral do seu portfólio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Patrimônio Total"
          value={formatCurrency(summary.total.totalValue)}
          subtitle={`${summary.total.positions} posições`}
          color="blue"
          icon={<WalletIcon className="w-5 h-5" />}
        />
        <SummaryCard
          title="P&L Total"
          value={formatCurrency(totalPnl)}
          color={totalPnl >= 0 ? 'green' : 'red'}
          subtitle={summary.total.totalValue > 0 
            ? formatPercent((totalPnl / summary.total.totalValue) * 100) 
            : '0%'}
          icon={totalPnl >= 0 ? <TrendUpIcon className="w-5 h-5" /> : <TrendDownIcon className="w-5 h-5" />}
        />
        <SummaryCard
          title="Carteira de Ações"
          value={formatCurrency(summary.stocks.totalValue)}
          subtitle={`${summary.stocks.positions} ativos`}
          color="cyan"
          icon={<LayersIcon className="w-5 h-5" />}
        />
        <SummaryCard
          title="Carteira de Derivativos"
          value={formatCurrency(summary.derivatives.totalValue)}
          subtitle={`${summary.derivatives.positions} contratos`}
          color="violet"
          icon={<ZapIcon className="w-5 h-5" />}
        />
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Positions */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Posições em Ações</h2>
            <span className="text-sm text-muted-foreground">{stockPositions.length} ativos</span>
          </div>
          
          {stockPositions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Nenhuma posição em ações. Registre sua primeira operação no Book.
            </p>
          ) : (
            <div className="space-y-3">
              {stockPositions.slice(0, 5).map((pos) => (
                <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{pos.ticker}</p>
                    <p className="text-sm text-muted-foreground">
                      {pos.quantity} @ {formatCurrency(Number(pos.averagePrice))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatCurrency(Number(pos.totalCost))}</p>
                    <p className={`text-sm tabular-nums ${Number(pos.realizedPnl || 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(Number(pos.realizedPnl || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Derivative Positions */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Posições em Derivativos</h2>
            <span className="text-sm text-muted-foreground">{derivativePositions.length} contratos</span>
          </div>
          
          {derivativePositions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Nenhuma posição em derivativos. Registre sua primeira operação no Book.
            </p>
          ) : (
            <div className="space-y-3">
              {derivativePositions.slice(0, 5).map((pos) => (
                <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{pos.ticker}</p>
                    <p className="text-sm text-muted-foreground">
                      {pos.derivativeType} | {pos.quantity} @ {formatCurrency(Number(pos.averagePrice))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatCurrency(Number(pos.totalCost))}</p>
                    <p className={`text-sm tabular-nums ${Number(pos.realizedPnl || 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(Number(pos.realizedPnl || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            title="Registrar Operação"
            description="Adicionar nova compra ou venda"
            href="/book"
            icon={<PlusIcon className="w-5 h-5" />}
            color="green"
          />
          <QuickActionCard
            title="Análise de Risco"
            description="VaR, CVaR e métricas"
            href="/risk"
            icon={<ShieldIcon className="w-5 h-5" />}
            color="red"
          />
          <QuickActionCard
            title="Otimização"
            description="Markowitz e alocação"
            href="/portfolio"
            icon={<ChartIcon className="w-5 h-5" />}
            color="violet"
          />
          <QuickActionCard
            title="Ver Mercados"
            description="Índices globais"
            href="/markets"
            icon={<GlobeIcon className="w-5 h-5" />}
            color="amber"
          />
        </div>
      </Card>
    </div>
  )
}

type StatColor = 'blue' | 'green' | 'red' | 'amber' | 'violet' | 'cyan'

const colorMap: Record<StatColor, { box: string; text: string }> = {
  blue: { box: 'stat-blue', text: 'text-info' },
  green: { box: 'stat-green', text: 'text-positive' },
  red: { box: 'stat-red', text: 'text-negative' },
  amber: { box: 'stat-amber', text: 'text-warning' },
  violet: { box: 'stat-violet', text: 'text-violet' },
  cyan: { box: 'stat-cyan', text: 'text-cyan' },
}

function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  icon,
}: { 
  title: string
  value: string
  subtitle: string
  color?: StatColor
  icon?: React.ReactNode
}) {
  const c = colorMap[color]

  return (
    <div className={`stat-box ${c.box} rounded-xl p-4 pl-5`}>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground/80">{title}</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-foreground">{value}</p>
          <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50 text-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  href, 
  icon,
  color = 'blue',
}: { 
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color?: StatColor
}) {
  const c = colorMap[color]
  return (
    <a 
      href={href}
      className={`stat-box ${c.box} flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-transform hover:-translate-y-0.5`}
    >
      <div className={`relative w-11 h-11 rounded-full bg-background/40 flex items-center justify-center ${c.text}`}>
        {icon}
      </div>
      <div className="relative">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
