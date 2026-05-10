@echo off
setlocal

REM ============================================================
REM  Vater - page_cotacao
REM  Sobe o servidor Next.js localmente e abre no navegador
REM ============================================================

cd /d "%~dp0"
title Vater - page_cotacao (dev server)

echo.
echo ============================================================
echo  Vater - page_cotacao  --  Next.js dev server
echo  Pasta: %CD%
echo ============================================================
echo.

REM ---- Verifica Node ----
where node >nul 2>nul
if errorlevel 1 goto NO_NODE

REM ---- Detecta pnpm ----
where pnpm >nul 2>nul
if errorlevel 1 goto TRY_NPM
set PKG=pnpm
goto HAS_PKG

:TRY_NPM
where npm >nul 2>nul
if errorlevel 1 goto NO_PKG
set PKG=npm
echo [AVISO] pnpm nao encontrado. Usando npm como fallback.
echo.
goto HAS_PKG

:HAS_PKG
echo [INFO] Gerenciador de pacotes para install: %PKG%
echo.

REM ---- (Re)gera .npmrc com flags que destravam pnpm v11 ----
echo [INFO] Garantindo .npmrc compativel com pnpm v11...
> .npmrc echo # Gerado por run-local.bat
>> .npmrc echo verify-deps-before-run=false
>> .npmrc echo strict-dep-builds=false
>> .npmrc echo auto-install-peers=true

REM Reforca via env vars (caso .npmrc seja ignorado em alguma config local)
set npm_config_verify_deps_before_run=false
set npm_config_strict_dep_builds=false

REM ---- Instala dependencias se necessario ----
if exist "node_modules\next" goto RUN_DEV
echo.
echo [INFO] Instalando dependencias (pode levar alguns minutos)...
echo.
call %PKG% install
REM pnpm v10/v11 retorna nao-zero quando ignora builds; checamos pelo pacote real.
if not exist "node_modules\next" goto INSTALL_FAIL
echo.
echo [INFO] Dependencias instaladas com sucesso.

:RUN_DEV
echo.
echo [INFO] Iniciando Next.js diretamente via node_modules\.bin\next.cmd
echo        (bypassa o check de deps do pnpm v11)
echo        URL: http://localhost:3000
echo        Para parar: Ctrl+C nesta janela.
echo.

REM Abre o navegador apos 8s, em paralelo
start "" /B cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000"

REM Caminho 1: binario direto do Next (sem passar pelo pnpm)
if exist "node_modules\.bin\next.cmd" (
    call "node_modules\.bin\next.cmd" dev
    goto AFTER_DEV
)

REM Caminho 2: invocar via Node, caso o .cmd shim nao exista
if exist "node_modules\next\dist\bin\next" (
    call node "node_modules\next\dist\bin\next" dev
    goto AFTER_DEV
)

echo [ERRO] Nao encontrei o binario do Next em node_modules.
echo        Apague node_modules e rode o .bat de novo para reinstalar.
goto END

:AFTER_DEV
echo.
echo [INFO] Servidor encerrado.
goto END

:NO_NODE
echo [ERRO] Node.js nao encontrado no PATH.
echo        Instale em https://nodejs.org/ e reinicie o terminal.
goto END

:NO_PKG
echo [ERRO] Nem pnpm nem npm foram encontrados no PATH.
echo        Reinstale o Node.js (que ja vem com npm).
goto END

:INSTALL_FAIL
echo.
echo [ERRO] A instalacao nao concluiu - pacote 'next' nao foi encontrado.
echo        Tente rodar manualmente:  %PKG% install
goto END

:END
echo.
pause
endlocal
