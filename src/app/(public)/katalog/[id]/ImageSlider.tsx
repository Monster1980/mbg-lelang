"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

type Props = {
  images: string[];
  isUnavailable: boolean;
  status: string;
  youtubeUrl?: string | null;
};

export default function ImageSlider({ images, isUnavailable, status, youtubeUrl }: Props) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = useMemo(() => extractYoutubeId(youtubeUrl || ""), [youtubeUrl]);
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;

  const slides = useMemo(() => {
    const list: Array<{ type: "video" | "image"; url: string }> = [];
    if (youtubeEmbedUrl) {
      list.push({ type: "video", url: youtubeEmbedUrl });
    }
    const displayImages = images.length > 0 ? images : ["https://placehold.co/800x600/1a1a2e/e0e0e0?text=Tanpa+Gambar"];
    displayImages.forEach((img) => {
      list.push({ type: "image", url: img });
    });
    return list;
  }, [images, youtubeEmbedUrl]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setIsVideoPlaying(false);
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative w-full aspect-[4/3] sm:rounded-3xl overflow-hidden bg-black ${isUnavailable ? 'grayscale' : ''}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full bg-slate-900" key={index}>
              {slide.type === "video" ? (
                <div className="w-full h-full relative">
                  {isVideoPlaying ? (
                    <iframe 
                      className="absolute inset-0 w-full h-full border-0"
                      src={`${slide.url}?autoplay=1`}
                      title="Review Video YouTube" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div 
                      className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center group"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      {youtubeId && (
                        <Image
                          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt="Video thumbnail"
                          fill
                          className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      )}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                      <div className="relative z-10 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 active:scale-95 transition-all duration-300">
                        <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                        Klik untuk putar video
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <Image
                  src={slide.url}
                  alt={`Gambar produk ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {isUnavailable && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 pointer-events-none backdrop-blur-[1px]">
          <span className="px-6 py-3 border-4 border-red-600 text-red-600 font-black text-3xl sm:text-4xl tracking-widest rounded-xl transform -rotate-12 bg-red-50/80 shadow-xl">
            {status.toUpperCase()}
          </span>
        </div>
      )}

      {slides.length > 1 && (
        <>
          {/* Controls */}
          <button
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/20 items-center justify-center text-white hover:bg-black/50 z-20 transition-colors"
            onClick={scrollPrev}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/20 items-center justify-center text-white hover:bg-black/50 z-20 transition-colors"
            onClick={scrollNext}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'bg-brand-400 w-6' : 'bg-white/50 w-2'}`}
                onClick={() => emblaApi?.scrollTo(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
