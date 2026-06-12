/**
 * LLM Utilities - Client-side helpers for token counting and budget display
 */

// Token estimation (approximate, based on GPT-4 tokenization)
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  // Portuguese tends to be slightly more tokens per character
  return Math.ceil(text.length / 3.5)
}

// Budget configuration
export interface TokenBudget {
  maxInputTokens: number
  maxOutputTokens: number
  maxTotalPerDay: number
  costPerInputToken: number   // in USD
  costPerOutputToken: number  // in USD
}

export const DEFAULT_BUDGET: TokenBudget = {
  maxInputTokens: 4000,
  maxOutputTokens: 2000,
  maxTotalPerDay: 100000,
  costPerInputToken: 0.00001,   // $0.01 per 1K tokens
  costPerOutputToken: 0.00003,  // $0.03 per 1K tokens
}

// Token budget check
export function checkBudget(
  estimatedTokens: number,
  usedToday: number,
  budget: TokenBudget = DEFAULT_BUDGET
): { allowed: boolean; remaining: number; message: string } {
  const remaining = budget.maxTotalPerDay - usedToday
  
  if (estimatedTokens > remaining) {
    return {
      allowed: false,
      remaining,
      message: `Orçamento insuficiente. Necessário: ${estimatedTokens}, Disponível: ${remaining}`,
    }
  }
  
  return {
    allowed: true,
    remaining: remaining - estimatedTokens,
    message: `Orçamento OK. Restante após operação: ${remaining - estimatedTokens}`,
  }
}

// Format token count for display
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

// Estimate cost for display
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(2)}¢`
  }
  return `$${cost.toFixed(4)}`
}
