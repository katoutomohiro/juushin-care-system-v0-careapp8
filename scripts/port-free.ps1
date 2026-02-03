#!/usr/bin/env powershell
<#
.SYNOPSIS
    Free port 3000 by killing any process that's listening on it
    
.DESCRIPTION
    This script finds and kills any process listening on port 3000.
    It runs without any interactive prompts.
    
.EXAMPLE
    .\scripts\port-free.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/port-free.ps1
#>

# Set error action to silently continue on errors
$ErrorActionPreference = "SilentlyContinue"

# Find the process using port 3000
$connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($null -ne $connection) {
    $pid = $connection.OwningProcess
    Write-Host "Found process on port 3000 (PID: $pid), killing it..." -ForegroundColor Yellow
    
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    
    # Verify it's dead
    $stillThere = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($null -eq $stillThere) {
        Write-Host "✅ Port 3000 freed successfully" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️  Process still running, retrying..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Host "✅ Port 3000 forced free" -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "✅ Port 3000 already free" -ForegroundColor Green
    exit 0
}
