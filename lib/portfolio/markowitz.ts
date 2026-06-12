// Markowitz Portfolio Optimization

export interface Asset {
  ticker: string
  expectedReturn: number
  weight: number
}

export interface OptimizationResult {
  weights: Record<string, number>
  expectedReturn: number
  volatility: number
  sharpeRatio: number
}

export interface EfficientFrontierPoint {
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  weights: Record<string, number>
}

// Matrix operations
function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length
  const colsA = A[0]?.length || 0
  const colsB = B[0]?.length || 0
  
  const result: number[][] = Array(rowsA).fill(null).map(() => Array(colsB).fill(0))
  
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }
  
  return result
}

function matrixTranspose(A: number[][]): number[][] {
  const rows = A.length
  const cols = A[0]?.length || 0
  const result: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0))
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = A[i][j]
    }
  }
  
  return result
}

function vectorDot(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

// Portfolio metrics
export function calculatePortfolioReturn(weights: number[], returns: number[]): number {
  return vectorDot(weights, returns)
}

export function calculatePortfolioVariance(weights: number[], covMatrix: number[][]): number {
  const n = weights.length
  let variance = 0
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j]
    }
  }
  
  return variance
}

export function calculatePortfolioVolatility(weights: number[], covMatrix: number[][]): number {
  return Math.sqrt(calculatePortfolioVariance(weights, covMatrix))
}

export function calculateSharpeRatio(
  expectedReturn: number,
  volatility: number,
  riskFreeRate: number = 0.10
): number {
  if (volatility === 0) return 0
  return (expectedReturn - riskFreeRate) / volatility
}

// Minimum Variance Portfolio (analytical solution)
export function minimumVariancePortfolio(
  covMatrix: number[][],
  tickers: string[]
): OptimizationResult {
  const n = covMatrix.length
  if (n === 0) {
    return { weights: {}, expectedReturn: 0, volatility: 0, sharpeRatio: 0 }
  }
  
  // For MVP: weights = (Σ^-1 * 1) / (1' * Σ^-1 * 1)
  // Using gradient descent as matrix inversion can be unstable
  const weights = optimizeWeights(covMatrix, Array(n).fill(0), 0, 'minVariance')
  
  const weightsMap: Record<string, number> = {}
  tickers.forEach((ticker, i) => {
    weightsMap[ticker] = weights[i]
  })
  
  const volatility = calculatePortfolioVolatility(weights, covMatrix)
  
  return {
    weights: weightsMap,
    expectedReturn: 0,
    volatility,
    sharpeRatio: 0,
  }
}

// Maximum Sharpe Ratio Portfolio
export function maxSharpePortfolio(
  expectedReturns: number[],
  covMatrix: number[][],
  tickers: string[],
  riskFreeRate: number = 0.10
): OptimizationResult {
  const n = covMatrix.length
  if (n === 0) {
    return { weights: {}, expectedReturn: 0, volatility: 0, sharpeRatio: 0 }
  }
  
  const weights = optimizeWeights(covMatrix, expectedReturns, riskFreeRate, 'maxSharpe')
  
  const weightsMap: Record<string, number> = {}
  tickers.forEach((ticker, i) => {
    weightsMap[ticker] = weights[i]
  })
  
  const expectedReturn = calculatePortfolioReturn(weights, expectedReturns)
  const volatility = calculatePortfolioVolatility(weights, covMatrix)
  const sharpeRatio = calculateSharpeRatio(expectedReturn, volatility, riskFreeRate)
  
  return {
    weights: weightsMap,
    expectedReturn,
    volatility,
    sharpeRatio,
  }
}

// Target Return Portfolio
export function targetReturnPortfolio(
  expectedReturns: number[],
  covMatrix: number[][],
  tickers: string[],
  targetReturn: number
): OptimizationResult {
  const n = covMatrix.length
  if (n === 0) {
    return { weights: {}, expectedReturn: 0, volatility: 0, sharpeRatio: 0 }
  }
  
  const weights = optimizeWeights(covMatrix, expectedReturns, 0, 'targetReturn', targetReturn)
  
  const weightsMap: Record<string, number> = {}
  tickers.forEach((ticker, i) => {
    weightsMap[ticker] = weights[i]
  })
  
  const expectedReturn = calculatePortfolioReturn(weights, expectedReturns)
  const volatility = calculatePortfolioVolatility(weights, covMatrix)
  const sharpeRatio = calculateSharpeRatio(expectedReturn, volatility)
  
  return {
    weights: weightsMap,
    expectedReturn,
    volatility,
    sharpeRatio,
  }
}

// Gradient descent optimization
function optimizeWeights(
  covMatrix: number[][],
  expectedReturns: number[],
  riskFreeRate: number,
  objective: 'minVariance' | 'maxSharpe' | 'targetReturn',
  targetReturn?: number
): number[] {
  const n = covMatrix.length
  if (n === 0) return []
  
  // Initialize with equal weights
  let weights = Array(n).fill(1 / n)
  
  const learningRate = 0.01
  const iterations = 1000
  
  for (let iter = 0; iter < iterations; iter++) {
    const gradient = Array(n).fill(0)
    
    // Calculate current metrics
    const currentVariance = calculatePortfolioVariance(weights, covMatrix)
    const currentReturn = calculatePortfolioReturn(weights, expectedReturns)
    const currentVol = Math.sqrt(currentVariance)
    
    if (objective === 'minVariance') {
      // Gradient of variance w.r.t. weights: 2 * Σ * w
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          gradient[i] += 2 * covMatrix[i][j] * weights[j]
        }
      }
    } else if (objective === 'maxSharpe') {
      // Gradient of Sharpe Ratio
      const sharpe = currentVol !== 0 ? (currentReturn - riskFreeRate) / currentVol : 0
      for (let i = 0; i < n; i++) {
        const dReturnDw = expectedReturns[i]
        let dVolDw = 0
        for (let j = 0; j < n; j++) {
          dVolDw += covMatrix[i][j] * weights[j]
        }
        dVolDw = currentVol !== 0 ? dVolDw / currentVol : 0
        
        // d(Sharpe)/dw = (dReturn/dw * vol - (return - rf) * dVol/dw) / vol^2
        gradient[i] = -(dReturnDw * currentVol - (currentReturn - riskFreeRate) * dVolDw) / (currentVariance + 1e-10)
      }
    } else if (objective === 'targetReturn' && targetReturn !== undefined) {
      // Minimize variance subject to return constraint (Lagrangian)
      const lambda = 0.1 // Lagrange multiplier
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          gradient[i] += 2 * covMatrix[i][j] * weights[j]
        }
        gradient[i] -= lambda * (expectedReturns[i] - targetReturn)
      }
    }
    
    // Update weights
    for (let i = 0; i < n; i++) {
      weights[i] -= learningRate * gradient[i]
    }
    
    // Project to simplex (normalize and enforce non-negativity)
    weights = projectToSimplex(weights)
  }
  
  return weights
}

// Project weights to simplex (sum = 1, all >= 0)
function projectToSimplex(weights: number[]): number[] {
  const n = weights.length
  
  // Clip to non-negative
  let clipped = weights.map(w => Math.max(0, w))
  
  // Normalize
  const sum = clipped.reduce((a, b) => a + b, 0)
  if (sum > 0) {
    clipped = clipped.map(w => w / sum)
  } else {
    clipped = Array(n).fill(1 / n)
  }
  
  return clipped
}

// Generate Efficient Frontier
export function generateEfficientFrontier(
  expectedReturns: number[],
  covMatrix: number[][],
  tickers: string[],
  numPoints: number = 50,
  riskFreeRate: number = 0.10
): EfficientFrontierPoint[] {
  const n = expectedReturns.length
  if (n === 0) return []
  
  const minReturn = Math.min(...expectedReturns)
  const maxReturn = Math.max(...expectedReturns)
  
  const frontier: EfficientFrontierPoint[] = []
  
  for (let i = 0; i < numPoints; i++) {
    const targetReturn = minReturn + (maxReturn - minReturn) * (i / (numPoints - 1))
    const result = targetReturnPortfolio(expectedReturns, covMatrix, tickers, targetReturn)
    
    frontier.push({
      expectedReturn: result.expectedReturn,
      volatility: result.volatility,
      sharpeRatio: result.sharpeRatio,
      weights: result.weights,
    })
  }
  
  return frontier
}

// Risk contribution analysis
export function calculateRiskContribution(
  weights: number[],
  covMatrix: number[][],
  tickers: string[]
): Record<string, { marginalRisk: number; riskContribution: number; percentage: number }> {
  const n = weights.length
  const portfolioVol = calculatePortfolioVolatility(weights, covMatrix)
  
  const result: Record<string, { marginalRisk: number; riskContribution: number; percentage: number }> = {}
  
  for (let i = 0; i < n; i++) {
    // Marginal risk = (Σ * w)_i / σ_p
    let marginalRisk = 0
    for (let j = 0; j < n; j++) {
      marginalRisk += covMatrix[i][j] * weights[j]
    }
    marginalRisk = portfolioVol !== 0 ? marginalRisk / portfolioVol : 0
    
    // Risk contribution = w_i * marginal_risk
    const riskContribution = weights[i] * marginalRisk
    
    // Percentage of total risk
    const percentage = portfolioVol !== 0 ? riskContribution / portfolioVol : 0
    
    result[tickers[i]] = {
      marginalRisk,
      riskContribution,
      percentage,
    }
  }
  
  return result
}
