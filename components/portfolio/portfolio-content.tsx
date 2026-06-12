'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StockPosition, DerivativePosition } from '@/lib/db/schema'
import {
  generateEfficientFrontier,
  maxSharpePortfolio,
  minimumVariancePortfolio,
  calculateRiskContribution,
} from '@/lib/portfolio/markowitz'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Cell,
  ComposedChart,
  Area,
} from 'recharts'

interface PortfolioContentProps {
  stockPositions: StockPosition[]
  derivativePositions: DerivativePosition[]
  summary: {
    stocks: { totalValue: number }
    derivatives: { totalValue: number }
    total: { totalValue: number }
  }
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Generate mock monthly data for demonstration
function generateMonthlyData() {
  let accumulated = 0
  return MONTHS.map((month, i) => {
    const gainLossPct = (Math.random() - 0.4) * 30 // -12% to +18%
    const gainLoseValue = (Math.random() - 0.4) * 5000
    accumulated += gainLoseValue
    return {
      month,
      gainLossPct: Math.round(gainLossPct * 10) / 10,
      gainLoseValue: Math.round(gainLoseValue),
      accumulated: Math.round(accumulated),
    }
  })
}

// Generate mock sector data
function generateSectorData() {
  return [
    { sector: 'Financeiro', value: 3012, pct: 30 },
    { sector: 'Energia', value: -401, pct: -7 },
    { sector: 'Tecnologia', value: 1523, pct: 17 },
    { sector: 'Consumo', value: 694, pct: 11 },
  ]
}

// Mock data for expected returns and covariance
function generateMockPortfolioData(positions: StockPosition[]) {
  const tickers = positions.map(p => p.ticker)
  const n = tickers.length
  
  const expectedReturns = tickers.map(() => 0.05 + Math.random() * 0.20)
  
  const covMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        covMatrix[i][j] = 0.04 + Math.random() * 0.08
      } else {
        const correlation = 0.2 + Math.random() * 0.4
        const vol_i = Math.sqrt(covMatrix[i][i] || 0.06)
        const vol_j = Math.sqrt(covMatrix[j][j] || 0.06)
        covMatrix[i][j] = correlation * vol_i * vol_j
        covMatrix[j][i] = covMatrix[i][j]
      }
    }
  }
  
  const totalValue = positions.reduce((sum, p) => sum + Number(p.totalCost), 0)
  const weights = positions.map(p => totalValue > 0 ? Number(p.totalCost) / totalValue : 1 / n)
  
  return { tickers, expectedReturns, covMatrix, weights }
}

export function PortfolioContent({
  stockPositions,
  derivativePositions,
  summary,
}: PortfolioContentProps) {
  const [riskFreeRate, setRiskFreeRate] = useState(10)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedOptimization, setSelectedOptimization] = useState<'current' | 'minVar' | 'maxSharpe'>('current')

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
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  }

  // Monthly data
  const monthlyData = useMemo(() => generateMonthlyData(), [])
  const sectorData = useMemo(() => generateSectorData(), [])

  // Portfolio data
  const portfolioData = useMemo(() => {
    if (stockPositions.length === 0) {
      return null
    }
    return generateMockPortfolioData(stockPositions)
  }, [stockPositions])

  // Efficient frontier
  const efficientFrontier = useMemo(() => {
    if (!portfolioData) return []
    return generateEfficientFrontier(
      portfolioData.expectedReturns,
      portfolioData.covMatrix,
      portfolioData.tickers,
      50,
      riskFreeRate / 100
    )
  }, [portfolioData, riskFreeRate])

  // Optimized portfolios
  const optimizedPortfolios = useMemo(() => {
    if (!portfolioData) return null
    
    const minVar = minimumVariancePortfolio(
      portfolioData.covMatrix,
      portfolioData.tickers
    )
    
    const maxSharpe = maxSharpePortfolio(
      portfolioData.expectedReturns,
      portfolioData.covMatrix,
      portfolioData.tickers,
      riskFreeRate / 100
    )
    
    let currentReturn = 0
    let currentVariance = 0
    const n = portfolioData.weights.length
    
    for (let i = 0; i < n; i++) {
      currentReturn += portfolioData.weights[i] * portfolioData.expectedReturns[i]
      for (let j = 0; j < n; j++) {
        currentVariance += portfolioData.weights[i] * portfolioData.weights[j] * portfolioData.covMatrix[i][j]
      }
    }
    
    const currentVol = Math.sqrt(currentVariance)
    const currentSharpe = currentVol > 0 ? (currentReturn - riskFreeRate / 100) / currentVol : 0
    
    const currentWeights: Record<string, number> = {}
    portfolioData.tickers.forEach((ticker, i) => {
      currentWeights[ticker] = portfolioData.weights[i]
    })
    
    return {
      current: {
        weights: currentWeights,
        expectedReturn: currentReturn,
        volatility: currentVol,
        sharpeRatio: currentSharpe,
      },
      minVar,
      maxSharpe,
    }
  }, [portfolioData, riskFreeRate])

  // Risk contribution
  const riskContribution = useMemo(() => {
    if (!portfolioData || !optimizedPortfolios) return null
    
    const selectedWeights = selectedOptimization === 'current' 
      ? portfolioData.weights
      : selectedOptimization === 'minVar'
        ? portfolioData.tickers.map(t => optimizedPortfolios.minVar.weights[t] || 0)
        : portfolioData.tickers.map(t => optimizedPortfolios.maxSharpe.weights[t] || 0)
    
    return calculateRiskContribution(
      selectedWeights,
      portfolioData.covMatrix,
      portfolioData.tickers
    )
  }, [portfolioData, optimizedPortfolios, selectedOptimization])

  const selectedPortfolio = optimizedPortfolios 
    ? optimizedPortfolios[selectedOptimization]
    : null

  // Stocks for horizontal bar chart
  const stockBarData = useMemo(() => {
    return stockPositions.map(pos => {
      const purchasePrice = Number(pos.averagePrice)
      const currentPrice = purchasePrice * (1 + (Math.random() - 0.3) * 0.4)
      const changeInPrice = currentPrice - purchasePrice
      return {
        ticker: pos.ticker,
        purchasePrice: Math.round(purchasePrice * 100) / 100,
        changeInPrice: Math.round(changeInPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
      }
    }).slice(0, 10)
  }, [stockPositions])

  // Summary calculations
  const totalInvested = summary.stocks.totalValue
  const uniqueSectors = 4
  const totalStocks = stockPositions.length
  const currentPriceAvg = stockPositions.length > 0 
    ? stockPositions.reduce((sum, p) => sum + Number(p.averagePrice), 0) / stockPositions.length 
    : 0
  const totalGainLoss = monthlyData.reduce((sum, m) => sum + m.gainLoseValue, 0)
  const totalGainLossPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  if (stockPositions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Portfolio Analysis</h1>
          <p className="text-muted-foreground">Markowitz e alocação eficiente</p>
        </div>
        <Card className="p-8 bg-card border-border">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Adicione posições em ações no Book de Operações para utilizar a análise de portfólio.
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Investment Portfolio Analysis</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="riskFree" className="text-sm whitespace-nowrap">Taxa Livre (SELIC):</Label>
            <Input
              id="riskFree"
              type="number"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(Number(e.target.value))}
              className="w-16 bg-input h-8 text-sm"
              min={0}
              max={30}
              step={0.5}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* Top row: Summary cards + Month selector + Bar chart */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Summary Cards */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          {/* Sectors & Stocks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-box stat-blue rounded-lg p-3 pl-4">
              <p className="text-xs text-foreground/70 font-medium">Setores</p>
              <p className="text-3xl font-bold text-foreground">{uniqueSectors}</p>
            </div>
            <div className="stat-box stat-cyan rounded-lg p-3 pl-4">
              <p className="text-xs text-foreground/70 font-medium">Ações</p>
              <p className="text-3xl font-bold text-foreground">{totalStocks}</p>
            </div>
          </div>

          {/* Current Price & Total Invested */}
          <div className="stat-box stat-violet rounded-lg p-3 pl-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-foreground/70 font-medium">Preço Médio</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(currentPriceAvg)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/70 font-medium">Total Investido</p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
            </div>
          </div>

          {/* Gain/Loss */}
          <div className={`stat-box ${totalGainLoss >= 0 ? 'stat-green' : 'stat-red'} rounded-lg p-3 pl-4`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-foreground/70 font-medium">Gain/Loss Valor</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {formatCurrency(Math.abs(totalGainLoss))}
                  </p>
                  {totalGainLoss >= 0 ? (
                    <ArrowUpIcon className="w-5 h-5 text-positive" />
                  ) : (
                    <ArrowDownIcon className="w-5 h-5 text-negative" />
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/70 font-medium">Gain/Loss %</p>
                <p className={`text-xl font-bold tabular-nums ${totalGainLossPct >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {totalGainLossPct >= 0 ? '+' : ''}{totalGainLossPct.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="col-span-12 lg:col-span-2">
          <Card className="p-3 bg-card border-border h-full">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Meses</p>
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                  className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedMonth === month
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Horizontal Bar Chart: Purchase Price vs Change */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="p-4 bg-card border-border h-full">
            <div className="flex items-center gap-4 mb-2">
              <p className="text-sm font-semibold text-foreground">Preço de Compra vs Variação</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-primary/80" />
                  Preço de Compra
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-positive" />
                  Variação +
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-negative" />
                  Variação -
                </span>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis 
                    dataKey="ticker" 
                    type="category" 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'purchasePrice' ? 'Preço Compra' : 'Variação'
                    ]}
                  />
                  <Bar dataKey="purchasePrice" stackId="a" fill="oklch(0.70 0.20 240 / 0.8)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="changeInPrice" stackId="a" radius={[0, 4, 4, 0]}>
                    {stockBarData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.changeInPrice >= 0 ? 'oklch(0.72 0.24 150)' : 'oklch(0.65 0.26 25)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Middle row: Gain/Loss % Analysis + Accumulated Growth + Sector */}
      <div className="grid grid-cols-12 gap-4">
        {/* Gain/Loss % Analysis */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm font-semibold text-foreground mb-3">
              <span className="text-positive">Gain</span> / <span className="text-negative">Loss</span> % Análise
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Variação']}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" />
                  <Bar dataKey="gainLossPct" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gainLossPct >= 0 ? 'oklch(0.72 0.24 150)' : 'oklch(0.65 0.26 25)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Accumulated Growth */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm font-semibold text-foreground mb-3">Crescimento Acumulado</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.72 0.24 150)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="oklch(0.72 0.24 150)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Acumulado']}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" />
                  <Area 
                    type="monotone" 
                    dataKey="accumulated" 
                    fill="url(#accGradient)" 
                    stroke="oklch(0.72 0.24 150)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accumulated" 
                    stroke="oklch(0.72 0.24 150)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.72 0.24 150)', r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Gain/Loss by Sector */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm font-semibold text-foreground mb-3">
              <span className="text-positive">Gain</span> / <span className="text-negative">Loss</span> por Setor
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="sector" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      'Valor'
                    ]}
                  />
                  <ReferenceLine y={0} stroke="var(--muted-foreground)" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value >= 0 ? 'oklch(0.72 0.24 150)' : 'oklch(0.65 0.26 25)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Optimization Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-sm text-muted-foreground mr-2">Otimização:</span>
        <Button
          size="sm"
          variant={selectedOptimization === 'current' ? 'default' : 'outline'}
          onClick={() => setSelectedOptimization('current')}
        >
          Carteira Atual
        </Button>
        <Button
          size="sm"
          variant={selectedOptimization === 'minVar' ? 'default' : 'outline'}
          onClick={() => setSelectedOptimization('minVar')}
        >
          Mínima Variância
        </Button>
        <Button
          size="sm"
          variant={selectedOptimization === 'maxSharpe' ? 'default' : 'outline'}
          onClick={() => setSelectedOptimization('maxSharpe')}
        >
          Máximo Sharpe
        </Button>
      </div>

      {/* Data Table */}
      <Card className="p-4 bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary/30">
                <th className="px-3 py-2 text-left font-semibold text-foreground bg-primary/10">Ticker</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground bg-cyan-500/10">Setor</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-violet-500/10">Qtd</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-blue-500/10">Preço Compra</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-blue-500/10">Total Investido</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-amber-500/10">Preço Atual</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-amber-500/10">Variação Preço</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-green-500/10">Valor Atual</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground bg-green-500/10">Acum. Crescimento</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground">Gain/Loss</th>
                <th className="px-3 py-2 text-right font-semibold text-foreground">Gain/Loss %</th>
              </tr>
            </thead>
            <tbody>
              {stockPositions.map((pos, idx) => {
                const purchasePrice = Number(pos.averagePrice)
                const qty = Number(pos.quantity)
                const totalInv = Number(pos.totalCost)
                const currentPrice = purchasePrice * (1 + (Math.random() - 0.3) * 0.4)
                const priceChange = currentPrice - purchasePrice
                const grossValue = currentPrice * qty
                const accGrowth = grossValue - totalInv
                const gainLoss = accGrowth
                const gainLossPct = totalInv > 0 ? (gainLoss / totalInv) * 100 : 0
                const sectors = ['Financeiro', 'Energia', 'Tecnologia', 'Consumo', 'Saúde']
                const sector = sectors[idx % sectors.length]

                return (
                  <tr 
                    key={pos.id} 
                    className={`border-b border-border/30 hover:bg-secondary/30 transition-colors ${
                      idx % 2 === 0 ? 'bg-secondary/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground">{pos.ticker}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{sector}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{qty}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(purchasePrice)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(totalInv)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(currentPrice)}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${priceChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium">{formatCurrency(grossValue)}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${accGrowth >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(accGrowth)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        gainLoss >= 0 
                          ? 'bg-positive/20 text-positive' 
                          : 'bg-negative/20 text-negative'
                      }`}>
                        {gainLoss >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                        {formatCurrency(Math.abs(gainLoss))}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-right tabular-nums font-bold ${
                      gainLossPct >= 0 ? 'text-positive' : 'text-negative'
                    }`}>
                      {gainLossPct >= 0 ? '+' : ''}{gainLossPct.toFixed(0)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Optimization Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <h2 className="text-sm font-semibold mb-3">Comparação de Alocações</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-muted-foreground font-medium">Ativo</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Atual</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Mín Var</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Max Sharpe</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData?.tickers.map((ticker) => (
                  <tr key={ticker} className="border-b border-border/30">
                    <td className="py-2 font-medium">{ticker}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatPercent(optimizedPortfolios?.current.weights[ticker] || 0)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatPercent(optimizedPortfolios?.minVar.weights[ticker] || 0)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatPercent(optimizedPortfolios?.maxSharpe.weights[ticker] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <h2 className="text-sm font-semibold mb-3">Métricas das Carteiras</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-muted-foreground font-medium">Métrica</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Atual</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Mín Var</th>
                  <th className="pb-2 text-muted-foreground font-medium text-right">Max Sharpe</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-2 font-medium">Retorno Esperado</td>
                  <td className="py-2 text-right tabular-nums text-positive">
                    {formatPercent(optimizedPortfolios?.current.expectedReturn || 0)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-positive">
                    {formatPercent(optimizedPortfolios?.minVar.expectedReturn || 0)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-positive">
                    {formatPercent(optimizedPortfolios?.maxSharpe.expectedReturn || 0)}
                  </td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 font-medium">Volatilidade</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPercent(optimizedPortfolios?.current.volatility || 0)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-info font-medium">
                    {formatPercent(optimizedPortfolios?.minVar.volatility || 0)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPercent(optimizedPortfolios?.maxSharpe.volatility || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Sharpe Ratio</td>
                  <td className="py-2 text-right tabular-nums">
                    {optimizedPortfolios?.current.sharpeRatio.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {optimizedPortfolios?.minVar.sharpeRatio.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2 text-right tabular-nums text-primary font-bold">
                    {optimizedPortfolios?.maxSharpe.sharpeRatio.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
