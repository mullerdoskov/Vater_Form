"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export function AnalyticsView() {
  const metrics = [
    {
      title: "Taxa de Conversao",
      value: "24.8%",
      change: "+3.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Ticket Medio",
      value: "R$ 4.850",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Taxa de Churn",
      value: "2.3%",
      change: "-0.5%",
      trend: "down",
      icon: TrendingDown,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Novos Leads",
      value: "342",
      change: "+18%",
      trend: "up",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ]

  const channelData = [
    { channel: "E-mail Marketing", visits: 12450, conversions: 342, rate: "2.7%" },
    { channel: "Busca Organica", visits: 8920, conversions: 267, rate: "3.0%" },
    { channel: "Redes Sociais", visits: 6780, conversions: 156, rate: "2.3%" },
    { channel: "Anuncios Pagos", visits: 4560, conversions: 189, rate: "4.1%" },
    { channel: "Indicacoes", visits: 2340, conversions: 98, rate: "4.2%" },
  ]

  const monthlyData = [
    { month: "Jan", vendas: 45, meta: 50 },
    { month: "Fev", vendas: 52, meta: 50 },
    { month: "Mar", vendas: 48, meta: 55 },
    { month: "Abr", vendas: 61, meta: 55 },
    { month: "Mai", vendas: 55, meta: 60 },
    { month: "Jun", vendas: 67, meta: 60 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Analiticos</h2>
        <p className="text-slate-500">Acompanhe as metricas e desempenho do seu CRM</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <Badge
                variant="outline"
                className={
                  metric.trend === "up"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }
              >
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {metric.change}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
            <p className="text-sm text-slate-500">{metric.title}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Vendas vs Meta</h3>
          <div className="space-y-4">
            {monthlyData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.month}</span>
                  <span className="text-slate-800 font-medium">
                    {item.vendas} / {item.meta}
                  </span>
                </div>
                <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-slate-300 rounded-full"
                    style={{ width: `${(item.meta / 70) * 100}%` }}
                  />
                  <div
                    className={`absolute h-full rounded-full ${
                      item.vendas >= item.meta
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gradient-to-r from-blue-400 to-blue-500"
                    }`}
                    style={{ width: `${(item.vendas / 70) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Channel Performance */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Desempenho por Canal</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-4 text-sm text-slate-500 pb-2 border-b border-slate-100">
              <span>Canal</span>
              <span className="text-right">Visitas</span>
              <span className="text-right">Conversoes</span>
              <span className="text-right">Taxa</span>
            </div>
            {channelData.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-4 text-sm py-2 hover:bg-slate-50 rounded-lg px-1 transition-colors"
              >
                <span className="text-slate-700 font-medium">{item.channel}</span>
                <span className="text-right text-slate-600">{item.visits.toLocaleString()}</span>
                <span className="text-right text-slate-600">{item.conversions}</span>
                <span className="text-right font-semibold text-green-600">{item.rate}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Engagement Stats */}
      <Card className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Engajamento dos Clientes</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">45.2K</p>
            <p className="text-sm text-slate-500">Visualizacoes de Perfil</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <MousePointerClick className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">12.8K</p>
            <p className="text-sm text-slate-500">Cliques em Ofertas</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">68%</p>
            <p className="text-sm text-slate-500">Taxa de Retencao</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
