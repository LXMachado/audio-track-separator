import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AudioFile } from '../App'
import { convertFileSrc } from '@tauri-apps/api/tauri'

interface AudioPlayerProps {
  file: AudioFile | null
}

export function AudioPlayer({ file }: AudioPlayerProps) {
  const audioSrc = useMemo(() => {
    if (!file?.path) {
      return null
    }

    return convertFileSrc(file.path)
  }, [file?.path])

  if (!file || !audioSrc) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <audio controls className="w-full" src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      </CardContent>
    </Card>
  )
}
