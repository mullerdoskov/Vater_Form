'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseThesisWithLLM, type ParsedThesisIntent } from '@/lib/workspace/llm'
import { estimateTokens, formatTokenCount, formatCost, DEFAULT_BUDGET } from '@/lib/workspace/llm-utils'
import {
  runCorrelationAgent,
  runSeasonalityAgent,
  runScenarioAgent,
  runMacroAgent,
  runHedgeAgent,
  type CorrelationOutput,
  type SeasonalityOutput,
  type ScenarioOutput,
  type MacroOutput,
  type HedgeOutput,
} from '@/lib/workspace/agents'
import { CLUSTERS, type ScenarioDistribution } from '@/lib/workspace/gan-data'
import { generateGANScenarios } from '@/lib/workspace/gan'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, Area, AreaChart, Legend
} from 'recharts'

type AssetType = 'STOCK' | 'CALL' | 'PUT' | 'FUTURE'
type Direction = 'LONG' | 'SHORT'

interface PlannedPosition {
  id: string
  ticker: string
  assetType: AssetType
  direction: Direction
  quantity: number
  entryPrice: number
  strike?: number
  expiration?: string
}

type AgentStatus = 'idle' | 'running' | 'completed' | 'failed'

interface AgentState {
  correlation: { status: AgentStatus; output?: CorrelationOutput }
  seasonality: { status: AgentStatus; output?: SeasonalityOutput }
  scenario: { status: AgentStatus; output?: ScenarioOutput }
  macro: { status: AgentStatus; output?: MacroOutput }
  hedge: { status: AgentStatus; output?: HedgeOutput }
}

export function WorkspaceContent() {
  // Thesis state
  const [thesis, setThesis] = useState('')
  const [parsedIntent, setParsedIntent] = useState<ParsedThesisIntent | null>(null)
  const [isParsingThesis, setIsParsingThesis] = useState(false)
  
  // Token tracking
  const [tokensUsed, setTokensUsed] = useState({ input: 0, output: 0, total: 0 })
  const [estimatedCost, setEstimatedCost] = useState(0)
  
  // Positions
  const [positions, setPositions] = useState<PlannedPosition[]>([])
  const [newPosition, setNewPosition] = useState<Partial<PlannedPosition>>({
    assetType: 'STOCK',
    direction: 'LONG',
    quantity: 100,
  })
  
  // Agents
  const [agents, setAgents] = useState<AgentState>({
    correlation: { status: 'idle' },
    seasonality: { status: 'idle' },
    scenario: { status: 'idle' },
    macro: { status: 'idle' },
    hedge: { status: 'idle' },
  })
  
  // GAN scenarios
  const [ganScenarios, setGanScenarios] = useState<ScenarioDistribution | null>(null)
  
  // Calculate token estimate as user types
  const thesisTokens = estimateTokens(thesis)
  const budgetRemaining = DEFAULT_BUDGET.maxTotalPerDay - tokensUsed.total
  
  // Parse thesis
  const handleParseThesis = useCallback(async () => {
    if (!thesis.trim()) return
    
    setIsParsingThesis(true)
    try {
      const result = await parseThesisWithLLM(thesis)
      setParsedIntent(result.result)
      setTokensUsed(prev => ({
        input: prev.input + result.tokensUsed.input,
        output: prev.output + result.tokensUsed.output,
        total: prev.total + result.tokensUsed.input + result.tokensUsed.output,
      }))
      setEstimatedCost(prev => prev + result.estimatedCost)
      
      // Auto-add detected assets as positions
      if (result.result.assets.length > 0) {
        const autoPositions: PlannedPosition[] = result.result.assets.map((asset, i) => ({
          id: `auto_${Date.now()}_${i}`,
          ticker: asset.ticker,
          assetType: 'STOCK' as AssetType,
          direction: result.result.direction === 'BEARISH' ? 'SHORT' : 'LONG',
          quantity: 100,
          entryPrice: 0,
        }))
        setPositions(prev => [...prev, ...autoPositions])
      }
    } catch (error) {
      console.error('Error parsing thesis:', error)
    } finally {
      setIsParsingThesis(false)
    }
  }, [thesis])
  
  // Run all agents
  const handleRunSimulation = useCallback(async () => {
    if (!parsedIntent) return
    
    const tickers = positions.map(p => p.ticker).filter(Boolean)
    if (tickers.length === 0) return
    
    // Run agents in parallel
    setAgents({
      correlation: { status: 'running' },
      seasonality: { status: 'running' },
      scenario: { status: 'running' },
      macro: { status: 'running' },
      hedge: { status: 'running' },
    })
    
    // Generate GAN scenarios first
    const firstTicker = tickers[0]
    const scenarios = await generateGANScenarios(firstTicker)
    setGanScenarios(scenarios)
    
    // Run agents
    const [correlationResult, seasonalityResult, scenarioResult, macroResult] = await Promise.all([
      runCorrelationAgent(tickers, parsedIntent),
      runSeasonalityAgent(tickers, parsedIntent),
      runScenarioAgent(tickers, parsedIntent, scenarios),
      runMacroAgent(parsedIntent),
    ])
    
    setAgents(prev => ({
      ...prev,
      correlation: { status: 'completed', output: correlationResult.output },
      seasonality: { status: 'completed', output: seasonalityResult.output },
      scenario: { status: 'completed', output: scenarioResult.output },
      macro: { status: 'completed', output: macroResult.output },
    }))
    
    // Run hedge agent after scenario
    const hedgeResult = await runHedgeAgent(tickers, parsedIntent, scenarioResult.output)
    setAgents(prev => ({
      ...prev,
      hedge: { status: 'completed', output: hedgeResult.output },
    }))
  }, [parsedIntent, positions])
  
  // Add position
  const handleAddPosition = useCallback(() => {
    if (!newPosition.ticker) return
    
    setPositions(prev => [...prev, {
      id: `pos_${Date.now()}`,
      ticker: newPosition.ticker!.toUpperCase(),
      assetType: newPosition.assetType ?? 'STOCK',
      direction: newPosition.direction ?? 'LONG',
      quantity: newPosition.quantity ?? 100,
      entryPrice: newPosition.entryPrice ?? 0,
      strike: newPosition.strike,
      expiration: newPosition.expiration,
    }])
    
    setNewPosition({ assetType: 'STOCK', direction: 'LONG', quantity: 100 })
  }, [newPosition])
  
  // Remove position
  const handleRemovePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id))
  }, [])
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Workspace de Simulações</h1>
        <p className="text-muted-foreground">
          Insira sua tese de investimento e monte posições para simular cenários
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Thesis & Positions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Thesis Input */}
          <Card className="stat-box stat-blue rounded-xl p-5">
            <div className="relative flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tese de Investimento</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tokens:</span>
                  <span className={`font-mono ${thesisTokens > DEFAULT_BUDGET.maxInputTokens ? 'text-negative' : 'text-info'}`}>
                    {formatTokenCount(thesisTokens)} / {formatTokenCount(DEFAULT_BUDGET.maxInputTokens)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-mono text-positive">{formatTokenCount(budgetRemaining)}</span>
                </div>
              </div>
            </div>
            
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Ex: Acredito que com a queda da SELIC e aquecimento da China, VALE3 deve subir nos próximos 2 meses. Quero montar posição comprada em ações com proteção via put."
              className="relative w-full h-32 p-3 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <div className="relative flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-info pulse-dot" />
                <span>AI interpreta sua tese e sugere posições e estratégias</span>
              </div>
              <Button 
                onClick={handleParseThesis}
                disabled={isParsingThesis || !thesis.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isParsingThesis ? 'Analisando...' : 'Analisar Tese'}
              </Button>
            </div>
          </Card>
          
          {/* Parsed Intent */}
          {parsedIntent && (
            <Card className="stat-box stat-green rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 relative">Análise da Tese</h3>
              
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-background/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Direção</p>
                  <p className={`text-lg font-bold ${
                    parsedIntent.direction === 'BULLISH' ? 'text-positive' :
                    parsedIntent.direction === 'BEARISH' ? 'text-negative' : 'text-warning'
                  }`}>
                    {parsedIntent.direction}
                  </p>
                </div>
                <div className="p-3 bg-background/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Confiança</p>
                  <p className="text-lg font-bold text-foreground">{parsedIntent.confidence}%</p>
                </div>
                <div className="p-3 bg-background/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Horizonte</p>
                  <p className="text-lg font-bold text-foreground">{parsedIntent.timeHorizon}</p>
                </div>
                <div className="p-3 bg-background/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Setores</p>
                  <p className="text-lg font-bold text-foreground">{parsedIntent.sectors.join(', ') || 'N/A'}</p>
                </div>
              </div>
              
              {parsedIntent.keyInsights.length > 0 && (
                <div className="relative mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Insights</p>
                  <ul className="space-y-1">
                    {parsedIntent.keyInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-info">•</span> {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {parsedIntent.warnings.length > 0 && (
                <div className="relative">
                  <p className="text-sm font-medium text-foreground mb-2">Alertas</p>
                  <ul className="space-y-1">
                    {parsedIntent.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-warning flex items-start gap-2">
                        <span>⚠</span> {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
          
          {/* Position Builder */}
          <Card className="stat-box stat-violet rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 relative">Construtor de Posições</h3>
            
            {/* Add Position Form */}
            <div className="relative grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              <Input
                placeholder="Ticker"
                value={newPosition.ticker ?? ''}
                onChange={(e) => setNewPosition(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                className="bg-background/50 border-border"
              />
              <select
                value={newPosition.assetType}
                onChange={(e) => setNewPosition(prev => ({ ...prev, assetType: e.target.value as AssetType }))}
                className="h-9 px-3 bg-background/50 border border-border rounded-md text-foreground text-sm"
              >
                <option value="STOCK">Ação</option>
                <option value="CALL">Call</option>
                <option value="PUT">Put</option>
                <option value="FUTURE">Futuro</option>
              </select>
              <select
                value={newPosition.direction}
                onChange={(e) => setNewPosition(prev => ({ ...prev, direction: e.target.value as Direction }))}
                className="h-9 px-3 bg-background/50 border border-border rounded-md text-foreground text-sm"
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
              <Input
                type="number"
                placeholder="Qtd"
                value={newPosition.quantity ?? ''}
                onChange={(e) => setNewPosition(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="bg-background/50 border-border"
              />
              <Input
                type="number"
                placeholder="Preço"
                value={newPosition.entryPrice ?? ''}
                onChange={(e) => setNewPosition(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                className="bg-background/50 border-border"
              />
              <Button onClick={handleAddPosition} variant="secondary" className="h-9">
                + Adicionar
              </Button>
            </div>
            
            {/* Positions Table */}
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Ticker</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Tipo</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Direção</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Qtd</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Preço</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Valor</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-border/50">
                      <td className="py-2 font-medium text-foreground">{pos.ticker}</td>
                      <td className="py-2 text-muted-foreground">{pos.assetType}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          pos.direction === 'LONG' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'
                        }`}>
                          {pos.direction}
                        </span>
                      </td>
                      <td className="py-2 text-right tabular-nums text-foreground">{pos.quantity}</td>
                      <td className="py-2 text-right tabular-nums text-foreground">
                        {pos.entryPrice > 0 ? `R$ ${pos.entryPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2 text-right tabular-nums text-foreground">
                        {pos.entryPrice > 0 ? `R$ ${(pos.quantity * pos.entryPrice).toLocaleString('pt-BR')}` : '-'}
                      </td>
                      <td className="py-2">
                        <button 
                          onClick={() => handleRemovePosition(pos.id)}
                          className="text-muted-foreground hover:text-negative"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  {positions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Nenhuma posição adicionada. Analise uma tese ou adicione manualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {positions.length > 0 && (
              <div className="relative mt-4 flex justify-end">
                <Button 
                  onClick={handleRunSimulation}
                  disabled={!parsedIntent}
                  className="bg-primary hover:bg-primary/90"
                >
                  Executar Simulação
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right Column - Agents & Results */}
        <div className="space-y-6">
          {/* Token Usage Card */}
          <Card className="stat-box stat-amber rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 relative">Consumo de Tokens</h3>
            <div className="relative space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Input Tokens</span>
                <span className="font-mono text-foreground">{formatTokenCount(tokensUsed.input)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Output Tokens</span>
                <span className="font-mono text-foreground">{formatTokenCount(tokensUsed.output)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Usado</span>
                <span className="font-mono font-medium text-foreground">{formatTokenCount(tokensUsed.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo Estimado</span>
                <span className="font-mono text-warning">{formatCost(estimatedCost)}</span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2">
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-positive to-warning transition-all"
                    style={{ width: `${Math.min(100, (tokensUsed.total / DEFAULT_BUDGET.maxTotalPerDay) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {((tokensUsed.total / DEFAULT_BUDGET.maxTotalPerDay) * 100).toFixed(1)}% do budget diário
                </p>
              </div>
            </div>
          </Card>
          
          {/* Agent Status Cards */}
          <Card className="stat-box stat-cyan rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 relative">Status dos Agents</h3>
            <div className="relative space-y-3">
              <AgentStatusRow name="Correlação" status={agents.correlation.status} />
              <AgentStatusRow name="Sazonalidade" status={agents.seasonality.status} />
              <AgentStatusRow name="Cenários GAN" status={agents.scenario.status} />
              <AgentStatusRow name="Macro" status={agents.macro.status} />
              <AgentStatusRow name="Hedge" status={agents.hedge.status} />
            </div>
          </Card>
          
          {/* Clusters Reference */}
          <Card className="stat-box stat-red rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4 relative">Clusters Setoriais</h3>
            <div className="relative space-y-3 max-h-48 overflow-y-auto">
              {CLUSTERS.map((cluster) => (
                <div key={cluster.id} className="p-2 bg-background/40 rounded-lg">
                  <p className="text-sm font-medium text-foreground">{cluster.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cluster.tickers.slice(0, 5).join(', ')}{cluster.tickers.length > 5 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Results Section */}
      {(agents.scenario.output || agents.correlation.output) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenario Distribution */}
          {agents.scenario.output && (
            <Card className="stat-box stat-blue rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 relative">Distribuição de Cenários</h3>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agents.scenario.output.distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="bucket" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probabilidade']}
                    />
                    <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                      {agents.scenario.output.distribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.bucket.includes('-') ? 'oklch(0.65 0.26 25)' : 'oklch(0.72 0.24 150)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Risk Metrics */}
              <div className="relative grid grid-cols-3 gap-3 mt-4">
                <div className="p-2 bg-background/40 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Retorno Esperado</p>
                  <p className={`text-lg font-bold ${agents.scenario.output.riskMetrics.expectedReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {(agents.scenario.output.riskMetrics.expectedReturn * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 bg-background/40 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">VaR 95%</p>
                  <p className="text-lg font-bold text-negative">
                    {(agents.scenario.output.scenarios[2]?.var95 * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 bg-background/40 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Sharpe</p>
                  <p className="text-lg font-bold text-foreground">
                    {agents.scenario.output.riskMetrics.sharpeRatio.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Scenario Cards */}
          {agents.scenario.output && (
            <Card className="stat-box stat-green rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 relative">Cenários Projetados</h3>
              <div className="relative space-y-3">
                {agents.scenario.output.scenarios.map((scenario) => (
                  <div 
                    key={scenario.name}
                    className={`p-4 rounded-lg border ${
                      scenario.name === 'Otimista' ? 'bg-positive/10 border-positive/30' :
                      scenario.name === 'Stress' ? 'bg-negative/10 border-negative/30' :
                      'bg-warning/10 border-warning/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground">{scenario.name}</span>
                      <span className="text-sm text-muted-foreground">{(scenario.probability * 100).toFixed(0)}% prob.</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Retorno</p>
                        <p className={`font-medium ${scenario.expectedReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {(scenario.expectedReturn * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Max DD</p>
                        <p className="font-medium text-negative">{(scenario.maxDrawdown * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CVaR</p>
                        <p className="font-medium text-warning">{(scenario.cvar95 * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{scenario.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Correlation Matrix */}
          {agents.correlation.output && agents.correlation.output.matrix.length > 0 && (
            <Card className="stat-box stat-violet rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 relative">Matriz de Correlação</h3>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Par</th>
                      <th className="text-right py-2 text-muted-foreground">Correlação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.correlation.output.matrix.map((pair, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{pair.ticker1} / {pair.ticker2}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            pair.correlation > 0.7 ? 'bg-positive/20 text-positive' :
                            pair.correlation < 0.3 ? 'bg-negative/20 text-negative' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {pair.correlation.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="relative mt-4 p-3 bg-background/40 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Score de Diversificação: <span className="font-bold text-foreground">{agents.correlation.output.diversificationScore}/100</span>
                </p>
              </div>
            </Card>
          )}
          
          {/* Macro Analysis */}
          {agents.macro.output && (
            <Card className="stat-box stat-amber rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4 relative">Análise Macro</h3>
              <div className="relative space-y-3">
                {agents.macro.output.relevantFactors.map((factor, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-background/40 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{factor.factor}</p>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground">{factor.currentValue}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        factor.impactOnPortfolio === 'POSITIVE' ? 'bg-positive/20 text-positive' :
                        factor.impactOnPortfolio === 'NEGATIVE' ? 'bg-negative/20 text-negative' :
                        'bg-muted/20 text-muted-foreground'
                      }`}>
                        {factor.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 p-3 bg-background/40 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Score Macro: <span className={`font-bold ${agents.macro.output.overallMacroScore >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {agents.macro.output.overallMacroScore > 0 ? '+' : ''}{agents.macro.output.overallMacroScore}
                  </span>
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
      
      {/* Hedge Recommendations */}
      {agents.hedge.output && (
        <Card className="stat-box stat-red rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 relative">Recomendações de Hedge</h3>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.hedge.output.recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-background/40 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-info/20 text-info">{rec.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm text-foreground mb-2">{rec.description}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Custo: {(rec.estimatedCost * 100).toFixed(2)}% do portfolio</p>
                  <p>Proteção: {(rec.protectionLevel * 100).toFixed(0)}%</p>
                  <p className="text-warning">{rec.tradeoff}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function AgentStatusRow({ name, status }: { name: string; status: AgentStatus }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{name}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        status === 'idle' ? 'bg-muted/20 text-muted-foreground' :
        status === 'running' ? 'bg-info/20 text-info' :
        status === 'completed' ? 'bg-positive/20 text-positive' :
        'bg-negative/20 text-negative'
      }`}>
        {status === 'idle' ? 'Aguardando' :
         status === 'running' ? 'Executando...' :
         status === 'completed' ? 'Concluído' : 'Erro'}
      </span>
    </div>
  )
}
