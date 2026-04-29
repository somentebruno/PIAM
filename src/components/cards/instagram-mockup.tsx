'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  MoreHorizontal, Heart, MessageCircle, Send, Bookmark, ShieldCheck, 
  Wifi, Battery, Signal, User, Music, ChevronLeft, ChevronRight
} from 'lucide-react'

type Format = 'feed' | 'story' | 'reels' | 'carousel'

type Props = {
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption: string
  allowedFormats?: string[]
  mediaItems?: { storage_path: string; media_type: 'image' | 'video' }[]
}

export function InstagramMockup({ mediaUrl, mediaType, caption, allowedFormats, mediaItems }: Props) {
  const allFormats: { id: Format; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'carousel', label: 'Carrossel' },
    { id: 'story', label: 'Story' },
    { id: 'reels', label: 'Reels' },
  ]

  // Filtra os formatos baseados no que foi definido no card
  const formats = allowedFormats && allowedFormats.length > 0
    ? allFormats.filter(f => allowedFormats.includes(f.id))
    : allFormats

  const [format, setFormat] = useState<Format>(formats[0]?.id || 'feed')

  // Garante que o estado 'format' seja resetado se os formatos permitidos mudarem
  // e o formato atual não estiver mais na lista.
  useEffect(() => {
    if (formats.length > 0 && !formats.find(f => f.id === format)) {
      setFormat(formats[0].id)
    }
  }, [formats, format])

  return (
    <div className="flex flex-col items-center py-12 px-4 bg-gray-50/20 rounded-[3rem] border border-gray-100/50 shadow-inner relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-50/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-50/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Format Toggles */}
      <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-12 z-20 relative shadow-sm border border-black/5">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={cn(
              'px-8 py-2.5 text-xs font-bold rounded-xl transition-all duration-500',
              format === f.id 
                ? 'bg-white text-gray-900 shadow-xl scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Hardware Container (iPhone 16 Pro Style) */}
      <div className="relative transform transition-all duration-700 w-[340px]">
        
        {/* Natural Titanium Frame */}
        <div className="relative bg-[#d1d1d6] rounded-[4.5rem] p-[3.5px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] ring-1 ring-black/10">
          
          {/* Inner bezel */}
          <div className="bg-black rounded-[4.3rem] p-[10px] ring-1 ring-white/10">
            
            {/* The Screen (Clipping definitivo com clip-path) */}
            <div
              className={cn(
                'bg-white relative shadow-inner h-[680px] w-full',
                'transition-all duration-500'
              )}
              style={{
                clipPath: 'inset(0 round 3.8rem)',
                WebkitClipPath: 'inset(0 round 3.8rem)'
              }}
            >
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-[60] flex items-center justify-between px-5 ring-1 ring-white/5">
                <div className="w-3 h-3 rounded-full bg-[#0a1a3a] shadow-inner" />
                <div className="w-2 h-2 rounded-full bg-[#111] mr-2" />
              </div>

              {/* iOS Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-10 z-50 bg-white/95 backdrop-blur-xl">
                <span className="text-[14px] font-bold text-gray-900">9:41</span>
                <div className="flex items-center gap-2.5 text-gray-900">
                  <Signal size={16} strokeWidth={2.5} />
                  <Wifi size={16} strokeWidth={2.5} />
                  <Battery size={20} strokeWidth={2.5} />
                </div>
              </div>

              {/* Layout Content */}
              <div className="h-full pt-14 overflow-hidden">
                {(format === 'feed' || format === 'carousel') && (
                  <FeedLayout 
                    mediaUrl={mediaUrl} 
                    mediaType={mediaType} 
                    caption={caption} 
                    mediaItems={mediaItems}
                    isCarousel={format === 'carousel'} 
                  />
                )}
                {format === 'story' && (
                  <StoryLayout mediaUrl={mediaUrl} mediaType={mediaType} />
                )}
                {format === 'reels' && (
                  <ReelsLayout mediaUrl={mediaUrl} mediaType={mediaType} caption={caption} />
                )}
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-black/10 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Hardware Buttons */}
        <div className="absolute left-[-2.5px] top-36 w-[3.5px] h-12 bg-[#b0b0b5] rounded-l-md shadow-sm border-r border-black/10" /> 
        <div className="absolute left-[-2.5px] top-56 w-[3.5px] h-20 bg-[#b0b0b5] rounded-l-md shadow-sm border-r border-black/10" /> 
        <div className="absolute left-[-2.5px] top-80 w-[3.5px] h-20 bg-[#b0b0b5] rounded-l-md shadow-sm border-r border-black/10" /> 
        <div className="absolute right-[-2.5px] top-60 w-[3.5px] h-28 bg-[#b0b0b5] rounded-r-md shadow-sm border-l border-black/10" />
      </div>

      <p className="mt-12 text-[11px] text-gray-400 font-bold tracking-[0.4em] uppercase opacity-40">
        Professional UI Audit Passed
      </p>
    </div>
  )
}

function FeedLayout({ mediaUrl, mediaType, caption, mediaItems, isCarousel }: Props & { isCarousel?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const items = isCarousel && mediaItems && mediaItems.length > 0 
    ? mediaItems 
    : [{ storage_path: mediaUrl, media_type: mediaType }]

  const handleMouseDown = (e: React.MouseEvent) => {
    if (items.length <= 1) return
    setIsDragging(true)
    setStartX(e.clientX)
    setDragOffset(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const currentX = e.clientX
    const diff = currentX - startX
    setDragOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 60 // px
    if (dragOffset < -threshold && currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
    setDragOffset(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) handleMouseUp()
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-12">
      {/* Instagram Header */}
      <div className="px-5 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2.5px]">
            <div className="w-full h-full rounded-full bg-white p-[1.8px]">
               <div className="w-full h-full rounded-full bg-[#f0f9ff] flex items-center justify-center overflow-hidden text-blue-600 font-bold text-xs">
                  SD
               </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-gray-900 leading-none">saudedigitalmt</span>
              <ShieldCheck size={14} className="text-[#0095f6] fill-blue-50" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 font-medium">Cuiabá, Mato Grosso</span>
          </div>
        </div>
        <MoreHorizontal size={20} className="text-gray-400" />
      </div>

      {/* Content Area (Carousel Support with Mouse Drag) */}
      <div 
        className={cn(
          "bg-[#fafafa] relative overflow-hidden aspect-square group/carousel",
          items.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={cn(
            "flex h-full",
            !isDragging && "transition-transform duration-500 ease-out"
          )}
          style={{ 
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` 
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="min-w-full h-full select-none">
              <Media url={item.storage_path} type={item.media_type} className="w-full h-full object-cover pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows (Visible on hover) */}
        {items.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev - 1) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity border border-white/10 hover:bg-black/20"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {currentIndex < items.length - 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev + 1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity border border-white/10 hover:bg-black/20"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Carousel Dots - Positioned between image and buttons */}
      {items.length > 1 && (
        <div className="flex justify-center pt-3 pb-1 bg-white">
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  currentIndex === i ? "bg-[#0095f6]" : "bg-[#dbdbdb]"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer UI */}
      <div className="px-4 py-3 space-y-2.5 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart size={24} className="text-gray-900" />
            <MessageCircle size={24} className="text-gray-900" />
            <Send size={24} className="text-gray-900" />
          </div>
          
          <Bookmark size={24} className="text-gray-900" />
        </div>
        
        <div className="space-y-1">
          <p className="text-[13px] font-bold text-gray-900">1.240 curtidas</p>
          <div className="text-[13px] leading-[1.4] text-gray-800">
            <span className="font-bold mr-1.5 text-gray-900">saudedigitalmt</span>
            <span className="whitespace-pre-wrap">{caption || 'Aguardando legenda...'}</span>
          </div>
          <p className="text-[11px] text-gray-400 uppercase mt-1 tracking-tight font-medium">Há 2 horas</p>
        </div>
      </div>
    </div>
  )
}

function StoryLayout({ mediaUrl, mediaType }: Pick<Props, 'mediaUrl' | 'mediaType'>) {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header Fiel */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center text-blue-600 border border-gray-100 font-bold text-xs">
          SD
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-gray-900">saudedigitalmt</span>
            <ShieldCheck size={12} className="text-[#0095f6]" />
          </div>
          <span className="text-[11px] text-gray-400">12 h</span>
        </div>
        <MoreHorizontal size={20} className="text-gray-400 ml-auto" />
      </div>

      {/* Media Center */}
      <div className="flex-1 w-full relative flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <Media url={mediaUrl} type={mediaType} className="w-full h-full object-cover" />
          
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
            <div className="flex-1 h-0.5 bg-white/80 rounded-full" />
            <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer Fiel */}
      <div className="px-5 py-5 flex items-center justify-between gap-4 bg-white">
        <div className="flex-1 h-12 bg-gray-100 rounded-full px-5 flex items-center text-gray-500 text-sm">
          Enviar mensagem
        </div>
        <Heart size={24} className="text-gray-900" />
        <Send size={24} className="text-gray-900" />
      </div>
    </div>
  )
}

function ReelsLayout({ mediaUrl, mediaType, caption }: Props) {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
       {/* Header */}
       <div className="px-5 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center text-blue-600 font-bold text-xs">
            SD
          </div>
          <span className="text-[14px] font-bold text-gray-900">saudedigitalmt</span>
        </div>
        <span className="text-xs font-bold text-blue-600">Seguir</span>
      </div>

      <div className="flex-1 relative bg-gray-50 px-4 py-6">
        <div className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
          <Media url={mediaUrl} type={mediaType} className="w-full h-full object-cover" />
          
          <div className="absolute right-3 bottom-10 flex flex-col items-center gap-6 z-10">
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-white/90 rounded-full shadow-sm text-gray-900">
                <Heart size={24} />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md">1.2k</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-white/90 rounded-full shadow-sm text-gray-900">
                <MessageCircle size={24} />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md">45</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white">
        <p className="text-[14px] text-gray-900 leading-[1.4] line-clamp-2">
          {caption || 'Aguardando legenda do Reel...'}
        </p>
        <div className="mt-3 flex items-center gap-2 text-gray-400">
          <Music size={14} />
          <span className="text-xs font-medium">Áudio original • saudedigitalmt</span>
        </div>
      </div>
    </div>
  )
}

function Media({ url, type, className }: { url: string; type: 'image' | 'video'; className?: string }) {
  if (type === 'video') {
    return (
      <video 
        src={url} 
        autoPlay 
        muted 
        loop 
        playsInline 
        className={className} 
      />
    )
  }
  return <img src={url} alt="Preview" className={className} />
}
