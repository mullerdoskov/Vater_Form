'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StockTrade, DerivativeTrade } from '@/lib/db/schema'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface PnlContentProps {
  stockTrades: StockTrade[]
  derivativeTrades: DerivativeTrade[]
  summary: {
    stocks: { totalValue: number }
    derivatives: { totalValue: number }
    total: { totalValue: number }
  }
}

interface PnlEntry {
  date: string
  ticker: string
  type: 'stock' | 'derivative'
  realized: number
  unrealized: number
  fees: number
  net: number
}

// Generate mock P&L data based on trades
function generatePnlData(stockTrades: StockTrade[], derivativeTrades: DerivativeTrade[]): PnlEntry[] {
  const entries: PnlEntry[] = []
  
  stockTrades.forEach(trade => {
    const realized = trade.type === 'SELL' 
      ? Number(trade.totalValue) * (0.05 + Math.random() * 0.15) * (Math.random() > 0.3 ? 1 : -1)
      : 0
    const unrealized = trade.type === 'BUY'
      ? Number(trade.totalValue) * (Math.random() * 0.2 - 0.1)
      : 0
    
    entries.push({
      date: new Date(trade.tradeDate).toISOString().split('T')[0],
      ticker: trade.ticker,
      type: 'stock',
      realized,
      unrealized,
      fees: Number(trade.fees || 0),
      net: realized + unrealized - Number(trade.fees || 0),
    })
  })
  
  derivativeTrades.forEach(trade => {
    const realized = trade.type === 'SELL'
      ? Number(trade.totalValue) * (0.1 + Math.random() * 0.3) * (Math.random() > 0.4 ? 1 : -1)
      : 0
    const unrealized = trade.type === 'BUY'
      ? Number(trade.totalValue) * (Math.random() * 0.4 - 0.2)
      : 0
    
    entries.push({
      date: new Date(trade.tradeDate).toISOString().split('T')[0],
      ticker: trade.ticker,
      type: 'derivative',
      realized,
      unrealized,
      fees: Number(trade.fees || 0),
      net: realized + unrealized - Number(trade.fees || 0),
    })
  })
  
  return entries.sort((a, b) => a.date.localeCompare(b.date))
}

// Generate monthly P&L
function generateMonthlyPnl(entries: PnlEntry[]) {
  const months: Record<string, { month: string; realized: number; unrealized: number; fees: number; net: number }> = {}
  
  // Last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    months[monthKey] = { month: monthKey, realized: 0, unrealized: 0, fees: 0, net: 0 }
  }
  
  entries.forEach(entry => {
    const date = new Date(entry.date)
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    if (months[monthKey]) {
      months[monthKey].realized += entry.realized
      months[monthKey].unrealized += entry.unrealized
      months[monthKey].fees += entry.fees
      months[monthKey].net += entry.net
    }
  })
  
  return Object.values(months)
}

// Generate cumulative P&L
function generateCumulativePnl(monthlyData: { month: string; net: number }[]) {
  let cumulative = 0
  return monthlyData.map(m => {
    cumulative += m.net
    return { month: m.month, cumulative }
  })
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function PnlContent({ stockTrades, derivativeTrades, summary }: PnlContentProps) {
  const [activeView, setActiveView] = useState<'overview' | 'stocks' | 'derivatives' | 'fees'>('overview')
  const [period, setPeriod] = useState<'mtd' | 'ytd' | '12m' | 'all'>('ytd')

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

  // P&L calculations
  const pnlData = useMemo(() => {
    const entries = generatePnlData(stockTrades, derivativeTrades)
    const monthlyPnl = generateMonthlyPnl(entries)
    const cumulativePnl = generateCumulativePnl(monthlyPnl)
    
    const totals = {
      realized: entries.reduce((sum, e) => sum + e.realized, 0),
      unrealized: entries.reduce((sum, e) => sum + e.unrealized, 0),
      fees: entries.reduce((sum, e) => sum + e.fees, 0),
      net: entries.reduce((sum, e) => sum + e.net, 0),
    }
    
    const stockEntries = entries.filter(e => e.type === 'stock')
    const derivativeEntries = entries.filter(e => e.type === 'derivative')
    
    const stockTotals = {
      realized: stockEntries.reduce((sum, e) => sum + e.realized, 0),
      unrealized: stockEntries.reduce((sum, e) => sum + e.unrealized, 0),
      fees: stockEntries.reduce((sum, e) => sum + e.fees, 0),
      net: stockEntries.reduce((sum, e) => sum + e.net, 0),
    }
    
    const derivativeTotals = {
      realized: derivativeEntries.reduce((sum, e) => sum + e.realized, 0),
      unrealized: derivativeEntries.reduce((sum, e) => sum + e.unrealized, 0),
      fees: derivativeEntries.reduce((sum, e) => sum + e.fees, 0),
      net: derivativeEntries.reduce((sum, e) => sum + e.net, 0),
    }
    
    // P&L by ticker
    const byTicker: Record<string, { ticker: string; net: number; count: number }> = {}
    entries.forEach(e => {
      if (!byTicker[e.ticker]) {
        byTicker[e.ticker] = { ticker: e.ticker, net: 0, count: 0 }
      }
      byTicker[e.ticker].net += e.net
      byTicker[e.ticker].count++
    })
    
    return {
      entries,
      monthlyPnl,
      cumulativePnl,
      totals,
      stockTotals,
      derivativeTotals,
      byTicker: Object.values(byTicker).sort((a, b) => b.net - a.net),
    }
  }, [stockTrades, derivativeTrades])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Ações', value: Math.abs(pnlData.stockTotals.net), actual: pnlData.stockTotals.net },
      { name: 'Derivativos', value: Math.abs(pnlData.derivativeTotals.net), actual: pnlData.derivativeTotals.net },
    ].filter(d => d.value > 0)
  }, [pnlData])

  const returnOnCapital = summary.total.totalValue > 0 
    ? pnlData.totals.net / summary.total.totalValue 
    : 0

  if (stockTrades.length === 0 && derivativeTrades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">P&L e Controladoria</h1>
          <p className="text-muted-foreground">Lucros, perdas e análise de resultado</p>
        </div>
        <Card className="p-8 bg-card border-border">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Registre operações no Book para visualizar o P&L.
            </p>
            <Button asChild>
              <a href="/book">Ir para Book de Operações</a>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">P&L e Controladoria</h1>
          <p className="text-muted-foreground">Lucros, perdas e análise de resultado</p>
        </div>
        <div className="flex gap-2">
          {(['mtd', 'ytd', '12m', 'all'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'mtd' ? 'MTD' : p === 'ytd' ? 'YTD' : p === '12m' ? '12M' : 'Total'}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={`p-4 border-border ${pnlData.totals.net >= 0 ? 'bg-positive/10' : 'bg-negative/10'}`}>
          <p className="text-sm text-muted-foreground">P&L Total</p>
          <p className={`text-2xl font-bold tabular-nums ${pnlData.totals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrency(pnlData.totals.net)}
          </p>
          <p className={`text-sm ${returnOnCapital >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatPercent(returnOnCapital)} sobre capital
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground">Realizado</p>
          <p className={`text-2xl font-bold tabular-nums ${pnlData.totals.realized >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrency(pnlData.totals.realized)}
          </p>
          <p className="text-sm text-muted-foreground">lucros/perdas fechados</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground">Não Realizado</p>
          <p className={`text-2xl font-bold tabular-nums ${pnlData.totals.unrealized >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrency(pnlData.totals.unrealized)}
          </p>
          <p className="text-sm text-muted-foreground">marcação a mercado</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground">Custos e Taxas</p>
          <p className="text-2xl font-bold tabular-nums text-negative">
            {formatCurrency(-pnlData.totals.fees)}
          </p>
          <p className="text-sm text-muted-foreground">corretagem, emol., taxas</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-sm text-muted-foreground">Capital Investido</p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(summary.total.totalValue)}
          </p>
          <p className="text-sm text-muted-foreground">{stockTrades.length + derivativeTrades.length} operações</p>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        <Button variant={activeView === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('overview')}>
          Visão Geral
        </Button>
        <Button variant={activeView === 'stocks' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('stocks')}>
          Ações
        </Button>
        <Button variant={activeView === 'derivatives' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('derivatives')}>
          Derivativos
        </Button>
        <Button variant={activeView === 'fees' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('fees')}>
          Custos
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">P&L Mensal</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData.monthlyPnl}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                />
                <Bar dataKey="net">
                  {pnlData.monthlyPnl.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.net >= 0 ? 'var(--positive)' : 'var(--negative)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cumulative P&L */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">P&L Acumulado</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlData.cumulativePnl}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Acumulado']}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Asset Class */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">P&L por Classe de Ativo</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Ações</p>
              <p className={`text-xl font-bold tabular-nums ${pnlData.stockTotals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(pnlData.stockTotals.net)}
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Derivativos</p>
              <p className={`text-xl font-bold tabular-nums ${pnlData.derivativeTotals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(pnlData.derivativeTotals.net)}
              </p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, actual }) => `${name}: ${formatCurrency(actual)}`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: { payload: { actual: number } }) => [
                    formatCurrency(props.payload.actual),
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Ranking de Ativos</h2>
          <div className="space-y-2">
            {pnlData.byTicker.slice(0, 8).map((item, index) => (
              <div key={item.ticker} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-mono font-medium">{item.ticker}</span>
                </div>
                <div className="text-right">
                  <p className={`font-bold tabular-nums ${item.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {formatCurrency(item.net)}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.count} ops</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Detalhamento</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">Categoria</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Realizado</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Não Realizado</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">Custos</th>
                <th className="pb-3 text-muted-foreground font-medium text-right">P&L Líquido</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Ações</td>
                <td className={`py-3 text-right tabular-nums ${pnlData.stockTotals.realized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.stockTotals.realized)}
                </td>
                <td className={`py-3 text-right tabular-nums ${pnlData.stockTotals.unrealized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.stockTotals.unrealized)}
                </td>
                <td className="py-3 text-right tabular-nums text-negative">
                  {formatCurrency(-pnlData.stockTotals.fees)}
                </td>
                <td className={`py-3 text-right tabular-nums font-medium ${pnlData.stockTotals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.stockTotals.net)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Derivativos</td>
                <td className={`py-3 text-right tabular-nums ${pnlData.derivativeTotals.realized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.derivativeTotals.realized)}
                </td>
                <td className={`py-3 text-right tabular-nums ${pnlData.derivativeTotals.unrealized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.derivativeTotals.unrealized)}
                </td>
                <td className="py-3 text-right tabular-nums text-negative">
                  {formatCurrency(-pnlData.derivativeTotals.fees)}
                </td>
                <td className={`py-3 text-right tabular-nums font-medium ${pnlData.derivativeTotals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.derivativeTotals.net)}
                </td>
              </tr>
              <tr className="bg-secondary/30">
                <td className="py-3 font-bold">Total</td>
                <td className={`py-3 text-right tabular-nums font-bold ${pnlData.totals.realized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.totals.realized)}
                </td>
                <td className={`py-3 text-right tabular-nums font-bold ${pnlData.totals.unrealized >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.totals.unrealized)}
                </td>
                <td className="py-3 text-right tabular-nums font-bold text-negative">
                  {formatCurrency(-pnlData.totals.fees)}
                </td>
                <td className={`py-3 text-right tabular-nums font-bold ${pnlData.totals.net >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(pnlData.totals.net)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
