"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Play, Pause, Zap, Mail, Clock, Users, Trash2, Settings } from "lucide-react"

type Automation = {
  id: number
  name: string
  trigger: string
  action: string
  status: "ativa" | "pausada"
  runs: number
  lastRun: string
}

export function AutomationsView() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 1,
      name: "Boas-vindas Novo Lead",
      trigger: "Novo lead cadastrado",
      action: "Enviar e-mail de boas-vindas",
      status: "ativa",
      runs: 156,
      lastRun: "Hoje, 10:30",
    },
    {
      id: 2,
      name: "Follow-up 7 Dias",
      trigger: "Lead sem interacao por 7 dias",
      action: "Enviar e-mail de follow-up",
      status: "ativa",
      runs: 89,
      lastRun: "Hoje, 09:15",
    },
    {
      id: 3,
      name: "Notificar Equipe de Vendas",
      trigger: "Negocio acima de R$ 50.000",
      action: "Notificar gerente de vendas",
      status: "ativa",
      runs: 23,
      lastRun: "Ontem, 16:45",
    },
    {
      id: 4,
      name: "Lembrete de Renovacao",
      trigger: "30 dias antes do vencimento",
      action: "Criar tarefa de renovacao",
      status: "pausada",
      runs: 45,
      lastRun: "15/01/2024",
    },
    {
      id: 5,
      name: "Atribuir Lead Regional",
      trigger: "Novo lead por regiao",
      action: "Atribuir ao vendedor da regiao",
      status: "ativa",
      runs: 234,
      lastRun: "Hoje, 11:00",
    },
  ])

  const toggleStatus = (id: number) => {
    setAutomations(automations.map((a) =>
      a.id === id ? { ...a, status: a.status === "ativa" ? "pausada" : "ativa" } : a
    ))
  }

  const deleteAutomation = (id: number) => {
    setAutomations(automations.filter((a) => a.id !== id))
  }

  const activeCount = automations.filter((a) => a.status === "ativa").length
  const totalRuns = automations.reduce((sum, a) => sum + a.runs, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Automacoes</h2>
          <p className="text-slate-500">Configure fluxos automaticos para seu CRM</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nova Automacao
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
              <p className="text-sm text-slate-500">Automacoes Ativas</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Play className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalRuns}</p>
              <p className="text-sm text-slate-500">Execucoes Totais</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">24/7</p>
              <p className="text-sm text-slate-500">Operando Sempre</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <Card
            key={automation.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${automation.status === "ativa" ? "bg-green-50" : "bg-slate-100"}`}>
                  <Zap className={`h-5 w-5 ${automation.status === "ativa" ? "text-green-500" : "text-slate-400"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{automation.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        automation.status === "ativa"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }
                    >
                      {automation.status === "ativa" ? "Ativa" : "Pausada"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {automation.trigger}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {automation.action}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{automation.runs} execucoes</p>
                  <p className="text-xs text-slate-500">Ultima: {automation.lastRun}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={automation.status === "ativa"}
                    onCheckedChange={() => toggleStatus(automation.id)}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteAutomation(automation.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Templates */}
      <Card className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Templates Populares</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Lead Scoring", icon: Users, desc: "Pontue leads automaticamente" },
            { name: "E-mail Sequencia", icon: Mail, desc: "Envie sequencia de e-mails" },
            { name: "Lembrete Tarefa", icon: Clock, desc: "Crie lembretes automaticos" },
          ].map((template, index) => (
            <Card
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <template.icon className="h-4 w-4 text-slate-600" />
                </div>
                <p className="font-medium text-slate-800">{template.name}</p>
              </div>
              <p className="text-sm text-slate-500">{template.desc}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
