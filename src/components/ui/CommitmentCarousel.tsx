// src/components/ui/CommitmentCarousel.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
// useEmblaCarousel のみを embla-carousel-react からインポート
import useEmblaCarousel from 'embla-carousel-react';
// Embla Carousel のコアな型定義を embla-carousel 本体からインポート
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// スライドするアイテムのデータ型
interface CommitmentItemData {
  id: number;
  title: string;
  description: string;
  IconComponent: LucideIcon;
}

// カルーセルコンポーネントのPropsの型
interface CommitmentCarouselProps {
  slides: CommitmentItemData[];
  options?: EmblaOptionsType;
}

export const CommitmentCarousel: React.FC<CommitmentCarouselProps> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', ...options });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = useCallback((emblaApiInstance: EmblaCarouselType) => {
    if (!emblaApiInstance) return;
    setScrollSnaps(emblaApiInstance.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApiInstance: EmblaCarouselType) => {
    if (!emblaApiInstance) return;
    setSelectedIndex(emblaApiInstance.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApiInstance.canScrollPrev());
    setNextBtnDisabled(!emblaApiInstance.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    const handleReInit = () => {
        onInit(emblaApi);
        onSelect(emblaApi);
    };
    const handleSelect = () => onSelect(emblaApi);

    emblaApi.on('reInit', handleReInit);
    emblaApi.on('select', handleSelect);

    return () => {
      if (emblaApi) {
        emblaApi.off('reInit', handleReInit);
        emblaApi.off('select', handleSelect);
      }
    };
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 p-1">
              <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg shadow-xl h-full flex flex-col items-center text-center min-h-[300px] md:min-h-[280px] justify-center">
                <div className="mb-4 text-sky-500 dark:text-sky-400">
                  <slide.IconComponent size={48} strokeWidth={1.5} />
                </div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-50 mb-3">
                  {slide.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 left-[-15px] md:left-[-40px] z-10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        aria-label="前のスライドへ"
      >
        <ChevronLeft className="h-7 w-7" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 right-[-15px] md:right-[-40px] z-10 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        aria-label="次のスライドへ"
      >
        <ChevronRight className="h-7 w-7" />
      </Button>

      <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 flex space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out
                        ${index === selectedIndex ? 'bg-sky-500 scale-125' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
            aria-label={`スライド ${index + 1} へ移動`}
          />
        ))}
      </div>
    </div>
  );
};