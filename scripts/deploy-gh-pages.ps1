param(
  [string]$ApiUrl = "https://college-internship-backend.onrender.com/api",
  [string]$BasePath = "/COLLEGE-INTERNSHIP-MANAGEMENT-SYSTEM/"
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "🚀 Building and Deploying Frontend to GitHub Pages..." -ForegroundColor Cyan
Write-Host "📡 Backend API URL: $ApiUrl" -ForegroundColor Yellow
Write-Host "🌐 Base Path:       $BasePath" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

$env:VITE_BASE_PATH = $BasePath
$env:VITE_API_URL = $ApiUrl

Write-Host "`n📦 Compiling production frontend build..." -ForegroundColor Green
npm run build --workspace=frontend
if ($LASTEXITCODE -ne 0) {
  Write-Error "Frontend build failed. Aborting deployment."
  exit 1
}

$distPath = Join-Path $PSScriptRoot "..\frontend\dist"
Push-Location $distPath

try {
  if (Test-Path .git) {
    Remove-Item -Recurse -Force .git
  }
  git init | Out-Null
  git checkout -B gh-pages | Out-Null
  git add -A
  git -c user.name="yash7175" -c user.email="yash7175@users.noreply.github.com" commit -m "Deploy to GitHub Pages" | Out-Null
  
  $remoteUrl = "https://github.com/yash7175/COLLEGE-INTERNSHIP-MANAGEMENT-SYSTEM.git"
  Write-Host "`n📤 Pushing build to 'gh-pages' branch on GitHub..." -ForegroundColor Green
  git push -f $remoteUrl gh-pages
  if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=======================================================" -ForegroundColor Green
    Write-Host "🎉 Successfully deployed to GitHub Pages!" -ForegroundColor Green
    Write-Host "🌐 Live URL: https://yash7175.github.io/COLLEGE-INTERNSHIP-MANAGEMENT-SYSTEM/" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Green
  } else {
    Write-Warning "Push failed. If credentials are required, make sure git authentication is configured."
  }
}
finally {
  if (Test-Path .git) {
    Remove-Item -Recurse -Force .git
  }
  Pop-Location
}
