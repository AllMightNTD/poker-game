import React, { createContext, useContext, useRef, useCallback } from "react";

interface Coordinates {
  x: number;
  y: number;
}

interface AnimationRegistryContextType {
  registerTableContainer: (el: HTMLDivElement | null) => void;
  registerSeat: (seatNumber: number, el: HTMLDivElement | null) => void;
  registerCenter: (el: HTMLDivElement | null) => void;
  getSeatCoords: (seatNumber: number) => Coordinates | null;
  getCenterCoords: () => Coordinates | null;
}

const AnimationRegistryContext = createContext<AnimationRegistryContextType | undefined>(undefined);

export const AnimationRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const seatsMapRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const centerRef = useRef<HTMLDivElement | null>(null);

  const registerTableContainer = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
  }, []);

  const registerSeat = useCallback((seatNumber: number, el: HTMLDivElement | null) => {
    if (el) {
      seatsMapRef.current.set(seatNumber, el);
    } else {
      seatsMapRef.current.delete(seatNumber);
    }
  }, []);

  const registerCenter = useCallback((el: HTMLDivElement | null) => {
    centerRef.current = el;
  }, []);

  const getElementCenterCoords = useCallback((element: HTMLElement | null): Coordinates | null => {
    if (!element || !containerRef.current) return null;

    const elRect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate center coordinates relative to the table container
    return {
      x: elRect.left + elRect.width / 2 - containerRect.left,
      y: elRect.top + elRect.height / 2 - containerRect.top,
    };
  }, []);

  const getSeatCoords = useCallback((seatNumber: number): Coordinates | null => {
    const seatEl = seatsMapRef.current.get(seatNumber);
    return getElementCenterCoords(seatEl || null);
  }, [getElementCenterCoords]);

  const getCenterCoords = useCallback((): Coordinates | null => {
    if (centerRef.current) {
      return getElementCenterCoords(centerRef.current);
    }
    // Fallback to table center if center element is not registered
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: rect.width / 2,
        y: rect.height * 0.38, // Table visual center center is at ~38% top
      };
    }
    return null;
  }, [getElementCenterCoords]);

  return (
    <AnimationRegistryContext.Provider
      value={{
        registerTableContainer,
        registerSeat,
        registerCenter,
        getSeatCoords,
        getCenterCoords,
      }}
    >
      {children}
    </AnimationRegistryContext.Provider>
  );
};

export const useAnimationRegistry = () => {
  const context = useContext(AnimationRegistryContext);
  if (!context) {
    throw new Error("useAnimationRegistry must be used within an AnimationRegistryProvider");
  }
  return context;
};
