import { pgTable, text, timestamp, boolean, serial, integer, decimal, date, bigint, jsonb } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const stockTrades = pgTable('stock_trades', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  ticker: text('ticker').notNull(),
  type: text('type').notNull(), // BUY, SELL
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  totalValue: decimal('totalValue', { precision: 18, scale: 2 }).notNull(),
  fees: decimal('fees', { precision: 18, scale: 2 }).default('0'),
  tradeDate: timestamp('tradeDate').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const derivativeTrades = pgTable('derivative_trades', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  ticker: text('ticker').notNull(),
  underlying: text('underlying').notNull(),
  derivativeType: text('derivativeType').notNull(), // CALL, PUT, FUTURE
  type: text('type').notNull(), // BUY, SELL
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  strike: decimal('strike', { precision: 18, scale: 2 }),
  expiration: date('expiration'),
  totalValue: decimal('totalValue', { precision: 18, scale: 2 }).notNull(),
  fees: decimal('fees', { precision: 18, scale: 2 }).default('0'),
  tradeDate: timestamp('tradeDate').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const stockPositions = pgTable('stock_positions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  ticker: text('ticker').notNull(),
  quantity: integer('quantity').notNull().default(0),
  averagePrice: decimal('averagePrice', { precision: 18, scale: 8 }).notNull().default('0'),
  totalCost: decimal('totalCost', { precision: 18, scale: 2 }).notNull().default('0'),
  currentPrice: decimal('currentPrice', { precision: 18, scale: 8 }),
  marketValue: decimal('marketValue', { precision: 18, scale: 2 }),
  unrealizedPnl: decimal('unrealizedPnl', { precision: 18, scale: 2 }),
  realizedPnl: decimal('realizedPnl', { precision: 18, scale: 2 }).default('0'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const derivativePositions = pgTable('derivative_positions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  ticker: text('ticker').notNull(),
  underlying: text('underlying').notNull(),
  derivativeType: text('derivativeType').notNull(),
  strike: decimal('strike', { precision: 18, scale: 2 }),
  expiration: date('expiration'),
  quantity: integer('quantity').notNull().default(0),
  averagePrice: decimal('averagePrice', { precision: 18, scale: 8 }).notNull().default('0'),
  totalCost: decimal('totalCost', { precision: 18, scale: 2 }).notNull().default('0'),
  currentPrice: decimal('currentPrice', { precision: 18, scale: 8 }),
  marketValue: decimal('marketValue', { precision: 18, scale: 2 }),
  unrealizedPnl: decimal('unrealizedPnl', { precision: 18, scale: 2 }),
  realizedPnl: decimal('realizedPnl', { precision: 18, scale: 2 }).default('0'),
  delta: decimal('delta', { precision: 10, scale: 6 }),
  gamma: decimal('gamma', { precision: 10, scale: 6 }),
  theta: decimal('theta', { precision: 10, scale: 6 }),
  vega: decimal('vega', { precision: 10, scale: 6 }),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const dailyPnl = pgTable('daily_pnl', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  date: date('date').notNull(),
  stocksRealizedPnl: decimal('stocksRealizedPnl', { precision: 18, scale: 2 }).default('0'),
  stocksUnrealizedPnl: decimal('stocksUnrealizedPnl', { precision: 18, scale: 2 }).default('0'),
  derivativesRealizedPnl: decimal('derivativesRealizedPnl', { precision: 18, scale: 2 }).default('0'),
  derivativesUnrealizedPnl: decimal('derivativesUnrealizedPnl', { precision: 18, scale: 2 }).default('0'),
  totalPnl: decimal('totalPnl', { precision: 18, scale: 2 }).default('0'),
  cumulativePnl: decimal('cumulativePnl', { precision: 18, scale: 2 }).default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  ticker: text('ticker').notNull(),
  date: date('date').notNull(),
  open: decimal('open', { precision: 18, scale: 8 }),
  high: decimal('high', { precision: 18, scale: 8 }),
  low: decimal('low', { precision: 18, scale: 8 }),
  close: decimal('close', { precision: 18, scale: 8 }).notNull(),
  volume: bigint('volume', { mode: 'number' }),
  logReturn: decimal('logReturn', { precision: 18, scale: 10 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Types
export type User = typeof user.$inferSelect
export type StockTrade = typeof stockTrades.$inferSelect
export type DerivativeTrade = typeof derivativeTrades.$inferSelect
export type StockPosition = typeof stockPositions.$inferSelect
export type DerivativePosition = typeof derivativePositions.$inferSelect
export type DailyPnl = typeof dailyPnl.$inferSelect
export type PriceHistory = typeof priceHistory.$inferSelect

// --- Workspace / Simulation tables -----------------------------------------

export const simulations = pgTable('simulations', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  thesis: text('thesis').notNull(),
  parsedIntent: jsonb('parsedIntent'),
  status: text('status').notNull().default('draft'), // draft, running, completed, failed
  tokensUsed: integer('tokensUsed').default(0),
  results: jsonb('results'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const plannedPositions = pgTable('planned_positions', {
  id: serial('id').primaryKey(),
  simulationId: integer('simulationId').notNull(),
  userId: text('userId').notNull(),
  ticker: text('ticker').notNull(),
  assetType: text('assetType').notNull(), // STOCK, CALL, PUT, FUTURE
  direction: text('direction').notNull(), // LONG, SHORT
  quantity: integer('quantity').notNull(),
  entryPrice: decimal('entryPrice', { precision: 18, scale: 8 }),
  strike: decimal('strike', { precision: 18, scale: 2 }),
  expiration: date('expiration'),
  underlying: text('underlying'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const ganScenariosCache = pgTable('gan_scenarios_cache', {
  id: serial('id').primaryKey(),
  ticker: text('ticker').notNull(),
  cluster: text('cluster').notNull(),
  date: date('date').notNull(),
  scenarios: jsonb('scenarios').notNull(),
  macroFactors: jsonb('macroFactors'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const tokenUsage = pgTable('token_usage', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  date: date('date').notNull(),
  inputTokens: integer('inputTokens').notNull().default(0),
  outputTokens: integer('outputTokens').notNull().default(0),
  totalTokens: integer('totalTokens').notNull().default(0),
  estimatedCost: decimal('estimatedCost', { precision: 10, scale: 4 }).default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const clusterFactors = pgTable('cluster_factors', {
  id: serial('id').primaryKey(),
  cluster: text('cluster').notNull(),
  factorName: text('factorName').notNull(),
  factorType: text('factorType').notNull(),
  impact: text('impact').notNull(), // POSITIVE, NEGATIVE, NEUTRAL
  weight: decimal('weight', { precision: 5, scale: 2 }).default('1.0'),
  description: text('description'),
})

export type Simulation = typeof simulations.$inferSelect
export type PlannedPosition = typeof plannedPositions.$inferSelect
export type GanScenario = typeof ganScenariosCache.$inferSelect
export type TokenUsage = typeof tokenUsage.$inferSelect
export type ClusterFactor = typeof clusterFactors.$inferSelect
