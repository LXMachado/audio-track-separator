# Use Python 3.11 for Spleeter compatibility
FROM python:3.11-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libsndfile1-dev \
    libasound2-dev \
    portaudio19-dev \
    python3-pyaudio \
    libatlas-base-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Spleeter models (optional but recommended)
RUN python -c "from spleeter.separator import Separator; from spleeter.audio import STFTBackend; separator = Separator('spleeter:2stems')" || true

# Copy the main application
COPY . .

# Expose the port the app runs on
EXPOSE 8081

# Run the application
CMD ["python", "-c", "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8081, log_level='info')"]