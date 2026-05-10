import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

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

interface PythonResult {
  ok: boolean
  stdout: string
  stderr: string
  code: number | null
  cmdUsado: string
}

/**
 * Faz spawn do script Python passando o JSON via stdin.
 * Tenta `python` primeiro; se falhar com ENOENT, cai pra `py` (Windows
 * Python launcher). Pode ser sobrescrito via env var PYTHON_CMD.
 */
function callPythonSender(data: QuoteData): Promise<PythonResult> {
  return new Promise((resolve) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "send_quote_telegram.py",
    )

    // Ordem de tentativa dos interpretadores
    const candidatos = process.env.PYTHON_CMD
      ? [process.env.PYTHON_CMD]
      : ["python", "py"]

    const tentar = (i: number) => {
      if (i >= candidatos.length) {
        resolve({
          ok: false,
          stdout: "",
          stderr:
            "Nenhum interpretador Python encontrado (tentei: " +
            candidatos.join(", ") +
            "). Instale Python ou defina a env var PYTHON_CMD.",
          code: null,
          cmdUsado: candidatos.join(" / "),
        })
        return
      }

      const cmd = candidatos[i]
      const proc = spawn(cmd, [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      })

      let stdout = ""
      let stderr = ""
      let resolvedJaSpawnError = false

      proc.stdout?.on("data", (d) => {
        stdout += d.toString("utf-8")
      })
      proc.stderr?.on("data", (d) => {
        stderr += d.toString("utf-8")
      })

      proc.on("error", (err: NodeJS.ErrnoException) => {
        // Se nao achou o binario (ENOENT) ainda nao falhamos: tenta proximo
        if (err.code === "ENOENT" && !resolvedJaSpawnError) {
          resolvedJaSpawnError = true
          tentar(i + 1)
          return
        }
        resolve({
          ok: false,
          stdout,
          stderr: stderr + `\n[spawn error] ${err.message}`,
          code: null,
          cmdUsado: cmd,
        })
      })

      proc.on("close", (code) => {
        resolve({
          ok: code === 0,
          stdout,
          stderr,
          code,
          cmdUsado: cmd,
        })
      })

      // Envia o JSON pro stdin do Python
      try {
        proc.stdin?.setDefaultEncoding("utf-8")
        proc.stdin?.write(JSON.stringify(data))
        proc.stdin?.end()
      } catch (err) {
        // Se o write falhar (proc ja morto, etc.), o handler de 'error'
        // ou 'close' acima ainda dispara. Apenas log defensivo aqui.
        console.error("[send-quote] erro escrevendo stdin:", err)
      }
    }

    tentar(0)
  })
}

export async function POST(request: Request) {
  try {
    const data: QuoteData = await request.json()

    console.log("[send-quote] cotacao recebida:", data.nome, data.telefone)

    const result = await callPythonSender(data)

    if (!result.ok) {
      console.error(
        "[send-quote] Python falhou (cmd=%s, code=%s)\nstdout=%s\nstderr=%s",
        result.cmdUsado,
        result.code,
        result.stdout,
        result.stderr,
      )
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao enviar cotacao via Telegram",
          detail: result.stderr || result.stdout || "(sem detalhes)",
        },
        { status: 500 },
      )
    }

    console.log("[send-quote] Telegram OK:", result.stdout)

    return NextResponse.json({
      success: true,
      message: "Cotacao enviada com sucesso",
      data,
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
