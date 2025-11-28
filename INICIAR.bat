@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   💰 APP DE CONTROLE FINANCEIRO
echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 Iniciando o aplicativo...
echo.

REM Verificar se Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências do backend...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do backend
        pause
        exit /b 1
    )
)

REM Verificar se o build do frontend existe
if not exist "client\dist" (
    echo.
    echo 📦 Criando build do frontend...
    cd client
    if not exist "node_modules" (
        call npm install
        if %errorlevel% neq 0 (
            echo ❌ Erro ao instalar dependências do frontend
            cd ..
            pause
            exit /b 1
        )
    )
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Erro ao criar build do frontend
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo ✅ Tudo pronto! Iniciando servidor...
echo.
echo 📱 O aplicativo abrirá automaticamente no navegador
echo    Se não abrir, acesse: http://localhost:3000
echo.
echo ⚠️  Para fechar, pressione Ctrl+C
echo.

REM Iniciar o servidor standalone
node server/servidor-standalone.js

pause

