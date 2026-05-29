"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  Megaphone,
  MoreHorizontal,
  Play,
  Pause,
  BarChart3,
  Users,
  MousePointerClick,
} from "lucide-react"

type Campaign = {
  id: number
  name: string
  type: "email" | "sms" | "social"
  status: "ativa" | "pausada" | "rascunho" | "concluida"
  sent: number
  opened: number
  clicked: number
  converted: number
  startDate: string
}

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      name: "Promocao de Verao",
      type: "email",
      status: "ativa",
      sent: 5420,
      opened: 2856,
      clicked: 892,
      converted: 156,
      startDate: "10/01/2024",
    },
    {
      id: 2,
      name: "Lancamento Produto X",
      type: "email",
      status: "ativa",
      sent: 3200,
      opened: 1890,
      clicked: 567,
      converted: 89,
      startDate: "15/01/2024",
    },
    {
      id: 3,
      name: "Lembrete de Carrinho",
      type: "sms",
      status: "pausada",
      sent: 1250,
      opened: 980,
      clicked: 345,
      converted: 78,
      startDate: "08/01/2024",
    },
    {
      id: 4,
      name: "Campanha Redes Sociais",
      type: "social",
      status: "ativa",
      sent: 8900,
      opened: 4560,
      clicked: 1230,
      converted: 234,
      startDate: "01/01/2024",
    },
    {
      id: 5,
      name: "Black Friday 2024",
      type: "email",
      status: "rascunho",
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      startDate: "-",
    },
    {
      id: 6,
      name: "Natal 2023",
      type: "email",
      status: "concluida",
      sent: 12500,
      opened: 7800,
      clicked: 2340,
      converted: 567,
      startDate: "15/12/2023",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCampaignStatus = (id: number) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ativa" ? "pausada" : c.status === "pausada" ? "ativa" : c.status }
          : c
      )
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return Mail
      case "sms": return MessageSquare
      case "social": return Megaphone
      default: return Mail
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativa":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Ativa</Badge>
      case "pausada":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pausada</Badge>
      case "rascunho":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Rascunho</Badge>
      case "concluida":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Concluida</Badge>
      default:
        return null
    }
  }

  const totalStats = {
    sent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    opened: campaigns.reduce((sum, c) => sum + c.opened, 0),
    clicked: campaigns.reduce((sum, c) => sum + c.clicked, 0),
    converted: campaigns.reduce((sum, c) => sum + c.converted, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Campanhas</h2>
          <p className="text-slate-500">Gerencie suas campanhas de marketing</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStats.sent.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Enviados</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <Mail className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStats.opened.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Abertos</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <MousePointerClick className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStats.clicked.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Clicados</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStats.converted.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Convertidos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Buscar campanhas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border border-slate-300 rounded-xl"
        />
      </div>

      {/* Campaigns List */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
          <span className="col-span-2">Campanha</span>
          <span>Tipo</span>
          <span>Status</span>
          <span className="text-right">Enviados</span>
          <span className="text-right">Taxa Abertura</span>
          <span className="text-right">Conversoes</span>
          <span className="text-right">Acoes</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredCampaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type)
            const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : "0"

            return (
              <div
                key={campaign.id}
                className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <TypeIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{campaign.name}</p>
                    <p className="text-xs text-slate-500">Inicio: {campaign.startDate}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-600 capitalize">{campaign.type}</span>
                <div>{getStatusBadge(campaign.status)}</div>
                <span className="text-right text-sm text-slate-600">{campaign.sent.toLocaleString()}</span>
                <span className="text-right text-sm text-slate-600">{openRate}%</span>
                <span className="text-right text-sm font-medium text-slate-800">{campaign.converted}</span>
                <div className="flex justify-end gap-2">
                  {(campaign.status === "ativa" || campaign.status === "pausada") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className="h-8 w-8"
                    >
                      {campaign.status === "ativa" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
