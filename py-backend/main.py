#!/usr/bin/env python3
"""
Spleeter Studio Backend API
FastAPI server for audio source separation using Spleeter
"""

import os
import json
import asyncio
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Note: Audio processing libraries will be imported only when needed
# to avoid dependency issues during initial setup

# Request/Response models
class SeparationRequest(BaseModel):
    input_path: str
    output_dir: str
    stems: int = 2  # 2, 4, or 5 stems
    format: str = "wav"

class SeparationStatus(BaseModel):
    status: str  # 'processing', 'completed', 'error'
    progress: float  # 0.0 to 1.0
    current_step: str
    eta_seconds: Optional[int] = None
    error_message: Optional[str] = None
    output_files: Optional[List[str]] = None

class SeparationResult(BaseModel):
    success: bool
    output_files: List[str]
    processing_time: float
    error_message: Optional[str] = None

# Global variables for status tracking
separation_status: Dict[str, SeparationStatus] = {}
current_separator = None

app = FastAPI(title="Spleeter Studio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_audio_info(file_path: str) -> Dict:
    """Get basic information about an audio file."""
    try:
        # Try to import required libraries
        try:
            import librosa
            import soundfile as sf
            HAS_AUDIO_LIBS = True
        except ImportError:
            HAS_AUDIO_LIBS = False

        info = {}
        info['file_path'] = file_path
        info['file_size'] = os.path.getsize(file_path)
        info['file_extension'] = Path(file_path).suffix.lower()

        if HAS_AUDIO_LIBS:
            # Get audio metadata
            audio_info = sf.info(file_path)
            info['duration'] = audio_info.duration
            info['samplerate'] = audio_info.samplerate
            info['channels'] = audio_info.channels
            info['format'] = audio_info.format

            # Load with librosa for additional info
            y, sr = librosa.load(file_path, sr=None, duration=30)  # First 30 seconds
            info['tempo'] = librosa.beat.tempo(y, sr=sr)[0]
        else:
            info['duration'] = 0  # Will be determined later
            info['samplerate'] = 44100  # Default assumption
            info['channels'] = 2  # Default assumption
            info['format'] = 'Unknown'
            info['tempo'] = 120  # Default assumption

        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading audio file: {str(e)}")

async def separate_audio_task(
    task_id: str,
    input_path: str,
    output_dir: str,
    stems: int = 2
) -> SeparationResult:
    """Background task for audio separation."""
    global current_separator

    try:
        # Update status
        separation_status[task_id] = SeparationStatus(
            status="processing",
            progress=0.0,
            current_step="Initializing separator..."
        )

        # Check if required libraries are available
        try:
            from spleeter.separator import Separator
            from spleeter.audio import STFTBackend
            HAS_SPLEETER = True
        except ImportError:
            HAS_SPLEETER = False

        if not HAS_SPLEETER:
            error_message = (
                "Spleeter is not installed. Install the Python backend dependencies "
                "with `pip install -r py-backend/requirements.txt` and ensure FFmpeg is available."
            )

            separation_status[task_id] = SeparationStatus(
                status="error",
                progress=0.0,
                current_step="Spleeter dependencies missing",
                error_message=error_message,
                output_files=[]
            )

            return SeparationResult(
                success=False,
                output_files=[],
                processing_time=0.0,
                error_message=error_message
            )

        # Initialize separator based on stem count
        if stems == 2:
            separation_type = "spleeter:2stems"
        elif stems == 4:
            separation_type = "spleeter:4stems"
        elif stems == 5:
            separation_type = "spleeter:5stems"
        else:
            raise ValueError(f"Unsupported stem count: {stems}")

        # Create separator
        current_separator = Separator(separation_type, stft_backend=STFTBackend.LIBROSA)

        separation_status[task_id] = SeparationStatus(
            status="processing",
            progress=0.1,
            current_step="Loading audio file..."
        )

        # Get audio info for ETA calculation
        audio_info = get_audio_info(input_path)
        duration = audio_info['duration']

        # Estimate processing time (rough approximation)
        # Spleeter typically processes at ~0.1x to 0.2x real-time
        estimated_time = duration * 8  # Conservative estimate

        separation_status[task_id] = SeparationStatus(
            status="processing",
            progress=0.2,
            current_step="Separating audio tracks...",
            eta_seconds=int(estimated_time)
        )

        # Perform separation
        start_time = datetime.now()

        with tempfile.TemporaryDirectory() as temp_dir:
            # Run separation
            current_separator.separate_to_file(input_path, temp_dir)

            # Calculate progress and move files
            separation_status[task_id] = SeparationStatus(
                status="processing",
                progress=0.8,
                current_step="Saving separated files...",
                eta_seconds=int(estimated_time * 0.2)
            )

            # Create output directory
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)

            # Move files from temp directory to output
            output_files = []
            temp_path = Path(temp_dir)

            # Find the subdirectory created by spleeter
            audio_filename = Path(input_path).stem
            spleeter_output_dir = temp_path / audio_filename

            if spleeter_output_dir.exists():
                for stem_file in spleeter_output_dir.glob("*.wav"):
                    dest_file = output_path / stem_file.name
                    shutil.copy2(stem_file, dest_file)
                    output_files.append(str(dest_file))

            processing_time = (datetime.now() - start_time).total_seconds()

            # Update final status
            separation_status[task_id] = SeparationStatus(
                status="completed",
                progress=1.0,
                current_step="Separation completed!",
                output_files=output_files
            )

            return SeparationResult(
                success=True,
                output_files=output_files,
                processing_time=processing_time
            )

    except Exception as e:
        error_message = str(e)
        separation_status[task_id] = SeparationStatus(
            status="error",
            progress=0.0,
            current_step="Error occurred",
            error_message=error_message,
            output_files=[]
        )

        return SeparationResult(
            success=False,
            output_files=[],
            processing_time=0.0,
            error_message=error_message
        )

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Spleeter Studio API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze")
async def analyze_audio(request: SeparationRequest):
    """Analyze audio file and return information."""
    if not os.path.exists(request.input_path):
        raise HTTPException(status_code=404, detail="Input file not found")

    try:
        audio_info = get_audio_info(request.input_path)
        return {
            "success": True,
            "audio_info": audio_info,
            "estimated_processing_time": audio_info['duration'] * 8  # seconds
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/separate")
async def separate_audio(request: SeparationRequest, background_tasks: BackgroundTasks):
    """Start audio separation process."""
    if not os.path.exists(request.input_path):
        raise HTTPException(status_code=404, detail="Input file not found")

    # Validate stems parameter
    if request.stems not in [2, 4, 5]:
        raise HTTPException(status_code=400, detail="Stems must be 2, 4, or 5")

    # Create task ID
    task_id = f"sep_{int(datetime.now().timestamp())}_{os.path.basename(request.input_path)}"

    separation_status[task_id] = SeparationStatus(
        status="processing",
        progress=0.0,
        current_step="Task queued..."
    )

    # Start background task
    background_tasks.add_task(
        separate_audio_task,
        task_id,
        request.input_path,
        request.output_dir,
        request.stems
    )

    return {
        "success": True,
        "task_id": task_id,
        "message": "Separation started"
    }

@app.get("/status/{task_id}")
async def get_separation_status(task_id: str):
    """Get the status of a separation task."""
    if task_id not in separation_status:
        raise HTTPException(status_code=404, detail="Task not found")

    return separation_status[task_id]

@app.get("/list-models")
async def list_available_models():
    """List available Spleeter models."""
    return {
        "models": [
            {"name": "2stems", "description": "Vocals + Accompaniment"},
            {"name": "4stems", "description": "Vocals + Drums + Bass + Other"},
            {"name": "5stems", "description": "Vocals + Drums + Bass + Piano + Other"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="info")
