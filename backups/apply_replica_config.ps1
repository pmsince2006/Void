# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script must be executed in an elevated PowerShell session (Run as Administrator)."
    exit 1
}

$sourceCfg = 'D:\Projects\Void\backups\mongod_replica.cfg'
$targetCfg = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg'

Write-Host "Copying validated replica configuration to $targetCfg..."
Copy-Item -Path $sourceCfg -Destination $targetCfg -Force

Write-Host "Restarting MongoDB Windows service..."
Restart-Service -Name MongoDB

Write-Host "Service status:"
Get-Service -Name MongoDB
