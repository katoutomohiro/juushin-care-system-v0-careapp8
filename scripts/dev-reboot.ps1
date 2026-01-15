#!/usr/bin/env powershell
<#
.SYNOPSIS
    Full dev server reboot: Free port -> Clean cache -> Start dev server
    
.DESCRIPTION
    This is the one-command recovery for dev server issues.
    - Kills any process on port 3000
    - Removes .next cache directory
    - Starts Next.js dev server on port 3000 (in new PowerShell window)
    
.EXAMPLE
    .\scripts\dev-reboot.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dev-reboot.ps1
#>

$ErrorActionPreference = "SilentlyContinue"

# Step 1: Free port 3000
Write-Host "📍 Step 1: Freeing port 3000..." -ForegroundColor Cyan
$connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($null -ne $connection) {
    $pid = $connection.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Host "✅ Port 3000 freed" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 already free" -ForegroundColor Green
}

# Step 2: Clean .next cache
Write-Host "📍 Step 2: Cleaning .next cache..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "✅ .next cache removed" -ForegroundColor Green
} else {
    Write-Host "✅ .next cache already clean" -ForegroundColor Green
}

# Step 3: Start dev server
Write-Host "📍 Step 3: Starting dev server on port 3000..." -ForegroundColor Cyan
Write-Host "⏳ Starting Next.js..." -ForegroundColor Yellow

# Use next.cmd directly with full path to avoid PATH issues
$nextCmd = Join-Path $PSScriptRoot "..\node_modules\.bin\next.cmd"

if (Test-Path $nextCmd) {
    # Start in a new PowerShell window that stays open
    $script = {
        param($path)
        Set-Location $path
        & .\node_modules\.bin\next.cmd dev -p 3000
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$PWD'; & .\node_modules\.bin\next.cmd dev -p 3000" -WindowStyle Normal
    
    # Wait a moment for the server to start
    Start-Sleep -Seconds 3
    
    # Check if it's actually listening
    $listening = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($null -ne $listening) {
        Write-Host "✅ Dev server started successfully on port 3000" -ForegroundColor Green
        Write-Host "📌 A new PowerShell window should be running the dev server" -ForegroundColor Cyan
        Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "⚠️  Dev server may not have started. Check the PowerShell window." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ next.cmd not found at $nextCmd" -ForegroundColor Red
    Write-Host "💡 Try running: pnpm install" -ForegroundColor Yellow
    exit 1
}
