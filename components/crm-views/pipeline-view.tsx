"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MoreHorizontal, DollarSign } from "lucide-react"

type Deal = {
  id: number
  name: string
  company: string
  value: string
  avatar: string
  daysInStage: number
}

type Stage = {
  id: string
  name: string
  color: string
  deals: Deal[]
}

export function PipelineView() {
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "lead",
      name: "Lead",
      color: "bg-slate-400",
      deals: [
        { id: 1, name: "Ana Costa", company: "TechStart", value: "R$ 15.000", avatar: "AC", daysInStage: 2 },
        { id: 2, name: "Bruno Lima", company: "Inovacao SA", value: "R$ 8.500", avatar: "BL", daysInStage: 5 },
      ],
    },
    {
      id: "qualified",
      name: "Qualificado",
      color: "bg-blue-400",
      deals: [
        { id: 3, name: "Carla Mendes", company: "DataCorp", value: "R$ 32.000", avatar: "CM", daysInStage: 3 },
        { id: 4, name: "Diego Santos", company: "CloudTech", value: "R$ 18.500", avatar: "DS", daysInStage: 7 },
        { id: 5, name: "Elena Ferreira", company: "Startup X", value: "R$ 12.000", avatar: "EF", daysInStage: 1 },
      ],
    },
    {
      id: "proposal",
      name: "Proposta",
      color: "bg-amber-400",
      deals: [
        { id: 6, name: "Fabio Alves", company: "Mega Corp", value: "R$ 45.000", avatar: "FA", daysInStage: 4 },
        { id: 7, name: "Gisele Rocha", company: "Prime Solutions", value: "R$ 28.000", avatar: "GR", daysInStage: 2 },
      ],
    },
    {
      id: "negotiation",
      name: "Negociacao",
      color: "bg-purple-400",
      deals: [
        { id: 8, name: "Hugo Martins", company: "Global Inc", value: "R$ 62.000", avatar: "HM", daysInStage: 6 },
      ],
    },
    {
      id: "closed",
      name: "Fechado",
      color: "bg-green-400",
      deals: [
        { id: 9, name: "Isabela Nunes", company: "Success Co", value: "R$ 38.000", avatar: "IN", daysInStage: 0 },
        { id: 10, name: "Julio Cesar", company: "Winner Ltd", value: "R$ 55.000", avatar: "JC", daysInStage: 0 },
      ],
    },
  ])

  const [draggedDeal, setDraggedDeal] = useState<{ deal: Deal; fromStage: string } | null>(null)

  const handleDragStart = (deal: Deal, stageId: string) => {
    setDraggedDeal({ deal, fromStage: stageId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toStageId: string) => {
    if (draggedDeal && draggedDeal.fromStage !== toStageId) {
      setStages((prevStages) =>
        prevStages.map((stage) => {
          if (stage.id === draggedDeal.fromStage) {
            return { ...stage, deals: stage.deals.filter((d) => d.id !== draggedDeal.deal.id) }
          }
          if (stage.id === toStageId) {
            return { ...stage, deals: [...stage.deals, { ...draggedDeal.deal, daysInStage: 0 }] }
          }
          return stage
        })
      )
    }
    setDraggedDeal(null)
  }

  const getTotalValue = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => {
      const value = parseFloat(deal.value.replace("R$ ", "").replace(".", "").replace(",", "."))
      return sum + value
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pipeline de Vendas</h2>
          <p className="text-slate-500">Arraste os negocios entre as etapas</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Negocio
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <Card className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold text-slate-800">{stage.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {stage.deals.length}
                  </Badge>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                R$ {getTotalValue(stage.deals).toLocaleString("pt-BR")}
              </div>

              <div className="space-y-3 min-h-[200px]">
                {stage.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal, stage.id)}
                    className="bg-white border border-slate-200 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                          {deal.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{deal.name}</p>
                        <p className="text-xs text-slate-500 truncate">{deal.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{deal.value}</span>
                      <span className="text-xs text-slate-400">
                        {deal.daysInStage === 0 ? "Hoje" : `${deal.daysInStage}d`}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
