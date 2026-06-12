'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock market data - in production, this would come from an API
const marketData = {
  brasil: {
    label: 'Brasil',
    indices: [
      { ticker: 'IBOV', name: 'Ibovespa', value: 128450, change: 1.23, currency: 'pts' },
      { ticker: 'IFIX', name: 'Índice FIIs', value: 3215, change: 0.45, currency: 'pts' },
      { ticker: 'SMLL', name: 'Small Caps', value: 2089, change: -0.32, currency: 'pts' },
      { ticker: 'IDIV', name: 'Dividendos', value: 7654, change: 0.87, currency: 'pts' },
      { ticker: 'IFNC', name: 'Financeiro', value: 12340, change: 1.56, currency: 'pts' },
      { ticker: 'ICON', name: 'Consumo', value: 4567, change: -0.21, currency: 'pts' },
    ],
    stocks: [
      { ticker: 'PETR4', name: 'Petrobras PN', value: 38.45, change: 2.34 },
      { ticker: 'VALE3', name: 'Vale ON', value: 68.90, change: -1.12 },
      { ticker: 'ITUB4', name: 'Itaú PN', value: 32.15, change: 0.89 },
      { ticker: 'BBDC4', name: 'Bradesco PN', value: 15.78, change: -0.45 },
      { ticker: 'ABEV3', name: 'Ambev ON', value: 12.34, change: 0.23 },
      { ticker: 'WEGE3', name: 'WEG ON', value: 42.56, change: 1.67 },
      { ticker: 'RENT3', name: 'Localiza ON', value: 56.78, change: -0.89 },
      { ticker: 'MGLU3', name: 'Magazine Luiza ON', value: 2.45, change: 3.45 },
    ],
  },
  eua: {
    label: 'Estados Unidos',
    indices: [
      { ticker: 'SPX', name: 'S&P 500', value: 5234.18, change: 0.45, currency: 'pts' },
      { ticker: 'NDX', name: 'Nasdaq 100', value: 18567.23, change: 0.89, currency: 'pts' },
      { ticker: 'DJI', name: 'Dow Jones', value: 39876.54, change: 0.23, currency: 'pts' },
      { ticker: 'RUT', name: 'Russell 2000', value: 2087.45, change: -0.34, currency: 'pts' },
      { ticker: 'VIX', name: 'Volatility Index', value: 14.56, change: -2.34, currency: 'pts' },
    ],
    stocks: [
      { ticker: 'AAPL', name: 'Apple', value: 189.45, change: 1.23 },
      { ticker: 'MSFT', name: 'Microsoft', value: 425.67, change: 0.56 },
      { ticker: 'GOOGL', name: 'Alphabet', value: 156.78, change: -0.34 },
      { ticker: 'AMZN', name: 'Amazon', value: 178.90, change: 2.12 },
      { ticker: 'NVDA', name: 'NVIDIA', value: 875.34, change: 3.45 },
      { ticker: 'META', name: 'Meta', value: 498.76, change: 1.89 },
      { ticker: 'TSLA', name: 'Tesla', value: 178.45, change: -1.56 },
      { ticker: 'JPM', name: 'JPMorgan', value: 198.23, change: 0.67 },
    ],
  },
  europa: {
    label: 'Europa',
    indices: [
      { ticker: 'FTSE', name: 'FTSE 100', value: 8234.56, change: 0.34, currency: 'pts' },
      { ticker: 'DAX', name: 'DAX 40', value: 18567.89, change: 0.67, currency: 'pts' },
      { ticker: 'CAC', name: 'CAC 40', value: 8123.45, change: -0.23, currency: 'pts' },
      { ticker: 'STOXX', name: 'Euro Stoxx 50', value: 5012.34, change: 0.45, currency: 'pts' },
    ],
  },
  asia: {
    label: 'Ásia',
    indices: [
      { ticker: 'N225', name: 'Nikkei 225', value: 38567.89, change: 1.23, currency: 'pts' },
      { ticker: 'HSI', name: 'Hang Seng', value: 17234.56, change: -0.89, currency: 'pts' },
      { ticker: 'SHCOMP', name: 'Shanghai Composite', value: 3089.45, change: 0.34, currency: 'pts' },
      { ticker: 'KOSPI', name: 'KOSPI', value: 2678.90, change: 0.56, currency: 'pts' },
    ],
  },
  commodities: {
    label: 'Commodities',
    indices: [
      { ticker: 'CL', name: 'Petróleo WTI', value: 78.45, change: 1.23, currency: 'USD' },
      { ticker: 'GC', name: 'Ouro', value: 2345.67, change: 0.45, currency: 'USD' },
      { ticker: 'SI', name: 'Prata', value: 28.56, change: -0.34, currency: 'USD' },
      { ticker: 'HG', name: 'Cobre', value: 4.23, change: 0.89, currency: 'USD' },
      { ticker: 'ZS', name: 'Soja', value: 1156.78, change: -1.23, currency: 'USD' },
      { ticker: 'ZC', name: 'Milho', value: 456.34, change: 0.67, currency: 'USD' },
      { ticker: 'KC', name: 'Café', value: 234.56, change: 2.34, currency: 'USD' },
      { ticker: 'NG', name: 'Gás Natural', value: 2.89, change: -0.56, currency: 'USD' },
    ],
  },
  moedas: {
    label: 'Moedas',
    indices: [
      { ticker: 'USDBRL', name: 'Dólar/Real', value: 4.9745, change: -0.23, currency: 'BRL' },
      { ticker: 'EURBRL', name: 'Euro/Real', value: 5.4123, change: 0.12, currency: 'BRL' },
      { ticker: 'EURUSD', name: 'Euro/Dólar', value: 1.0876, change: 0.08, currency: 'USD' },
      { ticker: 'GBPUSD', name: 'Libra/Dólar', value: 1.2654, change: -0.15, currency: 'USD' },
      { ticker: 'USDJPY', name: 'Dólar/Iene', value: 154.67, change: 0.34, currency: 'JPY' },
      { ticker: 'BTCUSD', name: 'Bitcoin/Dólar', value: 67845.23, change: 2.56, currency: 'USD' },
    ],
  },
  etfs: {
    label: 'ETFs',
    indices: [
      { ticker: 'BOVA11', name: 'ETF Ibovespa', value: 128.45, change: 1.23, currency: 'BRL' },
      { ticker: 'IVVB11', name: 'ETF S&P 500', value: 298.67, change: 0.56, currency: 'BRL' },
      { ticker: 'HASH11', name: 'ETF Crypto', value: 45.23, change: 3.45, currency: 'BRL' },
      { ticker: 'GOLD11', name: 'ETF Ouro', value: 12.34, change: 0.23, currency: 'BRL' },
      { ticker: 'SPY', name: 'SPDR S&P 500', value: 523.45, change: 0.45, currency: 'USD' },
      { ticker: 'QQQ', name: 'Invesco QQQ', value: 452.67, change: 0.89, currency: 'USD' },
      { ticker: 'IWM', name: 'iShares Russell 2000', value: 208.34, change: -0.34, currency: 'USD' },
      { ticker: 'GLD', name: 'SPDR Gold', value: 217.89, change: 0.34, currency: 'USD' },
    ],
  },
}

type MarketRegion = keyof typeof marketData

export function MarketsContent() {
  const [activeRegion, setActiveRegion] = useState<MarketRegion>('brasil')
  const [searchTerm, setSearchTerm] = useState('')

  const formatValue = (value: number, currency?: string) => {
    if (currency === 'pts') {
      return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
    }
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    }
    if (currency === 'JPY') {
      return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 2 }).format(value)
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const regionData = marketData[activeRegion]

  // Filter by search term
  const filteredIndices = regionData.indices.filter(
    item => item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredStocks = 'stocks' in regionData 
    ? regionData.stocks.filter(
        item => item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mercados</h1>
          <p className="text-muted-foreground">Índices e ativos globais</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            placeholder="Buscar ticker ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-input"
          />
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(marketData).map(([key, data]) => (
          <Button
            key={key}
            variant={activeRegion === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveRegion(key as MarketRegion)}
          >
            {data.label}
          </Button>
        ))}
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {regionData.indices.slice(0, 6).map((item) => (
          <Card key={item.ticker} className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">{item.ticker}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${item.change >= 0 ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
                {formatChange(item.change)}
              </span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {formatValue(item.value, item.currency)}
            </p>
            <p className="text-xs text-muted-foreground truncate">{item.name}</p>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indices */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Índices - {regionData.label}</h2>
          <div className="space-y-1">
            {filteredIndices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum índice encontrado</p>
            ) : (
              filteredIndices.map((item) => (
                <div 
                  key={item.ticker} 
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-bold">{item.ticker.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.ticker}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{formatValue(item.value, item.currency)}</p>
                    <p className={`text-sm tabular-nums ${item.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatChange(item.change)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Stocks/Assets */}
        {'stocks' in regionData && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold mb-4">Principais Ativos</h2>
            <div className="space-y-1">
              {filteredStocks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum ativo encontrado</p>
              ) : (
                filteredStocks.map((item) => (
                  <div 
                    key={item.ticker} 
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{item.ticker.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.ticker}</p>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums">
                        {activeRegion === 'brasil' 
                          ? formatValue(item.value, 'BRL') 
                          : formatValue(item.value, 'USD')}
                      </p>
                      <p className={`text-sm tabular-nums ${item.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {formatChange(item.change)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {!('stocks' in regionData) && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold mb-4">Resumo do Mercado</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Em Alta</p>
                <p className="text-2xl font-bold text-positive">
                  {regionData.indices.filter(i => i.change > 0).length}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Em Baixa</p>
                <p className="text-2xl font-bold text-negative">
                  {regionData.indices.filter(i => i.change < 0).length}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground">Variação Média</p>
                <p className={`text-2xl font-bold ${
                  regionData.indices.reduce((sum, i) => sum + i.change, 0) / regionData.indices.length >= 0 
                    ? 'text-positive' 
                    : 'text-negative'
                }`}>
                  {formatChange(regionData.indices.reduce((sum, i) => sum + i.change, 0) / regionData.indices.length)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Global Overview */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Visão Global</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(marketData).map(([key, data]) => {
            const avgChange = data.indices.reduce((sum, i) => sum + i.change, 0) / data.indices.length
            return (
              <div 
                key={key}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  activeRegion === key 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-secondary/30 border-border hover:bg-secondary/50'
                }`}
                onClick={() => setActiveRegion(key as MarketRegion)}
              >
                <p className="font-medium text-sm">{data.label}</p>
                <p className={`text-lg font-bold ${avgChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatChange(avgChange)}
                </p>
                <p className="text-xs text-muted-foreground">{data.indices.length} índices</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
