'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stockTrades, stockPositions, derivativeTrades, derivativePositions, dailyPnl } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Stock Trades
export async function getStockTrades() {
  const userId = await getUserId()
  return db
    .select()
    .from(stockTrades)
    .where(eq(stockTrades.userId, userId))
    .orderBy(desc(stockTrades.tradeDate))
}

export async function addStockTrade(data: {
  ticker: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  fees?: number
  tradeDate: Date
  notes?: string
}) {
  const userId = await getUserId()
  const totalValue = data.quantity * data.price

  await db.insert(stockTrades).values({
    userId,
    ticker: data.ticker.toUpperCase(),
    type: data.type,
    quantity: data.quantity,
    price: String(data.price),
    totalValue: String(totalValue),
    fees: String(data.fees || 0),
    tradeDate: data.tradeDate,
    notes: data.notes,
  })

  // Update position
  await updateStockPosition(userId, data.ticker.toUpperCase(), data.type, data.quantity, data.price)
  
  revalidatePath('/dashboard')
  revalidatePath('/book')
}

async function updateStockPosition(userId: string, ticker: string, type: 'BUY' | 'SELL', quantity: number, price: number) {
  const existing = await db
    .select()
    .from(stockPositions)
    .where(and(eq(stockPositions.userId, userId), eq(stockPositions.ticker, ticker)))
    .limit(1)

  if (existing.length === 0) {
    // Create new position
    if (type === 'BUY') {
      await db.insert(stockPositions).values({
        userId,
        ticker,
        quantity,
        averagePrice: String(price),
        totalCost: String(quantity * price),
      })
    }
  } else {
    const pos = existing[0]
    const currentQty = pos.quantity
    const currentAvgPrice = Number(pos.averagePrice)
    const currentCost = Number(pos.totalCost)

    if (type === 'BUY') {
      const newQty = currentQty + quantity
      const newCost = currentCost + (quantity * price)
      const newAvgPrice = newCost / newQty

      await db
        .update(stockPositions)
        .set({
          quantity: newQty,
          averagePrice: String(newAvgPrice),
          totalCost: String(newCost),
          updatedAt: new Date(),
        })
        .where(and(eq(stockPositions.userId, userId), eq(stockPositions.ticker, ticker)))
    } else {
      // SELL
      const newQty = currentQty - quantity
      const realizedPnl = quantity * (price - currentAvgPrice)
      const currentRealizedPnl = Number(pos.realizedPnl || 0)

      if (newQty <= 0) {
        await db
          .delete(stockPositions)
          .where(and(eq(stockPositions.userId, userId), eq(stockPositions.ticker, ticker)))
      } else {
        await db
          .update(stockPositions)
          .set({
            quantity: newQty,
            totalCost: String(newQty * currentAvgPrice),
            realizedPnl: String(currentRealizedPnl + realizedPnl),
            updatedAt: new Date(),
          })
          .where(and(eq(stockPositions.userId, userId), eq(stockPositions.ticker, ticker)))
      }
    }
  }
}

export async function deleteStockTrade(id: number) {
  const userId = await getUserId()
  await db.delete(stockTrades).where(and(eq(stockTrades.id, id), eq(stockTrades.userId, userId)))
  revalidatePath('/dashboard')
  revalidatePath('/book')
}

// Derivative Trades
export async function getDerivativeTrades() {
  const userId = await getUserId()
  return db
    .select()
    .from(derivativeTrades)
    .where(eq(derivativeTrades.userId, userId))
    .orderBy(desc(derivativeTrades.tradeDate))
}

export async function addDerivativeTrade(data: {
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
}) {
  const userId = await getUserId()
  const totalValue = data.quantity * data.price

  await db.insert(derivativeTrades).values({
    userId,
    ticker: data.ticker.toUpperCase(),
    underlying: data.underlying.toUpperCase(),
    derivativeType: data.derivativeType,
    type: data.type,
    quantity: data.quantity,
    price: String(data.price),
    strike: data.strike ? String(data.strike) : null,
    expiration: data.expiration?.toISOString().split('T')[0],
    totalValue: String(totalValue),
    fees: String(data.fees || 0),
    tradeDate: data.tradeDate,
    notes: data.notes,
  })

  // Update derivative position
  await updateDerivativePosition(userId, data)
  
  revalidatePath('/dashboard')
  revalidatePath('/book')
}

async function updateDerivativePosition(userId: string, data: {
  ticker: string
  underlying: string
  derivativeType: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  strike?: number
  expiration?: Date
}) {
  const ticker = data.ticker.toUpperCase()
  const existing = await db
    .select()
    .from(derivativePositions)
    .where(and(eq(derivativePositions.userId, userId), eq(derivativePositions.ticker, ticker)))
    .limit(1)

  if (existing.length === 0) {
    if (data.type === 'BUY') {
      await db.insert(derivativePositions).values({
        userId,
        ticker,
        underlying: data.underlying.toUpperCase(),
        derivativeType: data.derivativeType,
        strike: data.strike ? String(data.strike) : null,
        expiration: data.expiration?.toISOString().split('T')[0],
        quantity: data.quantity,
        averagePrice: String(data.price),
        totalCost: String(data.quantity * data.price),
      })
    }
  } else {
    const pos = existing[0]
    const currentQty = pos.quantity
    const currentAvgPrice = Number(pos.averagePrice)
    const currentCost = Number(pos.totalCost)

    if (data.type === 'BUY') {
      const newQty = currentQty + data.quantity
      const newCost = currentCost + (data.quantity * data.price)
      const newAvgPrice = newCost / newQty

      await db
        .update(derivativePositions)
        .set({
          quantity: newQty,
          averagePrice: String(newAvgPrice),
          totalCost: String(newCost),
          updatedAt: new Date(),
        })
        .where(and(eq(derivativePositions.userId, userId), eq(derivativePositions.ticker, ticker)))
    } else {
      const newQty = currentQty - data.quantity
      const realizedPnl = data.quantity * (data.price - currentAvgPrice)
      const currentRealizedPnl = Number(pos.realizedPnl || 0)

      if (newQty <= 0) {
        await db
          .delete(derivativePositions)
          .where(and(eq(derivativePositions.userId, userId), eq(derivativePositions.ticker, ticker)))
      } else {
        await db
          .update(derivativePositions)
          .set({
            quantity: newQty,
            totalCost: String(newQty * currentAvgPrice),
            realizedPnl: String(currentRealizedPnl + realizedPnl),
            updatedAt: new Date(),
          })
          .where(and(eq(derivativePositions.userId, userId), eq(derivativePositions.ticker, ticker)))
      }
    }
  }
}

export async function deleteDerivativeTrade(id: number) {
  const userId = await getUserId()
  await db.delete(derivativeTrades).where(and(eq(derivativeTrades.id, id), eq(derivativeTrades.userId, userId)))
  revalidatePath('/dashboard')
  revalidatePath('/book')
}

// Positions
export async function getStockPositions() {
  const userId = await getUserId()
  return db
    .select()
    .from(stockPositions)
    .where(eq(stockPositions.userId, userId))
    .orderBy(desc(stockPositions.updatedAt))
}

export async function getDerivativePositions() {
  const userId = await getUserId()
  return db
    .select()
    .from(derivativePositions)
    .where(eq(derivativePositions.userId, userId))
    .orderBy(desc(derivativePositions.updatedAt))
}

// P&L
export async function getDailyPnl(days: number = 30) {
  const userId = await getUserId()
  return db
    .select()
    .from(dailyPnl)
    .where(eq(dailyPnl.userId, userId))
    .orderBy(desc(dailyPnl.date))
    .limit(days)
}

export async function getPortfolioSummary() {
  const userId = await getUserId()
  
  const stocks = await db
    .select()
    .from(stockPositions)
    .where(eq(stockPositions.userId, userId))

  const derivatives = await db
    .select()
    .from(derivativePositions)
    .where(eq(derivativePositions.userId, userId))

  const stocksValue = stocks.reduce((sum, pos) => sum + Number(pos.totalCost || 0), 0)
  const stocksUnrealizedPnl = stocks.reduce((sum, pos) => sum + Number(pos.unrealizedPnl || 0), 0)
  const stocksRealizedPnl = stocks.reduce((sum, pos) => sum + Number(pos.realizedPnl || 0), 0)

  const derivativesValue = derivatives.reduce((sum, pos) => sum + Number(pos.totalCost || 0), 0)
  const derivativesUnrealizedPnl = derivatives.reduce((sum, pos) => sum + Number(pos.unrealizedPnl || 0), 0)
  const derivativesRealizedPnl = derivatives.reduce((sum, pos) => sum + Number(pos.realizedPnl || 0), 0)

  return {
    stocks: {
      positions: stocks.length,
      totalValue: stocksValue,
      unrealizedPnl: stocksUnrealizedPnl,
      realizedPnl: stocksRealizedPnl,
    },
    derivatives: {
      positions: derivatives.length,
      totalValue: derivativesValue,
      unrealizedPnl: derivativesUnrealizedPnl,
      realizedPnl: derivativesRealizedPnl,
    },
    total: {
      positions: stocks.length + derivatives.length,
      totalValue: stocksValue + derivativesValue,
      unrealizedPnl: stocksUnrealizedPnl + derivativesUnrealizedPnl,
      realizedPnl: stocksRealizedPnl + derivativesRealizedPnl,
    },
  }
}
