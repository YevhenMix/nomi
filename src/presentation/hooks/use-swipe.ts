import { useRef, type TouchEvent, type TouchEventHandler } from 'react';

const MIN_DISTANCE_PX = 60;
const MAX_DURATION_MS = 800;
/** How much more sideways than vertical a gesture must be, so scrolling never counts as a swipe. */
const MIN_HORIZONTAL_RATIO = 1.5;

export type SwipeDirection = 'left' | 'right';

export interface SwipeGesture {
  deltaX: number;
  deltaY: number;
  durationMs: number;
}

export function detectSwipe({ deltaX, deltaY, durationMs }: SwipeGesture): SwipeDirection | null {
  const isSwipe =
    Math.abs(deltaX) >= MIN_DISTANCE_PX &&
    Math.abs(deltaX) >= Math.abs(deltaY) * MIN_HORIZONTAL_RATIO &&
    durationMs <= MAX_DURATION_MS;
  if (!isSwipe) return null;
  return deltaX < 0 ? 'left' : 'right';
}

interface SwipeHandlers {
  onTouchStart: TouchEventHandler;
  onTouchEnd: TouchEventHandler;
  onTouchCancel: TouchEventHandler;
}

/** Text inputs keep their own gestures: moving the caret, scrolling a long value. */
function startedInTextInput(event: TouchEvent): boolean {
  return event.target instanceof Element && event.target.closest('input[type="text"]') !== null;
}

export function useSwipe(onSwipe: (direction: SwipeDirection) => void): SwipeHandlers {
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  return {
    onTouchStart(event) {
      const touch = event.touches[0];
      // A second finger means pinch zoom, not a swipe.
      start.current =
        touch && event.touches.length === 1 && !startedInTextInput(event)
          ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp }
          : null;
    },
    onTouchEnd(event) {
      const touch = event.changedTouches[0];
      const begun = start.current;
      start.current = null;
      if (!touch || !begun) return;

      const direction = detectSwipe({
        deltaX: touch.clientX - begun.x,
        deltaY: touch.clientY - begun.y,
        durationMs: event.timeStamp - begun.time,
      });
      if (direction) onSwipe(direction);
    },
    onTouchCancel() {
      start.current = null;
    },
  };
}
