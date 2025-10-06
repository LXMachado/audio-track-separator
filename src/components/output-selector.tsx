import { Button } from './ui/button'

interface OutputSelectorProps {
  outputDir: string
  onOutputDirChange: (dir: string) => void
  disabled?: boolean
}

export function OutputSelector({ outputDir, onOutputDirChange, disabled }: OutputSelectorProps) {
  const handleSelectDirectory = async () => {
    if (disabled) return

    try {
      // For demo purposes, set a default output directory
      const demoDir = '/Users/alexandremachado/Desktop/Spleeter Output'
      onOutputDirChange(demoDir)
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="font-medium">Output Directory</div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleSelectDirectory}
          disabled={disabled}
          className="flex-1 justify-start"
        >
          {outputDir || 'Select output folder'}
        </Button>
      </div>
      {outputDir && (
        <div className="text-sm text-muted-foreground">
          Files will be saved to: {outputDir}
        </div>
      )}
    </div>
  )
}
