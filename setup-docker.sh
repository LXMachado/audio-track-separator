#!/bin/bash

# Docker setup script for Spleeter Studio Backend
# This script builds and runs the backend in Docker to resolve Python compatibility issues

set -e

echo "🔧 Setting up Spleeter Studio Backend with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   - macOS: brew install docker"
    echo "   - Ubuntu: sudo apt-get install docker.io"
    echo "   - Or download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found. Installing..."
    pip install docker-compose
fi

# Build the Docker image
echo "🐳 Building Docker image for Python 3.11 with Spleeter..."
docker-compose build backend

# Create output directory if it doesn't exist
mkdir -p output_test

echo "🚀 Starting the backend in Docker..."
docker-compose up -d backend

# Wait for the server to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Test the health endpoint
echo "🏥 Testing backend health..."
if curl -s http://localhost:8081/health > /dev/null; then
    echo "✅ Backend is running successfully!"
    echo "📡 API available at: http://localhost:8081"
    echo "📊 Health check: http://localhost:8081/health"
    echo "🔄 List models: http://localhost:8081/list-models"
    echo ""
    echo "🎵 Test audio separation:"
    echo "curl -X POST http://localhost:8081/separate \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"input_path\": \"test_audio.wav\", \"output_dir\": \"output_test\", \"stems\": 2}'"
else
    echo "❌ Backend failed to start. Check logs:"
    docker-compose logs backend
fi

echo ""
echo "📋 Useful commands:"
echo "  docker-compose logs backend    - View backend logs"
echo "  docker-compose stop backend    - Stop the backend"
echo "  docker-compose down            - Stop all services"
echo "  docker-compose up -d backend   - Restart backend"