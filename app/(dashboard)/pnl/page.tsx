import { getStockTrades, getDerivativeTrades, getPortfolioSummary } from '@/app/actions/trades'
import { PnlContent } from '@/components/pnl/pnl-content'

export default async function PnlPage() {
  const [stockTrades, derivativeTrades, summary] = await Promise.all([
    getStockTrades(),
    getDerivativeTrades(),
    getPortfolioSummary(),
  ])

  return (
    <PnlContent 
      stockTrades={stockTrades}
      derivativeTrades={derivativeTrades}
      summary={summary}
    />
  )
}
