# PowerShell script to launch VS Code with proper secret injection
# Run this from Windows PowerShell (not WSL)

Write-Host "🔐 Setting up TestSprite integration..." -ForegroundColor Green

# Authenticate with 1Password
op signin

# Get TestSprite API key
$env:TESTSPRITE_API_KEY = op read 'op://Development/Testsprite API/credential'

if ($env:TESTSPRITE_API_KEY) {
    Write-Host "✅ TestSprite API key loaded successfully" -ForegroundColor Green

    # Launch VS Code with the WSL project path
    $projectPath = "\\wsl.localhost\Ubuntu\home\ichardart\code\clients\website-mq-studio"
    Write-Host "🚀 Launching VS Code..." -ForegroundColor Cyan
    code $projectPath

    Write-Host "`n📦 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait for VS Code to open"
    Write-Host "  2. Press F1 and run: 'Dev Containers: Reopen in Container'"
    Write-Host "  3. In the container terminal, verify with: echo `$TESTSPRITE_API_KEY"
} else {
    Write-Host "❌ Failed to retrieve TestSprite API key from 1Password" -ForegroundColor Red
    Write-Host "   Please ensure you have access to 'op://Development/Testsprite API/credential'" -ForegroundColor Yellow
}