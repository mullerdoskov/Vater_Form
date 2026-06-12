'use server'

/**
 * Agent System for Trading Workspace
 * 5 specialized agents with well-defined outputs:
 * 1. Correlation Agent - analyzes correlations between assets
 * 2. Seasonality Agent - monthly/weekly patterns
 * 3. Scenario Agent - integrates with GAN scenarios
 * 4. Macro Agent - macro factor analysis
 * 5. Hedge Agent - hedge recommendations
 */

import type { ParsedThesisIntent } from './llm'

// ============================================================================
// Agent Output Types
// ============================================================================

export interface CorrelationOutput {
  matrix: { ticker1: string; ticker2: string; correlation: number }[]
  clusters: { name: string; tickers: string[]; avgCorrelation: number }[]
  diversificationScore: number // 0-100, higher = more diversified
  warnings: string[]
}

export interface SeasonalityOutput {
  monthlyPatterns: {
    ticker: string
    patterns: { month: number; avgReturn: number; winRate: number; volatility: number }[]
    bestMonth: number
    worstMonth: number
  }[]
  currentMonthOutlook: 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE'
  historicalContext: string
}

export interface ScenarioOutput {
  scenarios: {
    name: string // optimistic, base, stress
    probability: number
    expectedReturn: number
    maxDrawdown: number
    var95: number
    cvar95: number
    description: string
  }[]
  distribution: { bucket: string; probability: number }[]
  riskMetrics: {
    expectedReturn: number
    volatility: number
    sharpeRatio: number
    sortinoRatio: number
    maxDrawdown: number
  }
}

export interface MacroOutput {
  relevantFactors: {
    factor: string
    currentValue: number | string
    trend: 'UP' | 'DOWN' | 'STABLE'
    impactOnPortfolio: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    weight: number
    description: string
  }[]
  overallMacroScore: number // -100 to 100
  sectorExposure: { sector: string; exposure: number; macroSensitivity: number }[]
  recommendations: string[]
}

export interface HedgeOutput {
  recommendations: {
    type: 'PROTECTIVE_PUT' | 'COLLAR' | 'FUTURES_HEDGE' | 'CORRELATION_HEDGE' | 'SECTOR_HEDGE'
    description: string
    instruments: { ticker: string; quantity: number; direction: 'LONG' | 'SHORT' }[]
    estimatedCost: number
    protectionLevel: number // percentage of portfolio protected
    tradeoff: string
  }[]
  currentHedgeRatio: number
  recommendedHedgeRatio: number
  unhedgedRisk: number
}

export interface AgentResult<T> {
  agentName: string
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  output?: T
  error?: string
}

// ============================================================================
// Agent Implementations (Mock for demonstration)
// ============================================================================

export async function runCorrelationAgent(
  tickers: string[],
  _intent: ParsedThesisIntent
): Promise<AgentResult<CorrelationOutput>> {
  const startedAt = new Date()
  
  // Simulate processing time
  await new Promise(r => setTimeout(r, 800))
  
  // Generate mock correlation matrix
  const matrix: CorrelationOutput['matrix'] = []
  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      // Mock correlation based on sector similarity
      const sameSector = areSameSector(tickers[i], tickers[j])
      const correlation = sameSector 
        ? 0.6 + Math.random() * 0.35 
        : -0.2 + Math.random() * 0.7
      
      matrix.push({
        ticker1: tickers[i],
        ticker2: tickers[j],
        correlation: Math.round(correlation * 100) / 100,
      })
    }
  }
  
  // Identify clusters
  const clusters = identifyClusters(tickers, matrix)
  
  // Calculate diversification score
  const avgCorrelation = matrix.length > 0 
    ? matrix.reduce((sum, m) => sum + Math.abs(m.correlation), 0) / matrix.length 
    : 0
  const diversificationScore = Math.round((1 - avgCorrelation) * 100)
  
  const warnings: string[] = []
  if (diversificationScore < 40) {
    warnings.push('Portfolio altamente concentrado - considere diversificar')
  }
  if (matrix.some(m => m.correlation > 0.85)) {
    warnings.push('Alguns ativos têm correlação muito alta (>85%)')
  }
  
  return {
    agentName: 'Correlation Agent',
    status: 'completed',
    startedAt,
    completedAt: new Date(),
    output: { matrix, clusters, diversificationScore, warnings },
  }
}

export async function runSeasonalityAgent(
  tickers: string[],
  _intent: ParsedThesisIntent
): Promise<AgentResult<SeasonalityOutput>> {
  const startedAt = new Date()
  
  await new Promise(r => setTimeout(r, 600))
  
  const currentMonth = new Date().getMonth() + 1
  
  const monthlyPatterns = tickers.map(ticker => {
    const patterns = Array.from({ length: 12 }, (_, i) => {
      // Generate seasonal patterns with some logic
      const month = i + 1
      const isGoodMonth = [1, 4, 7, 10, 11, 12].includes(month) // historically better months
      const baseReturn = isGoodMonth ? 0.02 : -0.005
      const variance = 0.03
      
      return {
        month,
        avgReturn: baseReturn + (Math.random() - 0.5) * variance,
        winRate: 0.4 + Math.random() * 0.3,
        volatility: 0.15 + Math.random() * 0.2,
      }
    })
    
    const sortedByReturn = [...patterns].sort((a, b) => b.avgReturn - a.avgReturn)
    
    return {
      ticker,
      patterns,
      bestMonth: sortedByReturn[0].month,
      worstMonth: sortedByReturn[sortedByReturn.length - 1].month,
    }
  })
  
  // Determine current month outlook
  const currentMonthReturns = monthlyPatterns.map(p => 
    p.patterns.find(m => m.month === currentMonth)?.avgReturn ?? 0
  )
  const avgCurrentMonth = currentMonthReturns.reduce((a, b) => a + b, 0) / currentMonthReturns.length
  
  let currentMonthOutlook: SeasonalityOutput['currentMonthOutlook'] = 'NEUTRAL'
  if (avgCurrentMonth > 0.01) currentMonthOutlook = 'FAVORABLE'
  else if (avgCurrentMonth < -0.01) currentMonthOutlook = 'UNFAVORABLE'
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  return {
    agentName: 'Seasonality Agent',
    status: 'completed',
    startedAt,
    completedAt: new Date(),
    output: {
      monthlyPatterns,
      currentMonthOutlook,
      historicalContext: `${monthNames[currentMonth - 1]} historicamente apresenta retorno médio de ${(avgCurrentMonth * 100).toFixed(1)}% para os ativos selecionados`,
    },
  }
}

export async function runScenarioAgent(
  tickers: string[],
  intent: ParsedThesisIntent,
  ganScenarios?: unknown
): Promise<AgentResult<ScenarioOutput>> {
  const startedAt = new Date()
  
  await new Promise(r => setTimeout(r, 1200))
  
  // Use GAN scenarios if available, otherwise generate mock
  const isBullish = intent.direction === 'BULLISH'
  const isBearish = intent.direction === 'BEARISH'
  
  const scenarios: ScenarioOutput['scenarios'] = [
    {
      name: 'Otimista',
      probability: isBullish ? 0.35 : isBearish ? 0.15 : 0.25,
      expectedReturn: 0.15 + Math.random() * 0.1,
      maxDrawdown: -0.05 - Math.random() * 0.05,
      var95: -0.03 - Math.random() * 0.02,
      cvar95: -0.04 - Math.random() * 0.03,
      description: 'Cenário de alta com fatores macro favoráveis',
    },
    {
      name: 'Base',
      probability: 0.50,
      expectedReturn: 0.02 + Math.random() * 0.05,
      maxDrawdown: -0.10 - Math.random() * 0.05,
      var95: -0.05 - Math.random() * 0.03,
      cvar95: -0.07 - Math.random() * 0.04,
      description: 'Cenário neutro com volatilidade normal',
    },
    {
      name: 'Stress',
      probability: isBearish ? 0.35 : isBullish ? 0.15 : 0.25,
      expectedReturn: -0.10 - Math.random() * 0.15,
      maxDrawdown: -0.25 - Math.random() * 0.15,
      var95: -0.12 - Math.random() * 0.08,
      cvar95: -0.18 - Math.random() * 0.1,
      description: 'Cenário de estresse com correção de mercado',
    },
  ]
  
  // Generate distribution
  const distribution = [
    { bucket: '< -20%', probability: 0.05 },
    { bucket: '-20% a -10%', probability: 0.10 },
    { bucket: '-10% a -5%', probability: 0.15 },
    { bucket: '-5% a 0%', probability: 0.20 },
    { bucket: '0% a 5%', probability: 0.20 },
    { bucket: '5% a 10%', probability: 0.15 },
    { bucket: '10% a 20%', probability: 0.10 },
    { bucket: '> 20%', probability: 0.05 },
  ]
  
  // Expected value across scenarios
  const expectedReturn = scenarios.reduce((sum, s) => sum + s.probability * s.expectedReturn, 0)
  const volatility = 0.20 + Math.random() * 0.15
  
  return {
    agentName: 'Scenario Agent',
    status: 'completed',
    startedAt,
    completedAt: new Date(),
    output: {
      scenarios,
      distribution,
      riskMetrics: {
        expectedReturn,
        volatility,
        sharpeRatio: expectedReturn / volatility,
        sortinoRatio: expectedReturn / (volatility * 0.7),
        maxDrawdown: Math.min(...scenarios.map(s => s.maxDrawdown)),
      },
    },
  }
}

export async function runMacroAgent(
  intent: ParsedThesisIntent
): Promise<AgentResult<MacroOutput>> {
  const startedAt = new Date()
  
  await new Promise(r => setTimeout(r, 700))
  
  // Map parsed factors to detailed analysis
  const relevantFactors: MacroOutput['relevantFactors'] = intent.macroFactors.map(f => ({
    factor: f.factor,
    currentValue: getMockMacroValue(f.factor),
    trend: f.expectedDirection,
    impactOnPortfolio: f.expectedDirection === 'UP' 
      ? (isPositiveFactor(f.factor, intent.sectors) ? 'POSITIVE' : 'NEGATIVE')
      : (isPositiveFactor(f.factor, intent.sectors) ? 'NEGATIVE' : 'POSITIVE'),
    weight: f.impact === 'HIGH' ? 1.5 : f.impact === 'MEDIUM' ? 1.0 : 0.5,
    description: getMacroDescription(f.factor),
  }))
  
  // Add default factors if none detected
  if (relevantFactors.length === 0) {
    relevantFactors.push(
      { factor: 'SELIC', currentValue: '10.50%', trend: 'STABLE', impactOnPortfolio: 'NEUTRAL', weight: 1.2, description: 'Taxa básica de juros' },
      { factor: 'IPCA', currentValue: '4.2%', trend: 'DOWN', impactOnPortfolio: 'POSITIVE', weight: 1.0, description: 'Inflação oficial' },
    )
  }
  
  // Calculate overall macro score
  const positiveFactors = relevantFactors.filter(f => f.impactOnPortfolio === 'POSITIVE').length
  const negativeFactors = relevantFactors.filter(f => f.impactOnPortfolio === 'NEGATIVE').length
  const overallMacroScore = Math.round(((positiveFactors - negativeFactors) / Math.max(relevantFactors.length, 1)) * 50)
  
  // Sector exposure
  const sectorExposure = intent.sectors.map(sector => ({
    sector,
    exposure: Math.random() * 0.4 + 0.1,
    macroSensitivity: getSectorSensitivity(sector),
  }))
  
  const recommendations: string[] = []
  if (overallMacroScore < -20) {
    recommendations.push('Cenário macro desfavorável - considere posições defensivas')
  } else if (overallMacroScore > 20) {
    recommendations.push('Cenário macro favorável - oportunidade para posições direcionais')
  }
  
  return {
    agentName: 'Macro Agent',
    status: 'completed',
    startedAt,
    completedAt: new Date(),
    output: { relevantFactors, overallMacroScore, sectorExposure, recommendations },
  }
}

export async function runHedgeAgent(
  tickers: string[],
  intent: ParsedThesisIntent,
  scenarioOutput?: ScenarioOutput
): Promise<AgentResult<HedgeOutput>> {
  const startedAt = new Date()
  
  await new Promise(r => setTimeout(r, 900))
  
  const recommendations: HedgeOutput['recommendations'] = []
  
  // Protective put for long positions
  if (intent.direction === 'BULLISH' && tickers.length > 0) {
    recommendations.push({
      type: 'PROTECTIVE_PUT',
      description: 'Put protetiva 5% OTM para limitar downside',
      instruments: tickers.slice(0, 2).map(t => ({ 
        ticker: `${t.replace(/[0-9]/g, '')}P${getNextExpiry()}`, 
        quantity: 100, 
        direction: 'LONG' as const 
      })),
      estimatedCost: 0.02 + Math.random() * 0.02,
      protectionLevel: 0.85,
      tradeoff: 'Custo do prêmio reduz retorno em cenário de alta',
    })
  }
  
  // Collar for income with protection
  if (tickers.length > 0) {
    recommendations.push({
      type: 'COLLAR',
      description: 'Collar: venda call 10% OTM + compra put 10% OTM',
      instruments: [
        { ticker: `${tickers[0].replace(/[0-9]/g, '')}C${getNextExpiry()}`, quantity: 100, direction: 'SHORT' as const },
        { ticker: `${tickers[0].replace(/[0-9]/g, '')}P${getNextExpiry()}`, quantity: 100, direction: 'LONG' as const },
      ],
      estimatedCost: 0.005,
      protectionLevel: 0.90,
      tradeoff: 'Limita upside mas reduz custo de proteção',
    })
  }
  
  // Correlation hedge
  if (intent.sectors.includes('COMMODITIES')) {
    recommendations.push({
      type: 'CORRELATION_HEDGE',
      description: 'Hedge via dólar futuro - correlação negativa com commodities em BRL',
      instruments: [{ ticker: 'DOLFUT', quantity: 1, direction: 'SHORT' as const }],
      estimatedCost: 0.001,
      protectionLevel: 0.5,
      tradeoff: 'Proteção parcial, pode divergir em cenários extremos',
    })
  }
  
  const var95 = scenarioOutput?.riskMetrics?.maxDrawdown ?? -0.15
  const unhedgedRisk = Math.abs(var95)
  
  return {
    agentName: 'Hedge Agent',
    status: 'completed',
    startedAt,
    completedAt: new Date(),
    output: {
      recommendations,
      currentHedgeRatio: 0,
      recommendedHedgeRatio: intent.direction === 'BULLISH' ? 0.3 : 0.5,
      unhedgedRisk,
    },
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function areSameSector(ticker1: string, ticker2: string): boolean {
  const sectorMap: Record<string, string> = {
    'PETR4': 'ENERGIA', 'ELET3': 'ENERGIA', 'ELET6': 'ENERGIA',
    'VALE3': 'COMMODITIES', 'CSNA3': 'COMMODITIES', 'GGBR4': 'COMMODITIES', 'SUZB3': 'COMMODITIES',
    'ITUB4': 'BANCOS', 'BBDC4': 'BANCOS', 'B3SA3': 'BANCOS',
    'MGLU3': 'VAREJO', 'RENT3': 'VAREJO',
    'WEGE3': 'TECNOLOGIA',
  }
  return sectorMap[ticker1] === sectorMap[ticker2]
}

function identifyClusters(
  tickers: string[], 
  matrix: CorrelationOutput['matrix']
): CorrelationOutput['clusters'] {
  // Simple clustering by high correlation
  const clusters: CorrelationOutput['clusters'] = []
  const used = new Set<string>()
  
  for (const ticker of tickers) {
    if (used.has(ticker)) continue
    
    const cluster = [ticker]
    used.add(ticker)
    
    for (const other of tickers) {
      if (used.has(other)) continue
      const corr = matrix.find(m => 
        (m.ticker1 === ticker && m.ticker2 === other) ||
        (m.ticker1 === other && m.ticker2 === ticker)
      )
      if (corr && corr.correlation > 0.6) {
        cluster.push(other)
        used.add(other)
      }
    }
    
    if (cluster.length > 0) {
      clusters.push({
        name: `Cluster ${clusters.length + 1}`,
        tickers: cluster,
        avgCorrelation: cluster.length > 1 ? 0.7 : 1,
      })
    }
  }
  
  return clusters
}

function getMockMacroValue(factor: string): string {
  const values: Record<string, string> = {
    'SELIC': '10.50%',
    'IPCA': '4.2%',
    'CAMBIO': 'R$ 4.95',
    'CHINA_PMI': '51.2',
    'PLD': 'R$ 89.50/MWh',
    'INADIMPLENCIA': '3.8%',
    'MINERIO_FERRO': 'US$ 118/ton',
  }
  return values[factor] ?? 'N/A'
}

function getMacroDescription(factor: string): string {
  const descriptions: Record<string, string> = {
    'SELIC': 'Taxa básica de juros - impacta custo de capital e consumo',
    'IPCA': 'Inflação oficial - afeta poder de compra e reajustes',
    'CAMBIO': 'Taxa de câmbio BRL/USD - impacta exportadoras e custos importados',
    'CHINA_PMI': 'Índice de atividade industrial chinesa - demanda por commodities',
    'PLD': 'Preço de Liquidação das Diferenças - custo de energia',
    'INADIMPLENCIA': 'Taxa de inadimplência do sistema - risco de crédito',
    'MINERIO_FERRO': 'Preço spot do minério - receita de mineradoras',
  }
  return descriptions[factor] ?? 'Fator macroeconômico'
}

function isPositiveFactor(factor: string, sectors: string[]): boolean {
  // SELIC alta é boa para bancos, ruim para varejo/tech
  if (factor === 'SELIC') {
    return sectors.includes('BANCOS')
  }
  // Câmbio alto é bom para exportadoras
  if (factor === 'CAMBIO') {
    return sectors.includes('COMMODITIES')
  }
  return true
}

function getSectorSensitivity(sector: string): number {
  const sensitivity: Record<string, number> = {
    'ENERGIA': 0.7,
    'BANCOS': 0.9,
    'VAREJO': 0.85,
    'COMMODITIES': 0.6,
    'TECNOLOGIA': 0.95,
  }
  return sensitivity[sector] ?? 0.5
}

function getNextExpiry(): string {
  const now = new Date()
  const month = now.getMonth() + 2 // próximo vencimento
  const monthCode = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][month % 12]
  return `${monthCode}${now.getFullYear() % 100}`
}
