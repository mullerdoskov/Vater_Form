/**
 * GAN Data - Client-safe constants and types
 */

export interface ClusterDefinition {
  id: string
  name: string
  tickers: string[]
  factors: MacroFactor[]
}

export interface MacroFactor {
  id: string
  name: string
  type: 'COMMODITY' | 'MONETARY' | 'INFLATION' | 'OPERATIONAL' | 'DEMAND' | 'CREDIT' | 'CURRENCY' | 'REGULATORY' | 'INCOME' | 'SENTIMENT' | 'LABOR' | 'LOGISTICS' | 'MACRO' | 'STRUCTURAL' | 'FUNDING'
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number
  currentValue?: number | string
  description: string
}

export interface ScenarioDistribution {
  ticker: string
  cluster: string
  date: Date
  scenarios: GeneratedScenario[]
  statistics: DistributionStats
}

export interface GeneratedScenario {
  id: string
  returnPct: number
  probability: number
  macroContext: { factor: string; value: number; direction: 'UP' | 'DOWN' | 'STABLE' }[]
  volatility: number
  timeHorizon: number
}

export interface DistributionStats {
  mean: number
  median: number
  std: number
  skewness: number
  kurtosis: number
  var95: number
  var99: number
  cvar95: number
  cvar99: number
  minReturn: number
  maxReturn: number
}

export const CLUSTERS: ClusterDefinition[] = [
  {
    id: 'ENERGIA',
    name: 'Energia',
    tickers: ['PETR4', 'PETR3', 'ELET3', 'ELET6', 'CPFE3', 'EGIE3', 'TAEE11', 'CPLE6', 'CMIG4', 'EQTL3'],
    factors: [
      { id: 'PLD', name: 'PLD', type: 'COMMODITY', impact: 'NEGATIVE', weight: 1.5, description: 'Preço de Liquidação das Diferenças' },
      { id: 'SELIC_E', name: 'SELIC', type: 'MONETARY', impact: 'NEGATIVE', weight: 1.2, description: 'Taxa de juros afeta custo de capital' },
      { id: 'IPCA_E', name: 'IPCA', type: 'INFLATION', impact: 'POSITIVE', weight: 0.8, description: 'Reajuste tarifário indexado' },
      { id: 'RESERV', name: 'Nível Reservatórios', type: 'OPERATIONAL', impact: 'POSITIVE', weight: 1.3, description: 'Níveis hidrelétricos' },
      { id: 'DEM_IND', name: 'Demanda Industrial', type: 'DEMAND', impact: 'POSITIVE', weight: 1.0, description: 'Consumo industrial' },
    ],
  },
  {
    id: 'BANCOS',
    name: 'Bancos',
    tickers: ['ITUB4', 'ITUB3', 'BBDC4', 'BBDC3', 'BBAS3', 'SANB11', 'B3SA3', 'BPAC11', 'BRSR6', 'ABCB4'],
    factors: [
      { id: 'SELIC_B', name: 'SELIC', type: 'MONETARY', impact: 'POSITIVE', weight: 1.8, description: 'Spread bancário' },
      { id: 'INAD', name: 'Inadimplência', type: 'CREDIT', impact: 'NEGATIVE', weight: 1.5, description: 'Taxa de inadimplência' },
      { id: 'PIB', name: 'PIB', type: 'MACRO', impact: 'POSITIVE', weight: 1.2, description: 'Crescimento econômico' },
      { id: 'CAMBIO_B', name: 'Câmbio', type: 'CURRENCY', impact: 'NEGATIVE', weight: 0.7, description: 'Exposição cambial' },
      { id: 'BASIL', name: 'Índice Basileia', type: 'REGULATORY', impact: 'NEUTRAL', weight: 0.5, description: 'Adequação de capital' },
    ],
  },
  {
    id: 'VAREJO',
    name: 'Varejo',
    tickers: ['MGLU3', 'VIIA3', 'AMER3', 'LREN3', 'ARZZ3', 'SOMA3', 'PETZ3', 'MDIA3', 'GRND3', 'CEAB3'],
    factors: [
      { id: 'SELIC_V', name: 'SELIC', type: 'MONETARY', impact: 'NEGATIVE', weight: 1.5, description: 'Juros altos reduzem consumo' },
      { id: 'IPCA_V', name: 'IPCA', type: 'INFLATION', impact: 'NEGATIVE', weight: 1.3, description: 'Inflação corrói poder de compra' },
      { id: 'MASSA', name: 'Massa Salarial', type: 'INCOME', impact: 'POSITIVE', weight: 1.6, description: 'Renda disponível' },
      { id: 'ICC', name: 'Confiança Consumidor', type: 'SENTIMENT', impact: 'POSITIVE', weight: 1.4, description: 'Índice de confiança' },
      { id: 'DESEMP', name: 'Desemprego', type: 'LABOR', impact: 'NEGATIVE', weight: 1.5, description: 'Taxa de desemprego' },
    ],
  },
  {
    id: 'COMMODITIES',
    name: 'Commodities',
    tickers: ['VALE3', 'CSNA3', 'GGBR4', 'GOAU4', 'USIM5', 'SUZB3', 'KLBN11', 'CMIN3', 'BRAP4', 'FESA4'],
    factors: [
      { id: 'MINERIO', name: 'Minério de Ferro', type: 'COMMODITY', impact: 'POSITIVE', weight: 1.8, description: 'Preço spot do minério' },
      { id: 'CAMBIO_C', name: 'Câmbio', type: 'CURRENCY', impact: 'POSITIVE', weight: 1.5, description: 'Receita em dólar' },
      { id: 'CHINA', name: 'China PMI', type: 'DEMAND', impact: 'POSITIVE', weight: 1.6, description: 'Demanda chinesa' },
      { id: 'PLD_C', name: 'PLD', type: 'OPERATIONAL', impact: 'NEGATIVE', weight: 1.2, description: 'Custo de energia' },
      { id: 'BDI', name: 'Baltic Dry Index', type: 'LOGISTICS', impact: 'NEGATIVE', weight: 0.9, description: 'Frete marítimo' },
    ],
  },
  {
    id: 'TECNOLOGIA',
    name: 'Tecnologia',
    tickers: ['WEGE3', 'TOTS3', 'LWSA3', 'CASH3', 'POSI3', 'INTB3', 'MLAS3', 'SQIA3', 'NINJ3', 'BMOB3'],
    factors: [
      { id: 'SELIC_T', name: 'SELIC', type: 'MONETARY', impact: 'NEGATIVE', weight: 1.7, description: 'Growth stocks sofrem com juros' },
      { id: 'NASDAQ', name: 'NASDAQ', type: 'SENTIMENT', impact: 'POSITIVE', weight: 1.4, description: 'Correlação tech global' },
      { id: 'DIGITAL', name: 'Penetração Digital', type: 'STRUCTURAL', impact: 'POSITIVE', weight: 1.2, description: 'Adoção digital' },
      { id: 'CAMBIO_T', name: 'Câmbio', type: 'CURRENCY', impact: 'NEGATIVE', weight: 1.0, description: 'Custos em USD' },
      { id: 'VC', name: 'Venture Capital', type: 'FUNDING', impact: 'POSITIVE', weight: 0.8, description: 'Fluxo de capital' },
    ],
  },
]

export function getClusterForTicker(ticker: string): ClusterDefinition | undefined {
  return CLUSTERS.find(c => c.tickers.includes(ticker.toUpperCase()))
}

export function getAllTickers(): string[] {
  return CLUSTERS.flatMap(c => c.tickers)
}
