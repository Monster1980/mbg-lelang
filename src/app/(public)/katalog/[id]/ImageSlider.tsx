"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

type Props = {
  images: string[];
  isUnavailable: boolean;
  status: string;
};

export default function ImageSlider({ images, isUnavailable, status }: Props) {
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
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const displayImages = images.length > 0 ? images : ["https://placehold.co/800x600/1a1a2e/e0e0e0?text=Tanpa+Gambar"];

  return (
    <div className={`relative w-full aspect-square sm:aspect-[4/3] sm:rounded-3xl overflow-hidden bg-black ${isUnavailable ? 'grayscale' : ''}`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {displayImages.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full" key={index}>
              <Image
                src={src}
                alt={`Gambar produk ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {isUnavailable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none backdrop-blur-[2px]">
          <span className="px-6 py-3 border-4 border-red-500 text-red-500 font-black text-3xl sm:text-4xl tracking-widest rounded-xl transform -rotate-12 bg-black/50 shadow-2xl">
            {status.toUpperCase()}
          </span>
        </div>
      )}

      {displayImages.length > 1 && (
        <>
          {/* Controls - Hide on mobile since they can swipe, but show on desktop */}
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
            {displayImages.map((_, idx) => (
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
