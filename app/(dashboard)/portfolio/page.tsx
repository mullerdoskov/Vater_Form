import { getStockPositions, getDerivativePositions, getPortfolioSummary } from '@/app/actions/trades'
import { PortfolioContent } from '@/components/portfolio/portfolio-content'

export default async function PortfolioPage() {
  const [stockPositions, derivativePositions, summary] = await Promise.all([
    getStockPositions(),
    getDerivativePositions(),
    getPortfolioSummary(),
  ])

  return (
    <PortfolioContent 
      stockPositions={stockPositions}
      derivativePositions={derivativePositions}
      summary={summary}
    />
  )
}
