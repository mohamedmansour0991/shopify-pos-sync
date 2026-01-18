# PowerShell Script to Connect to Server
# ========================================

Write-Host "========================================"
Write-Host "   Connecting to Server via SSH"
Write-Host "========================================"
Write-Host ""
Write-Host "Host: 75.119.139.162"
Write-Host "Port: 2222"
Write-Host "User: sortat"
Write-Host ""
Write-Host "Password: Tekpart@2025"
Write-Host ""
Write-Host "========================================"
Write-Host ""

# Connect to server
ssh -p 2222 sortat@75.119.139.162
