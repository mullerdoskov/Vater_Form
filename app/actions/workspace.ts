'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { simulations, plannedPositions, tokenUsage } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { parseThesisWithLLM, type ParsedThesisIntent } from '@/lib/workspace/llm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Create a new simulation
export async function createSimulation(data: {
  name: string
  thesis: string
}) {
  const userId = await getUserId()
  
  // Parse thesis with LLM
  const llmResult = await parseThesisWithLLM(data.thesis)
  
  // Create simulation record
  const [simulation] = await db.insert(simulations).values({
    userId,
    name: data.name,
    thesis: data.thesis,
    parsedIntent: llmResult.result as unknown as Record<string, unknown>,
    status: 'draft',
    tokensUsed: llmResult.tokensUsed.input + llmResult.tokensUsed.output,
  }).returning()
  
  // Update token usage
  const today = new Date().toISOString().split('T')[0]
  await db.insert(tokenUsage).values({
    userId,
    date: today,
    inputTokens: llmResult.tokensUsed.input,
    outputTokens: llmResult.tokensUsed.output,
    totalTokens: llmResult.tokensUsed.input + llmResult.tokensUsed.output,
    estimatedCost: String(llmResult.estimatedCost),
  }).onConflictDoUpdate({
    target: [tokenUsage.userId, tokenUsage.date],
    set: {
      inputTokens: llmResult.tokensUsed.input,
      outputTokens: llmResult.tokensUsed.output,
      totalTokens: llmResult.tokensUsed.input + llmResult.tokensUsed.output,
    },
  })
  
  revalidatePath('/workspace')
  
  return {
    simulation,
    parsedIntent: llmResult.result,
    tokensUsed: llmResult.tokensUsed,
  }
}

// Get user's simulations
export async function getSimulations() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(simulations)
    .where(eq(simulations.userId, userId))
    .orderBy(desc(simulations.createdAt))
    .limit(20)
}

// Get simulation by ID
export async function getSimulationById(id: number) {
  const userId = await getUserId()
  
  const [simulation] = await db
    .select()
    .from(simulations)
    .where(and(eq(simulations.id, id), eq(simulations.userId, userId)))
    .limit(1)
  
  if (!simulation) throw new Error('Simulation not found')
  
  const positions = await db
    .select()
    .from(plannedPositions)
    .where(eq(plannedPositions.simulationId, id))
  
  return { simulation, positions }
}

// Add position to simulation
export async function addPlannedPosition(data: {
  simulationId: number
  ticker: string
  assetType: 'STOCK' | 'CALL' | 'PUT' | 'FUTURE'
  direction: 'LONG' | 'SHORT'
  quantity: number
  entryPrice?: number
  strike?: number
  expiration?: string
  underlying?: string
}) {
  const userId = await getUserId()
  
  const [position] = await db.insert(plannedPositions).values({
    simulationId: data.simulationId,
    userId,
    ticker: data.ticker.toUpperCase(),
    assetType: data.assetType,
    direction: data.direction,
    quantity: data.quantity,
    entryPrice: data.entryPrice ? String(data.entryPrice) : null,
    strike: data.strike ? String(data.strike) : null,
    expiration: data.expiration,
    underlying: data.underlying,
  }).returning()
  
  revalidatePath('/workspace')
  return position
}

// Update simulation status
export async function updateSimulationStatus(
  id: number, 
  status: 'draft' | 'running' | 'completed' | 'failed',
  results?: Record<string, unknown>
) {
  const userId = await getUserId()
  
  await db.update(simulations)
    .set({ 
      status, 
      results: results as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(and(eq(simulations.id, id), eq(simulations.userId, userId)))
  
  revalidatePath('/workspace')
}

// Get today's token usage
export async function getTodayTokenUsage() {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]
  
  const [usage] = await db
    .select()
    .from(tokenUsage)
    .where(and(eq(tokenUsage.userId, userId), eq(tokenUsage.date, today)))
    .limit(1)
  
  return usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: '0' }
}

// Delete simulation
export async function deleteSimulation(id: number) {
  const userId = await getUserId()
  
  // Delete positions first
  await db.delete(plannedPositions)
    .where(eq(plannedPositions.simulationId, id))
  
  // Delete simulation
  await db.delete(simulations)
    .where(and(eq(simulations.id, id), eq(simulations.userId, userId)))
  
  revalidatePath('/workspace')
}
