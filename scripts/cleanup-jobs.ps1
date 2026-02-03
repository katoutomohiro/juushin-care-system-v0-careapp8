#!/usr/bin/env powershell
<#
.SYNOPSIS
    Clean up any background jobs in PowerShell
    
.DESCRIPTION
    Removes all running/stopped background jobs.
    Call before exiting PowerShell to avoid "End batch job?" prompt.
    
.EXAMPLE
    .\scripts\cleanup-jobs.ps1
#>

$jobs = Get-Job -ErrorAction SilentlyContinue

if ($jobs.Count -gt 0) {
    Write-Host "Cleaning up $($jobs.Count) background job(s)..." -ForegroundColor Yellow
    Remove-Job -Job $jobs -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
} else {
    Write-Host "✅ No background jobs to clean" -ForegroundColor Green
}
