import { useCallback, useRef } from "react";
import { useAnimationRegistry } from "./AnimationRegistryContext";

export const useGameAnimation = () => {
  const { getSeatCoords, getCenterCoords } = useAnimationRegistry();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setAnimationContainer = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
  }, []);

  /**
   * Helper to create a temporary animated element inside the container
   */
  const createAnimatedElement = useCallback((
    className: string,
    content: string | HTMLElement,
    startCoords: { x: number; y: number },
    targetCoords: { x: number; y: number },
    options: {
      duration: number;
      easing?: string;
      delay?: number;
      classNameExtra?: string;
      onStart?: (el: HTMLElement) => void;
      onComplete?: () => void;
      keyframesModifier?: (
        start: { x: number; y: number },
        end: { x: number; y: number }
      ) => Keyframe[];
    }
  ) => {
    if (!containerRef.current) return Promise.resolve();

    const el = document.createElement("div");
    el.className = `${className} absolute pointer-events-none z-50 will-change-transform ${options.classNameExtra || ""}`;
    
    if (typeof content === "string") {
      el.innerHTML = content;
    } else {
      el.appendChild(content);
    }

    // Set initial position to startCoords
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.transform = `translate3d(${startCoords.x}px, ${startCoords.y}px, 0)`;

    containerRef.current.appendChild(el);

    if (options.onStart) {
      options.onStart(el);
    }

    const keyframes = options.keyframesModifier 
      ? options.keyframesModifier(startCoords, targetCoords)
      : [
          { transform: `translate3d(${startCoords.x}px, ${startCoords.y}px, 0) scale(0.5)`, opacity: 0 },
          { transform: `translate3d(${startCoords.x}px, ${startCoords.y}px, 0) scale(1)`, opacity: 1, offset: 0.1 },
          { transform: `translate3d(${targetCoords.x}px, ${targetCoords.y}px, 0) scale(1)`, opacity: 1, offset: 0.9 },
          { transform: `translate3d(${targetCoords.x}px, ${targetCoords.y}px, 0) scale(0.8)`, opacity: 0 }
        ];

    const animation = el.animate(keyframes, {
      duration: options.duration,
      easing: options.easing || "ease-out",
      delay: options.delay || 0,
      fill: "forwards"
    });

    return new Promise<void>((resolve) => {
      animation.onfinish = () => {
        el.remove();
        if (options.onComplete) {
          options.onComplete();
        }
        resolve();
      };
    });
  }, []);

  /**
   * 1. Dealing Card Animation (Bay bài từ Center -> Seat)
   */
  const animateDealing = useCallback(async (seatNumber: number, delay = 0, isHero = false) => {
    const start = getCenterCoords();
    const end = getSeatCoords(seatNumber);
    if (!start || !end) return;

    // Adjust target coordinates slightly to match card area on seat panel
    const targetX = end.x;
    const targetY = end.y + (isHero ? 20 : 10);

    const cardMarkup = `
      <div class="w-8 h-12 sm:w-10 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md border border-white/20 shadow-md flex items-center justify-center overflow-hidden">
        <div class="w-full h-full bg-cover" style="background-image: url('/images/card_back.png');">
          <div class="w-full h-full bg-black/40 flex items-center justify-center">
            <span class="text-[8px] font-black text-amber-300">♣</span>
          </div>
        </div>
      </div>
    `;

    await createAnimatedElement(
      "card-deal",
      cardMarkup,
      start,
      { x: targetX, y: targetY },
      {
        duration: 500,
        delay,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        keyframesModifier: (s, e) => [
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(0.3) rotate(0deg)`, opacity: 0 },
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(0.8) rotate(15deg)`, opacity: 1, offset: 0.15 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(1) rotate(0deg)`, opacity: 1, offset: 0.85 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(1) rotate(0deg)`, opacity: 1 }
        ]
      }
    );
  }, [getCenterCoords, getSeatCoords, createAnimatedElement]);

  /**
   * 2. Betting Chips Animation (Bay chip từ Seat -> Bet Area)
   */
  const animateBetting = useCallback(async (seatNumber: number, delay = 0) => {
    const start = getSeatCoords(seatNumber);
    const end = getCenterCoords(); // In simple WAAPI we can target table center area
    if (!start || !end) return;

    // Vector bet area is slightly towards center
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const distance = 60; // Push bet chips 60px towards center
    const betAreaX = start.x + (dx / len) * distance;
    const betAreaY = start.y + (dy / len) * distance;

    const chipMarkup = `
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border border-white/30 shadow-lg flex items-center justify-center text-[10px] font-black text-slate-950 select-none">
        $
      </div>
    `;

    await createAnimatedElement(
      "chip-bet",
      chipMarkup,
      start,
      { x: betAreaX, y: betAreaY },
      {
        duration: 400,
        delay,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        keyframesModifier: (s, e) => [
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(0.5)`, opacity: 0 },
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(1.1)`, opacity: 1, offset: 0.2 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(1)`, opacity: 1, offset: 0.9 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(1)`, opacity: 1 }
        ]
      }
    );
  }, [getSeatCoords, getCenterCoords, createAnimatedElement]);

  /**
   * 3. Fold Card Animation (Bay bài từ Seat -> Center & Muck)
   */
  const animateFold = useCallback(async (seatNumber: number) => {
    const start = getSeatCoords(seatNumber);
    const end = getCenterCoords();
    if (!start || !end) return;

    const cardMarkup = `
      <div class="w-6 h-9 sm:w-8 sm:h-11 bg-slate-800 rounded-md border border-slate-700/60 shadow flex items-center justify-center opacity-65">
        <div class="w-full h-full bg-cover" style="background-image: url('/images/card_back.png'); filter: grayscale(1);"></div>
      </div>
    `;

    await createAnimatedElement(
      "card-fold",
      cardMarkup,
      start,
      end,
      {
        duration: 600,
        easing: "ease-in",
        keyframesModifier: (s, e) => [
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) rotate(0deg) scale(1)`, opacity: 0.8 },
          { transform: `translate3d(${(s.x + e.x) / 2}px, ${(s.y + e.y) / 2}px, 0) rotate(45deg) scale(0.8)`, opacity: 0.5, offset: 0.5 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) rotate(90deg) scale(0.4)`, opacity: 0 }
        ]
      }
    );
  }, [getSeatCoords, getCenterCoords, createAnimatedElement]);

  /**
   * 4. Pot Collect Animation (Bay chip từ Bet Area về Center)
   */
  const animatePotCollect = useCallback(async (seatNumber: number, delay = 0) => {
    const start = getSeatCoords(seatNumber);
    const end = getCenterCoords();
    if (!start || !end) return;

    // Bet Area location calculation
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const distance = 60;
    const betAreaCoords = {
      x: start.x + (dx / len) * distance,
      y: start.y + (dy / len) * distance
    };

    const chipMarkup = `
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border border-white/20 shadow-md flex items-center justify-center text-[10px] font-black text-slate-900">
        $
      </div>
    `;

    await createAnimatedElement(
      "chip-collect",
      chipMarkup,
      betAreaCoords,
      end,
      {
        duration: 500,
        delay,
        easing: "ease-in-out",
        keyframesModifier: (s, e) => [
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(1)`, opacity: 1 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(0.8)`, opacity: 0 }
        ]
      }
    );
  }, [getSeatCoords, getCenterCoords, createAnimatedElement]);

  /**
   * 5. Chips Distribute Animation (Bay chip từ Center -> Seat)
   */
  const animatePotDistribute = useCallback(async (seatNumber: number, delay = 0) => {
    const start = getCenterCoords();
    const end = getSeatCoords(seatNumber);
    if (!start || !end) return;

    const chipMarkup = `
      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-[#F4B942] to-[#C9861C] border border-white/20 shadow-md flex items-center justify-center text-[10px] font-black text-slate-900">
        $
      </div>
    `;

    await createAnimatedElement(
      "chip-distribute",
      chipMarkup,
      start,
      end,
      {
        duration: 700,
        delay,
        easing: "ease-out",
        keyframesModifier: (s, e) => [
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(0.5)`, opacity: 0 },
          { transform: `translate3d(${s.x}px, ${s.y}px, 0) scale(1)`, opacity: 1, offset: 0.15 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(1)`, opacity: 1, offset: 0.8 },
          { transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(0.8)`, opacity: 0 }
        ]
      }
    );
  }, [getCenterCoords, getSeatCoords, createAnimatedElement]);

  return {
    setAnimationContainer,
    animateDealing,
    animateBetting,
    animateFold,
    animatePotCollect,
    animatePotDistribute,
  };
};
