import { getStockPositions, getDerivativePositions, getPortfolioSummary } from '@/app/actions/trades'
import { RiskContent } from '@/components/risk/risk-content'

export default async function RiskPage() {
  const [stockPositions, derivativePositions, summary] = await Promise.all([
    getStockPositions(),
    getDerivativePositions(),
    getPortfolioSummary(),
  ])

  return (
    <RiskContent 
      stockPositions={stockPositions}
      derivativePositions={derivativePositions}
      summary={summary}
    />
  )
}
