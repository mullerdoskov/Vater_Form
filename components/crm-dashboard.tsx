"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Bell,
  Settings,
  Plus,
  Phone,
  Mail,
  Filter,
  Download,
  BarChart3,
  FileText,
  Target,
  Briefcase,
  MessageSquare,
  Database,
  Zap,
  Crown,
  LogOut,
  HelpCircle,
  ChevronRight,
  X,
  Check,
} from "lucide-react"
import { AnalyticsView } from "@/components/crm-views/analytics-view"
import { PipelineView } from "@/components/crm-views/pipeline-view"
import { CalendarView } from "@/components/crm-views/calendar-view"
import { CampaignsView } from "@/components/crm-views/campaigns-view"
import { ReportsView } from "@/components/crm-views/reports-view"
import { DealsView } from "@/components/crm-views/deals-view"
import { MessagesView } from "@/components/crm-views/messages-view"
import { ImportView } from "@/components/crm-views/import-view"
import { ForecastsView } from "@/components/crm-views/forecasts-view"
import { SettingsView } from "@/components/crm-views/settings-view"
import { AutomationsView } from "@/components/crm-views/automations-view"

type Contact = {
  name: string
  email: string
  phone: string
  company: string
  status: "Ativo" | "Prospecto" | "Inativo"
  value: string
  avatar: string
}

type Activity = {
  action: string
  time: string
  type: "success" | "info" | "default"
}

export function CRMDashboard() {
  const [activeMenu, setActiveMenu] = useState("Contatos")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("Todos")
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Ola! Sou a Xperia, sua assistente de IA. Como posso ajudar?", isUser: false }
  ])
  const [chatInput, setChatInput] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([
    {
      name: "Sarah Johnson",
      email: "sarah@empresa.com",
      phone: "+55 (11) 98765-4321",
      company: "TechCorp Inc.",
      status: "Ativo",
      value: "R$ 62.500",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      email: "michael@startup.io",
      phone: "+55 (11) 91234-5678",
      company: "StartupHub",
      status: "Prospecto",
      value: "R$ 41.000",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      email: "emily@agencia.com",
      phone: "+55 (21) 99876-5432",
      company: "Agencia Criativa",
      status: "Ativo",
      value: "R$ 78.500",
      avatar: "ER",
    },
    {
      name: "David Kim",
      email: "david@tech.com",
      phone: "+55 (31) 98765-1234",
      company: "TechSolutions",
      status: "Inativo",
      value: "R$ 15.500",
      avatar: "DK",
    },
    {
      name: "Lisa Thompson",
      email: "lisa@design.co",
      phone: "+55 (41) 97654-3210",
      company: "Estudio Design",
      status: "Ativo",
      value: "R$ 49.000",
      avatar: "LT",
    },
  ])
  const [activities, setActivities] = useState<Activity[]>([
    { action: "Novo contato adicionado", time: "2 min atras", type: "success" },
    { action: "Negocio fechado", time: "1 hora atras", type: "success" },
    { action: "Reuniao agendada", time: "3 horas atras", type: "info" },
    { action: "E-mail enviado", time: "5 horas atras", type: "default" },
  ])
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  })

  const mainMenuItems = [
    { icon: Users, label: "Contatos" },
    { icon: TrendingUp, label: "Analiticos" },
    { icon: DollarSign, label: "Pipeline de Vendas" },
    { icon: Calendar, label: "Calendario" },
    { icon: Target, label: "Campanhas" },
  ]

  const crmToolsItems = [
    { icon: FileText, label: "Relatorios" },
    { icon: Briefcase, label: "Negocios" },
    { icon: MessageSquare, label: "Mensagens" },
    { icon: Database, label: "Importar Dados" },
    { icon: BarChart3, label: "Previsoes" },
  ]

  const adminItems = [
    { icon: Settings, label: "Configuracoes" },
    { icon: Zap, label: "Automacoes" },
  ]

  const quickActions = [
    { icon: Phone, label: "Agendar Ligacao" },
    { icon: Mail, label: "Enviar E-mail" },
    { icon: Calendar, label: "Marcar Reuniao" },
    { icon: Plus, label: "Adicionar Nota" },
  ]

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "Todos" || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      const initials = newContact.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      const newContactData: Contact = {
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || "+55 (00) 00000-0000",
        company: newContact.company || "Sem empresa",
        status: "Prospecto",
        value: "R$ 0",
        avatar: initials,
      }

      setContacts([newContactData, ...contacts])
      setActivities([
        { action: `Contato ${newContact.name} adicionado`, time: "Agora", type: "success" },
        ...activities,
      ])
      setNewContact({ name: "", email: "", phone: "", company: "" })
      setShowAddContactModal(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setActivities([{ action: `${action} iniciado`, time: "Agora", type: "info" }, ...activities])
  }

  const handleExport = () => {
    const csvContent = contacts
      .map((c) => `${c.name},${c.email},${c.phone},${c.company},${c.status},${c.value}`)
      .join("\n")
    const blob = new Blob([`Nome,Email,Telefone,Empresa,Status,Valor\n${csvContent}`], {
      type: "text/csv",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contatos.csv"
    a.click()
    URL.revokeObjectURL(url)
    setActivities([{ action: "Contatos exportados", time: "Agora", type: "success" }, ...activities])
  }

  const handleSendChat = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { text: chatInput, isUser: true }])
      setChatInput("")
      setTimeout(() => {
        const responses = [
          "Posso ajudar a analisar seus contatos e sugerir acoes.",
          "Notei que voce tem 3 prospectos pendentes. Quer que eu priorize?",
          "Suas metas estao em 68%. Recomendo focar em upsell com clientes ativos.",
          "Posso gerar um relatorio de desempenho da equipe se quiser.",
        ]
        setChatMessages((prev) => [
          ...prev,
          { text: responses[Math.floor(Math.random() * responses.length)], isUser: false },
        ])
      }, 1000)
    }
  }

  const handleDeleteContact = (index: number) => {
    const contactName = filteredContacts[index].name
    setContacts(contacts.filter((_, i) => i !== index))
    setActivities([
      { action: `Contato ${contactName} removido`, time: "Agora", type: "default" },
      ...activities,
    ])
  }

  const handleContactClick = (contact: Contact) => {
    setActivities([
      { action: `Visualizou contato ${contact.name}`, time: "Agora", type: "info" },
      ...activities,
    ])
  }

  return (
    <div className="h-screen relative overflow-hidden bg-white">
      <div className="relative z-10 p-6 grid grid-cols-12 gap-6 h-screen">
        {/* Left Sidebar Card */}
        <Card className="col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-6 pb-6 h-fit flex flex-col shadow-sm">
          <div className="space-y-6">
            {/* Logo */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800">CRM Pro</h1>
              <p className="text-slate-500 text-sm">Gestao de Clientes</p>
            </div>

            {/* Main Navigation */}
            <div>
              <h4 className="text-slate-600 text-sm font-semibold uppercase tracking-wider mb-3">
                Menu Principal
              </h4>
              <nav className="space-y-2">
                {mainMenuItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setActiveMenu(item.label)}
                    className={`w-full justify-start text-base transition-all duration-300 h-11 ${
                      activeMenu === item.label
                        ? "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                        : "text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            {/* CRM Tools */}
            <div>
              <h4 className="text-slate-600 text-sm font-semibold uppercase tracking-wider mb-3">
                Ferramentas CRM
              </h4>
              <nav className="space-y-2">
                {crmToolsItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setActiveMenu(item.label)}
                    className={`w-full justify-start text-base transition-all duration-300 h-11 ${
                      activeMenu === item.label
                        ? "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                        : "text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Administration */}
            <div>
              <h4 className="text-slate-600 text-sm font-semibold uppercase tracking-wider mb-3">
                Administracao
              </h4>
              <nav className="space-y-2">
                {adminItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setActiveMenu(item.label)}
                    className={`w-full justify-start text-base transition-all duration-300 h-11 ${
                      activeMenu === item.label
                        ? "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                        : "text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-shrink-0 space-y-4 pt-4 border-t border-slate-200">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Crown className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-slate-800 font-semibold text-lg">Seja Premium</h4>
                  <p className="text-slate-600 text-sm">Desbloqueie recursos avancados</p>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 transition-all duration-300 hover:scale-[1.02] text-sm font-medium"
                >
                  Atualizar Agora
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </Card>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-base text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all duration-300 h-11"
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Suporte
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-base text-slate-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300 h-11"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="col-span-8 space-y-6 h-screen overflow-y-auto pb-6">
          {/* Render view based on active menu */}
          {activeMenu === "Analiticos" && <AnalyticsView />}
          {activeMenu === "Pipeline de Vendas" && <PipelineView />}
          {activeMenu === "Calendario" && <CalendarView />}
          {activeMenu === "Campanhas" && <CampaignsView />}
          {activeMenu === "Relatorios" && <ReportsView />}
          {activeMenu === "Negocios" && <DealsView />}
          {activeMenu === "Mensagens" && <MessagesView />}
          {activeMenu === "Importar Dados" && <ImportView />}
          {activeMenu === "Previsoes" && <ForecastsView />}
          {activeMenu === "Configuracoes" && <SettingsView />}
          {activeMenu === "Automacoes" && <AutomationsView />}
          
          {/* Default Contacts View */}
          {activeMenu === "Contatos" && (
            <>
          {/* Header Card */}
          <Card className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Painel de Controle</h2>
                <p className="text-slate-500">Bem-vindo de volta! Aqui esta sua visao geral do CRM</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar contatos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-slate-600 hover:bg-slate-200 hover:text-slate-800 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {activities.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {activities.length > 9 ? "9+" : activities.length}
                      </span>
                    )}
                  </Button>
                  {showNotifications && (
                    <div className="absolute right-0 top-12 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800">Notificacoes</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNotifications(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {activities.slice(0, 5).map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                activity.type === "success"
                                  ? "bg-green-500"
                                  : activity.type === "info"
                                    ? "bg-blue-500"
                                    : "bg-slate-400"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-slate-700">{activity.action}</p>
                              <p className="text-xs text-slate-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowAddContactModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white transition-all duration-300 hover:scale-[1.02]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Contato
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              {
                title: "Total de Contatos",
                value: contacts.length.toString(),
                change: "+12%",
                icon: Users,
                color: "text-blue-500",
                bgColor: "bg-blue-50",
              },
              {
                title: "Negocios Ativos",
                value: "156",
                change: "+8%",
                icon: TrendingUp,
                color: "text-green-500",
                bgColor: "bg-green-50",
              },
              {
                title: "Receita",
                value: "R$ 446K",
                change: "+23%",
                icon: DollarSign,
                color: "text-amber-500",
                bgColor: "bg-amber-50",
              },
              {
                title: "Reunioes",
                value: "24",
                change: "+5%",
                icon: Calendar,
                color: "text-purple-500",
                bgColor: "bg-purple-50",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Contacts and Sales Target Cards */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Contatos Recentes</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFilterModal(true)}
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                    {statusFilter !== "Todos" && (
                      <Badge className="ml-2 bg-slate-800 text-white text-xs">{statusFilter}</Badge>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExport}
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                  {filteredContacts.slice(0, 5).map((contact, index) => (
                  <div
                    key={index}
                    onClick={() => handleContactClick(contact)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-sm font-medium">
                          {contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 text-sm">{contact.name}</p>
                            <p className="text-xs text-slate-500">
                              {contact.company} - {contact.phone}
                            </p>
                          </div>
                          <div className="text-right ml-4 flex items-center space-x-2">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{contact.value}</p>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  contact.status === "Ativo"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : contact.status === "Prospecto"
                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                {contact.status}
                              </Badge>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteContact(index)
                              }}
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Meta de Vendas</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Monthly Target Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Meta Mensal</span>
                    <span className="text-slate-800 font-semibold">R$ 625K</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">R$ 425K alcancado</span>
                    <span className="text-slate-500">68%</span>
                  </div>
                </div>

                {/* Quarterly Target Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Meta Trimestral</span>
                    <span className="text-slate-800 font-semibold">R$ 1.875K</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">R$ 840K alcancado</span>
                    <span className="text-slate-500">45%</span>
                  </div>
                </div>

                {/* Team Performance */}
                <div className="space-y-3">
                  <h4 className="text-slate-800 font-medium">Desempenho das Equipes</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Equipe de Vendas A", progress: 78, color: "from-blue-400 to-purple-500" },
                      { name: "Equipe de Vendas B", progress: 62, color: "from-green-400 to-teal-500" },
                      { name: "Equipe de Vendas C", progress: 54, color: "from-orange-400 to-red-500" },
                    ].map((team, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{team.name}</span>
                          <span className="text-slate-800">{team.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${team.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${team.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Days Remaining */}
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-slate-800">12</p>
                  <p className="text-slate-500 text-sm">Dias restantes no mes</p>
                </div>
              </div>
            </Card>
          </div>
            </>
          )}
        </div>

        {/* Right Sidebar Card */}
        <Card className="col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-6 pb-6 h-fit shadow-sm">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Acoes Rapidas</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction(action.label)}
                    className="w-full justify-start text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all duration-300"
                  >
                    <action.icon className="mr-3 h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Xperia Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="text-center space-y-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <h4 className="text-slate-800 font-semibold">Converse com nossa IA</h4>
                  <p className="text-slate-600 text-sm">Xperia</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowChatModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-[1.02]"
                >
                  Iniciar Chat
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                {activities.slice(0, 4).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "info"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Melhores Desempenhos</h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Silva", deals: 12, avatar: "AS" },
                  { name: "Maria Garcia", deals: 9, avatar: "MG" },
                  { name: "Joao Souza", deals: 7, avatar: "JS" },
                ].map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                          {performer.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{performer.name}</p>
                        <p className="text-xs text-slate-500">{performer.deals} negocios</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Adicionar Novo Contato</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAddContactModal(false)}
                className="text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome *</label>
                <Input
                  placeholder="Nome completo"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">E-mail *</label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label>
                <Input
                  placeholder="+55 (11) 99999-9999"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Empresa</label>
                <Input
                  placeholder="Nome da empresa"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddContactModal(false)}
                  className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.email}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Filtrar Contatos</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowFilterModal(false)}
                className="text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Status do Contato</p>
              {["Todos", "Ativo", "Prospecto", "Inativo"].map((status) => (
                <Button
                  key={status}
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter(status)
                    setShowFilterModal(false)
                  }}
                  className={`w-full justify-start ${
                    statusFilter === status
                      ? "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {statusFilter === status && <Check className="mr-2 h-4 w-4" />}
                  {status}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Configuracoes de Metas</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 mb-2">Meta Mensal Atual</p>
                <p className="text-2xl font-bold text-slate-800">R$ 625.000</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 mb-2">Meta Trimestral Atual</p>
                <p className="text-2xl font-bold text-slate-800">R$ 1.875.000</p>
              </div>
              <p className="text-sm text-slate-500 text-center">
                Entre em contato com o administrador para alterar as metas.
              </p>
              <Button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-xl h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Xperia IA</h3>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowChatModal(false)}
                className="text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.isUser
                        ? "bg-slate-800 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-white border border-slate-300 rounded-xl text-slate-800"
              />
              <Button
                onClick={handleSendChat}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                Enviar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer Attribution */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-slate-100 border border-slate-200 rounded-full px-6 py-2 shadow-sm">
          <p className="text-slate-600 text-sm">
            Desenvolvido com ❤️ por{" "}
            <a
              href="https://www.youtube.com/@diecastbydollar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-800 hover:text-slate-600 transition-colors duration-300 font-medium"
            >
              Dollar Gill
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
