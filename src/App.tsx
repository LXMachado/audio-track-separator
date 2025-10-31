import { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Separator } from './components/ui/separator'
import { ThemeToggle } from './components/theme-toggle'
import { FileUpload } from './components/file-upload'
import { StemSelector } from './components/stem-selector'
import { OutputSelector } from './components/output-selector'
import { ProgressDisplay } from './components/progress-display'
import { StatusBar } from './components/status-bar'
import { AudioPlayer } from './components/audio-player'

const BACKEND_BASE_URL = 'http://127.0.0.1:8080'

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
  currentStep?: string
  etaSeconds?: number
  errorMessage?: string
  startTime?: Date
  endTime?: Date
}

export interface SeparationStatusPayload {
  status: 'processing' | 'completed' | 'error'
  progress: number
  current_step: string
  eta_seconds?: number
  error_message?: string
  output_files?: string[]
}

export const adaptSeparationStatus = (
  status: SeparationStatusPayload
): Pick<SeparationTask, 'status' | 'progress' | 'currentStep' | 'etaSeconds' | 'errorMessage' | 'outputFiles'> => ({
  status: status.status,
  progress: status.progress,
  currentStep: status.current_step,
  etaSeconds: status.eta_seconds,
  errorMessage: status.error_message,
  outputFiles: status.output_files
})

function App() {
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null)
  const [outputDir, setOutputDir] = useState<string>('')
  const [selectedStems, setSelectedStems] = useState<number>(2)
  const [currentTask, setCurrentTask] = useState<SeparationTask | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopStatusPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopStatusPolling()
    }
  }, [stopStatusPolling])

  const wait = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), [])

  const waitForBackendHealth = useCallback(async (retries = 10, delayMs = 500) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/health`)
        if (response.ok) {
          return
        }
      } catch (error) {
        // Ignore errors until retries are exhausted
      }
      await wait(delayMs)
    }
    throw new Error('Backend health check timed out')
  }, [wait])

  const ensureBackendAvailable = useCallback(async () => {
    if (backendStatus === 'connected') {
      try {
        await waitForBackendHealth()
        return
      } catch (error) {
        console.warn('Backend health check failed; attempting restart.', error)
      }
    }

    setBackendStatus('connecting')

    try {
      await invoke('check_python_backend_status')
    } catch (statusError) {
      console.info('Backend not running, attempting to start it.', statusError)
      await invoke('start_python_backend')
    }

    try {
      await waitForBackendHealth()
      setBackendStatus('connected')
    } catch (error) {
      console.error('Failed to connect to backend:', error)
      setBackendStatus('disconnected')
      throw error
    }
  }, [backendStatus, waitForBackendHealth])

  const startStatusPolling = useCallback((taskId: string) => {
    stopStatusPolling()

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/status/${taskId}`)

        if (response.status === 404) {
          return
        }

        if (!response.ok) {
          throw new Error(`Status check failed (${response.status})`)
        }

        const payload: SeparationStatusPayload = await response.json()
        const updates = adaptSeparationStatus(payload)

        setCurrentTask(prev => {
          if (!prev) return prev

          const updatedTask: SeparationTask = {
            ...prev,
            ...updates,
            outputFiles: updates.outputFiles ?? prev.outputFiles
          }

          if ((payload.status === 'completed' || payload.status === 'error') && !prev.endTime) {
            updatedTask.endTime = new Date()
          }

          return updatedTask
        })

        if (payload.status === 'completed' || payload.status === 'error') {
          stopStatusPolling()
          setIsProcessing(false)
        }
      } catch (error) {
        console.error('Error polling task status:', error)
      }
    }

    fetchStatus()
    pollingRef.current = setInterval(fetchStatus, 1000)
  }, [stopStatusPolling])

  useEffect(() => {
    ensureBackendAvailable().catch(error => {
      console.error('Failed to initialize backend:', error)
    })
  }, [ensureBackendAvailable])

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFile(file)
  }

  const handleOutputDirSelect = (dir: string) => {
    setOutputDir(dir)
  }

  const handleStartSeparation = async () => {
    if (!selectedFile || !outputDir) return

    stopStatusPolling()
    setIsProcessing(true)

    const initialTaskId = `task_${Date.now()}`
    const startTimestamp = new Date()
    setCurrentTask({
      id: initialTaskId,
      status: 'processing',
      progress: 0,
      inputFile: selectedFile,
      outputDir,
      stems: selectedStems,
      currentStep: 'Initializing separator...',
      outputFiles: [],
      startTime: startTimestamp
    })

    try {
      await ensureBackendAvailable()

      const response = await fetch(`${BACKEND_BASE_URL}/separate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_path: selectedFile.path,
          output_dir: outputDir,
          stems: selectedStems
        })
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to start separation task')
      }

      const result = await response.json() as { success: boolean; task_id?: string; message?: string }

      if (!result.success) {
        throw new Error(result.message || 'Separation task failed to start')
      }

      const taskId = result.task_id ?? initialTaskId

      setCurrentTask(prev => prev ? {
        ...prev,
        id: taskId,
        status: 'processing',
        currentStep: 'Separating audio tracks...'
      } : prev)

      startStatusPolling(taskId)

    } catch (error) {
      console.error('Separation failed:', error)
      stopStatusPolling()
      setCurrentTask(prev => prev ? {
        ...prev,
        status: 'error',
        currentStep: 'Failed to start separation',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        endTime: new Date()
      } : null)
      setIsProcessing(false)
    } finally {
      // Keep processing flag active until polling reports completion or error
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

            <AudioPlayer file={selectedFile} />

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
