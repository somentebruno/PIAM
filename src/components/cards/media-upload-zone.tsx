import { useRef, useState } from 'react'
import { useMediaUpload } from '@/hooks/use-media-upload'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, Plus, Image as ImageIcon, Film } from 'lucide-react'

type MediaItem = { path: string; url: string; type: 'image' | 'video' }

type Props = {
  cardId: string
  onUploadComplete: (path: string, url: string, mediaType: 'image' | 'video', items?: MediaItem[]) => void
  currentMediaUrl?: string | null
  currentMediaType?: 'image' | 'video' | null
  currentItems?: MediaItem[]
  label?: string
  allowMultiple?: boolean
}

export function MediaUploadZone({
  cardId,
  onUploadComplete,
  currentMediaUrl,
  currentMediaType,
  currentItems = [],
  label = 'Mídia',
  allowMultiple = false,
}: Props) {
  const { upload, reset } = useMediaUpload(cardId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [items, setItems] = useState<MediaItem[]>(currentItems)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (!allowMultiple && fileArray.length > 1) {
      alert('Selecione apenas um arquivo para este formato.')
      return
    }

    if (allowMultiple && (items.length + fileArray.length) > 10) {
      alert('O Instagram permite no máximo 10 mídias por carrossel.')
      return
    }

    setUploadingCount(prev => prev + fileArray.length)
    const newItems: MediaItem[] = [...items]

    for (const file of fileArray) {
      const result = await upload(file)
      if (result) {
        const newItem = { path: result.path, url: result.url, type: result.mediaType }
        if (!allowMultiple) {
          onUploadComplete(newItem.path, newItem.url, newItem.type)
          setItems([newItem])
        } else {
          newItems.push(newItem)
        }
      }
      setUploadingCount(prev => prev - 1)
    }

    if (allowMultiple) {
      setItems(newItems)
      if (newItems.length > 0) {
        onUploadComplete(newItems[0].path, newItems[0].url, newItems[0].type, newItems)
      }
    }
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    if (newItems.length > 0) {
      onUploadComplete(newItems[0].path, newItems[0].url, newItems[0].type, newItems)
    } else {
      reset()
      onUploadComplete('', '', 'image', [])
    }
  }

  // --- Native Drag and Drop Logic ---
  const onDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const onDropItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, movedItem)

    setItems(newItems)
    setDraggedIndex(null)
    onUploadComplete(newItems[0].path, newItems[0].url, newItems[0].type, newItems)
  }

  const hasMedia = items.length > 0 || !!currentMediaUrl

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-stone-700">{label}</p>
          {allowMultiple && items.length > 1 && (
            <p className="text-[10px] text-stone-400">Arraste para reordenar</p>
          )}
        </div>
        {allowMultiple && items.length > 0 && (
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            {items.length} / 10 mídias
          </p>
        )}
      </div>

      <div className="space-y-3">
        {/* Lista de Itens (Grade se Carrossel) */}
        {items.length > 0 && (
          <div className={cn(
            "grid gap-3",
            allowMultiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"
          )}>
            {items.map((item, index) => (
              <div 
                key={index} 
                draggable={allowMultiple}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={(e) => onDropItem(e, index)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shadow-sm group",
                  allowMultiple ? "cursor-grab active:cursor-grabbing" : "",
                  draggedIndex === index ? "opacity-40 grayscale" : "opacity-100"
                )}
              >
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <img src={item.url} alt={`Preview ${index}`} className="w-full h-full object-cover pointer-events-none" />
                )}
                
                {/* Badge de Ordem */}
                {allowMultiple && (
                   <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-[10px] font-bold text-white flex items-center justify-center backdrop-blur-sm">
                      {index + 1}
                   </div>
                )}

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <X size={14} />
                </button>
                {item.type === 'video' && (
                   <div className="absolute bottom-1.5 left-1.5 p-1 bg-black/50 rounded text-white">
                      <Film size={12} />
                   </div>
                )}
              </div>
            ))}
            
            {allowMultiple && items.length < 10 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex flex-col items-center justify-center gap-2 text-stone-400 transition-all"
              >
                <Plus size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
              </button>
            )}
          </div>
        )}

        {/* Zona de Drop (quando vazio ou se não for múltiplo) */}
        {items.length === 0 && (
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer min-h-[200px] flex flex-col items-center justify-center',
              dragging
                ? 'border-stone-400 bg-stone-50 scale-[0.99]'
                : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
            }}
          >
            {uploadingCount > 0 ? (
              <div className="space-y-3 w-full max-w-[200px]">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-stone-900 h-1.5 rounded-full animate-pulse w-full" />
                </div>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Enviando {uploadingCount} arquivos…</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2 text-stone-400">
                  {allowMultiple ? <Plus size={20} /> : <ImageIcon size={20} />}
                </div>
                <p className="text-sm text-stone-500">
                  {allowMultiple ? 'Arraste as fotos/vídeos do carrossel' : 'Arraste a mídia do post'}
                  <br />
                  <span className="text-xs text-stone-400 font-normal">ou clique para selecionar</span>
                </p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-4">JPG, PNG ou MP4</p>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        accept="image/jpeg,image/png,video/mp4"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files)
        }}
      />
    </div>
  )
}
