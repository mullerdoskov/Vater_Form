'use server'

/**
 * LLM Abstraction Layer - Server Actions
 * Generic interface for LLM providers with structured prompt engineering
 * for trading thesis analysis
 */

import { estimateTokens, DEFAULT_BUDGET, type TokenBudget } from './llm-utils'

// Parsed thesis intent schema
export interface ParsedThesisIntent {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILITY'
  confidence: number
  timeHorizon: 'INTRADAY' | 'SWING' | 'POSITION' | 'LONG_TERM'
  assets: {
    ticker: string
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    mentionedFactors: string[]
  }[]
  macroFactors: {
    factor: string
    expectedDirection: 'UP' | 'DOWN' | 'STABLE'
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
  }[]
  sectors: string[]
  suggestedStrategies: {
    name: string
    description: string
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  }[]
  keyInsights: string[]
  warnings: string[]
}

// System prompts for thesis analysis
const THESIS_ANALYSIS_PROMPT = `Você é um analista quantitativo especializado em mercado brasileiro (B3).
Sua tarefa é analisar a tese de investimento do trader e extrair informações estruturadas.

CLUSTERS SETORIAIS DISPONÍVEIS:
- ENERGIA: Petrobras, Eletrobras, CPFL, Engie, Taesa, etc.
- BANCOS: Itaú, Bradesco, Santander, B3, BTG, etc.
- VAREJO: Magazine Luiza, Via, Americanas, Renner, Arezzo, etc.
- COMMODITIES: Vale, CSN, Gerdau, Suzano, Klabin, etc.
- TECNOLOGIA: Méliuz, Locaweb, Totvs, Positivo, etc.

FATORES MACRO POR CLUSTER:
- ENERGIA: PLD (custo energia), SELIC, IPCA, nível reservatórios
- BANCOS: SELIC (spread), inadimplência, PIB, câmbio
- VAREJO: SELIC, IPCA, massa salarial, confiança consumidor, desemprego
- COMMODITIES: minério ferro, câmbio, China PMI, PLD, frete marítimo
- TECNOLOGIA: SELIC, NASDAQ, câmbio, venture capital

INSTRUÇÕES:
1. Identifique a direção da tese (alta, baixa, neutra, volatilidade)
2. Extraia os ativos mencionados e seu sentimento
3. Identifique fatores macro relevantes
4. Sugira estratégias compatíveis com a tese
5. Liste insights e alertas de risco

RESPONDA APENAS EM JSON VÁLIDO seguindo o schema ParsedThesisIntent.`

// Mock LLM response for demonstration
export async function parseThesisWithLLM(
  thesis: string,
  budget: TokenBudget = DEFAULT_BUDGET
): Promise<{
  result: ParsedThesisIntent
  tokensUsed: { input: number; output: number }
  estimatedCost: number
}> {
  const inputTokens = estimateTokens(THESIS_ANALYSIS_PROMPT + thesis)
  
  // In production, this would call the actual LLM API
  const result = await mockParseThesis(thesis)
  
  const outputTokens = estimateTokens(JSON.stringify(result))
  const estimatedCost = 
    inputTokens * budget.costPerInputToken + 
    outputTokens * budget.costPerOutputToken

  return {
    result,
    tokensUsed: { input: inputTokens, output: outputTokens },
    estimatedCost,
  }
}

// Simple keyword-based mock parser
async function mockParseThesis(thesis: string): Promise<ParsedThesisIntent> {
  const lowerThesis = thesis.toLowerCase()
  
  // Direction detection
  let direction: ParsedThesisIntent['direction'] = 'NEUTRAL'
  if (lowerThesis.includes('alta') || lowerThesis.includes('subir') || lowerThesis.includes('comprar') || lowerThesis.includes('bullish')) {
    direction = 'BULLISH'
  } else if (lowerThesis.includes('baixa') || lowerThesis.includes('cair') || lowerThesis.includes('vender') || lowerThesis.includes('bearish')) {
    direction = 'BEARISH'
  } else if (lowerThesis.includes('volatilidade') || lowerThesis.includes('straddle') || lowerThesis.includes('strangle')) {
    direction = 'VOLATILITY'
  }

  // Time horizon detection
  let timeHorizon: ParsedThesisIntent['timeHorizon'] = 'SWING'
  if (lowerThesis.includes('day trade') || lowerThesis.includes('intraday') || lowerThesis.includes('hoje')) {
    timeHorizon = 'INTRADAY'
  } else if (lowerThesis.includes('longo prazo') || lowerThesis.includes('anos') || lowerThesis.includes('fundamentalista')) {
    timeHorizon = 'LONG_TERM'
  } else if (lowerThesis.includes('posição') || lowerThesis.includes('meses')) {
    timeHorizon = 'POSITION'
  }

  // Asset detection (common B3 tickers)
  const tickerPatterns = [
    { pattern: /petr[o4]/i, ticker: 'PETR4', sector: 'ENERGIA' },
    { pattern: /vale[3]?/i, ticker: 'VALE3', sector: 'COMMODITIES' },
    { pattern: /itub|itau/i, ticker: 'ITUB4', sector: 'BANCOS' },
    { pattern: /bbdc|bradesco/i, ticker: 'BBDC4', sector: 'BANCOS' },
    { pattern: /mglu|magalu|magazine/i, ticker: 'MGLU3', sector: 'VAREJO' },
    { pattern: /csn[a3]?/i, ticker: 'CSNA3', sector: 'COMMODITIES' },
    { pattern: /ggbr|gerdau/i, ticker: 'GGBR4', sector: 'COMMODITIES' },
    { pattern: /elet[36]|eletrobras/i, ticker: 'ELET3', sector: 'ENERGIA' },
    { pattern: /b3sa|b3/i, ticker: 'B3SA3', sector: 'BANCOS' },
    { pattern: /wege|weg/i, ticker: 'WEGE3', sector: 'TECNOLOGIA' },
    { pattern: /rent|localiza/i, ticker: 'RENT3', sector: 'VAREJO' },
    { pattern: /suzb|suzano/i, ticker: 'SUZB3', sector: 'COMMODITIES' },
  ]

  const assets: ParsedThesisIntent['assets'] = []
  const sectors = new Set<string>()

  for (const { pattern, ticker, sector } of tickerPatterns) {
    if (pattern.test(thesis)) {
      assets.push({
        ticker,
        sentiment: direction === 'BULLISH' ? 'POSITIVE' : direction === 'BEARISH' ? 'NEGATIVE' : 'NEUTRAL',
        mentionedFactors: [],
      })
      sectors.add(sector)
    }
  }

  // Macro factors detection
  const macroFactors: ParsedThesisIntent['macroFactors'] = []
  
  if (lowerThesis.includes('selic') || lowerThesis.includes('juros')) {
    macroFactors.push({
      factor: 'SELIC',
      expectedDirection: lowerThesis.includes('queda') || lowerThesis.includes('corte') ? 'DOWN' : 'UP',
      impact: 'HIGH',
    })
  }
  if (lowerThesis.includes('dólar') || lowerThesis.includes('câmbio')) {
    macroFactors.push({
      factor: 'CAMBIO',
      expectedDirection: lowerThesis.includes('valoriz') ? 'DOWN' : 'UP',
      impact: 'MEDIUM',
    })
  }
  if (lowerThesis.includes('china') || lowerThesis.includes('minério')) {
    macroFactors.push({
      factor: 'CHINA_PMI',
      expectedDirection: lowerThesis.includes('aquec') || lowerThesis.includes('forte') ? 'UP' : 'DOWN',
      impact: 'HIGH',
    })
  }
  if (lowerThesis.includes('inflação') || lowerThesis.includes('ipca')) {
    macroFactors.push({
      factor: 'IPCA',
      expectedDirection: lowerThesis.includes('control') || lowerThesis.includes('queda') ? 'DOWN' : 'UP',
      impact: 'MEDIUM',
    })
  }

  // Suggested strategies based on direction
  const suggestedStrategies: ParsedThesisIntent['suggestedStrategies'] = []
  
  if (direction === 'BULLISH') {
    suggestedStrategies.push(
      { name: 'Compra à Vista', description: 'Compra direta do ativo', riskLevel: 'MEDIUM' },
      { name: 'Call Spread', description: 'Compra de call ATM + venda de call OTM', riskLevel: 'LOW' },
      { name: 'Venda de Put', description: 'Venda de put OTM para capturar prêmio', riskLevel: 'HIGH' },
    )
  } else if (direction === 'BEARISH') {
    suggestedStrategies.push(
      { name: 'Venda a Descoberto', description: 'Short selling do ativo', riskLevel: 'HIGH' },
      { name: 'Put Spread', description: 'Compra de put ATM + venda de put OTM', riskLevel: 'LOW' },
      { name: 'Bear Call Spread', description: 'Venda de call ATM + compra de call OTM', riskLevel: 'MEDIUM' },
    )
  } else if (direction === 'VOLATILITY') {
    suggestedStrategies.push(
      { name: 'Straddle', description: 'Compra de call + put ATM', riskLevel: 'HIGH' },
      { name: 'Strangle', description: 'Compra de call + put OTM', riskLevel: 'MEDIUM' },
      { name: 'Iron Condor', description: 'Venda de volatilidade com proteção', riskLevel: 'LOW' },
    )
  }

  // Key insights
  const keyInsights: string[] = []
  if (assets.length > 0) {
    keyInsights.push(`Identificados ${assets.length} ativo(s) relacionado(s) à tese`)
  }
  if (macroFactors.length > 0) {
    keyInsights.push(`${macroFactors.length} fator(es) macro identificado(s) como relevantes`)
  }
  if (sectors.size > 0) {
    keyInsights.push(`Setores envolvidos: ${Array.from(sectors).join(', ')}`)
  }

  // Warnings
  const warnings: string[] = []
  if (assets.length === 0) {
    warnings.push('Nenhum ativo específico identificado na tese')
  }
  if (direction === 'VOLATILITY' && timeHorizon === 'LONG_TERM') {
    warnings.push('Estratégias de volatilidade não são ideais para longo prazo')
  }
  if (macroFactors.some(f => f.impact === 'HIGH')) {
    warnings.push('Fatores macro de alto impacto podem aumentar a volatilidade')
  }

  return {
    direction,
    confidence: assets.length > 0 ? 70 + Math.min(assets.length * 5, 25) : 40,
    timeHorizon,
    assets,
    macroFactors,
    sectors: Array.from(sectors),
    suggestedStrategies,
    keyInsights,
    warnings,
  }
}
