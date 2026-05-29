"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar } from "lucide-react"

export function ForecastsView() {
  const forecasts = [
    {
      period: "Janeiro 2024",
      predicted: "R$ 485.000",
      actual: "R$ 462.500",
      accuracy: 95.4,
      trend: "up",
    },
    {
      period: "Fevereiro 2024",
      predicted: "R$ 520.000",
      actual: null,
      accuracy: null,
      trend: "up",
    },
    {
      period: "Marco 2024",
      predicted: "R$ 545.000",
      actual: null,
      accuracy: null,
      trend: "up",
    },
  ]

  const metrics = [
    {
      title: "Previsao Q1",
      value: "R$ 1.55M",
      change: "+12%",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pipeline Atual",
      value: "R$ 892K",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Taxa de Fechamento",
      value: "34%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ciclo de Vendas",
      value: "28 dias",
      change: "-2 dias",
      icon: Calendar,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ]

  const teamForecasts = [
    { name: "Equipe A", quota: "R$ 200K", forecast: "R$ 215K", probability: 89 },
    { name: "Equipe B", quota: "R$ 180K", forecast: "R$ 168K", probability: 72 },
    { name: "Equipe C", quota: "R$ 150K", forecast: "R$ 162K", probability: 85 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Previsoes</h2>
        <p className="text-slate-500">Analise preditiva de vendas e metas</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                {metric.change}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
            <p className="text-sm text-slate-500">{metric.title}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Forecasts */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Previsao Mensal</h3>
          <div className="space-y-4">
            {forecasts.map((forecast, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{forecast.period}</span>
                  {forecast.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Previsao</p>
                    <p className="font-semibold text-slate-800">{forecast.predicted}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Realizado</p>
                    <p className="font-semibold text-slate-800">{forecast.actual || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Precisao</p>
                    <p className={`font-semibold ${forecast.accuracy && forecast.accuracy > 90 ? "text-green-600" : "text-slate-800"}`}>
                      {forecast.accuracy ? `${forecast.accuracy}%` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Forecasts */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Previsao por Equipe</h3>
          <div className="space-y-4">
            {teamForecasts.map((team, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-800">{team.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      team.probability >= 80
                        ? "bg-green-50 text-green-600 border-green-200"
                        : team.probability >= 60
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-red-50 text-red-600 border-red-200"
                    }
                  >
                    {team.probability}% probabilidade
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-500">Meta</p>
                    <p className="font-semibold text-slate-800">{team.quota}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Previsao</p>
                    <p className={`font-semibold ${parseFloat(team.forecast.replace(/[^0-9]/g, "")) >= parseFloat(team.quota.replace(/[^0-9]/g, "")) ? "text-green-600" : "text-amber-600"}`}>
                      {team.forecast}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      team.probability >= 80 ? "bg-green-500" : team.probability >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${team.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Insights da IA</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-white/70 text-sm mb-1">Melhor Canal</p>
            <p className="text-xl font-bold">E-mail Marketing</p>
            <p className="text-white/60 text-sm">32% das conversoes</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-white/70 text-sm mb-1">Produto em Alta</p>
            <p className="text-xl font-bold">Plano Enterprise</p>
            <p className="text-white/60 text-sm">+45% em demanda</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-white/70 text-sm mb-1">Recomendacao</p>
            <p className="text-xl font-bold">Focar em Upsell</p>
            <p className="text-white/60 text-sm">18 clientes elegíveis</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
