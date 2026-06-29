import { useState, useEffect, RefObject } from "react";

export function useTableScale(tableRef: RefObject<HTMLDivElement | null>, dependency?: any) {
  const [tableScale, setTableScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!tableRef.current) return;

      // The table's parent is the flex-centering wrapper (absolute inset-0)
      // which has the same size as <main>. Use it for scale calculation.
      const parent = tableRef.current.parentElement;
      if (!parent) return;

      const availW = parent.clientWidth;
      const availH = parent.clientHeight;

      if (availW === 0 || availH === 0) return;

      const baseW = 850;
      const baseH = 480;

      // Leave a small margin so the table doesn't touch the edges
      const scaleX = (availW - 24) / baseW;
      const scaleY = (availH - 24) / baseH;

      let scale = Math.min(scaleX, scaleY);

      // Clamp: never larger than 1.15, never smaller than 0.28
      scale = Math.min(1.15, Math.max(0.28, scale));

      setTableScale(scale);
    };

    handleResize();
    const t = setTimeout(handleResize, 120);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, [tableRef, dependency]);

  return tableScale;
}
