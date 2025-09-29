import { Badge } from './ui/badge'
import { SeparationTask } from '../App'

interface StatusBarProps {
  backendStatus: 'disconnected' | 'connecting' | 'connected'
  currentTask: SeparationTask | null
}

export function StatusBar({ backendStatus, currentTask }: StatusBarProps) {
  const getBackendStatusColor = (status: typeof backendStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-red-500'
    }
  }

  const getBackendStatusText = (status: typeof backendStatus) => {
    switch (status) {
      case 'connected':
        return 'Backend Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Backend Disconnected'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Backend Status</span>
        <Badge className={getBackendStatusColor(backendStatus)}>
          {getBackendStatusText(backendStatus)}
        </Badge>
      </div>

      {currentTask && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Current Task</div>
          <div className="text-sm text-muted-foreground">
            {currentTask.inputFile.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTask.stems} stems • {currentTask.outputDir}
          </div>
        </div>
      )}
    </div>
  )
}