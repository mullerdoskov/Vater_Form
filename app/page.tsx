"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Users, Heart, MapPin, Check, Shield, Plus, X } from "lucide-react"

type OptionButtonProps = {
  label: string
  selected: boolean
  onClick: () => void
  variant?: "default" | "success" | "danger"
}

function OptionButton({ label, selected, onClick, variant = "default" }: OptionButtonProps) {
  // Mobile-first: caixas e textos compactos por padrao; crescem em telas maiores.
  const baseClasses = "w-full flex items-center gap-1.5 sm:gap-3 px-2 py-2 sm:p-3 rounded-xl border-2 transition-all duration-200 text-left font-medium text-[11px] sm:text-sm min-w-0"

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
      <span className={`w-5 h-5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
        selected
          ? variant === "danger" ? "bg-destructive text-white" : "bg-primary text-white"
          : "bg-muted text-muted-foreground"
      }`}>
        {selected ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : label.charAt(0)}
      </span>
      <span className="truncate">{label}</span>
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
      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 font-medium text-xs ${
        selected 
          ? "border-primary bg-primary/10 text-primary" 
          : "border-border bg-card hover:border-primary/50 text-foreground"
      }`}
    >
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white mb-1 ${color}`}>
        {selected ? <Check className="w-3 h-3" /> : letter}
      </span>
      {label}
    </button>
  )
}

export default function CotacaoPage() {
  const [activeTab, setActiveTab] = useState("participantes")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Tab 1 - Participantes
  const [quantidadePessoas, setQuantidadePessoas] = useState<string>("")
  const [idades, setIdades] = useState<string[]>([""])
  
  // Tab 2 - Plano de Saúde
  const [temPlano, setTemPlano] = useState<string>("")
  const [planoAtual, setPlanoAtual] = useState("")
  const [acomodacao, setAcomodacao] = useState<string>("")
  const [temCNPJ, setTemCNPJ] = useState<string>("sim")
  
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

  const addIdade = () => {
    if (idades.length < 10) {
      setIdades([...idades, ""])
    }
  }

  const removeIdade = (index: number) => {
    if (idades.length > 1) {
      setIdades(idades.filter((_, i) => i !== index))
    }
  }

  const updateIdade = (index: number, value: string) => {
    const newIdades = [...idades]
    newIdades[index] = value
    setIdades(newIdades)
  }

  const goToNextTab = () => {
    if (activeTab === "participantes") setActiveTab("plano")
    else if (activeTab === "plano") setActiveTab("contato")
  }

  const goToPreviousTab = () => {
    if (activeTab === "plano") setActiveTab("participantes")
    else if (activeTab === "contato") setActiveTab("plano")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const formData = {
      quantidadePessoas: quantidadePessoas === "1-10" ? "De 1 a 10 pessoas" : "11 pessoas ou mais",
      idades: quantidadePessoas === "1-10" ? idades.filter(i => i !== "").join(", ") : null,
      temPlanoSaude: temPlano === "sim" ? "SIM" : "NÃO",
      planoAtual: temPlano === "sim" ? planoAtual : null,
      resideSaoPaulo: resideSP === "sim" ? "SIM" : "NÃO",
      regiao: resideSP === "sim" ? regiao.toUpperCase() : null,
      cidade: resideSP === "nao" ? cidade : "São Paulo",
      acomodacao: acomodacao.charAt(0).toUpperCase() + acomodacao.slice(1),
      temCNPJ: temCNPJ === "sim" ? "SIM" : "NÃO",
      nome,
      telefone,
      hospitalPreferido: hospital || "Não informado",
      dataEnvio: new Date().toISOString()
    }

    try {
      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("Cotação enviada com sucesso! Entraremos em contato em breve.")
        // Reset form
        setActiveTab("participantes")
        setQuantidadePessoas("")
        setIdades([""])
        setTemPlano("")
        setPlanoAtual("")
        setAcomodacao("")
        setTemCNPJ("sim")
        setResideSP("")
        setRegiao("")
        setCidade("")
        setNome("")
        setTelefone("")
        setHospital("")
      } else {
        alert("Erro ao enviar cotação. Tente novamente.")
      }
    } catch {
      alert("Erro ao enviar cotação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shrink-0">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Peça sua Cotação</h1>
            <p className="text-xs text-muted-foreground">Plano de saúde personalizado</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 flex-1 flex flex-col w-full">
        {/* Intro - compact */}
        <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-xs text-primary font-medium flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Nenhum dado sensível será solicitado.
          </p>
        </div>

        {/* Progress Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-xl mb-4 grid grid-cols-3 gap-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium text-xs"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab 1: Participantes */}
          <TabsContent value="participantes" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 space-y-4">
              <Card className="p-4 bg-card border-0 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Quantas pessoas vão participar? <span className="text-primary">*</span>
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton
                    label="1 a 10 pessoas"
                    selected={quantidadePessoas === "1-10"}
                    onClick={() => setQuantidadePessoas("1-10")}
                  />
                  <OptionButton
                    label="11 ou mais"
                    selected={quantidadePessoas === "11+"}
                    onClick={() => setQuantidadePessoas("11+")}
                  />
                </div>
              </Card>

              {quantidadePessoas === "1-10" && (
                <Card className="p-4 bg-card border-0 shadow-sm">
                  <h2 className="text-sm font-semibold text-foreground mb-3">
                    Idades dos participantes: <span className="text-primary">*</span>
                  </h2>
                  <div className="space-y-2">
                    {idades.map((idade, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <Input
                          type="number"
                          placeholder="Idade"
                          value={idade}
                          onChange={(e) => updateIdade(index, e.target.value)}
                          className="bg-background border-border h-10 rounded-lg flex-1 text-sm"
                          min="0"
                          max="120"
                        />
                        {idades.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIdade(index)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {idades.length < 10 && (
                      <Button
                        variant="outline"
                        onClick={addIdade}
                        className="w-full h-10 rounded-lg text-sm gap-2 mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar pessoa
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>

            <Button 
              onClick={goToNextTab}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm gap-2 mt-4 shrink-0"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </TabsContent>

          {/* Tab 2: Plano de Saúde */}
          <TabsContent value="plano" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 space-y-4">
              <Card className="p-4 bg-card border-0 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Tem plano de saúde? <span className="text-primary">*</span>
                </h2>
                <div className="grid grid-cols-2 gap-2">
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
                {temPlano === "sim" && (
                  <Input
                    type="text"
                    placeholder="Qual o plano atual?"
                    value={planoAtual}
                    onChange={(e) => setPlanoAtual(e.target.value)}
                    className="bg-background border-border h-10 rounded-lg mt-3 text-sm"
                  />
                )}
              </Card>

              <Card className="p-4 bg-card border-0 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Qual acomodação?
                </h2>
                <div className="grid grid-cols-3 gap-2">
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

              <Card className="p-4 bg-card border-0 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Você tem CNPJ? <span className="text-primary">*</span>
                </h2>
                <div className="grid grid-cols-2 gap-2">
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
            </div>

            <div className="flex gap-3 mt-4 shrink-0">
              <Button 
                onClick={goToPreviousTab}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-semibold text-sm"
              >
                Voltar
              </Button>
              <Button 
                onClick={goToNextTab}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Localização e Contato */}
          <TabsContent value="contato" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 space-y-4">
              <Card className="p-4 bg-card border-0 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Reside em São Paulo? <span className="text-primary">*</span>
                </h2>
                <div className="grid grid-cols-2 gap-2">
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
                
                {resideSP === "sim" && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Qual região?</p>
                    <div className="grid grid-cols-5 gap-2">
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
                        letter="C"
                        label="Centro"
                        selected={regiao === "centro"}
                        onClick={() => setRegiao("centro")}
                        color="bg-violet-500"
                      />
                      <RegionButton
                        letter="L"
                        label="Leste"
                        selected={regiao === "leste"}
                        onClick={() => setRegiao("leste")}
                        color="bg-rose-500"
                      />
                    </div>
                  </div>
                )}

                {resideSP === "nao" && (
                  <Input
                    type="text"
                    placeholder="Qual cidade?"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="bg-background border-border h-10 rounded-lg mt-3 text-sm"
                  />
                )}
              </Card>

              <Card className="p-4 bg-card border-0 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-2">
                      Seu nome <span className="text-primary">*</span>
                    </h2>
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-background border-border h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-2">
                      Telefone <span className="text-primary">*</span>
                    </h2>
                    <Input
                      type="tel"
                      placeholder="11912345678"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="bg-background border-border h-10 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-2">
                      Hospital preferido <span className="text-muted-foreground text-xs">(opcional)</span>
                    </h2>
                    <Input
                      type="text"
                      placeholder="Hospital ou laboratório"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="bg-background border-border h-10 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-3 mt-4 shrink-0">
              <Button 
                onClick={goToPreviousTab}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-semibold text-sm"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm gap-2"
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
