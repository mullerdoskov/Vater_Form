@echo off
setlocal

REM ============================================================
REM  Vater - page_cotacao
REM  Sobe alteracoes para o GitHub:
REM    https://github.com/mullerdoskov/Vater_Form
REM ============================================================

cd /d "%~dp0"
title Vater - git push (Vater_Form)

set "REPO_URL=https://github.com/mullerdoskov/Vater_Form.git"
set "BRANCH=main"

echo.
echo ============================================================
echo  Vater - git push
echo  Pasta:  %CD%
echo  Repo:   %REPO_URL%
echo  Branch: %BRANCH%
echo ============================================================
echo.

REM ---- Verifica git ----
where git >nul 2>nul
if errorlevel 1 goto NO_GIT

REM ---- Inicializa repo se necessario ----
if exist ".git" goto HAS_GIT
echo [INFO] Repo nao iniciado. Rodando 'git init'...
call git init
if errorlevel 1 goto INIT_FAIL
call git branch -M %BRANCH% >nul 2>nul
call git remote add origin %REPO_URL%
goto STAGE

:HAS_GIT
REM Garante que o remote 'origin' aponta para a URL correta
call git remote get-url origin >nul 2>nul
if errorlevel 1 (
    call git remote add origin %REPO_URL%
) else (
    call git remote set-url origin %REPO_URL%
)
REM Garante que estamos na branch main (idempotente)
call git branch -M %BRANCH% >nul 2>nul

:STAGE
echo.
echo [INFO] Estado atual:
call git status --short
echo.

echo [INFO] Adicionando todas as alteracoes (git add -A)...
call git add -A

REM ---- Mensagem de commit ----
set "MSG="
set /p MSG=Mensagem de commit (Enter para usar timestamp):
if "%MSG%"=="" set "MSG=Update %date% %time%"

echo.
echo [INFO] Commit: %MSG%
call git commit -m "%MSG%"
REM 'nothing to commit' retorna nao-zero - tudo bem, seguimos pro push.

REM ---- Sincroniza com remoto (tolera ausencia de branch remota) ----
echo.
echo [INFO] Sincronizando com remoto (pull --rebase)...
call git pull --rebase origin %BRANCH%
REM Erro aqui (ex: branch remota nao existe ainda) nao trava o push.

REM ---- Push ----
echo.
echo [INFO] Enviando para %REPO_URL% (%BRANCH%)...
call git push -u origin %BRANCH%
if errorlevel 1 goto PUSH_FAIL

echo.
echo ============================================================
echo  [OK] Push concluido com sucesso.
echo  Repo: %REPO_URL%
echo ============================================================
goto END

:NO_GIT
echo [ERRO] Git nao encontrado no PATH.
echo        Instale em https://git-scm.com/download/win
echo        e reinicie o terminal.
goto END

:INIT_FAIL
echo [ERRO] Falha ao inicializar repo git nesta pasta.
goto END

:PUSH_FAIL
echo.
echo [ERRO] Push falhou. Possiveis causas:
echo   1. Sem credenciais autenticadas:
echo      - Na primeira vez o Git Credential Manager abre janela do GitHub.
echo      - Ou gere um Personal Access Token em github.com/settings/tokens
echo        e use ele como senha.
echo   2. Branch remota tem commits que voce nao tem:
echo      - Rode novamente o .bat (faz pull --rebase antes do push).
echo   3. Sem permissao de escrita no repo Vater_Form.
goto END

:END
echo.
pause
endlocal
