import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { SeparationTask } from '../App'

interface ProgressDisplayProps {
  task: SeparationTask
}

export function ProgressDisplay({ task }: ProgressDisplayProps) {
  const getStatusColor = (status: SeparationTask['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: SeparationTask['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge className={getStatusColor(task.status)}>
          {getStatusText(task.status)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {Math.round(task.progress * 100)}%
        </span>
      </div>

      <Progress value={task.progress * 100} className="w-full" />

      <div className="text-sm text-muted-foreground">
        {task.current_step || 'Initializing...'}
      </div>

      {task.error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
          {task.error}
        </div>
      )}

      {task.outputFiles && task.outputFiles.length > 0 && (
        <div className="space-y-2">
          <div className="font-medium text-sm">Output Files:</div>
          <div className="space-y-1">
            {task.outputFiles.map((file, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {file.split('/').pop()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}