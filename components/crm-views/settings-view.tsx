"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  Mail,
  Smartphone,
  Save,
} from "lucide-react"

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("perfil")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  })

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificacoes", label: "Notificacoes", icon: Bell },
    { id: "seguranca", label: "Seguranca", icon: Shield },
    { id: "aparencia", label: "Aparencia", icon: Palette },
    { id: "idioma", label: "Idioma e Regiao", icon: Globe },
    { id: "faturamento", label: "Faturamento", icon: CreditCard },
    { id: "equipe", label: "Equipe", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configuracoes</h2>
        <p className="text-slate-500">Gerencie suas preferencias e configuracoes da conta</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full justify-start ${
                  activeTab === tab.id
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="mr-3 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="col-span-3">
          {activeTab === "perfil" && (
            <Card className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Informacoes do Perfil</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600">
                    AS
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Alterar Foto</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG ou GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Nome</label>
                    <Input defaultValue="Admin Sistema" className="border-slate-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Sobrenome</label>
                    <Input defaultValue="CRM" className="border-slate-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">E-mail</label>
                    <Input defaultValue="admin@crmpro.com" type="email" className="border-slate-300" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label>
                    <Input defaultValue="+55 (11) 99999-9999" className="border-slate-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Cargo</label>
                    <Input defaultValue="Gerente de Vendas" className="border-slate-300" />
                  </div>
                </div>
                <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alteracoes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "notificacoes" && (
            <Card className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Preferencias de Notificacao</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Notificacoes por E-mail</p>
                      <p className="text-sm text-slate-500">Receba atualizacoes importantes por e-mail</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Notificacoes Push</p>
                      <p className="text-sm text-slate-500">Receba notificacoes no navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">Notificacoes por SMS</p>
                      <p className="text-sm text-slate-500">Receba alertas urgentes por SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">E-mails de Marketing</p>
                      <p className="text-sm text-slate-500">Receba novidades e promocoes</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === "seguranca" && (
            <Card className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Seguranca da Conta</h3>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-800">Senha</p>
                      <p className="text-sm text-slate-500">Ultima alteracao: 30 dias atras</p>
                    </div>
                    <Button variant="outline">Alterar Senha</Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-800">Autenticacao em Dois Fatores</p>
                      <p className="text-sm text-slate-500">Adicione uma camada extra de seguranca</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar 2FA</Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="font-medium text-slate-800 mb-2">Sessoes Ativas</p>
                  <p className="text-sm text-slate-500 mb-4">Gerencie os dispositivos conectados</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-800">Chrome - Windows</p>
                        <p className="text-xs text-slate-500">Sessao atual</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Atual</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-800">Safari - iPhone</p>
                        <p className="text-xs text-slate-500">Ultimo acesso: 2 horas atras</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        Encerrar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {(activeTab === "aparencia" || activeTab === "idioma" || activeTab === "faturamento" || activeTab === "equipe") && (
            <Card className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-center py-12">
                <p className="text-slate-500">Configuracoes de {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento</p>
                <Button variant="outline" className="mt-4">Em Breve</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
