import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export function SignaturePad({
  onSave,
  onCancel,
}: {
  onSave: (url: string) => void
  onCancel: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const getPos = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    return { x, y }
  }

  const start = (e: any) => {
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }

  const draw = (e: any) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      const pos = getPos(e)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
  }

  const stop = () => setIsDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 touch-none overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={500}
          height={250}
          className="w-full h-[250px]"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
      </div>
      <div className="flex justify-between items-center text-sm text-slate-500 px-1">
        <span>Firma libre (táctil o ratón)</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={clear}>
            Limpiar
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSave(canvasRef.current?.toDataURL() || '')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Guardar Firma
          </Button>
        </div>
      </div>
    </div>
  )
}
