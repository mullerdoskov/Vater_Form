"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Users, Heart, MapPin, Check, Shield } from "lucide-react"

type OptionButtonProps = {
  label: string
  selected: boolean
  onClick: () => void
  variant?: "default" | "success" | "danger"
}

function OptionButton({ label, selected, onClick, variant = "default" }: OptionButtonProps) {
  const baseClasses = "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium"
  
  const variants = {
    default: selected 
      ? "border-primary bg-primary/10 text-primary" 
      : "border-border bg-card hover:border-primary/50 text-foreground",
    success: selected 
      ? "border-primary bg-primary/10 text-primary" 
      : "border-border bg-card hover:border-primary/50 text-foreground",
    danger: selected 
      ? "border-destructive bg-destructive/10 text-destructive" 
      : "border-border bg-card hover:border-destructive/50 text-foreground"
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
        selected 
          ? variant === "danger" ? "bg-destructive text-white" : "bg-primary text-white"
          : "bg-muted text-muted-foreground"
      }`}>
        {selected ? <Check className="w-4 h-4" /> : label.charAt(0)}
      </span>
      {label}
    </button>
  )
}

type RegionButtonProps = {
  letter: string
  label: string
  selected: boolean
  onClick: () => void
  color: string
}

function RegionButton({ letter, label, selected, onClick, color }: RegionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
        selected 
          ? "border-primary bg-primary/10 text-primary" 
          : "border-border bg-card hover:border-primary/50 text-foreground"
      }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${color}`}>
        {selected ? <Check className="w-4 h-4" /> : letter}
      </span>
      {label}
    </button>
  )
}

export default function CotacaoPage() {
  const [activeTab, setActiveTab] = useState("participantes")
  
  // Tab 1 - Participantes
  const [quantidadePessoas, setQuantidadePessoas] = useState<string>("")
  const [idades, setIdades] = useState("")
  
  // Tab 2 - Plano de Saúde
  const [temPlano, setTemPlano] = useState<string>("")
  const [planoAtual, setPlanoAtual] = useState("")
  const [acomodacao, setAcomodacao] = useState<string>("")
  const [temCNPJ, setTemCNPJ] = useState<string>("")
  
  // Tab 3 - Localização e Contato
  const [resideSP, setResideSP] = useState<string>("")
  const [regiao, setRegiao] = useState<string>("")
  const [cidade, setCidade] = useState("")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [hospital, setHospital] = useState("")

  const tabs = [
    { id: "participantes", label: "Participantes", icon: Users },
    { id: "plano", label: "Plano", icon: Heart },
    { id: "contato", label: "Contato", icon: MapPin }
  ]

  const goToNextTab = () => {
    if (activeTab === "participantes") setActiveTab("plano")
    else if (activeTab === "plano") setActiveTab("contato")
  }

  const goToPreviousTab = () => {
    if (activeTab === "plano") setActiveTab("participantes")
    else if (activeTab === "contato") setActiveTab("plano")
  }

  const handleSubmit = () => {
    alert("Cotação enviada com sucesso!")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Peça sua Cotação</h1>
            <p className="text-sm text-muted-foreground">Plano de saúde personalizado</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Intro Card */}
        <Card className="p-6 mb-6 bg-card border-0 shadow-sm">
          <p className="text-foreground leading-relaxed">
            Para elaborar uma cotação, precisamos de algumas informações simples.
          </p>
          <p className="text-primary font-semibold mt-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Nenhum dado sensível será solicitado.
          </p>
        </Card>

        {/* Progress Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-2xl mb-6 grid grid-cols-3 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium text-sm`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab 1: Participantes */}
          <TabsContent value="participantes" className="space-y-6 mt-0">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Quantas pessoas vão participar do plano? <span className="text-primary">*</span>
              </h2>
              <div className="space-y-3">
                <OptionButton
                  label="De 1 a 10 pessoas"
                  selected={quantidadePessoas === "1-10"}
                  onClick={() => setQuantidadePessoas("1-10")}
                />
                <OptionButton
                  label="11 pessoas ou mais"
                  selected={quantidadePessoas === "11+"}
                  onClick={() => setQuantidadePessoas("11+")}
                />
              </div>
            </Card>

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Digite a idade de todos os participantes do plano: <span className="text-primary">*</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Separe por vírgula (Ex.: 39, 42, 54)</p>
              <Input
                type="text"
                placeholder="Ex.: 39, 42, 54"
                value={idades}
                onChange={(e) => setIdades(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
              />
            </Card>

            <Button 
              onClick={goToNextTab}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base gap-2"
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </TabsContent>

          {/* Tab 2: Plano de Saúde */}
          <TabsContent value="plano" className="space-y-6 mt-0">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Você tem plano de saúde atualmente? <span className="text-primary">*</span>
              </h2>
              <div className="space-y-3">
                <OptionButton
                  label="SIM"
                  selected={temPlano === "sim"}
                  onClick={() => setTemPlano("sim")}
                  variant="success"
                />
                <OptionButton
                  label="NÃO"
                  selected={temPlano === "nao"}
                  onClick={() => setTemPlano("nao")}
                  variant="danger"
                />
              </div>
            </Card>

            {temPlano === "sim" && (
              <Card className="p-6 bg-card border-0 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Qual é o seu plano de saúde atual? <span className="text-primary">*</span>
                </h2>
                <Input
                  type="text"
                  placeholder="Nome do plano atual"
                  value={planoAtual}
                  onChange={(e) => setPlanoAtual(e.target.value)}
                  className="bg-background border-border h-12 rounded-xl"
                />
              </Card>
            )}

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Qual acomodação do seu plano?
              </h2>
              <div className="space-y-3">
                <OptionButton
                  label="Apartamento"
                  selected={acomodacao === "apartamento"}
                  onClick={() => setAcomodacao("apartamento")}
                />
                <OptionButton
                  label="Enfermaria"
                  selected={acomodacao === "enfermaria"}
                  onClick={() => setAcomodacao("enfermaria")}
                />
                <OptionButton
                  label="Indiferente"
                  selected={acomodacao === "indiferente"}
                  onClick={() => setAcomodacao("indiferente")}
                />
              </div>
            </Card>

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Você tem CNPJ? <span className="text-primary">*</span>
              </h2>
              <div className="space-y-3">
                <OptionButton
                  label="SIM"
                  selected={temCNPJ === "sim"}
                  onClick={() => setTemCNPJ("sim")}
                  variant="success"
                />
                <OptionButton
                  label="NÃO"
                  selected={temCNPJ === "nao"}
                  onClick={() => setTemCNPJ("nao")}
                  variant="danger"
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={goToPreviousTab}
                variant="outline"
                className="flex-1 h-14 rounded-xl font-semibold text-base"
              >
                Voltar
              </Button>
              <Button 
                onClick={goToNextTab}
                className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base gap-2"
              >
                Próximo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Localização e Contato */}
          <TabsContent value="contato" className="space-y-6 mt-0">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Você reside na cidade de São Paulo? <span className="text-primary">*</span>
              </h2>
              <div className="space-y-3">
                <OptionButton
                  label="SIM"
                  selected={resideSP === "sim"}
                  onClick={() => setResideSP("sim")}
                  variant="success"
                />
                <OptionButton
                  label="NÃO"
                  selected={resideSP === "nao"}
                  onClick={() => setResideSP("nao")}
                  variant="danger"
                />
              </div>
            </Card>

            {resideSP === "sim" && (
              <Card className="p-6 bg-card border-0 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Em qual região? <span className="text-primary">*</span>
                </h2>
                <div className="space-y-3">
                  <RegionButton
                    letter="N"
                    label="Norte"
                    selected={regiao === "norte"}
                    onClick={() => setRegiao("norte")}
                    color="bg-emerald-500"
                  />
                  <RegionButton
                    letter="S"
                    label="Sul"
                    selected={regiao === "sul"}
                    onClick={() => setRegiao("sul")}
                    color="bg-sky-500"
                  />
                  <RegionButton
                    letter="O"
                    label="Oeste"
                    selected={regiao === "oeste"}
                    onClick={() => setRegiao("oeste")}
                    color="bg-amber-500"
                  />
                  <RegionButton
                    letter="L"
                    label="Leste"
                    selected={regiao === "leste"}
                    onClick={() => setRegiao("leste")}
                    color="bg-rose-500"
                  />
                  <RegionButton
                    letter="C"
                    label="Centro"
                    selected={regiao === "centro"}
                    onClick={() => setRegiao("centro")}
                    color="bg-violet-500"
                  />
                </div>
              </Card>
            )}

            {resideSP === "nao" && (
              <Card className="p-6 bg-card border-0 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Em qual cidade você reside? <span className="text-primary">*</span>
                </h2>
                <Input
                  type="text"
                  placeholder="Nome da cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="bg-background border-border h-12 rounded-xl"
                />
              </Card>
            )}

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Qual é o seu nome? <span className="text-primary">*</span>
              </h2>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
              />
            </Card>

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Qual é o seu telefone? <span className="text-primary">*</span>
              </h2>
              <Input
                type="tel"
                placeholder="11912345678"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
              />
            </Card>

            <Card className="p-6 bg-card border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Cite um Hospital ou Laboratório que gostaria de ser atendido.
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Informação opcional.</p>
              <Input
                type="text"
                placeholder="Nome do hospital ou laboratório"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
              />
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={goToPreviousTab}
                variant="outline"
                className="flex-1 h-14 rounded-xl font-semibold text-base"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base gap-2"
              >
                Enviar
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Seus dados estão protegidos
        </div>
      </footer>
    </main>
  )
}
