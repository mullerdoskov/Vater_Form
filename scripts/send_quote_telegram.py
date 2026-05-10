"""
send_quote_telegram.py
======================

Recebe um JSON com os dados de cotacao via STDIN, monta uma mensagem
formato tabela (HTML/<pre>) e envia para o chat 'Livecare' via
operador_Telegram do ecossistema Middle.

Uso (testavel via terminal):
    type dados.json | python send_quote_telegram.py
    echo {"nome":"...", "telefone":"..."} | python send_quote_telegram.py

Saida em STDOUT (JSON):
    {"success": true, "chat": "Livecare"}
ou em STDERR (JSON) com exit code 1:
    {"success": false, "error": "...", "traceback": "..."}

Esta versao chama o operador_Telegram diretamente para reaproveitar a
logica de cache/rate-limit do bot Energy_bot.
"""
from __future__ import annotations

import json
import os
import sys
import traceback
from datetime import datetime

# ─── Bootstrap do ecossistema Middle ──────────────────────────────────────
# operadores_gerais vive em C:\Users\lucas\Documents\Middle\0.SCRIPTS\0.CLASSES.
# Adiciona ao sys.path se nao estiver.
PATH_CLASSES = r"C:\Users\lucas\Documents\Middle\0.SCRIPTS\0.CLASSES"
if PATH_CLASSES not in sys.path:
    sys.path.insert(0, PATH_CLASSES)

# Forca UTF-8 no stdin/stdout/stderr (Windows costuma vir em cp1252)
for stream_name in ("stdin", "stdout", "stderr"):
    stream = getattr(sys, stream_name, None)
    if stream is not None and hasattr(stream, "reconfigure"):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


# ─── Helpers ──────────────────────────────────────────────────────────────
def _escape_html(s) -> str:
    """Escapa caracteres que quebrariam o parser HTML do Telegram."""
    if s is None:
        return "-"
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _fmt_data_iso(s) -> str:
    """Converte ISO datetime -> '2026-05-10 14:30' (br-friendly)."""
    if not s:
        return "-"
    try:
        dt = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return str(s)


def montar_mensagem_tabela(data: dict) -> str:
    """Monta mensagem HTML com cabecalho em <b> e tabela 2 colunas em <pre>.

    Estrutura:
      <b>🩺 Nova Cotacao - <Nome></b>
      <pre>
      Campo          : Valor
      ...
      </pre>
    """
    rows = [
        ("Nome",          data.get("nome")),
        ("Telefone",      data.get("telefone")),
        ("Pessoas",       data.get("quantidadePessoas")),
        ("Idades",        data.get("idades")),
        ("Tem plano",     data.get("temPlanoSaude")),
        ("Plano atual",   data.get("planoAtual")),
        ("Reside SP",     data.get("resideSaoPaulo")),
        ("Regiao",        data.get("regiao")),
        ("Cidade",        data.get("cidade")),
        ("Acomodacao",    data.get("acomodacao")),
        ("Tem CNPJ",      data.get("temCNPJ")),
        ("Hospital pref", data.get("hospitalPreferido")),
        ("Enviado em",    _fmt_data_iso(data.get("dataEnvio"))),
    ]

    # Largura do label = label mais longo + 1 espaco
    label_w = max(len(k) for k, _ in rows)

    linhas = []
    for k, v in rows:
        val = "-" if v in (None, "", "null") else v
        linhas.append(f"{k.ljust(label_w)} : {_escape_html(val)}")

    body_pre = "\n".join(linhas)
    nome_safe = _escape_html(data.get("nome") or "(sem nome)")

    msg = (
        f"<b>🩺 Nova Cotacao - {nome_safe}</b>\n"
        f"<pre>{body_pre}</pre>"
    )
    return msg


# ─── Main ────────────────────────────────────────────────────────────────
def main() -> int:
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            raise ValueError("stdin vazio - nenhum JSON recebido")

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON invalido em stdin: {e}") from e

        if not isinstance(data, dict):
            raise ValueError(f"Esperado objeto JSON, recebi {type(data).__name__}")

        # Importa apos garantir o path - caso operadores_gerais ou suas deps
        # nao estejam disponiveis, da erro com mensagem clara.
        try:
            import operadores_gerais as opg  # noqa: WPS433
        except Exception as e:
            raise RuntimeError(
                f"Falha ao importar operadores_gerais de {PATH_CLASSES!r}: "
                f"{type(e).__name__}: {e}"
            ) from e

        msg = montar_mensagem_tabela(data)

        # Envia
        tl = opg.operador_Telegram()
        tl.enviar_msg("Livecare", msg, html=True)

        # Resposta de sucesso (Next.js le do stdout)
        sys.stdout.write(json.dumps({
            "success": True,
            "chat": "Livecare",
            "preview": msg[:200],
        }, ensure_ascii=False))
        sys.stdout.flush()
        return 0

    except Exception as e:
        err_payload = {
            "success": False,
            "error": f"{type(e).__name__}: {e}",
            "traceback": traceback.format_exc(),
        }
        sys.stderr.write(json.dumps(err_payload, ensure_ascii=False))
        sys.stderr.flush()
        return 1


if __name__ == "__main__":
    sys.exit(main())
