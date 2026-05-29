"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, FileText, Filter, Plus, Search, Calendar, BarChart3, Users, DollarSign } from "lucide-react"

type Report = {
  id: number
  name: string
  type: "vendas" | "clientes" | "campanhas" | "financeiro"
  lastGenerated: string
  frequency: "diario" | "semanal" | "mensal" | "manual"
  status: "disponivel" | "gerando" | "erro"
}

export function ReportsView() {
  const [reports] = useState<Report[]>([
    { id: 1, name: "Relatorio de Vendas Mensal", type: "vendas", lastGenerated: "15/01/2024", frequency: "mensal", status: "disponivel" },
    { id: 2, name: "Analise de Clientes", type: "clientes", lastGenerated: "14/01/2024", frequency: "semanal", status: "disponivel" },
    { id: 3, name: "Performance de Campanhas", type: "campanhas", lastGenerated: "15/01/2024", frequency: "diario", status: "disponivel" },
    { id: 4, name: "Fluxo de Caixa", type: "financeiro", lastGenerated: "01/01/2024", frequency: "mensal", status: "disponivel" },
    { id: 5, name: "Funil de Vendas", type: "vendas", lastGenerated: "13/01/2024", frequency: "semanal", status: "gerando" },
    { id: 6, name: "Retencao de Clientes", type: "clientes", lastGenerated: "10/01/2024", frequency: "mensal", status: "disponivel" },
  ])

  const [searchQuery, setSearchQuery] = useState("")

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vendas": return BarChart3
      case "clientes": return Users
      case "campanhas": return FileText
      case "financeiro": return DollarSign
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vendas": return "bg-blue-50 text-blue-600"
      case "clientes": return "bg-green-50 text-green-600"
      case "campanhas": return "bg-purple-50 text-purple-600"
      case "financeiro": return "bg-amber-50 text-amber-600"
      default: return "bg-slate-50 text-slate-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatorios</h2>
          <p className="text-slate-500">Gere e exporte relatorios do seu CRM</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Relatorio
        </Button>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: "Vendas Hoje", value: "R$ 24.5K", icon: DollarSign, color: "text-green-500 bg-green-50" },
          { name: "Novos Leads", value: "32", icon: Users, color: "text-blue-500 bg-blue-50" },
          { name: "Tarefas Pendentes", value: "8", icon: Calendar, color: "text-amber-500 bg-amber-50" },
          { name: "Relatorios Gerados", value: "156", icon: FileText, color: "text-purple-500 bg-purple-50" },
        ].map((stat, index) => (
          <Card key={index} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.color.split(" ")[1]}`}>
                <stat.icon className={`h-5 w-5 ${stat.color.split(" ")[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Buscar relatorios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-slate-300 rounded-xl"
          />
        </div>
        <Button variant="outline" className="border-slate-300">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const TypeIcon = getTypeIcon(report.type)

          return (
            <Card key={report.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${getTypeColor(report.type)}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{report.name}</h3>
                    <p className="text-sm text-slate-500">Ultima geracao: {report.lastGenerated}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    report.status === "disponivel"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : report.status === "gerando"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-red-50 text-red-600 border-red-200"
                  }
                >
                  {report.status === "disponivel" ? "Disponivel" : report.status === "gerando" ? "Gerando..." : "Erro"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {report.frequency === "diario" ? "Diario" : report.frequency === "semanal" ? "Semanal" : report.frequency === "mensal" ? "Mensal" : "Manual"}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={report.status !== "disponivel"}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="ghost">
                    Gerar Novo
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
