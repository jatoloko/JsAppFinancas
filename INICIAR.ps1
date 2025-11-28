# Script PowerShell para iniciar o App de Finanças
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  💰 APP DE CONTROLE FINANCEIRO" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js em: https://nodejs.org" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Verificar se o build do frontend existe
if (-not (Test-Path "client\dist")) {
    Write-Host ""
    Write-Host "📦 Criando build do frontend..." -ForegroundColor Yellow
    Set-Location client
    
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
            Set-Location ..
            Read-Host "Pressione Enter para sair"
            exit 1
        }
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao criar build do frontend" -ForegroundColor Red
        Set-Location ..
        Read-Host "Pressione Enter para sair"
        exit 1
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "✅ Tudo pronto! Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 O aplicativo abrirá automaticamente no navegador" -ForegroundColor Cyan
Write-Host "   Se não abrir, acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Para fechar, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar o servidor standalone
node server/servidor-standalone.js

