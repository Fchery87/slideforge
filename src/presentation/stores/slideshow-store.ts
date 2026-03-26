import { create } from "zustand";
import type { Slideshow } from "@/domain/slideshow/entities/slideshow";

interface SlideshowStore {
  slideshows: Slideshow[];
  isLoading: boolean;
  setSlideshows: (slideshows: Slideshow[]) => void;
  setIsLoading: (loading: boolean) => void;
  addSlideshow: (slideshow: Slideshow) => void;
  removeSlideshow: (id: string) => void;
  updateSlideshow: (id: string, data: Partial<Slideshow>) => void;
}

export const useSlideshowStore = create<SlideshowStore>((set) => ({
  slideshows: [],
  isLoading: false,
  setSlideshows: (slideshows) => set({ slideshows }),
  setIsLoading: (isLoading) => set({ isLoading }),
  addSlideshow: (slideshow) => set((s) => ({ slideshows: [slideshow, ...s.slideshows] })),
  removeSlideshow: (id) => set((s) => ({ slideshows: s.slideshows.filter((sl) => sl.id !== id) })),
  updateSlideshow: (id, data) =>
    set((s) => ({
      slideshows: s.slideshows.map((sl) => (sl.id === id ? { ...sl, ...data } : sl)),
    })),
}));
