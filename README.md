# 🎵 Audio Track Separator

> A powerful cross-platform desktop application for separating audio tracks into individual stems using advanced AI-powered source separation technology.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)

## 📖 Overview

Audio Track Separator is a modern, cross-platform desktop application that leverages cutting-edge AI technology to separate music tracks into individual components (vocals, drums, bass, and other instruments). Built with Tauri, React, and Python, it provides a seamless user experience with professional-grade audio processing capabilities.

### ✨ Key Features

- 🎯 **AI-Powered Separation** - Advanced machine learning algorithms for high-quality source separation
- 🖥️ **Cross-Platform** - Native performance on Windows, macOS, and Linux
- 🎨 **Modern UI** - Clean, intuitive interface built with React and Tailwind CSS
- ⚡ **Fast Processing** - Optimized backend powered by Python and FastAPI
- 🎛️ **Multiple Output Formats** - Support for various audio formats and quality settings
- 📊 **Real-time Progress** - Live processing status and progress tracking
- 🌙 **Dark/Light Mode** - Customizable theme support
- 🔧 **Flexible Configuration** - Adjustable processing parameters and output settings

## 🛠️ Tech Stack

### Frontend
- **[Tauri](https://tauri.app/)** - Rust-based framework for building desktop applications
- **[React 18](https://reactjs.org/)** - Modern UI library with hooks and functional components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon library
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server

### Backend
- **[Python 3.8+](https://python.org/)** - Core processing language
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance async web framework
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server implementation

### Development Tools
- **[Rust](https://www.rust-lang.org/)** - Systems programming language for Tauri
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS processing and optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Python** (3.8 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

### Platform-Specific Requirements

#### Windows
- Visual Studio Build Tools or Visual Studio Community
- Windows 10/11 SDK

#### macOS
- Xcode Command Line Tools: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y gcc g++ libwebkit2gtk-4.0-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/LXMachado/audio-track-separator.git
cd audio-track-separator
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Set Up Python Backend
```bash
cd py-backend
pip install -r requirements.txt
cd ..
```

### 4. Run in Development Mode
```bash
npm run dev
```

This will start both the frontend and backend in development mode with hot reloading.

## 📦 Installation

### Development Build
```bash
# Install dependencies
npm install
cd py-backend && pip install -r requirements.txt && cd ..

# Run development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# The built application will be in src-tauri/target/release/
```

## 🎮 Usage

### Getting Started

1. **Launch the Application**
   - Run `npm run dev` for development
   - Or use the built executable for production

2. **Import Audio File**
   - Click "Choose File" or drag & drop your audio file
   - Supported formats: MP3, WAV, FLAC, M4A, OGG

3. **Configure Separation Settings**
   - Select output format and quality
   - Choose separation model (2-stem, 4-stem, 5-stem)
   - Adjust processing parameters if needed

4. **Start Processing**
   - Click "Separate Tracks"
   - Monitor real-time progress
   - Wait for completion

5. **Download Results**
   - Individual stems will be available for download
   - Choose output location
   - Enjoy your separated tracks!

### Supported Audio Formats

**Input Formats:**
- MP3 (.mp3)
- WAV (.wav)
- FLAC (.flac)
- M4A (.m4a)
- OGG (.ogg)

**Output Formats:**
- WAV (recommended for quality)
- MP3 (for smaller file sizes)
- FLAC (lossless compression)

### Separation Models

- **2-stem**: Vocals and accompaniment
- **4-stem**: Vocals, drums, bass, and other
- **5-stem**: Vocals, drums, bass, piano, and other

## 🏗️ Project Structure

```
audio-track-separator/
├── src/                          # React frontend source
│   ├── components/              # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   ├── file-upload.tsx     # File upload component
│   │   ├── progress-display.tsx # Progress tracking
│   │   ├── stem-selector.tsx   # Model selection
│   │   └── ...                 # Other components
│   ├── lib/                    # Utility functions
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # Application entry point
├── src-tauri/                  # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs            # Tauri main process
│   ├── tauri.conf.json        # Tauri configuration
│   └── Cargo.toml             # Rust dependencies
├── py-backend/                 # Python API server
│   ├── main.py                # FastAPI application
│   └── requirements.txt       # Python dependencies
├── public/                     # Static assets
├── package.json               # Node.js dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
└── README.md                 # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Python Backend
PYTHON_BACKEND_PORT=8000
PYTHON_BACKEND_HOST=localhost

# Processing Settings
MAX_FILE_SIZE_MB=100
DEFAULT_SEPARATION_MODEL=4stem
OUTPUT_QUALITY=high

# Paths
TEMP_DIR=./temp
OUTPUT_DIR=./output
```

### Tauri Configuration

The application behavior can be customized in `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "allowlist": {
      "dialog": true,
      "fs": {
        "readFile": true,
        "writeFile": true
      }
    }
  }
}
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build:frontend   # Build frontend only
npm run build           # Build complete application

# Tauri Commands
npm run tauri dev       # Start Tauri in development mode
npm run tauri build     # Build Tauri application

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
```

### Development Workflow

1. **Frontend Development**
   ```bash
   npm run dev
   ```

2. **Backend Development**
   ```bash
   cd py-backend
   uvicorn main:app --reload
   ```

3. **Full Stack Development**
   ```bash
   npm run tauri dev
   ```

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix
```

## 🧩 API Reference

### Python Backend Endpoints

#### POST /separate
Separate audio tracks

**Request:**
```json
{
  "file_path": "string",
  "model": "2stem|4stem|5stem",
  "output_format": "wav|mp3|flac",
  "quality": "low|medium|high"
}
```

**Response:**
```json
{
  "job_id": "string",
  "status": "processing|completed|error",
  "progress": 0.75,
  "output_files": ["path1", "path2", ...]
}
```

#### GET /status/{job_id}
Get processing status

**Response:**
```json
{
  "status": "processing|completed|error",
  "progress": 0.85,
  "message": "Processing vocals...",
  "output_files": ["path1", "path2"]
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork the Repository
```bash
git fork https://github.com/LXMachado/audio-track-separator.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Commit Your Changes
```bash
git commit -m "Add amazing feature"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/amazing-feature
```

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configurations
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new functionality
- **Documentation**: Update README and inline docs

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Tauri build fails on macOS
```bash
# Solution: Install Xcode Command Line Tools
xcode-select --install
```

**Issue**: Python dependencies not found
```bash
# Solution: Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r py-backend/requirements.txt
```

#### Runtime Issues

**Issue**: File upload not working
- Check file permissions
- Ensure supported file format
- Verify file size limits

**Issue**: Processing stuck
- Check available disk space
- Monitor system resources
- Review backend logs

### Performance Optimization

- **Large Files**: Use batch processing for files > 50MB
- **Memory**: Close other applications during processing
- **Storage**: Ensure 2-3x file size free disk space

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Audio Track Separator Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **[Spleeter](https://github.com/deezer/spleeter)** - AI source separation technology
- **[Tauri Team](https://tauri.app/)** - Amazing desktop app framework  
- **[React Team](https://reactjs.org/)** - Powerful UI library
- **[FastAPI](https://fastapi.tiangolo.com/)** - High-performance web framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

## 📞 Support

### Documentation
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://reactjs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Community
- [GitHub Issues](https://github.com/LXMachado/audio-track-separator/issues)
- [Discussions](https://github.com/LXMachado/audio-track-separator/discussions)

### Contact
- **Author**: LXMachado
- **Repository**: [https://github.com/LXMachado/audio-track-separator](https://github.com/LXMachado/audio-track-separator)

---

<div align="center">

**[⬆ Back to Top](#-audio-track-separator)**

Made with ❤️ and 🎵

</div>