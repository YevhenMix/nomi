import { useRef, type RefObject, type TouchEvent, type TouchEventHandler } from 'react';

/** How far a finger must move before the gesture is treated as either scrolling or a swipe. */
const AXIS_LOCK_DISTANCE_PX = 10;
/** How much more sideways than vertical a movement must be to count as a swipe. */
const MIN_HORIZONTAL_RATIO = 1.2;
/** Dragging further than this share of the page moves to it, however slowly. */
const COMMIT_PAGE_SHARE = 0.3;
/** A quick flick moves to the next page even over a short distance. */
const FLICK_MIN_DISTANCE_PX = 30;
const FLICK_MIN_SPEED_PX_PER_MS = 0.35;
/** Past the first and last page, the track only follows the finger this much. */
const EDGE_RESISTANCE = 0.25;

export type GestureAxis = 'horizontal' | 'vertical';

export function detectAxis(deltaX: number, deltaY: number): GestureAxis | null {
  const x = Math.abs(deltaX);
  const y = Math.abs(deltaY);
  if (x < AXIS_LOCK_DISTANCE_PX && y < AXIS_LOCK_DISTANCE_PX) return null;
  return x >= y * MIN_HORIZONTAL_RATIO ? 'horizontal' : 'vertical';
}

interface SwipeRelease {
  deltaX: number;
  durationMs: number;
  pageWidth: number;
}

/** How many pages a released swipe moves: +1 is the next page, -1 the previous, 0 stays. */
export function pageStepOnRelease({ deltaX, durationMs, pageWidth }: SwipeRelease): -1 | 0 | 1 {
  const distance = Math.abs(deltaX);
  const isFlick =
    distance >= FLICK_MIN_DISTANCE_PX && distance / durationMs >= FLICK_MIN_SPEED_PX_PER_MS;
  if (distance < pageWidth * COMMIT_PAGE_SHARE && !isFlick) return 0;
  return deltaX < 0 ? 1 : -1;
}

/** The track's position in pixels, with resistance past the first and last page. */
export function trackPosition(wanted: number, pageWidth: number, pageCount: number): number {
  const lowest = -(pageCount - 1) * pageWidth;
  if (wanted > 0) return wanted * EDGE_RESISTANCE;
  if (wanted < lowest) return lowest + (wanted - lowest) * EDGE_RESISTANCE;
  return wanted;
}

interface Gesture {
  startX: number;
  startY: number;
  startTime: number;
  /** Set once the finger has moved enough to tell a swipe from scrolling. */
  isDragging: boolean;
  /** Where the track already was, if it was still sliding when the finger came down. */
  carriedOffset: number;
}

interface PageSwipeOptions {
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
}

interface PageSwipe {
  trackRef: RefObject<HTMLDivElement | null>;
  /** The track's transform while no finger is on it. */
  restingTransform: string;
  handlers: {
    onTouchStart: TouchEventHandler;
    onTouchMove: TouchEventHandler;
    onTouchEnd: TouchEventHandler;
    onTouchCancel: TouchEventHandler;
  };
}

/** Text inputs keep their own gestures: moving the caret, scrolling a long value. */
function startedInTextInput(event: TouchEvent): boolean {
  return event.target instanceof Element && event.target.closest('input[type="text"]') !== null;
}

/** How far the track is from its resting place right now, partway through a slide. */
function currentOffset(track: HTMLElement, pageIndex: number, pageWidth: number): number {
  if (typeof DOMMatrixReadOnly === 'undefined') return 0;
  const position = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
  return position + pageIndex * pageWidth;
}

/**
 * Moves a track of side-by-side pages with the finger. Positions are written straight to the
 * element, without a React render, so the track keeps up with every touch movement.
 */
export function usePageSwipe({ pageIndex, pageCount, onPageChange }: PageSwipeOptions): PageSwipe {
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const restingTransform = `translateX(${-pageIndex * 100}%)`;

  /** Ends a drag. The transition only comes back here, so the track slides from the finger. */
  function settle(track: HTMLElement, targetIndex: number) {
    track.removeAttribute('data-dragging');
    if (targetIndex === pageIndex) track.style.transform = restingTransform;
    else onPageChange(targetIndex);
  }

  function cancel() {
    const track = trackRef.current;
    if (track && gesture.current?.isDragging) settle(track, pageIndex);
    gesture.current = null;
  }

  return {
    trackRef,
    restingTransform,
    handlers: {
      onTouchStart(event) {
        const touch = event.touches[0];
        // A second finger means pinch zoom, not a swipe.
        if (!touch || event.touches.length > 1 || startedInTextInput(event)) {
          cancel();
          return;
        }
        gesture.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: event.timeStamp,
          isDragging: false,
          carriedOffset: 0,
        };
      },

      onTouchMove(event) {
        const track = trackRef.current;
        const touch = event.touches[0];
        const current = gesture.current;
        if (!track || !touch || !current) return;

        const deltaX = touch.clientX - current.startX;
        const pageWidth = track.offsetWidth;

        if (!current.isDragging) {
          const axis = detectAxis(deltaX, touch.clientY - current.startY);
          if (axis === 'vertical') gesture.current = null;
          if (axis !== 'horizontal') return;
          current.isDragging = true;
          current.carriedOffset = currentOffset(track, pageIndex, pageWidth);
          track.setAttribute('data-dragging', '');
        }

        const wanted = -pageIndex * pageWidth + current.carriedOffset + deltaX;
        const position = trackPosition(wanted, pageWidth, pageCount);
        track.style.transform = `translateX(${position}px)`;
      },

      onTouchEnd(event) {
        const track = trackRef.current;
        const touch = event.changedTouches[0];
        const current = gesture.current;
        gesture.current = null;
        if (!track || !touch || !current?.isDragging) return;

        const step = pageStepOnRelease({
          deltaX: touch.clientX - current.startX + current.carriedOffset,
          durationMs: event.timeStamp - current.startTime,
          pageWidth: track.offsetWidth,
        });
        settle(track, Math.min(Math.max(pageIndex + step, 0), pageCount - 1));
      },

      onTouchCancel: cancel,
    },
  };
}
