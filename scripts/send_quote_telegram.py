"""
send_quote_telegram.py
======================

[STATUS: opcional - apenas para teste standalone via terminal]

A rota /api/send-quote do Next.js NAO depende mais deste script.
Ela faz a chamada para a Telegram Bot API direto em TypeScript,
para ser compativel com o runtime serverless do Vercel (que nao
roda Python).

Este script continua aqui como utilitario para testar o envio
do mesmo payload via terminal/Python, reutilizando o operador
operador_Telegram da pasta local Telegram/.

Uso (testavel via terminal, a partir da raiz de page_cotacao):
    type dados.json | python scripts\\send_quote_telegram.py

Saida (stdout JSON em caso de sucesso, stderr JSON em caso de erro).
"""
from __future__ import annotations

import json
import os
import sys
import traceback
from datetime import datetime
from pathlib import Path

# ─── Paths locais ──────────────────────────────────────────────────────────
# O script vive em page_cotacao/scripts/. A pasta Telegram esta em
# page_cotacao/Telegram/.
THIS_FILE = Path(__file__).resolve()
PROJECT_ROOT = THIS_FILE.parent.parent
TELEGRAM_DIR = PROJECT_ROOT / "Telegram"
ENERGY_BOT_DIR = TELEGRAM_DIR / "Energy_bot"

# Adiciona Telegram/ ao sys.path para encontrar operadores_gerais.py
if str(TELEGRAM_DIR) not in sys.path:
    sys.path.insert(0, str(TELEGRAM_DIR))

# UTF-8 nos streams (Windows costuma vir em cp1252)
for stream_name in ("stdin", "stdout", "stderr"):
    stream = getattr(sys, stream_name, None)
    if stream is not None and hasattr(stream, "reconfigure"):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


# ─── Helpers ──────────────────────────────────────────────────────────────
def _escape_html(s) -> str:
    if s is None or s == "":
        return "-"
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _fmt_data_iso(s) -> str:
    if not s:
        return "-"
    try:
        dt = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return str(s)


def montar_mensagem_tabela(data: dict) -> str:
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
    label_w = max(len(k) for k, _ in rows)
    linhas = []
    for k, v in rows:
        val = "-" if v in (None, "", "null") else v
        linhas.append(f"{k.ljust(label_w)} : {_escape_html(val)}")
    body_pre = "\n".join(linhas)
    nome_safe = _escape_html(data.get("nome") or "(sem nome)")
    return f"<b>🩺 Nova Cotacao - {nome_safe}</b>\n<pre>{body_pre}</pre>"


def _patch_operador_paths(opg_module):
    """Forca o operador_Telegram a usar a pasta local Telegram/Energy_bot/.

    O operador original calcula path_middle como '../..' do __file__, o
    que aponta para uma estrutura diferente (Documents/Middle). Aqui
    reescrevemos o path_folder_bot no __init__ para apontar para a
    pasta local que veio no commit.
    """
    OperadorTelegramOriginal = opg_module.operador_Telegram
    init_orig = OperadorTelegramOriginal.__init__

    def init_patched(self, *args, **kwargs):
        init_orig(self, *args, **kwargs)
        self.path_folder_bot = str(ENERGY_BOT_DIR)
        self.path_credenciais = str(ENERGY_BOT_DIR / "credenciais.csv")
        self.path_chat = str(ENERGY_BOT_DIR / "chat_id.csv")

    OperadorTelegramOriginal.__init__ = init_patched


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
            raise ValueError(
                f"Esperado objeto JSON, recebi {type(data).__name__}",
            )

        try:
            import operadores_gerais as opg  # noqa: WPS433
        except Exception as e:
            raise RuntimeError(
                f"Falha ao importar operadores_gerais de {TELEGRAM_DIR!s}: "
                f"{type(e).__name__}: {e}"
            ) from e

        # Aponta o operador para a pasta local de credenciais
        _patch_operador_paths(opg)

        msg = montar_mensagem_tabela(data)

        tl = opg.operador_Telegram()
        tl.enviar_msg("Livecare", msg, html=True)

        sys.stdout.write(json.dumps({
            "success": True,
            "chat": "Livecare",
            "preview": msg[:200],
        }, ensure_ascii=False))
        sys.stdout.flush()
        return 0

    except Exception as e:
        sys.stderr.write(json.dumps({
            "success": False,
            "error": f"{type(e).__name__}: {e}",
            "traceback": traceback.format_exc(),
        }, ensure_ascii=False))
        sys.stderr.flush()
        return 1


if __name__ == "__main__":
    sys.exit(main())
