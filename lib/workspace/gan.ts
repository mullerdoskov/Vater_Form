'use server'

/**
 * GAN Mock System - Server Actions
 * Simulates a Generative Adversarial Network for scenario generation
 * Uses cluster-based factors and hybrid macro inputs
 * 
 * In production, this would be replaced by actual neural network inference
 */

import { 
  CLUSTERS, 
  type ClusterDefinition, 
  type MacroFactor,
  type ScenarioDistribution,
  type GeneratedScenario,
  type DistributionStats,
} from './gan-data'

// Re-export types for convenience
export type { ClusterDefinition, MacroFactor, ScenarioDistribution, GeneratedScenario, DistributionStats }
export { CLUSTERS }

// ============================================================================
// GAN Mock Generator
// ============================================================================

/**
 * Generates mock scenarios using statistical methods to simulate GAN output
 * In production, this would call actual neural network inference
 */
export async function generateGANScenarios(
  ticker: string,
  numScenarios: number = 10000,
  timeHorizonDays: number = 21,
  macroOverrides?: { factor: string; direction: 'UP' | 'DOWN' | 'STABLE' }[]
): Promise<ScenarioDistribution> {
  // Find cluster for ticker
  const cluster = CLUSTERS.find(c => c.tickers.includes(ticker.toUpperCase())) ?? CLUSTERS[0]
  
  // Generate base parameters from cluster factors
  const baseReturn = calculateBaseReturn(cluster, macroOverrides)
  const baseVolatility = calculateBaseVolatility(cluster, ticker)
  
  // Generate scenarios using Monte Carlo with t-distribution (fatter tails than normal)
  const scenarios: GeneratedScenario[] = []
  const returns: number[] = []
  
  for (let i = 0; i < numScenarios; i++) {
    // Student-t with 5 degrees of freedom for fatter tails
    const tRandom = generateStudentT(5)
    const randomReturn = baseReturn + baseVolatility * tRandom * Math.sqrt(timeHorizonDays / 252)
    
    returns.push(randomReturn)
    
    // Only store a sample of scenarios for display (store percentile representatives)
    if (i % 1000 === 0 || i < 100) {
      scenarios.push({
        id: `scenario_${i}`,
        returnPct: randomReturn,
        probability: 1 / numScenarios,
        macroContext: cluster.factors.slice(0, 3).map(f => ({
          factor: f.name,
          value: Math.random(),
          direction: macroOverrides?.find(m => m.factor === f.id)?.direction ?? 
                     (Math.random() > 0.5 ? 'UP' : 'DOWN'),
        })),
        volatility: baseVolatility * (0.8 + Math.random() * 0.4),
        timeHorizon: timeHorizonDays,
      })
    }
  }
  
  // Calculate statistics
  returns.sort((a, b) => a - b)
  const statistics = calculateStats(returns)
  
  return {
    ticker,
    cluster: cluster.id,
    date: new Date(),
    scenarios,
    statistics,
  }
}

/**
 * Generate scenarios for entire portfolio
 */
export async function generatePortfolioScenarios(
  positions: { ticker: string; weight: number }[],
  numScenarios: number = 10000,
  timeHorizonDays: number = 21
): Promise<{
  portfolioStats: DistributionStats
  assetContributions: { ticker: string; riskContribution: number; returnContribution: number }[]
  correlationMatrix: { ticker1: string; ticker2: string; correlation: number }[]
}> {
  // Generate individual asset scenarios
  const assetScenarios = await Promise.all(
    positions.map(p => generateGANScenarios(p.ticker, numScenarios, timeHorizonDays))
  )
  
  // Calculate portfolio returns for each scenario
  const portfolioReturns: number[] = []
  
  for (let i = 0; i < numScenarios; i++) {
    let portfolioReturn = 0
    for (let j = 0; j < positions.length; j++) {
      const assetReturn = assetScenarios[j].scenarios[i % assetScenarios[j].scenarios.length]?.returnPct ?? 0
      portfolioReturn += positions[j].weight * assetReturn
    }
    portfolioReturns.push(portfolioReturn)
  }
  
  portfolioReturns.sort((a, b) => a - b)
  const portfolioStats = calculateStats(portfolioReturns)
  
  // Calculate risk/return contributions
  const assetContributions = positions.map((p, i) => ({
    ticker: p.ticker,
    riskContribution: p.weight * assetScenarios[i].statistics.std / portfolioStats.std,
    returnContribution: p.weight * assetScenarios[i].statistics.mean / portfolioStats.mean,
  }))
  
  // Correlation matrix
  const correlationMatrix: { ticker1: string; ticker2: string; correlation: number }[] = []
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      correlationMatrix.push({
        ticker1: positions[i].ticker,
        ticker2: positions[j].ticker,
        correlation: calculateMockCorrelation(positions[i].ticker, positions[j].ticker),
      })
    }
  }
  
  return { portfolioStats, assetContributions, correlationMatrix }
}

/**
 * Simulate position P&L using GAN scenarios
 */
export async function simulatePositionPnL(
  position: {
    ticker: string
    assetType: 'STOCK' | 'CALL' | 'PUT' | 'FUTURE'
    direction: 'LONG' | 'SHORT'
    quantity: number
    entryPrice: number
    strike?: number
    expiration?: Date
  },
  scenarios?: ScenarioDistribution
): Promise<{
  expectedPnL: number
  maxProfit: number
  maxLoss: number
  breakeven: number
  probabilityOfProfit: number
  pnlDistribution: { bucket: string; probability: number; avgPnL: number }[]
}> {
  // Get scenarios if not provided
  const dist = scenarios ?? await generateGANScenarios(position.ticker)
  
  const directionMultiplier = position.direction === 'LONG' ? 1 : -1
  const pnls: number[] = []
  
  for (const scenario of dist.scenarios) {
    let pnl: number
    const priceChange = position.entryPrice * scenario.returnPct
    
    if (position.assetType === 'STOCK' || position.assetType === 'FUTURE') {
      pnl = directionMultiplier * position.quantity * priceChange
    } else {
      // Options payoff
      const finalPrice = position.entryPrice * (1 + scenario.returnPct)
      const strike = position.strike ?? position.entryPrice
      
      if (position.assetType === 'CALL') {
        const intrinsicValue = Math.max(0, finalPrice - strike)
        const premium = position.entryPrice * 0.05 // approximate premium
        pnl = directionMultiplier * position.quantity * (intrinsicValue - premium)
      } else {
        // PUT
        const intrinsicValue = Math.max(0, strike - finalPrice)
        const premium = position.entryPrice * 0.05
        pnl = directionMultiplier * position.quantity * (intrinsicValue - premium)
      }
    }
    
    pnls.push(pnl)
  }
  
  pnls.sort((a, b) => a - b)
  
  const expectedPnL = pnls.reduce((a, b) => a + b, 0) / pnls.length
  const maxProfit = pnls[pnls.length - 1]
  const maxLoss = pnls[0]
  const profitablePnls = pnls.filter(p => p > 0).length
  const probabilityOfProfit = profitablePnls / pnls.length
  
  // Calculate breakeven (simplified)
  const breakeven = position.assetType === 'STOCK' 
    ? position.entryPrice 
    : (position.strike ?? position.entryPrice)
  
  // Create P&L distribution buckets
  const buckets = [
    { min: -Infinity, max: -0.1, label: '< -10%' },
    { min: -0.1, max: -0.05, label: '-10% a -5%' },
    { min: -0.05, max: 0, label: '-5% a 0%' },
    { min: 0, max: 0.05, label: '0% a 5%' },
    { min: 0.05, max: 0.1, label: '5% a 10%' },
    { min: 0.1, max: Infinity, label: '> 10%' },
  ]
  
  const positionValue = position.quantity * position.entryPrice
  const pnlDistribution = buckets.map(bucket => {
    const bucketPnls = pnls.filter(p => {
      const pctPnl = p / positionValue
      return pctPnl > bucket.min && pctPnl <= bucket.max
    })
    return {
      bucket: bucket.label,
      probability: bucketPnls.length / pnls.length,
      avgPnL: bucketPnls.length > 0 ? bucketPnls.reduce((a, b) => a + b, 0) / bucketPnls.length : 0,
    }
  })
  
  return {
    expectedPnL,
    maxProfit,
    maxLoss,
    breakeven,
    probabilityOfProfit,
    pnlDistribution,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateBaseReturn(cluster: ClusterDefinition, macroOverrides?: { factor: string; direction: 'UP' | 'DOWN' | 'STABLE' }[]): number {
  let baseReturn = 0.08 / 252 // ~8% annual return daily
  
  for (const factor of cluster.factors) {
    const override = macroOverrides?.find(m => m.factor === factor.id)
    const direction = override?.direction ?? 'STABLE'
    
    let impact = 0
    if (direction === 'UP') {
      impact = factor.impact === 'POSITIVE' ? 0.02 : factor.impact === 'NEGATIVE' ? -0.02 : 0
    } else if (direction === 'DOWN') {
      impact = factor.impact === 'POSITIVE' ? -0.02 : factor.impact === 'NEGATIVE' ? 0.02 : 0
    }
    
    baseReturn += impact * factor.weight / cluster.factors.length
  }
  
  return baseReturn
}

function calculateBaseVolatility(cluster: ClusterDefinition, ticker: string): number {
  // Base volatility varies by sector
  const sectorVol: Record<string, number> = {
    'ENERGIA': 0.35,
    'BANCOS': 0.30,
    'VAREJO': 0.55,
    'COMMODITIES': 0.40,
    'TECNOLOGIA': 0.50,
  }
  
  // Add some ticker-specific variation
  const tickerHash = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const variation = (tickerHash % 20 - 10) / 100
  
  return (sectorVol[cluster.id] ?? 0.35) + variation
}

function generateStudentT(degreesOfFreedom: number): number {
  // Generate Student-t using normal and chi-squared
  const normal = generateNormal()
  const chiSquared = generateChiSquared(degreesOfFreedom)
  return normal / Math.sqrt(chiSquared / degreesOfFreedom)
}

function generateNormal(): number {
  // Box-Muller transform
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateChiSquared(df: number): number {
  let sum = 0
  for (let i = 0; i < df; i++) {
    const n = generateNormal()
    sum += n * n
  }
  return sum
}

function calculateStats(returns: number[]): DistributionStats {
  const n = returns.length
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const median = returns[Math.floor(n / 2)]
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n
  const std = Math.sqrt(variance)
  
  const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 3), 0) / n
  const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / std, 4), 0) / n - 3
  
  const var95Index = Math.floor(n * 0.05)
  const var99Index = Math.floor(n * 0.01)
  
  const var95 = returns[var95Index]
  const var99 = returns[var99Index]
  
  const cvar95 = returns.slice(0, var95Index).reduce((a, b) => a + b, 0) / var95Index
  const cvar99 = returns.slice(0, var99Index).reduce((a, b) => a + b, 0) / var99Index
  
  return {
    mean,
    median,
    std,
    skewness,
    kurtosis,
    var95,
    var99,
    cvar95,
    cvar99,
    minReturn: returns[0],
    maxReturn: returns[n - 1],
  }
}

function calculateMockCorrelation(ticker1: string, ticker2: string): number {
  // Find clusters
  const cluster1 = CLUSTERS.find(c => c.tickers.includes(ticker1))?.id ?? 'OTHER'
  const cluster2 = CLUSTERS.find(c => c.tickers.includes(ticker2))?.id ?? 'OTHER'
  
  if (cluster1 === cluster2) {
    // Same sector: high correlation
    return 0.6 + Math.random() * 0.35
  } else {
    // Different sectors: lower correlation
    return -0.2 + Math.random() * 0.6
  }
}

// Export cluster helper
export async function getClusterForTicker(ticker: string): Promise<ClusterDefinition | undefined> {
  return CLUSTERS.find(c => c.tickers.includes(ticker.toUpperCase()))
}

export async function getAllTickers(): Promise<string[]> {
  return CLUSTERS.flatMap(c => c.tickers)
}
