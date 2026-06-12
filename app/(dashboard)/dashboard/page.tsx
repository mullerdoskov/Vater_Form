import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { getPortfolioSummary, getStockPositions, getDerivativePositions } from '@/app/actions/trades'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  const [summary, stockPositions, derivativePositions] = await Promise.all([
    getPortfolioSummary(),
    getStockPositions(),
    getDerivativePositions(),
  ])

  return (
    <DashboardContent 
      userName={session?.user?.name || 'Usuário'}
      summary={summary}
      stockPositions={stockPositions}
      derivativePositions={derivativePositions}
    />
  )
}
