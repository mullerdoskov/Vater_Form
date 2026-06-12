import { Metadata } from 'next'
import { WorkspaceContent } from '@/components/workspace/workspace-content'

export const metadata: Metadata = {
  title: 'Workspace - TradingBook',
  description: 'Simulações AI com análise de tese, cenários GAN e agents especializados',
}

export default function WorkspacePage() {
  return <WorkspaceContent />
}
