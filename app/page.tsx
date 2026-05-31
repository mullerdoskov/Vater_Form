"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Users, Heart, MapPin, Check, Shield, AlertCircle, Percent, CheckCircle } from "lucide-react"

type OptionButtonProps = {
  label: string
  selected: boolean
  onClick: () => void
  variant?: "default" | "success" | "danger"
}

function OptionButton({ label, selected, onClick, variant = "default" }: OptionButtonProps) {
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

// ----- Helpers -----

// Planos exibidos como botões com logo na Etapa 2 (logos em /public/logos).
const PLANOS = [
  { id: "Porto Saúde", logo: "/logos/porto-saude.png" },
  { id: "SulAmérica", logo: "/logos/sulamerica.png" },
  { id: "Alice", logo: "/logos/alice.png" },
  { id: "Amil", logo: "/logos/amil.png" },
  { id: "Bradesco Saúde", logo: "/logos/bradesco-saude.png" },
  { id: "Hapvida", logo: "/logos/hapvida.png" },
]

// Operadoras exibidas na faixa de prova social (rodapé).
const OPERADORAS = ["SulAmérica", "Bradesco Saúde", "Amil", "Porto Seguro", "Hapvida", "Alice"]

function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // Celular: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export default function CotacaoPage() {
  const [activeTab, setActiveTab] = useState("participantes")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tab 1 - Participantes
  const [quantidadePessoas, setQuantidadePessoas] = useState<string>("")
  const [idades, setIdades] = useState<string[]>([""])

  // Tab 2 - Plano de Saúde
  const [temPlano, setTemPlano] = useState<string>("")
  const [planosSelecionados, setPlanosSelecionados] = useState<string[]>([])
  const [planoOutro, setPlanoOutro] = useState("")
  const [acomodacao, setAcomodacao] = useState<string>("")
  const [temCNPJ, setTemCNPJ] = useState<string>("sim")

  // Tab 3 - Localização e Contato
  const [resideSP, setResideSP] = useState<string>("")
  const [cidade, setCidade] = useState("")
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [hospital, setHospital] = useState("")

  // Validation feedback
  const [errorMsg, setErrorMsg] = useState<string>("")

  const tabs = [
    { id: "participantes", label: "Participantes", icon: Users },
    { id: "plano", label: "Plano", icon: Heart },
    { id: "contato", label: "Contato", icon: MapPin }
  ]

  // Sincroniza a quantidade de campos de idade com a opção escolhida.
  // 1–4: cria exatamente N campos (preservando o que já foi digitado).
  // 5+: cotação empresarial — não coletamos idades aqui.
  useEffect(() => {
    if (!quantidadePessoas) return
    if (quantidadePessoas === "5+") {
      setIdades([])
    } else {
      const n = Number(quantidadePessoas)
      setIdades((prev) => {
        const next = Array(n).fill("")
        for (let i = 0; i < Math.min(n, prev.length); i++) next[i] = prev[i]
        return next
      })
    }
  }, [quantidadePessoas])

  const handleIdadeChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 3) // só dígitos, máx. 3
    setIdades((prev) => {
      const next = [...prev]
      next[index] = clean
      return next
    })
  }

  // Liga/desliga uma operadora na seleção múltipla da Etapa 2.
  const togglePlano = (id: string) => {
    setPlanosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  // ----- Validações -----

  const isStep1Valid = (): { ok: boolean; msg?: string } => {
    if (!quantidadePessoas) return { ok: false, msg: "Selecione a quantidade de pessoas." }
    if (quantidadePessoas === "5+") return { ok: true } // 5+ não coleta idades
    if (idades.length === 0) return { ok: false, msg: "Informe pelo menos uma idade." }
    const algumaVazia = idades.some((i) => i === "" || isNaN(Number(i)) || Number(i) < 0 || Number(i) > 120)
    if (algumaVazia) return { ok: false, msg: "Preencha a idade de todas as pessoas (0 a 120)." }
    return { ok: true }
  }

  const isStep2Valid = (): { ok: boolean; msg?: string } => {
    if (!temPlano) return { ok: false, msg: "Informe se tem plano de saúde." }
    if (temPlano === "sim") {
      if (planosSelecionados.length === 0) return { ok: false, msg: "Selecione pelo menos um plano atual." }
      if (planosSelecionados.includes("Outros") && !planoOutro.trim()) {
        return { ok: false, msg: "Informe qual é o outro plano." }
      }
    }
    if (!acomodacao) return { ok: false, msg: "Selecione o tipo de acomodação." }
    if (!temCNPJ) return { ok: false, msg: "Informe se você tem CNPJ." }
    return { ok: true }
  }

  const isStep3Valid = (): { ok: boolean; msg?: string } => {
    if (!resideSP) return { ok: false, msg: "Informe se reside em São Paulo." }
    if (resideSP === "nao" && !cidade.trim()) return { ok: false, msg: "Informe a cidade." }
    if (!nome.trim()) return { ok: false, msg: "Informe seu nome completo." }
    const phoneDigits = telefone.replace(/\D/g, "")
    if (phoneDigits.length < 10) return { ok: false, msg: "Informe um telefone válido (com DDD)." }
    if (phoneDigits.length > 11) return { ok: false, msg: "Telefone inválido." }
    return { ok: true }
  }

  const step1 = isStep1Valid()
  const step2 = isStep2Valid()
  const step3 = isStep3Valid()

  // Número da etapa atual (para o indicador "Etapa X de 3" no card).
  const stepNumber = activeTab === "participantes" ? 1 : activeTab === "plano" ? 2 : 3

  const tryGoNext = () => {
    if (activeTab === "participantes") {
      if (!step1.ok) {
        setErrorMsg(step1.msg || "Preencha os campos obrigatórios.")
        return
      }
      setErrorMsg("")
      setActiveTab("plano")
    } else if (activeTab === "plano") {
      if (!step2.ok) {
        setErrorMsg(step2.msg || "Preencha os campos obrigatórios.")
        return
      }
      setErrorMsg("")
      setActiveTab("contato")
    }
  }

  const goToPreviousTab = () => {
    setErrorMsg("")
    if (activeTab === "plano") setActiveTab("participantes")
    else if (activeTab === "contato") setActiveTab("plano")
  }

  // Troca de aba ao clicar nas abas do topo. Voltar é sempre livre; avançar
  // exige que as etapas anteriores estejam válidas (mesma regra do "Próximo").
  const handleTabChange = (target: string) => {
    const ordem: Record<string, number> = { participantes: 1, plano: 2, contato: 3 }
    const destino = ordem[target] ?? 1

    // Voltar (ou permanecer na etapa atual) é sempre permitido.
    if (destino <= ordem[activeTab]) {
      setErrorMsg("")
      setActiveTab(target)
      return
    }

    // Avançar: valida as etapas até o destino, parando na primeira incompleta.
    if (destino >= 2 && !step1.ok) {
      setActiveTab("participantes")
      setErrorMsg(step1.msg || "Preencha os campos obrigatórios.")
      return
    }
    if (destino >= 3 && !step2.ok) {
      setActiveTab("plano")
      setErrorMsg(step2.msg || "Preencha os campos obrigatórios.")
      return
    }

    setErrorMsg("")
    setActiveTab(target)
  }

  const handleSubmit = async () => {
    if (!step3.ok) {
      setErrorMsg(step3.msg || "Preencha os campos obrigatórios.")
      return
    }
    setErrorMsg("")
    setIsSubmitting(true)

    const planoFinal =
      temPlano === "sim"
        ? planosSelecionados
            .map((p) => (p === "Outros" ? planoOutro.trim() : p))
            .filter(Boolean)
            .join(", ")
        : null

    const formData = {
      quantidadePessoas:
        quantidadePessoas === "5+"
          ? "5 ou mais pessoas"
          : `${quantidadePessoas} ${quantidadePessoas === "1" ? "pessoa" : "pessoas"}`,
      idades: quantidadePessoas === "5+" ? null : idades.filter((i) => i !== "").join(", "),
      temPlanoSaude: temPlano === "sim" ? "SIM" : "NÃO",
      planoAtual: planoFinal,
      resideSaoPaulo: resideSP === "sim" ? "SIM" : "NÃO",
      regiao: null,
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
        setActiveTab("participantes")
        setQuantidadePessoas("")
        setIdades([""])
        setTemPlano("")
        setPlanosSelecionados([])
        setPlanoOutro("")
        setAcomodacao("")
        setTemCNPJ("sim")
        setResideSP("")
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

  // helper para botão Próximo - cinza quando inválido
  const nextButtonClass = (valid: boolean) =>
    `w-full h-12 rounded-xl font-semibold text-sm gap-2 mt-4 shrink-0 transition-colors ${
      valid
        ? "bg-primary hover:bg-primary/90 text-white"
        : "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
    }`

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans text-foreground antialiased">
      {/* ── HEADER INSTITUCIONAL ───────────────────────────────────────── */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-primary font-bold text-lg sm:text-xl tracking-tight">
            <span className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </span>
            <span>Livecare</span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Consultoria Autorizada SUSEP
          </span>
        </div>
      </header>

      {/* ── DOBRA PRINCIPAL: PROPOSTA DE VALOR + FORMULÁRIO ────────────── */}
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 py-8 lg:grid-cols-12 lg:gap-12 lg:py-16">

          {/* ESQUERDA: PROPOSTA DE VALOR */}
          <div className="flex flex-col justify-center lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
                Reduza o custo do plano de saúde da sua empresa em até{" "}
                <span className="text-primary">40%</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl text-pretty">
                Analisamos sua apólice atual e cotamos as principais operadoras do mercado
                para encontrar o equilíbrio perfeito entre custo e benefício.
              </p>
            </div>

            {/* BENEFÍCIOS CHAVE */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
                  <Percent className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Desconto pelo CNPJ / MEI</h3>
                  <p className="text-sm text-muted-foreground">
                    Planos corporativos a partir de 2 vidas com valores bem menores que o individual.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Transição Sem Burocracia</h3>
                  <p className="text-sm text-muted-foreground">
                    Aproveitamento de carências das principais operadoras do país de forma transparente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DIREITA: FORMULÁRIO EM ETAPAS */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xl ring-1 ring-foreground/5">

              {/* CABEÇALHO DO CARD */}
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                  <CheckCircle className="h-4 w-4" /> Peça sua Cotação
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2.5 py-1 rounded-md">
                  Etapa {stepNumber} de 3
                </span>
              </div>

              {/* AVISO DE PRIVACIDADE */}
              <div className="mb-5 rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-2 text-primary text-sm">
                <Shield className="h-4 w-4 shrink-0" />
                <p className="font-medium">Nenhum dado sensível ou de saúde será solicitado aqui.</p>
              </div>

              {/* Progress Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-xl mb-4 sm:mb-6 grid grid-cols-3 gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    // Trava as abas seguintes enquanto as etapas anteriores não estiverem válidas.
                    const locked =
                      (tab.id === "plano" && !step1.ok) ||
                      (tab.id === "contato" && !(step1.ok && step2.ok))
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        disabled={locked}
                        className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {/* Tab 1: Participantes */}
                <TabsContent value="participantes" className="mt-0 animate-in fade-in-50 duration-300">
                  <div className="space-y-4 sm:space-y-5">
                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                        Quantas pessoas vão participar? <span className="text-primary">*</span>
                      </h2>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, "5+"].map((num) => {
                          const valor = String(num)
                          const ativo = quantidadePessoas === valor
                          return (
                            <button
                              key={valor}
                              type="button"
                              onClick={() => setQuantidadePessoas(valor)}
                              className={`rounded-xl border-2 py-3 text-sm font-extrabold tracking-wide transition-all duration-200 ${
                                ativo
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/15"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {num}
                            </button>
                          )
                        })}
                      </div>
                    </Card>

                    {quantidadePessoas && quantidadePessoas !== "5+" && (
                      <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm animate-in fade-in-50 duration-300">
                        <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                          Idades dos participantes: <span className="text-primary">*</span>
                        </h2>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                          {idades.map((idade, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-6 text-right">{index + 1}.</span>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Ex: 26"
                                value={idade}
                                onChange={(e) => handleIdadeChange(index, e.target.value)}
                                className="bg-background border-border h-10 rounded-lg flex-1 text-sm"
                                maxLength={3}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {quantidadePessoas === "5+" && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 text-sm text-primary flex items-center gap-2 animate-in fade-in-50 duration-300">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>Para 5 ou mais vidas faremos uma cotação empresarial — as idades serão coletadas depois.</span>
                      </div>
                    )}
                  </div>

                  {errorMsg && activeTab === "participantes" && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-xs sm:text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button
                    onClick={tryGoNext}
                    className={nextButtonClass(step1.ok)}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </TabsContent>

                {/* Tab 2: Plano de Saúde */}
                <TabsContent value="plano" className="mt-0 animate-in fade-in-50 duration-300">
                  <div className="space-y-4 sm:space-y-5">
                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                        Tem plano de saúde? <span className="text-primary">*</span>
                      </h2>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                        <div className="mt-4 space-y-2">
                          <label className="text-xs sm:text-sm text-muted-foreground">
                            Qual(is) plano(s) você tem hoje? <span className="text-primary">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {PLANOS.map((op) => {
                              const sel = planosSelecionados.includes(op.id)
                              return (
                                <button
                                  key={op.id}
                                  type="button"
                                  onClick={() => togglePlano(op.id)}
                                  className={`relative flex flex-col items-center justify-center gap-1.5 p-2 min-h-[4rem] rounded-xl border-2 transition-all duration-200 ${
                                    sel
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                                      : "border-border bg-card hover:border-primary/50"
                                  }`}
                                >
                                  {sel && (
                                    <span className="absolute top-1 right-1 text-primary">
                                      <Check className="h-3.5 w-3.5" />
                                    </span>
                                  )}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={op.logo}
                                    alt={op.id}
                                    className="h-10 w-full object-contain"
                                  />
                                </button>
                              )
                            })}

                            {/* Opção "Outros" (sem logo) */}
                            <button
                              type="button"
                              onClick={() => togglePlano("Outros")}
                              className={`relative flex flex-col items-center justify-center gap-1.5 p-2 min-h-[4rem] rounded-xl border-2 transition-all duration-200 ${
                                planosSelecionados.includes("Outros")
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                                  : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              {planosSelecionados.includes("Outros") && (
                                <span className="absolute top-1 right-1 text-primary">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span className="text-sm font-bold text-foreground">Outros</span>
                            </button>
                          </div>

                          {planosSelecionados.includes("Outros") && (
                            <Input
                              type="text"
                              placeholder="Informe qual o outro plano"
                              value={planoOutro}
                              onChange={(e) => setPlanoOutro(e.target.value)}
                              className="bg-background border-border h-10 rounded-lg text-sm"
                            />
                          )}
                        </div>
                      )}
                    </Card>

                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                        Qual acomodação? <span className="text-primary">*</span>
                      </h2>
                      <div className="flex flex-col gap-2">
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

                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                        Você tem CNPJ? <span className="text-primary">*</span>
                      </h2>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                      {temCNPJ === "sim" && (
                        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs font-medium text-amber-800">
                          ✨ Excelente! Planos por CNPJ garantem tabelas de preço até 40% mais baratas.
                        </div>
                      )}
                    </Card>
                  </div>

                  {errorMsg && activeTab === "plano" && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-xs sm:text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={goToPreviousTab}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-semibold text-sm"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={tryGoNext}
                      className={`flex-1 h-12 rounded-xl font-semibold text-sm gap-2 transition-colors ${
                        step2.ok
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                      }`}
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab 3: Localização e Contato */}
                <TabsContent value="contato" className="mt-0 animate-in fade-in-50 duration-300">
                  <div className="space-y-4 sm:space-y-5">
                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <h2 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                        Reside em São Paulo? <span className="text-primary">*</span>
                      </h2>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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

                    <Card className="p-4 sm:p-5 bg-card border-0 shadow-sm">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-2">
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
                          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                            Telefone <span className="text-primary">*</span>
                          </h2>
                          <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="(11) 9 1234-5678"
                            value={telefone}
                            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                            className="bg-background border-border h-10 rounded-lg text-sm"
                            maxLength={16}
                          />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                            Hospital preferido{" "}
                            <span className="text-muted-foreground text-xs">(opcional)</span>
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

                  {errorMsg && activeTab === "contato" && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-xs sm:text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
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
                      className={`flex-1 h-12 rounded-xl font-semibold text-sm gap-2 transition-colors ${
                        step3.ok && !isSubmitting
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? "Enviando..." : "Receber Cotação Gratuita"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* ── VITRINE DE OPERADORAS (PROVA SOCIAL) ───────────────────────── */}
      <section className="border-t border-border bg-card py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Cotamos as melhores operadoras do país
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
            {OPERADORAS.map((nome) => (
              <span key={nome} className="font-extrabold text-base sm:text-xl text-foreground/70">
                {nome}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
