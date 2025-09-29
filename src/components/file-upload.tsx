import { useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { AudioFile } from '../App'

interface FileUploadProps {
  onFileSelect: (file: AudioFile) => void
  selectedFile: AudioFile | null
  disabled?: boolean
}

export function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const handleFileSelect = useCallback(async () => {
    if (disabled) return

    try {
      // For now, create a demo file
      // In a real implementation, this would use Tauri's file dialog
      const demoFile: AudioFile = {
        name: 'demo-song.mp3',
        path: '/demo/path/demo-song.mp3',
        size: 5242880, // 5MB
        duration: 180 // 3 minutes
      }
      onFileSelect(demoFile)
    } catch (error) {
      console.error('Error selecting file:', error)
    }
  }, [onFileSelect, disabled])

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled
            ? 'border-gray-300 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
        }`}
        onClick={handleFileSelect}
      >
        <div className="space-y-2">
          <div className="text-4xl">🎵</div>
          <div className="text-lg font-medium">
            {selectedFile ? 'Click to change file' : 'Click to select audio file'}
          </div>
          <div className="text-sm text-muted-foreground">
            Supports WAV, MP3, FLAC
          </div>
        </div>
      </div>

      {selectedFile && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  {selectedFile.duration && (
                    <span> • {Math.floor(selectedFile.duration / 60)}:{(selectedFile.duration % 60).toString().padStart(2, '0')}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleFileSelect}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}