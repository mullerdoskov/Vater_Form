// VaR and Risk calculations using EWMA + Monte Carlo with t-Student distribution

export interface RiskMetrics {
  var95: number
  var99: number
  cvar95: number
  cvar99: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
}

export interface PortfolioRisk {
  stocks: RiskMetrics
  derivatives: RiskMetrics
  total: RiskMetrics
}

// EWMA (Exponentially Weighted Moving Average) for variance
export function calculateEWMAVariance(returns: number[], lambda: number = 0.94): number {
  if (returns.length === 0) return 0
  
  let ewmaVariance = returns[0] ** 2
  
  for (let i = 1; i < returns.length; i++) {
    ewmaVariance = lambda * ewmaVariance + (1 - lambda) * returns[i] ** 2
  }
  
  return ewmaVariance
}

// EWMA Covariance Matrix for multivariate case
export function calculateEWMACovarianceMatrix(
  returnsMatrix: number[][], // Each row is a time series of returns for an asset
  lambda: number = 0.94
): number[][] {
  const n = returnsMatrix.length // number of assets
  if (n === 0) return []
  
  const t = returnsMatrix[0].length // number of time periods
  
  // Initialize covariance matrix
  const covMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  
  // Initialize with first observation
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      covMatrix[i][j] = returnsMatrix[i][0] * returnsMatrix[j][0]
    }
  }
  
  // Update with EWMA
  for (let k = 1; k < t; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        covMatrix[i][j] = lambda * covMatrix[i][j] + (1 - lambda) * returnsMatrix[i][k] * returnsMatrix[j][k]
      }
    }
  }
  
  return covMatrix
}

// t-Student distribution inverse CDF approximation
function tStudentInverseCDF(p: number, df: number): number {
  // Using approximation for t-distribution quantile
  const a = 8 * (Math.PI - 3) / (3 * Math.PI * (4 - Math.PI))
  const x = 2 * p - 1
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  
  // Normal approximation then adjust for heavier tails
  const erfInv = sign * Math.sqrt(
    Math.sqrt(Math.pow(2 / (Math.PI * a) + Math.log(1 - absX * absX) / 2, 2) - Math.log(1 - absX * absX) / a) -
    (2 / (Math.PI * a) + Math.log(1 - absX * absX) / 2)
  )
  
  const normal = Math.sqrt(2) * erfInv
  
  // Adjust for t-distribution (heavier tails for lower df)
  const adjustment = 1 + (1 / (4 * df)) * (normal ** 2 + 1)
  return normal * adjustment
}

// Generate random t-Student samples using inverse transform
function generateTStudentSamples(n: number, df: number = 5): number[] {
  const samples: number[] = []
  for (let i = 0; i < n; i++) {
    const u = Math.random()
    samples.push(tStudentInverseCDF(u, df))
  }
  return samples
}

// Cholesky decomposition for correlated random numbers
function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length
  const L: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0
      
      if (j === i) {
        for (let k = 0; k < j; k++) {
          sum += L[j][k] ** 2
        }
        L[j][j] = Math.sqrt(Math.max(0, matrix[j][j] - sum))
      } else {
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k]
        }
        L[i][j] = L[j][j] !== 0 ? (matrix[i][j] - sum) / L[j][j] : 0
      }
    }
  }
  
  return L
}

// Monte Carlo VaR with Random Walk and t-Student distribution
export function calculateMonteCarloVaR(
  portfolioValue: number,
  weights: number[],
  covarianceMatrix: number[][],
  numSimulations: number = 10000,
  horizon: number = 1, // days
  confidenceLevel: number = 0.95,
  degreesOfFreedom: number = 5
): { var: number; cvar: number; simulations: number[] } {
  const n = weights.length
  if (n === 0 || covarianceMatrix.length === 0) {
    return { var: 0, cvar: 0, simulations: [] }
  }
  
  // Cholesky decomposition
  const L = choleskyDecomposition(covarianceMatrix)
  
  const portfolioReturns: number[] = []
  
  for (let sim = 0; sim < numSimulations; sim++) {
    // Generate correlated t-Student random numbers
    const z = generateTStudentSamples(n, degreesOfFreedom)
    
    // Transform to correlated
    const correlatedReturns: number[] = Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        correlatedReturns[i] += L[i][j] * z[j]
      }
    }
    
    // Scale by volatilities (diagonal of covariance matrix)
    for (let i = 0; i < n; i++) {
      correlatedReturns[i] *= Math.sqrt(covarianceMatrix[i][i] * horizon)
    }
    
    // Portfolio return
    let portfolioReturn = 0
    for (let i = 0; i < n; i++) {
      portfolioReturn += weights[i] * correlatedReturns[i]
    }
    
    portfolioReturns.push(portfolioReturn)
  }
  
  // Sort returns for VaR calculation
  portfolioReturns.sort((a, b) => a - b)
  
  const varIndex = Math.floor((1 - confidenceLevel) * numSimulations)
  const varReturn = portfolioReturns[varIndex]
  
  // CVaR (Expected Shortfall) - average of returns below VaR
  let cvarSum = 0
  for (let i = 0; i <= varIndex; i++) {
    cvarSum += portfolioReturns[i]
  }
  const cvarReturn = cvarSum / (varIndex + 1)
  
  return {
    var: Math.abs(varReturn * portfolioValue),
    cvar: Math.abs(cvarReturn * portfolioValue),
    simulations: portfolioReturns,
  }
}

// Calculate log returns
export function calculateLogReturns(prices: number[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]))
    }
  }
  return returns
}

// Calculate portfolio risk metrics
export function calculateRiskMetrics(
  returns: number[],
  portfolioValue: number,
  riskFreeRate: number = 0.10 // SELIC ~10%
): RiskMetrics {
  if (returns.length === 0) {
    return {
      var95: 0,
      var99: 0,
      cvar95: 0,
      cvar99: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      beta: 0,
    }
  }
  
  // EWMA Volatility
  const ewmaVar = calculateEWMAVariance(returns)
  const volatility = Math.sqrt(ewmaVar) * Math.sqrt(252) // Annualized
  
  // Mean return
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const annualizedReturn = meanReturn * 252
  
  // Sharpe Ratio
  const sharpeRatio = volatility !== 0 ? (annualizedReturn - riskFreeRate) / volatility : 0
  
  // Max Drawdown
  let maxDrawdown = 0
  let peak = portfolioValue
  let cumulativeValue = portfolioValue
  
  for (const ret of returns) {
    cumulativeValue *= (1 + ret)
    if (cumulativeValue > peak) {
      peak = cumulativeValue
    }
    const drawdown = (peak - cumulativeValue) / peak
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }
  
  // VaR using parametric method with EWMA variance
  const dailyVol = Math.sqrt(ewmaVar)
  const var95 = portfolioValue * dailyVol * 1.645 // 95% confidence
  const var99 = portfolioValue * dailyVol * 2.326 // 99% confidence
  
  // CVaR approximation
  const cvar95 = var95 * 1.15 // Simple approximation
  const cvar99 = var99 * 1.12
  
  return {
    var95,
    var99,
    cvar95,
    cvar99,
    volatility,
    sharpeRatio,
    maxDrawdown,
    beta: 1, // Placeholder - would need market returns
  }
}

// Correlation matrix calculation
export function calculateCorrelationMatrix(returnsMatrix: number[][]): number[][] {
  const n = returnsMatrix.length
  if (n === 0) return []
  
  const corr: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        corr[i][j] = 1
      } else {
        const cov = calculateCovariance(returnsMatrix[i], returnsMatrix[j])
        const std_i = Math.sqrt(calculateEWMAVariance(returnsMatrix[i]))
        const std_j = Math.sqrt(calculateEWMAVariance(returnsMatrix[j]))
        corr[i][j] = (std_i !== 0 && std_j !== 0) ? cov / (std_i * std_j) : 0
      }
    }
  }
  
  return corr
}

function calculateCovariance(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0
  
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n
  
  let cov = 0
  for (let i = 0; i < n; i++) {
    cov += (x[i] - meanX) * (y[i] - meanY)
  }
  
  return cov / n
}
