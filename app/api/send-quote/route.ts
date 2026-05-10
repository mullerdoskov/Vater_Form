import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import path from "path"

// Garante runtime Node.js (nao Edge) — precisamos de fs para ler CSVs locais.
export const runtime = "nodejs"

interface QuoteData {
  quantidadePessoas: string
  idades: string | null
  temPlanoSaude: string
  planoAtual: string | null
  resideSaoPaulo: string
  regiao: string | null
  cidade: string
  acomodacao: string
  temCNPJ: string
  nome: string
  telefone: string
  hospitalPreferido: string
  dataEnvio: string
}

// ──────────────────────────────────────────────────────────────────────────
// Leitura de credenciais
// ──────────────────────────────────────────────────────────────────────────
//
// Ordem de prioridade:
//   1. Env vars (recomendado em producao no Vercel):
//        TELEGRAM_BOT_TOKEN     - token do bot
//        TELEGRAM_CHAT_LIVECARE - chat_id numerico do chat "Livecare"
//   2. Fallback: le os CSVs em Telegram/Energy_bot/ (mesmos arquivos que
//      o operador_Telegram do ecossistema Middle usa).
//
// Os CSVs sao incluidos no bundle do Vercel via next.config.mjs
// (outputFileTracingIncludes). Em dev local funciona via process.cwd().

const TELEGRAM_FOLDER = path.join(
  process.cwd(),
  "Telegram",
  "Energy_bot",
)

function lerToken(): string {
  const envTok = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (envTok) return envTok

  const file = path.join(TELEGRAM_FOLDER, "credenciais.csv")
  const raw = readFileSync(file, "utf-8")
  const linhas = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (linhas.length < 2) {
    throw new Error(
      `credenciais.csv invalido (${file}) - esperado cabecalho + linha de token`,
    )
  }
  // Formato: linha 0 = "token", linha 1 = <valor>
  const tok = linhas[1].trim()
  if (!tok) throw new Error(`Token vazio em ${file}`)
  return tok
}

function lerChatId(nomeChat: string): number {
  // Permite override por env var (ex.: TELEGRAM_CHAT_LIVECARE)
  const envName = `TELEGRAM_CHAT_${nomeChat.toUpperCase()}`
  const envVal = process.env[envName]?.trim()
  if (envVal) {
    const n = Number(envVal)
    if (!Number.isFinite(n)) {
      throw new Error(`Env var ${envName} nao e numero: ${JSON.stringify(envVal)}`)
    }
    return n
  }

  const file = path.join(TELEGRAM_FOLDER, "chat_id.csv")
  const raw = readFileSync(file, "utf-8")
  const linhas = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  // Cabecalho: "chat;id". Demais linhas: "<nome>;<id>"
  for (let i = 1; i < linhas.length; i++) {
    const partes = linhas[i].split(";")
    if (partes.length < 2) continue
    const nome = partes[0].trim()
    const idStr = partes[1].trim()
    if (nome === nomeChat) {
      const n = Number(idStr)
      if (!Number.isFinite(n)) {
        throw new Error(`chat_id de ${nomeChat} nao e numero: ${idStr}`)
      }
      return n
    }
  }
  throw new Error(
    `Chat "${nomeChat}" nao encontrado em ${file}. ` +
      `Defina ${envName} ou adicione linha no CSV.`,
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Formatacao da mensagem
// ──────────────────────────────────────────────────────────────────────────
function escapeHtml(s: unknown): string {
  if (s === null || s === undefined || s === "") return "-"
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function fmtDataIso(s: string | null | undefined): string {
  if (!s) return "-"
  try {
    const dt = new Date(s)
    if (Number.isNaN(dt.getTime())) return String(s)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  } catch {
    return String(s)
  }
}

function montarMensagemTabela(data: QuoteData): string {
  const rows: [string, unknown][] = [
    ["Nome",          data.nome],
    ["Telefone",      data.telefone],
    ["Pessoas",       data.quantidadePessoas],
    ["Idades",        data.idades],
    ["Tem plano",     data.temPlanoSaude],
    ["Plano atual",   data.planoAtual],
    ["Reside SP",     data.resideSaoPaulo],
    ["Regiao",        data.regiao],
    ["Cidade",        data.cidade],
    ["Acomodacao",    data.acomodacao],
    ["Tem CNPJ",      data.temCNPJ],
    ["Hospital pref", data.hospitalPreferido],
    ["Enviado em",    fmtDataIso(data.dataEnvio)],
  ]

  const labelW = Math.max(...rows.map(([k]) => k.length))

  const linhas = rows.map(([k, v]) => {
    const label = k.padEnd(labelW, " ")
    return `${label} : ${escapeHtml(v)}`
  })

  const nomeSafe = escapeHtml(data.nome || "(sem nome)")
  return `<b>🩺 Nova Cotacao - ${nomeSafe}</b>\n<pre>${linhas.join("\n")}</pre>`
}

// ──────────────────────────────────────────────────────────────────────────
// Envio
// ──────────────────────────────────────────────────────────────────────────
async function enviarTelegram(
  token: string,
  chatId: number,
  mensagem: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensagem,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  })

  if (!resp.ok) {
    const body = await resp.text().catch(() => "")
    throw new Error(
      `Telegram API retornou ${resp.status} ${resp.statusText}: ${body}`,
    )
  }

  const j = (await resp.json().catch(() => ({}))) as { ok?: boolean; description?: string }
  if (j.ok !== true) {
    throw new Error(
      `Telegram API respondeu ok=false: ${j.description || JSON.stringify(j)}`,
    )
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const data: QuoteData = await request.json()

    console.log(
      "[send-quote] cotacao recebida:",
      data.nome,
      data.telefone,
    )

    let token: string
    let chatId: number
    try {
      token = lerToken()
      chatId = lerChatId("Livecare")
    } catch (err) {
      console.error("[send-quote] erro lendo credenciais:", err)
      return NextResponse.json(
        {
          success: false,
          message: "Configuracao do Telegram ausente",
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 500 },
      )
    }

    const mensagem = montarMensagemTabela(data)

    try {
      await enviarTelegram(token, chatId, mensagem)
    } catch (err) {
      console.error("[send-quote] falha no envio Telegram:", err)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao enviar para o Telegram",
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 502 },
      )
    }

    console.log("[send-quote] Telegram OK (chat Livecare)")

    return NextResponse.json({
      success: true,
      message: "Cotacao enviada com sucesso",
    })
  } catch (error) {
    console.error("[send-quote] erro inesperado:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao processar cotacao",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
