# Optimized Startup Script
$IMAGE_NAME = "sweetsweet-app"
Write-Host "Checking if Docker image '$IMAGE_NAME' exists..."

$imageExists = docker images -q $IMAGE_NAME

if ($null -eq $imageExists -or $imageExists -eq "") {
    Write-Host "Image not found. Building..."
    docker-compose build app
} else {
    Write-Host "Image found. Skipping build."
}

Write-Host "Launching containers..."
docker-compose up -d

Write-Host "Application is starting at http://localhost:3000"
Write-Host "Selenium Dashboard available at http://localhost:4444"
