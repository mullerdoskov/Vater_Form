'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StockPosition, DerivativePosition } from '@/lib/db/schema'
import { 
  calculateEWMAVariance, 
  calculateEWMACovarianceMatrix,
  calculateMonteCarloVaR,
  calculateRiskMetrics,
  calculateCorrelationMatrix,
} from '@/lib/risk/var'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

interface RiskContentProps {
  stockPositions: StockPosition[]
  derivativePositions: DerivativePosition[]
  summary: {
    stocks: { totalValue: number }
    derivatives: { totalValue: number }
    total: { totalValue: number }
  }
}

// Mock historical returns for demonstration
function generateMockReturns(numDays: number = 252): number[] {
  const returns: number[] = []
  for (let i = 0; i < numDays; i++) {
    // Random return with slight positive drift and ~20% annual volatility
    const daily = (Math.random() - 0.48) * 0.03
    returns.push(daily)
  }
  return returns
}

export function RiskContent({ 
  stockPositions, 
  derivativePositions,
  summary 
}: RiskContentProps) {
  const [activeView, setActiveView] = useState<'overview' | 'stocks' | 'derivatives' | 'total'>('overview')
  const [confidenceLevel, setConfidenceLevel] = useState<95 | 99>(95)
  const [horizon, setHorizon] = useState<1 | 5 | 10>(1)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const stocksReturns = stockPositions.length > 0 ? generateMockReturns() : []
    const derivativesReturns = derivativePositions.length > 0 ? generateMockReturns() : []
    
    // EWMA volatility
    const stocksEWMAVar = calculateEWMAVariance(stocksReturns)
    const derivativesEWMAVar = calculateEWMAVariance(derivativesReturns)
    
    const stocksVol = Math.sqrt(stocksEWMAVar) * Math.sqrt(252)
    const derivativesVol = Math.sqrt(derivativesEWMAVar) * Math.sqrt(252)
    
    // Portfolio weights
    const totalValue = summary.total.totalValue || 1
    const stocksWeight = summary.stocks.totalValue / totalValue
    const derivativesWeight = summary.derivatives.totalValue / totalValue
    
    // Simplified covariance matrix for 2 asset classes
    const correlation = 0.3 // Assumed correlation between stocks and derivatives
    const covMatrix = [
      [stocksEWMAVar, correlation * Math.sqrt(stocksEWMAVar * derivativesEWMAVar)],
      [correlation * Math.sqrt(stocksEWMAVar * derivativesEWMAVar), derivativesEWMAVar],
    ]
    
    // Monte Carlo VaR
    const var95 = confidenceLevel === 95
    const mcVaR = calculateMonteCarloVaR(
      totalValue,
      [stocksWeight, derivativesWeight],
      covMatrix,
      10000,
      horizon,
      var95 ? 0.95 : 0.99,
      5 // degrees of freedom for t-distribution
    )
    
    // Individual metrics
    const stocksMetrics = calculateRiskMetrics(stocksReturns, summary.stocks.totalValue)
    const derivativesMetrics = calculateRiskMetrics(derivativesReturns, summary.derivatives.totalValue)
    const totalMetrics = calculateRiskMetrics(
      stocksReturns.map((r, i) => r * stocksWeight + (derivativesReturns[i] || 0) * derivativesWeight),
      totalValue
    )

    return {
      stocks: {
        ...stocksMetrics,
        volatility: stocksVol,
        value: summary.stocks.totalValue,
      },
      derivatives: {
        ...derivativesMetrics,
        volatility: derivativesVol,
        value: summary.derivatives.totalValue,
      },
      total: {
        ...totalMetrics,
        var: mcVaR.var,
        cvar: mcVaR.cvar,
        simulations: mcVaR.simulations,
        value: totalValue,
      },
    }
  }, [stockPositions, derivativePositions, summary, confidenceLevel, horizon])

  // Distribution data for chart
  const distributionData = useMemo(() => {
    const bins = 50
    const simulations = riskMetrics.total.simulations || []
    if (simulations.length === 0) return []
    
    const min = Math.min(...simulations)
    const max = Math.max(...simulations)
    const binWidth = (max - min) / bins
    
    const histogram: { range: string; count: number; isVaR: boolean }[] = []
    
    for (let i = 0; i < bins; i++) {
      const start = min + i * binWidth
      const end = start + binWidth
      const count = simulations.filter(s => s >= start && s < end).length
      const isVaR = start <= -(riskMetrics.total.var / riskMetrics.total.value)
      
      histogram.push({
        range: `${(start * 100).toFixed(1)}%`,
        count,
        isVaR,
      })
    }
    
    return histogram
  }, [riskMetrics])

  // EWMA volatility time series
  const volatilityData = useMemo(() => {
    const returns = generateMockReturns(60)
    const data: { day: number; ewmaVol: number }[] = []
    let ewmaVar = returns[0] ** 2
    
    for (let i = 0; i < returns.length; i++) {
      if (i > 0) {
        ewmaVar = 0.94 * ewmaVar + 0.06 * returns[i] ** 2
      }
      data.push({
        day: i + 1,
        ewmaVol: Math.sqrt(ewmaVar) * Math.sqrt(252) * 100,
      })
    }
    
    return data
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Risco</h1>
        <p className="text-muted-foreground">VaR, CVaR e métricas de risco do portfólio</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'overview' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            Visão Geral
          </Button>
          <Button 
            variant={activeView === 'stocks' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('stocks')}
          >
            Ações
          </Button>
          <Button 
            variant={activeView === 'derivatives' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('derivatives')}
          >
            Derivativos
          </Button>
          <Button 
            variant={activeView === 'total' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('total')}
          >
            Portfólio Total
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={confidenceLevel === 95 ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setConfidenceLevel(95)}
          >
            95%
          </Button>
          <Button 
            variant={confidenceLevel === 99 ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setConfidenceLevel(99)}
          >
            99%
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={horizon === 1 ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setHorizon(1)}
          >
            1 dia
          </Button>
          <Button 
            variant={horizon === 5 ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setHorizon(5)}
          >
            5 dias
          </Button>
          <Button 
            variant={horizon === 10 ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setHorizon(10)}
          >
            10 dias
          </Button>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={`VaR ${confidenceLevel}% (${horizon}d)`}
          value={formatCurrency(riskMetrics.total.var)}
          subtitle={`${formatPercent(riskMetrics.total.var / riskMetrics.total.value)} do portfólio`}
          highlight
        />
        <MetricCard
          title={`CVaR ${confidenceLevel}% (${horizon}d)`}
          value={formatCurrency(riskMetrics.total.cvar)}
          subtitle="Expected Shortfall"
          highlight
        />
        <MetricCard
          title="Volatilidade Anual"
          value={formatPercent(riskMetrics.total.volatility)}
          subtitle="EWMA (λ=0.94)"
        />
        <MetricCard
          title="Sharpe Ratio"
          value={riskMetrics.total.sharpeRatio.toFixed(2)}
          subtitle="Risk-free: 10% a.a."
        />
      </div>

      {/* Risk by Asset Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Risco por Classe de Ativo</h2>
          <div className="space-y-4">
            <RiskBar 
              label="Ações"
              value={summary.stocks.totalValue}
              var95={riskMetrics.stocks.var95}
              volatility={riskMetrics.stocks.volatility}
              totalValue={summary.total.totalValue}
            />
            <RiskBar 
              label="Derivativos"
              value={summary.derivatives.totalValue}
              var95={riskMetrics.derivatives.var95}
              volatility={riskMetrics.derivatives.volatility}
              totalValue={summary.total.totalValue}
            />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Métricas Adicionais</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
              <p className="text-xl font-bold text-negative">
                {formatPercent(riskMetrics.total.maxDrawdown)}
              </p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Beta</p>
              <p className="text-xl font-bold">{riskMetrics.total.beta.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">VaR 95%</p>
              <p className="text-xl font-bold">{formatCurrency(riskMetrics.total.var95)}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">VaR 99%</p>
              <p className="text-xl font-bold">{formatCurrency(riskMetrics.total.var99)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monte Carlo Distribution */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Distribuição Monte Carlo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            10.000 simulações com t-Student (df=5)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  interval={9}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count">
                  {distributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isVaR ? 'var(--negative)' : 'var(--primary)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Área vermelha: retornos abaixo do VaR
          </p>
        </Card>

        {/* EWMA Volatility */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Volatilidade EWMA</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Série temporal com λ = 0.94
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volatilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Volatilidade']}
                />
                <Area 
                  type="monotone" 
                  dataKey="ewmaVol" 
                  stroke="var(--primary)" 
                  fill="var(--primary)" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Matriz de Risco/Retorno</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">Carteira</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Valor</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">VaR 95%</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">CVaR 95%</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Volatilidade</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Sharpe</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Max DD</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Ações</td>
                <td className="py-3 text-right tabular-nums">{formatCurrency(riskMetrics.stocks.value)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatCurrency(riskMetrics.stocks.var95)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatCurrency(riskMetrics.stocks.cvar95)}</td>
                <td className="py-3 text-right tabular-nums">{formatPercent(riskMetrics.stocks.volatility)}</td>
                <td className="py-3 text-right tabular-nums">{riskMetrics.stocks.sharpeRatio.toFixed(2)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatPercent(riskMetrics.stocks.maxDrawdown)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Derivativos</td>
                <td className="py-3 text-right tabular-nums">{formatCurrency(riskMetrics.derivatives.value)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatCurrency(riskMetrics.derivatives.var95)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatCurrency(riskMetrics.derivatives.cvar95)}</td>
                <td className="py-3 text-right tabular-nums">{formatPercent(riskMetrics.derivatives.volatility)}</td>
                <td className="py-3 text-right tabular-nums">{riskMetrics.derivatives.sharpeRatio.toFixed(2)}</td>
                <td className="py-3 text-right tabular-nums text-negative">{formatPercent(riskMetrics.derivatives.maxDrawdown)}</td>
              </tr>
              <tr className="bg-secondary/30">
                <td className="py-3 font-bold">Portfólio Total</td>
                <td className="py-3 text-right tabular-nums font-bold">{formatCurrency(riskMetrics.total.value)}</td>
                <td className="py-3 text-right tabular-nums text-negative font-bold">{formatCurrency(riskMetrics.total.var)}</td>
                <td className="py-3 text-right tabular-nums text-negative font-bold">{formatCurrency(riskMetrics.total.cvar)}</td>
                <td className="py-3 text-right tabular-nums font-bold">{formatPercent(riskMetrics.total.volatility)}</td>
                <td className="py-3 text-right tabular-nums font-bold">{riskMetrics.total.sharpeRatio.toFixed(2)}</td>
                <td className="py-3 text-right tabular-nums text-negative font-bold">{formatPercent(riskMetrics.total.maxDrawdown)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  subtitle,
  highlight = false,
}: { 
  title: string
  value: string
  subtitle: string
  highlight?: boolean
}) {
  return (
    <Card className={`p-4 border-border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold tabular-nums mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </Card>
  )
}

function RiskBar({ 
  label, 
  value, 
  var95, 
  volatility, 
  totalValue 
}: { 
  label: string
  value: number
  var95: number
  volatility: number
  totalValue: number
}) {
  const weight = totalValue > 0 ? (value / totalValue) * 100 : 0

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{weight.toFixed(1)}% do portfólio</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all" 
          style={{ width: `${weight}%` }} 
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">VaR 95%: <span className="text-negative">{formatCurrency(var95)}</span></span>
        <span className="text-muted-foreground">Vol: {(volatility * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}
