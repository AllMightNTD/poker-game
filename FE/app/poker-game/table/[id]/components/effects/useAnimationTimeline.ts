import { useCallback, useEffect, useRef, useState } from "react";
import { AnimationStep, AnimationStepType, WinnerData, WinnerTimelinePayload } from "../types";

const DURATIONS: Record<AnimationStepType, number> = {
  HIGHLIGHT_WINNERS: 1000,
  COLLECT_POT_TO_CENTER: 800,
  FLY_CHIPS_TO_WINNERS: 1200,
  SHOW_BANNER: 2500
};

export const useAnimationTimeline = () => {
  const [currentStep, setCurrentStep] = useState<AnimationStepType | null>(null);
  const [activePayload, setActivePayload] = useState<WinnerTimelinePayload | null>(null);
  const stepQueue = useRef<AnimationStep[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const executeNextStepRef = useRef<() => void>(() => {});

  const executeNextStep = useCallback(() => {
    if (stepQueue.current.length === 0) {
      setCurrentStep(null);
      setActivePayload(null);
      return;
    }

    const nextStep = stepQueue.current.shift()!;
    setCurrentStep(nextStep.type);
    setActivePayload(nextStep.payload);

    timerRef.current = setTimeout(() => {
      executeNextStepRef.current();
    }, nextStep.duration);
  }, []);

  useEffect(() => {
    executeNextStepRef.current = executeNextStep;
  }, [executeNextStep]);

  const triggerWinnerTimeline = useCallback((winners: WinnerData[], totalPot: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const mainHandName = winners[0]?.handName || "Winner";

    const payload: WinnerTimelinePayload = {
      winners,
      totalPot,
      handName: mainHandName,
    };

    const timeline: AnimationStep[] = [
      {
        type: "HIGHLIGHT_WINNERS",
        duration: DURATIONS.HIGHLIGHT_WINNERS,
        payload,
      },
      {
        type: "COLLECT_POT_TO_CENTER",
        duration: DURATIONS.COLLECT_POT_TO_CENTER,
        payload,
      },
      {
        type: "FLY_CHIPS_TO_WINNERS",
        duration: DURATIONS.FLY_CHIPS_TO_WINNERS,
        payload,
      },
      {
        type: "SHOW_BANNER",
        duration: DURATIONS.SHOW_BANNER,
        payload,
      }
    ];

    stepQueue.current = timeline;
    console.log('stepQueue.current', stepQueue.current);

    executeNextStep();
  }, [executeNextStep]);

  return { currentStep, activePayload, triggerWinnerTimeline };
};
