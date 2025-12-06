import { usePlayback } from "@/context/playback-context";
import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import { motion, useMotionValue } from "framer-motion";
import { TIMELINE_START_LEFT } from "./constants";

interface PlayheadProps {
  zoom: number;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

// Configuration for auto-scroll behavior
const AUTO_SCROLL_CONFIG = {
  // Distance from the right edge (in pixels) where auto-scroll should trigger
  EDGE_THRESHOLD: 300,
  // Minimum distance from left edge to maintain during scroll
  MIN_LEFT_MARGIN: 100,
  // Easing power for smooth deceleration (higher = more gradual)
  EASING_POWER: 4,
  // Base smoothing factor for exponential easing
  BASE_SMOOTHING: 0.12,
  // Velocity-based smoothing multiplier
  VELOCITY_DAMPING: 0.85,
  // Minimum difference to continue animating (sub-pixel precision)
  MIN_DIFF_THRESHOLD: 0.05,
  // Look-ahead distance for predictive scrolling
  LOOK_AHEAD_MULTIPLIER: 1.5,
};

export default function Playhead({ zoom, scrollContainerRef }: PlayheadProps) {
  const { currentTime, subscribeToTimeUpdate, isPlaying } = usePlayback();
  
  // Create a motion value for the x position
  const x = useMotionValue(TIMELINE_START_LEFT + currentTime * zoom);
  
  // Refs for auto-scroll state
  const scrollAnimationRef = useRef<number | null>(null);
  const targetScrollLeftRef = useRef<number>(0);
  const currentScrollVelocityRef = useRef<number>(0);
  const lastScrollUpdateTimeRef = useRef<number>(0);
  const isUserScrollingRef = useRef<boolean>(false);
  const isAutoScrollingRef = useRef<boolean>(false);
  const isAutoScrollActiveRef = useRef<boolean>(true); // New ref to track if auto-scroll is enabled
  const expectedScrollLeftRef = useRef<number>(0); // New ref to validate scroll events
  const lastAutoScrollTimeRef = useRef<number>(0); // New ref to track last auto-scroll time
  const userScrollTimeoutRef = useRef<number | null>(null);
  const lastPlayheadPositionRef = useRef<number>(0);
  const playheadVelocityRef = useRef<number>(0);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Helper function to trigger smooth scroll animation with advanced easing
  const triggerSmoothScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If animation already running, let it continue with updated target
    if (scrollAnimationRef.current !== null) return;

    const startTime = performance.now();
    lastScrollUpdateTimeRef.current = startTime;

    const animate = (currentTime: number) => {
      if (!container) {
        scrollAnimationRef.current = null;
        isAutoScrollingRef.current = false;
        return;
      }
      
      const deltaTime = currentTime - lastScrollUpdateTimeRef.current;
      lastScrollUpdateTimeRef.current = currentTime;
      
      const currentScroll = container.scrollLeft;
      const diff = targetScrollLeftRef.current - currentScroll;
      
      // Use sub-pixel precision threshold
      if (Math.abs(diff) > AUTO_SCROLL_CONFIG.MIN_DIFF_THRESHOLD) {
        // Advanced easing: Combine exponential smoothing with velocity damping
        // This creates a natural deceleration curve
        const normalizedDiff = diff / container.clientWidth;
        const easingFactor = Math.pow(Math.abs(normalizedDiff), 1 / AUTO_SCROLL_CONFIG.EASING_POWER);
        
        // Calculate target velocity based on distance
        const targetVelocity = diff * AUTO_SCROLL_CONFIG.BASE_SMOOTHING * easingFactor;
        
        // Apply velocity damping for smooth acceleration/deceleration
        currentScrollVelocityRef.current = 
          currentScrollVelocityRef.current * AUTO_SCROLL_CONFIG.VELOCITY_DAMPING +
          targetVelocity * (1 - AUTO_SCROLL_CONFIG.VELOCITY_DAMPING);
        
        // Apply velocity with time-based normalization (60fps baseline)
        const timeMultiplier = Math.min(deltaTime / 16.67, 2); // Cap at 2x for lag spikes
        const scrollDelta = currentScrollVelocityRef.current * timeMultiplier;
        
        // Mark as auto-scrolling BEFORE scrolling
        isAutoScrollingRef.current = true;
        lastAutoScrollTimeRef.current = Date.now();
        const nextScrollLeft = currentScroll + scrollDelta;
        expectedScrollLeftRef.current = nextScrollLeft;
        
        // Use scrollTo for sub-pixel accuracy and smoother rendering
        container.scrollTo({
          left: nextScrollLeft,
          behavior: 'auto' // We handle smoothness manually
        });
        
        scrollAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to final position with sub-pixel accuracy
        if (Math.abs(diff) > 0) {
          isAutoScrollingRef.current = true;
          lastAutoScrollTimeRef.current = Date.now();
          expectedScrollLeftRef.current = targetScrollLeftRef.current;
          container.scrollTo({
            left: targetScrollLeftRef.current,
            behavior: 'auto'
          });
        }
        currentScrollVelocityRef.current = 0;
        scrollAnimationRef.current = null;
        // Reset auto-scroll flag after a short delay to allow scroll event to fire
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 50);
      }
    };
    
    scrollAnimationRef.current = requestAnimationFrame(animate);
  }, [scrollContainerRef]);

  // Detect user manual scrolling with momentum detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastScrollLeft = container.scrollLeft;
    let scrollMomentum = 0;

    const handleScroll = () => {
      const currentScrollLeft = container.scrollLeft;
      const now = Date.now();
      
      // Check if this scroll matches our expected auto-scroll position
      // We use a small tolerance because browsers might round scroll values
      const isExpected = Math.abs(currentScrollLeft - expectedScrollLeftRef.current) < 2;
      const isRecentAutoScroll = now - lastAutoScrollTimeRef.current < 100; // 100ms window for auto-scroll events
      
      if ((isAutoScrollingRef.current || isRecentAutoScroll) && isExpected) {
        // This is likely our own scroll, ignore it
        return;
      }

      scrollMomentum = Math.abs(currentScrollLeft - lastScrollLeft);
      lastScrollLeft = currentScrollLeft;
      
      // Mark as user scrolling AND disable auto-scroll
      isUserScrollingRef.current = true;
      isAutoScrollActiveRef.current = false; // User took control
      
      // Cancel ongoing auto-scroll animation
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
        currentScrollVelocityRef.current = 0;
        isAutoScrollingRef.current = false;
      }
      
      // Clear existing timeout
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
      
      // Longer delay for high momentum (user is actively scrolling)
      const delay = scrollMomentum > 10 ? 500 : 250;
      
      // Reset after delay (user finished scrolling)
      userScrollTimeoutRef.current = window.setTimeout(() => {
        isUserScrollingRef.current = false;
        scrollMomentum = 0;
      }, delay);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize target to current position
    targetScrollLeftRef.current = container.scrollLeft;
    expectedScrollLeftRef.current = container.scrollLeft;
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [scrollContainerRef]);

  // Subscribe to smooth time updates and handle auto-scroll with predictive positioning
  useEffect(() => {
    if (!subscribeToTimeUpdate) return;
    
    const updatePosition = (time: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Calculate playhead position in pixels
      const playheadPosition = TIMELINE_START_LEFT + time * zoom;
      
      // Calculate velocity for predictive scrolling
      const timeDelta = time - (lastPlayheadPositionRef.current - TIMELINE_START_LEFT) / zoom;
      const positionDelta = playheadPosition - lastPlayheadPositionRef.current;
      
      if (timeDelta > 0 && Math.abs(timeDelta) < 1) { // Valid time delta
        playheadVelocityRef.current = positionDelta / timeDelta;
      }
      
      // Auto-scroll logic (only when playing and not user-scrolling)
      if (isPlaying && !isUserScrollingRef.current) {
        const containerWidth = container.clientWidth;
        const currentScrollLeft = container.scrollLeft;
        
        // Predictive look-ahead: Consider where playhead will be in next few frames
        const lookAheadDistance = playheadVelocityRef.current * AUTO_SCROLL_CONFIG.LOOK_AHEAD_MULTIPLIER;
        const predictedPosition = playheadPosition + lookAheadDistance;
        
        // Calculate playhead position relative to viewport (use predicted position)
        const playheadViewportPosition = predictedPosition - currentScrollLeft;
        
        // Check if playhead is approaching the right edge
        const distanceFromRightEdge = containerWidth - playheadViewportPosition;
        
        // Dynamic threshold based on playback speed
        const dynamicThreshold = AUTO_SCROLL_CONFIG.EDGE_THRESHOLD + Math.abs(lookAheadDistance);
        
        // Handle re-enabling auto-scroll if playhead comes back into view safely
        if (!isAutoScrollActiveRef.current) {
          // Only re-enable if playhead is safely inside the viewport (not in the trigger zone)
          // This prevents "fighting" when the user scrolls just to the edge
          const isSafelyVisible = 
            playheadViewportPosition > AUTO_SCROLL_CONFIG.MIN_LEFT_MARGIN && 
            distanceFromRightEdge > dynamicThreshold; // Must be OUTSIDE the trigger zone
            
          if (isSafelyVisible) {
            isAutoScrollActiveRef.current = true;
          }
        }

        // Calculate if we need to scroll
        // Only scroll if auto-scroll is active AND we are in the trigger zone
        if (isAutoScrollActiveRef.current && distanceFromRightEdge < dynamicThreshold) {
          // Calculate target scroll position to keep playhead at optimal position
          const optimalPlayheadPosition = containerWidth - AUTO_SCROLL_CONFIG.EDGE_THRESHOLD;
          const targetScroll = predictedPosition - optimalPlayheadPosition;
          
          // Ensure we don't scroll past the maximum scrollable area
          const maxScroll = container.scrollWidth - containerWidth;
          const newTarget = Math.max(0, Math.min(maxScroll, targetScroll));
          
          // Determine if we should use synchronous update (steady tracking) or smooth scroll (catch-up)
          const diff = Math.abs(newTarget - currentScrollLeft);
          const isSteadyTracking = diff < 100; // Threshold for steady tracking

          if (isSteadyTracking) {
             // Synchronous update for steady tracking to prevent flicker/jitter
             // We only update if there's a change to avoid unnecessary layout thrashing
             if (Math.abs(newTarget - currentScrollLeft) > 0.5) {
                 // Cancel any ongoing physics animation
                 if (scrollAnimationRef.current !== null) {
                    cancelAnimationFrame(scrollAnimationRef.current);
                    scrollAnimationRef.current = null;
                 }
                 
                 isAutoScrollingRef.current = true;
                 lastAutoScrollTimeRef.current = Date.now();
                 expectedScrollLeftRef.current = newTarget;
                 targetScrollLeftRef.current = newTarget;
                 currentScrollVelocityRef.current = 0; // Reset velocity
                 
                 // CRITICAL: Update DOM synchronously to prevent flicker
                 // 1. Update scroll position
                 container.scrollLeft = newTarget;
                 
                 // 2. Update playhead position manually to match the scroll frame
                 if (playheadRef.current) {
                   playheadRef.current.style.transform = `translateX(${playheadPosition}px) translateZ(0)`;
                 }
                 
                 // 3. Update MotionValue to keep state consistent (will apply in next frame but we already handled this frame)
                 x.set(playheadPosition);
                 
                 // Reset flag shortly after
                 setTimeout(() => {
                    isAutoScrollingRef.current = false;
                 }, 50);
             } else {
               // Even if we don't scroll, we must update playhead
               x.set(playheadPosition);
             }
          } else {
              // Large jump or catch-up: use physics-based smooth scroll
              x.set(playheadPosition);
              
              // Only update target if significantly different (reduces jitter)
              if (Math.abs(newTarget - targetScrollLeftRef.current) > 1) {
                targetScrollLeftRef.current = newTarget;
                triggerSmoothScroll();
              }
          }
        } else {
          // Not auto-scrolling, just update playhead
          x.set(playheadPosition);
        }
        
        // Handle backward playback or seeking (if playhead jumped backward)
        const instantPositionDelta = playheadPosition - lastPlayheadPositionRef.current;
        // Detect large jumps in EITHER direction (seek)
        if (Math.abs(instantPositionDelta) > 50) {
          // Large jump detected (seek or clip transition)
          // Force re-enable auto-scroll on seek
          isAutoScrollActiveRef.current = true;
          
          // Check if playhead is now outside viewport
          const actualViewportPosition = playheadPosition - currentScrollLeft;
          
          if (actualViewportPosition < AUTO_SCROLL_CONFIG.MIN_LEFT_MARGIN || 
              actualViewportPosition > containerWidth - AUTO_SCROLL_CONFIG.MIN_LEFT_MARGIN) {
            // Center the playhead in viewport for better UX after seek
            const centerPosition = containerWidth * 0.35; // Slightly left of center
            const targetScroll = Math.max(0, playheadPosition - centerPosition);
            
            targetScrollLeftRef.current = targetScroll;
            // Reset velocity for immediate response
            currentScrollVelocityRef.current = 0;
            triggerSmoothScroll();
          }
        }
        
        lastPlayheadPositionRef.current = playheadPosition;
      } else if (!isPlaying) {
        // When paused, update last position to avoid false seek detection
        lastPlayheadPositionRef.current = playheadPosition;
        x.set(playheadPosition);
      }
    };
    
    // Initial position update
    updatePosition(currentTime);
    
    return subscribeToTimeUpdate(updatePosition);
  }, [subscribeToTimeUpdate, zoom, currentTime, x, scrollContainerRef, isPlaying, triggerSmoothScroll]);

  // Handle zoom changes - update position immediately and smoothly
  useEffect(() => {
    const playheadPosition = TIMELINE_START_LEFT + currentTime * zoom;
    x.set(playheadPosition);
    lastPlayheadPositionRef.current = playheadPosition;
    
    // Update scroll target proportionally to maintain relative position
    const container = scrollContainerRef.current;
    if (container && !isUserScrollingRef.current) {
      const wasPlayheadVisible = 
        lastPlayheadPositionRef.current > container.scrollLeft &&
        lastPlayheadPositionRef.current < container.scrollLeft + container.clientWidth;
      
      if (wasPlayheadVisible) {
        // Adjust scroll to maintain playhead's relative position
        const relativePosition = (lastPlayheadPositionRef.current - container.scrollLeft) / container.clientWidth;
        const newScrollTarget = playheadPosition - (relativePosition * container.clientWidth);
        targetScrollLeftRef.current = Math.max(0, newScrollTarget);
      }
    }
  }, [zoom, currentTime, x, scrollContainerRef]);

  // Stop auto-scroll when playback stops with smooth deceleration
  useEffect(() => {
    if (!isPlaying) {
      // Let animation finish naturally for smoother stop
      // Don't immediately cancel to avoid jarring stop
      if (scrollAnimationRef.current !== null && Math.abs(currentScrollVelocityRef.current) < 2) {
        // Only cancel if velocity is already low
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
        currentScrollVelocityRef.current = 0;
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      if (userScrollTimeoutRef.current !== null) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={playheadRef}
      className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none will-change-transform"
      style={{
        left: 0,
        x, // Bind the motion value to the x transform
        // Hardware acceleration hints
        transform: 'translateZ(0)',
      }}
    >
      <div className="absolute -left-1.5 top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-red-500" />
    </motion.div>
  );
}

