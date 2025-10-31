# Docker Setup for Spleeter Studio

## Problem Resolution: Python 3.13 Compatibility Issue

The main obstacle encountered during testing was that **Spleeter requires Python < 3.12**, but the system is running **Python 3.13.2**. This compatibility issue prevents Spleeter from being installed and used for audio separation.

### ✅ Solution: Docker Container with Python 3.11

We've created a complete Docker setup that resolves this compatibility issue by using Python 3.11, which is fully compatible with Spleeter.

## Docker Setup Files Created

1. **`py-backend/Dockerfile`** - Container definition with Python 3.11 + Spleeter dependencies
2. **`docker-compose.yml`** - Easy orchestration for running the backend
3. **`setup-docker.sh`** - Automated setup script
4. **`py-backend/.dockerignore`** - Optimized build context

## Quick Start

### Prerequisites
- Docker must be running on your system
- Docker daemon should be started (on macOS: start Docker Desktop)

### Using the Setup Script (Recommended)

```bash
# Make the script executable (already done)
chmod +x setup-docker.sh

# Run the automated setup
./setup-docker.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Build the Python 3.11 + Spleeter image
- ✅ Start the backend container
- ✅ Test the API health endpoint
- ✅ Provide usage instructions

### Manual Setup

```bash
# Build the Docker image
docker-compose build backend

# Start the backend container
docker-compose up -d backend

# Test the backend
curl http://localhost:8081/health
```

## What the Docker Container Provides

### ✅ Python 3.11 Environment
- Fully compatible with Spleeter (resolves the main compatibility issue)
- All required audio processing libraries pre-installed

### ✅ System Dependencies
- FFmpeg with full codec support
- Audio libraries (libsndfile, portaudio, etc.)
- Math libraries for audio processing

### ✅ Pre-configured Spleeter
- Models downloaded and ready to use
- Optimized for 2, 4, and 5 stem separation

## API Endpoints (Available on http://localhost:8081)

- `GET /` - API information
- `GET /health` - Health check (used by Docker setup script)
- `GET /list-models` - Available Spleeter models
- `POST /separate` - Start audio separation
- `GET /status/{task_id}` - Check separation progress

## Testing Audio Separation

Once Docker backend is running:

```bash
# Start separation
curl -X POST http://localhost:8081/separate \
  -H "Content-Type: application/json" \
  -d '{
    "input_path": "test_audio.wav",
    "output_dir": "output_test",
    "stems": 2,
    "format": "wav"
  }'

# Check status
curl http://localhost:8081/status/sep_[TASK_ID]_test_audio.wav
```

## Docker Management Commands

```bash
# View logs
docker-compose logs backend

# Stop backend
docker-compose stop backend

# Restart backend
docker-compose up -d backend

# Stop all services
docker-compose down

# Remove the image (if needed for rebuild)
docker rmi spleeter-studio-backend
```

## Frontend Development

The frontend (`npm run dev`) should continue running normally. Once the Docker backend is running, it will connect to `http://localhost:8081` for audio processing.

## Benefits of This Docker Solution

1. **🔧 Compatibility Resolution**: Solves Python 3.13 vs Spleeter compatibility
2. **📦 Isolated Environment**: No conflicts with system Python installations  
3. **🚀 Consistent Setup**: Works the same across different operating systems
4. **🛠️ Easy Deployment**: Simple to run in production or CI/CD environments
5. **📋 Clean Separation**: Backend and frontend remain independently managed

## Current Status

- ✅ **Frontend**: Running and tested
- ✅ **Backend API**: Framework ready
- ✅ **FFmpeg**: Installed and working
- ✅ **Docker Setup**: Complete and documented
- 🎵 **Audio Separation**: Ready to test once Docker daemon is started

The system is now ready for real audio stem separation once the Docker daemon is running!