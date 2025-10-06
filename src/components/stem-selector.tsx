import { Button } from './ui/button'

interface StemSelectorProps {
  selectedStems: number
  onStemsChange: (stems: number) => void
  disabled?: boolean
}

export function StemSelector({ selectedStems, onStemsChange, disabled }: StemSelectorProps) {
  const options = [
    { value: 2, label: '2 Stems', description: 'Vocals + Accompaniment' },
    { value: 4, label: '4 Stems', description: 'Vocals + Drums + Bass + Other' },
    { value: 5, label: '5 Stems', description: 'Vocals + Drums + Bass + Piano + Other' }
  ]

  return (
    <div className="space-y-3">
      <div className="font-medium">Stem Separation</div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={selectedStems === option.value ? "default" : "outline"}
            className="justify-start h-auto p-4"
            onClick={() => !disabled && onStemsChange(option.value)}
            disabled={disabled}
          >
            <div className="text-left">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm opacity-80">{option.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
