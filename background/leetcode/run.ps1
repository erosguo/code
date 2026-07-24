param([int]$num = 1)

$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $dir

Write-Host "Compiling..." -ForegroundColor Cyan
javac *.java 2>&1
if ($LASTEXITCODE -ne 0) { exit }

Write-Host "Running Question $num..." -ForegroundColor Green
java Runner $num