import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Progress } from './components/ui/progress'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { ThemeToggle } from './components/theme-toggle'
import { FileUpload } from './components/file-upload'
import { StemSelector } from './components/stem-selector'
import { OutputSelector } from './components/output-selector'
import { ProgressDisplay } from './components/progress-display'
import { StatusBar } from './components/status-bar'

export interface AudioFile {
  name: string
  path: string
  size: number
  duration?: number
}

export interface SeparationTask {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  inputFile: AudioFile
  outputDir: string
  stems: number
  outputFiles?: string[]
  error?: string
  startTime?: Date
  endTime?: Date
}

function App() {
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null)
  const [outputDir, setOutputDir] = useState<string>('')
  const [selectedStems, setSelectedStems] = useState<number>(2)
  const [currentTask, setCurrentTask] = useState<SeparationTask | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFile(file)
  }

  const handleOutputDirSelect = (dir: string) => {
    setOutputDir(dir)
  }

  const handleStartSeparation = async () => {
    if (!selectedFile || !outputDir) return

    setIsProcessing(true)
    setCurrentTask({
      id: `task_${Date.now()}`,
      status: 'pending',
      progress: 0,
      inputFile: selectedFile,
      outputDir,
      stems: selectedStems
    })

    try {
      // Start the Python backend if not already running
      if (backendStatus !== 'connected') {
        await invoke('start_python_backend')
        setBackendStatus('connected')
      }

      // TODO: Implement actual separation logic
      console.log('Starting separation:', { selectedFile, outputDir, selectedStems })

    } catch (error) {
      console.error('Separation failed:', error)
      setCurrentTask(prev => prev ? {
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const canStartSeparation = selectedFile && outputDir && !isProcessing

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Spleeter Studio</h1>
            <p className="text-muted-foreground mt-1">
              Professional audio source separation
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Audio File</CardTitle>
                <CardDescription>
                  Select an audio file to separate (WAV, MP3, FLAC supported)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Separation Settings</CardTitle>
                <CardDescription>
                  Configure how you want to separate your audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StemSelector
                  selectedStems={selectedStems}
                  onStemsChange={setSelectedStems}
                  disabled={isProcessing}
                />
                <OutputSelector
                  outputDir={outputDir}
                  onOutputDirChange={handleOutputDirSelect}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Progress */}
            {currentTask && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing</CardTitle>
                  <CardDescription>
                    {currentTask.status === 'processing' && 'Separating audio tracks...'}
                    {currentTask.status === 'completed' && 'Separation completed!'}
                    {currentTask.status === 'error' && 'Separation failed'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressDisplay task={currentTask} />
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleStartSeparation}
                disabled={!canStartSeparation}
                size="lg"
                className="px-8"
              >
                {isProcessing ? 'Processing...' : 'Start Separation'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBar
                  backendStatus={backendStatus}
                  currentTask={currentTask}
                />
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  No recent tasks
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">Spleeter Studio</p>
                  <p className="text-muted-foreground">Version 1.0.0</p>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Powered by Spleeter and Tauri
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App