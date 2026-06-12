import { getStockTrades, getDerivativeTrades } from '@/app/actions/trades'
import { BookContent } from '@/components/book/book-content'

export default async function BookPage() {
  const [stockTrades, derivativeTrades] = await Promise.all([
    getStockTrades(),
    getDerivativeTrades(),
  ])

  return (
    <BookContent 
      stockTrades={stockTrades}
      derivativeTrades={derivativeTrades}
    />
  )
}
