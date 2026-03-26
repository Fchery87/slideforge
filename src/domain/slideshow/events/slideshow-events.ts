export interface SlideshowCreated {
  type: "SLIDESHOW_CREATED";
  payload: { slideshowId: string; userId: string };
}

export interface SlideshowUpdated {
  type: "SLIDESHOW_UPDATED";
  payload: { slideshowId: string };
}

export interface SlideAdded {
  type: "SLIDE_ADDED";
  payload: { slideshowId: string; slideId: string };
}

export interface SlideRemoved {
  type: "SLIDE_REMOVED";
  payload: { slideshowId: string; slideId: string };
}

export interface TransitionApplied {
  type: "TRANSITION_APPLIED";
  payload: { slideshowId: string; transitionId: string };
}

export type SlideshowEvent = SlideshowCreated | SlideshowUpdated | SlideAdded | SlideRemoved | TransitionApplied;
