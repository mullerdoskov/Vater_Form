'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StockTrade, DerivativeTrade } from '@/lib/db/schema'
import { addStockTrade, addDerivativeTrade, deleteStockTrade, deleteDerivativeTrade } from '@/app/actions/trades'

interface BookContentProps {
  stockTrades: StockTrade[]
  derivativeTrades: DerivativeTrade[]
}

export function BookContent({ stockTrades, derivativeTrades }: BookContentProps) {
  const [activeTab, setActiveTab] = useState<'stocks' | 'derivatives'>('stocks')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value))
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book de Operações</h1>
          <p className="text-muted-foreground">Registre e gerencie suas operações</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nova Operação'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'stocks' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stocks')}
        >
          Ações ({stockTrades.length})
        </Button>
        <Button 
          variant={activeTab === 'derivatives' ? 'default' : 'outline'}
          onClick={() => setActiveTab('derivatives')}
        >
          Derivativos ({derivativeTrades.length})
        </Button>
      </div>

      {/* New Trade Form */}
      {showForm && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">
            Nova Operação de {activeTab === 'stocks' ? 'Ações' : 'Derivativos'}
          </h2>
          {activeTab === 'stocks' ? (
            <StockTradeForm 
              onSubmit={async (data) => {
                setLoading(true)
                await addStockTrade(data)
                setLoading(false)
                setShowForm(false)
              }}
              loading={loading}
            />
          ) : (
            <DerivativeTradeForm 
              onSubmit={async (data) => {
                setLoading(true)
                await addDerivativeTrade(data)
                setLoading(false)
                setShowForm(false)
              }}
              loading={loading}
            />
          )}
        </Card>
      )}

      {/* Trades Table */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">
          Histórico de {activeTab === 'stocks' ? 'Ações' : 'Derivativos'}
        </h2>
        
        {activeTab === 'stocks' ? (
          stockTrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma operação de ações registrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Data</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Ticker</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Tipo</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Qtd</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Preço</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Total</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stockTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50">
                      <td className="py-3 text-sm">{formatDate(trade.tradeDate)}</td>
                      <td className="py-3 font-medium">{trade.ticker}</td>
                      <td className="py-3">
                        <span className={`text-sm px-2 py-1 rounded ${trade.type === 'BUY' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
                          {trade.type === 'BUY' ? 'Compra' : 'Venda'}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums">{trade.quantity}</td>
                      <td className="py-3 text-right tabular-nums">{formatCurrency(trade.price)}</td>
                      <td className="py-3 text-right tabular-nums font-medium">{formatCurrency(trade.totalValue)}</td>
                      <td className="py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteStockTrade(trade.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          derivativeTrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma operação de derivativos registrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Data</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Ticker</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Ativo</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">Tipo</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm">C/V</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Qtd</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Preço</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Strike</th>
                    <th className="pb-3 text-muted-foreground font-medium text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {derivativeTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50">
                      <td className="py-3 text-sm">{formatDate(trade.tradeDate)}</td>
                      <td className="py-3 font-medium">{trade.ticker}</td>
                      <td className="py-3 text-sm text-muted-foreground">{trade.underlying}</td>
                      <td className="py-3">
                        <span className="text-sm px-2 py-1 rounded bg-secondary">
                          {trade.derivativeType}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm px-2 py-1 rounded ${trade.type === 'BUY' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
                          {trade.type === 'BUY' ? 'C' : 'V'}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums">{trade.quantity}</td>
                      <td className="py-3 text-right tabular-nums">{formatCurrency(trade.price)}</td>
                      <td className="py-3 text-right tabular-nums">{trade.strike ? formatCurrency(trade.strike) : '-'}</td>
                      <td className="py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteDerivativeTrade(trade.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  )
}

function StockTradeForm({ 
  onSubmit, 
  loading 
}: { 
  onSubmit: (data: {
    ticker: string
    type: 'BUY' | 'SELL'
    quantity: number
    price: number
    fees?: number
    tradeDate: Date
    notes?: string
  }) => Promise<void>
  loading: boolean 
}) {
  const [ticker, setTicker] = useState('')
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fees, setFees] = useState('')
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ticker,
      type,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      fees: fees ? parseFloat(fees) : undefined,
      tradeDate: new Date(tradeDate),
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ticker">Ticker</Label>
        <Input 
          id="ticker" 
          value={ticker} 
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="PETR4"
          required
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tipo</Label>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant={type === 'BUY' ? 'default' : 'outline'}
            onClick={() => setType('BUY')}
            className="flex-1"
          >
            Compra
          </Button>
          <Button 
            type="button"
            variant={type === 'SELL' ? 'default' : 'outline'}
            onClick={() => setType('SELL')}
            className="flex-1"
          >
            Venda
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tradeDate">Data</Label>
        <Input 
          id="tradeDate" 
          type="date"
          value={tradeDate} 
          onChange={(e) => setTradeDate(e.target.value)}
          required
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantidade</Label>
        <Input 
          id="quantity" 
          type="number"
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="100"
          required
          min="1"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="price">Preço (R$)</Label>
        <Input 
          id="price" 
          type="number"
          step="0.01"
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
          placeholder="35.50"
          required
          min="0.01"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fees">Taxas (R$)</Label>
        <Input 
          id="fees" 
          type="number"
          step="0.01"
          value={fees} 
          onChange={(e) => setFees(e.target.value)}
          placeholder="0.00"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="notes">Observações</Label>
        <Input 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas sobre a operação"
          className="bg-input"
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

function DerivativeTradeForm({ 
  onSubmit, 
  loading 
}: { 
  onSubmit: (data: {
    ticker: string
    underlying: string
    derivativeType: 'CALL' | 'PUT' | 'FUTURE'
    type: 'BUY' | 'SELL'
    quantity: number
    price: number
    strike?: number
    expiration?: Date
    fees?: number
    tradeDate: Date
    notes?: string
  }) => Promise<void>
  loading: boolean 
}) {
  const [ticker, setTicker] = useState('')
  const [underlying, setUnderlying] = useState('')
  const [derivativeType, setDerivativeType] = useState<'CALL' | 'PUT' | 'FUTURE'>('CALL')
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [strike, setStrike] = useState('')
  const [expiration, setExpiration] = useState('')
  const [fees, setFees] = useState('')
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ticker,
      underlying,
      derivativeType,
      type,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      strike: strike ? parseFloat(strike) : undefined,
      expiration: expiration ? new Date(expiration) : undefined,
      fees: fees ? parseFloat(fees) : undefined,
      tradeDate: new Date(tradeDate),
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ticker">Ticker Opção/Futuro</Label>
        <Input 
          id="ticker" 
          value={ticker} 
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="PETRA320"
          required
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="underlying">Ativo Subjacente</Label>
        <Input 
          id="underlying" 
          value={underlying} 
          onChange={(e) => setUnderlying(e.target.value.toUpperCase())}
          placeholder="PETR4"
          required
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tipo Derivativo</Label>
        <div className="flex gap-1">
          {(['CALL', 'PUT', 'FUTURE'] as const).map((dt) => (
            <Button 
              key={dt}
              type="button"
              variant={derivativeType === dt ? 'default' : 'outline'}
              onClick={() => setDerivativeType(dt)}
              size="sm"
              className="flex-1"
            >
              {dt}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Compra/Venda</Label>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant={type === 'BUY' ? 'default' : 'outline'}
            onClick={() => setType('BUY')}
            className="flex-1"
          >
            C
          </Button>
          <Button 
            type="button"
            variant={type === 'SELL' ? 'default' : 'outline'}
            onClick={() => setType('SELL')}
            className="flex-1"
          >
            V
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantidade</Label>
        <Input 
          id="quantity" 
          type="number"
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="100"
          required
          min="1"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="price">Prêmio/Preço (R$)</Label>
        <Input 
          id="price" 
          type="number"
          step="0.01"
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
          placeholder="2.50"
          required
          min="0.01"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="strike">Strike (R$)</Label>
        <Input 
          id="strike" 
          type="number"
          step="0.01"
          value={strike} 
          onChange={(e) => setStrike(e.target.value)}
          placeholder="32.00"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="expiration">Vencimento</Label>
        <Input 
          id="expiration" 
          type="date"
          value={expiration} 
          onChange={(e) => setExpiration(e.target.value)}
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tradeDate">Data Operação</Label>
        <Input 
          id="tradeDate" 
          type="date"
          value={tradeDate} 
          onChange={(e) => setTradeDate(e.target.value)}
          required
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fees">Taxas (R$)</Label>
        <Input 
          id="fees" 
          type="number"
          step="0.01"
          value={fees} 
          onChange={(e) => setFees(e.target.value)}
          placeholder="0.00"
          className="bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Observações</Label>
        <Input 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas"
          className="bg-input"
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
