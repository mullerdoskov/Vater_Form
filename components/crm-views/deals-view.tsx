"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  MoreHorizontal,
  DollarSign,
  Calendar,
  Building2,
  X,
  Check,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  GripVertical,
  User,
  FileText,
  ChevronRight,
  Clock,
  Tag,
  Mic,
} from "lucide-react"

type DealTag = { name: string; color: string }

type Deal = {
  id: string
  title: string
  company: string
  contact: string
  value: number
  stage: string
  probability: number
  closeDate: string
  createdAt: string
  seller: string
  sellerAvatar: string
  product: string
  policyNumber?: string
  tags: DealTag[]
}

type Stage = {
  id: string
  name: string
  probability: number
  color: string
}

type TimelineItem = {
  type: "creation" | "move" | "note" | "task" | "audio" | "seller"
  text: string
  date: string
  user: string
}

export function DealsView() {
  const [stages] = useState<Stage[]>([
    { id: "1", name: "Prospecção", probability: 10, color: "bg-slate-400" },
    { id: "2", name: "Qualificação", probability: 30, color: "bg-blue-500" },
    { id: "3", name: "Proposta Enviada", probability: 60, color: "bg-amber-500" },
    { id: "4", name: "Negociação", probability: 80, color: "bg-purple-500" },
    { id: "5", name: "Fechado Ganho", probability: 100, color: "bg-green-500" },
    { id: "6", name: "Fechado Perdido", probability: 0, color: "bg-red-500" },
  ])

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: "d1",
      title: "Seguro Auto - João Silva",
      company: "Particular",
      contact: "João Silva",
      value: 2500,
      stage: "1",
      probability: 10,
      closeDate: "30/05/2026",
      createdAt: "10/05/2026",
      seller: "Ana Costa",
      sellerAvatar: "AC",
      product: "Auto Individual",
      tags: [
        { name: "Novo", color: "bg-blue-500" },
        { name: "Urgente", color: "bg-red-500" },
      ],
    },
    {
      id: "d2",
      title: "Seguro Residencial - Maria Santos",
      company: "Particular",
      contact: "Maria Santos",
      value: 1800,
      stage: "1",
      probability: 10,
      closeDate: "25/05/2026",
      createdAt: "08/05/2026",
      seller: "Carlos Lima",
      sellerAvatar: "CL",
      product: "Residencial",
      tags: [{ name: "Indicação", color: "bg-green-500" }],
    },
    {
      id: "d3",
      title: "Seguro Vida - Pedro Oliveira",
      company: "Oliveira Ltda",
      contact: "Pedro Oliveira",
      value: 5000,
      stage: "2",
      probability: 30,
      closeDate: "20/05/2026",
      createdAt: "05/05/2026",
      seller: "Ana Costa",
      sellerAvatar: "AC",
      product: "Vida Individual",
      tags: [{ name: "Premium", color: "bg-purple-500" }],
    },
    {
      id: "d4",
      title: "Seguro Empresarial - Tech Corp",
      company: "Tech Corp",
      contact: "Roberto Almeida",
      value: 15000,
      stage: "3",
      probability: 60,
      closeDate: "15/05/2026",
      createdAt: "01/05/2026",
      seller: "Carlos Lima",
      sellerAvatar: "CL",
      product: "Empresarial PME",
      policyNumber: "AP-2026-0045",
      tags: [
        { name: "Empresa", color: "bg-orange-500" },
        { name: "Alto Valor", color: "bg-yellow-500" },
      ],
    },
    {
      id: "d5",
      title: "Seguro Frota - Logística ABC",
      company: "Logística ABC",
      contact: "Fernanda Costa",
      value: 45000,
      stage: "4",
      probability: 80,
      closeDate: "10/05/2026",
      createdAt: "28/04/2026",
      seller: "Ana Costa",
      sellerAvatar: "AC",
      product: "Frota Empresarial",
      policyNumber: "FR-2026-0012",
      tags: [
        { name: "Frota", color: "bg-teal-500" },
        { name: "Renovação", color: "bg-indigo-500" },
      ],
    },
    {
      id: "d6",
      title: "Seguro Saúde - Empresa XYZ",
      company: "Empresa XYZ",
      contact: "Marcos Pereira",
      value: 28000,
      stage: "5",
      probability: 100,
      closeDate: "05/05/2026",
      createdAt: "20/04/2026",
      seller: "Carlos Lima",
      sellerAvatar: "CL",
      product: "Saúde Empresarial",
      policyNumber: "SE-2026-0089",
      tags: [{ name: "Concluído", color: "bg-green-600" }],
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [showDealDetail, setShowDealDetail] = useState<Deal | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const [newDeal, setNewDeal] = useState({
    title: "",
    contact: "",
    company: "",
    seller: "",
    product: "",
    value: "",
    closeDate: "",
    policyNumber: "",
  })

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { type: "creation", text: "Negócio criado", date: "05/05/2026 09:30", user: "Ana Costa" },
    { type: "move", text: "Movido para Qualificação", date: "07/05/2026 14:15", user: "Ana Costa" },
    { type: "note", text: "Cliente interessado em cobertura adicional para terceiros", date: "08/05/2026 10:00", user: "Ana Costa" },
    { type: "task", text: "Tarefa concluída: Enviar proposta detalhada", date: "09/05/2026 11:30", user: "Sistema" },
    { type: "audio", text: "Anotação em áudio (0:45)", date: "10/05/2026 15:20", user: "Ana Costa" },
  ])

  const [newNote, setNewNote] = useState("")

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getDealsForStage = (stageId: string) =>
    deals.filter(
      (d) =>
        d.stage === stageId &&
        (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.company.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const getStageTotalValue = (stageId: string) =>
    getDealsForStage(stageId).reduce((sum, d) => sum + d.value, 0)

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetStageId: string) => {
    if (!draggedDeal || draggedDeal.stage === targetStageId) {
      setDraggedDeal(null)
      return
    }

    const targetStage = stages.find((s) => s.id === targetStageId)
    if (!targetStage) return

    setDeals((prev) =>
      prev.map((d) =>
        d.id === draggedDeal.id
          ? { ...d, stage: targetStageId, probability: targetStage.probability }
          : d
      )
    )

    setTimeline((prev) => [
      {
        type: "move",
        text: `Movido para ${targetStage.name}`,
        date: new Date().toLocaleString("pt-BR"),
        user: "Você",
      },
      ...prev,
    ])

    setDraggedDeal(null)
  }

  const handleAddDeal = () => {
    if (newDeal.title && newDeal.contact) {
      const deal: Deal = {
        id: `d${Date.now()}`,
        title: newDeal.title,
        contact: newDeal.contact,
        company: newDeal.company || "Particular",
        value: parseFloat(newDeal.value) || 0,
        stage: "1",
        probability: 10,
        closeDate: newDeal.closeDate || new Date().toLocaleDateString("pt-BR"),
        createdAt: new Date().toLocaleDateString("pt-BR"),
        seller: newDeal.seller || "Você",
        sellerAvatar: (newDeal.seller || "Você").split(" ").map((n) => n[0]).join("").substring(0, 2),
        product: newDeal.product,
        policyNumber: newDeal.policyNumber,
        tags: [{ name: "Novo", color: "bg-blue-500" }],
      }

      setDeals((prev) => [deal, ...prev])
      setNewDeal({ title: "", contact: "", company: "", seller: "", product: "", value: "", closeDate: "", policyNumber: "" })
      setShowNewDealModal(false)
    }
  }

  const handleDeleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId))
    if (showDealDetail?.id === dealId) {
      setShowDealDetail(null)
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      setTimeline((prev) => [
        { type: "note", text: newNote, date: new Date().toLocaleString("pt-BR"), user: "Você" },
        ...prev,
      ])
      setNewNote("")
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["ID", "Título", "Contato", "Empresa", "Valor", "Etapa", "Produto", "Vendedor", "Data Criação", "Data Fechamento", "Apólice"].join(","),
      ...deals.map((d) =>
        [d.id, d.title, d.contact, d.company, d.value, stages.find((s) => s.id === d.stage)?.name, d.product, d.seller, d.createdAt, d.closeDate, d.policyNumber || ""].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `negocios-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const totalInNegotiation = deals.filter((d) => !["5", "6"].includes(d.stage)).reduce((sum, d) => sum + d.value, 0)
  const totalWon = deals.filter((d) => d.stage === "5").reduce((sum, d) => sum + d.value, 0)
  const weightedValue = deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0)
  const conversionRate = deals.length > 0 ? ((deals.filter((d) => d.stage === "5").length / deals.length) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Negócios</h2>
            <p className="text-slate-500">Gerencie seu funil de vendas com visão em Kanban</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar negócios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border border-slate-300 rounded-xl text-slate-800 w-64"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilterModal(true)} className="border-slate-300 text-slate-600">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" onClick={handleExport} className="border-slate-300 text-slate-600">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="border-slate-300 text-slate-600">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button onClick={() => setShowNewDealModal(true)} className="bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Negócio
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-500 text-sm">Total em Negociação</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalInNegotiation)}</p>
          <p className="text-xs text-slate-400">{deals.filter((d) => !["5", "6"].includes(d.stage)).length} negócios ativos</p>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-500 text-sm">Valor Ponderado</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(weightedValue)}</p>
          <p className="text-xs text-slate-400">Baseado na probabilidade</p>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-500 text-sm">Fechados (Mês)</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalWon)}</p>
          <p className="text-xs text-slate-400">{deals.filter((d) => d.stage === "5").length} negócios ganhos</p>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-500 text-sm">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
          <p className="text-xs text-slate-400">Ganhos / Total</p>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("kanban")}
          className={viewMode === "kanban" ? "bg-slate-800 text-white" : "border-slate-300"}
        >
          Kanban
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className={viewMode === "list" ? "bg-slate-800 text-white" : "border-slate-300"}
        >
          Lista
        </Button>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="min-w-[280px] flex-shrink-0"
            >
              <Card className="bg-slate-100 border border-slate-200 rounded-2xl p-4 h-[520px] flex flex-col">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-slate-800 text-sm">{stage.name}</h3>
                    <Badge className="bg-slate-200 text-slate-600 text-xs">{getDealsForStage(stage.id).length}</Badge>
                  </div>
                  <span className="text-xs text-slate-500">{stage.probability}%</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-3">{formatCurrency(getStageTotalValue(stage.id))}</p>

                {/* Deals List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {getDealsForStage(stage.id).map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      onClick={() => setShowDealDetail(deal)}
                      className={`bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                        draggedDeal?.id === deal.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                          <p className="font-medium text-slate-800 text-sm line-clamp-1">{deal.title}</p>
                        </div>
                      </div>

                      {deal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {deal.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} className={`${tag.color} text-white text-[10px] px-1.5 py-0`}>
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{deal.contact}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{deal.product}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">{deal.sellerAvatar}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-slate-800 text-sm">{formatCurrency(deal.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Deal Button */}
                <Button
                  variant="ghost"
                  onClick={() => setShowNewDealModal(true)}
                  className="w-full mt-3 text-slate-500 hover:text-slate-700 hover:bg-slate-200 border-2 border-dashed border-slate-300 text-sm"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-8 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
            <span className="col-span-2">Negócio</span>
            <span>Valor</span>
            <span>Etapa</span>
            <span>Probabilidade</span>
            <span>Produto</span>
            <span>Fechamento</span>
            <span>Responsável</span>
          </div>
          <div className="divide-y divide-slate-100">
            {deals
              .filter(
                (d) =>
                  d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.contact.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => setShowDealDetail(deal)}
                  className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="col-span-2">
                    <p className="font-medium text-slate-800 text-sm">{deal.title}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      {deal.contact}
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{formatCurrency(deal.value)}</p>
                  <Badge className={`${stages.find((s) => s.id === deal.stage)?.color} text-white text-xs w-fit`}>
                    {stages.find((s) => s.id === deal.stage)?.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stages.find((s) => s.id === deal.stage)?.color}`}
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 w-8">{deal.probability}%</span>
                  </div>
                  <span className="text-sm text-slate-600 truncate">{deal.product}</span>
                  <span className="text-sm text-slate-600">{deal.closeDate}</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">{deal.sellerAvatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600 truncate">{deal.seller}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Novo Negócio</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowNewDealModal(false)} className="text-slate-500">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Título *</label>
                <Input
                  placeholder="Ex: Seguro Auto - Nome do Cliente"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Contato *</label>
                  <Input
                    placeholder="Nome do segurado"
                    value={newDeal.contact}
                    onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Empresa</label>
                  <Input
                    placeholder="Nome da empresa"
                    value={newDeal.company}
                    onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Vendedor</label>
                  <Input
                    placeholder="Responsável"
                    value={newDeal.seller}
                    onChange={(e) => setNewDeal({ ...newDeal, seller: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Produto</label>
                  <Input
                    placeholder="Tipo de seguro"
                    value={newDeal.product}
                    onChange={(e) => setNewDeal({ ...newDeal, product: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Valor (R$)</label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Data Fechamento</label>
                  <Input
                    type="date"
                    value={newDeal.closeDate}
                    onChange={(e) => setNewDeal({ ...newDeal, closeDate: e.target.value })}
                    className="bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nº Apólice</label>
                <Input
                  placeholder="Opcional"
                  value={newDeal.policyNumber}
                  onChange={(e) => setNewDeal({ ...newDeal, policyNumber: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewDealModal(false)} className="flex-1 border-slate-300">
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddDeal}
                  disabled={!newDeal.title || !newDeal.contact}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Criar Negócio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Deal Detail Modal */}
      {showDealDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">{showDealDetail.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {showDealDetail.tags.map((tag, i) => (
                    <Badge key={i} className={`${tag.color} text-white text-xs`}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="icon" variant="ghost" className="text-slate-500 hover:bg-slate-100">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteDeal(showDealDetail.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setShowDealDetail(null)} className="text-slate-500">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Deal Info */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Valor</p>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(showDealDetail.value)}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Contato</p>
                      <p className="text-sm text-slate-800">{showDealDetail.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Empresa</p>
                      <p className="text-sm text-slate-800">{showDealDetail.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Produto</p>
                      <p className="text-sm text-slate-800">{showDealDetail.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Data de Fechamento</p>
                      <p className="text-sm text-slate-800">{showDealDetail.closeDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${stages.find((s) => s.id === showDealDetail.stage)?.color} bg-opacity-10`}>
                  <p className="text-sm text-slate-600 mb-1">Etapa Atual</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {stages.find((s) => s.id === showDealDetail.stage)?.name}
                  </p>
                  <p className="text-sm text-slate-600">Probabilidade: {showDealDetail.probability}%</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">{showDealDetail.sellerAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-slate-500">Vendedor</p>
                      <p className="text-sm text-slate-800">{showDealDetail.seller}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Criado em</p>
                      <p className="text-sm text-slate-800">{showDealDetail.createdAt}</p>
                    </div>
                  </div>
                  {showDealDetail.policyNumber && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Nº Apólice</p>
                        <p className="text-sm text-slate-800">{showDealDetail.policyNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-semibold text-slate-800 mb-4">Linha do Tempo</h4>

              {/* Add Note */}
              <div className="flex space-x-3 mb-4">
                <Input
                  placeholder="Adicionar anotação..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  className="flex-1 bg-white border border-slate-300 rounded-xl"
                />
                <Button variant="outline" className="border-slate-300">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button onClick={handleAddNote} className="bg-slate-800 hover:bg-slate-700 text-white">
                  Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === "creation"
                          ? "bg-green-100 text-green-600"
                          : item.type === "move"
                            ? "bg-blue-100 text-blue-600"
                            : item.type === "note"
                              ? "bg-yellow-100 text-yellow-600"
                              : item.type === "audio"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.type === "creation" && <Plus className="h-4 w-4" />}
                      {item.type === "move" && <ChevronRight className="h-4 w-4" />}
                      {item.type === "note" && <FileText className="h-4 w-4" />}
                      {item.type === "task" && <Check className="h-4 w-4" />}
                      {item.type === "audio" && <Mic className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{item.text}</p>
                      <p className="text-xs text-slate-500">
                        {item.date} • {item.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Filtros Avançados</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowFilterModal(false)} className="text-slate-500">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Etapa</label>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <Badge key={stage.id} variant="outline" className="cursor-pointer hover:bg-slate-100">
                      {stage.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Valor</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Mínimo" className="bg-white border border-slate-300 rounded-xl" />
                  <Input placeholder="Máximo" className="bg-white border border-slate-300 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Período de Criação</label>
                <div className="flex flex-wrap gap-2">
                  {["Hoje", "Ontem", "Esta semana", "Este mês", "Este ano"].map((period) => (
                    <Badge key={period} variant="outline" className="cursor-pointer hover:bg-slate-100">
                      {period}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Vendedor</label>
                <Input placeholder="Buscar vendedor..." className="bg-white border border-slate-300 rounded-xl" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1 border-slate-300">
                  Limpar Filtros
                </Button>
                <Button onClick={() => setShowFilterModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
