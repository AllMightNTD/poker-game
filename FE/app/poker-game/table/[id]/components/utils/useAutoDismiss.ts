import { useEffect, useState } from "react";

interface UseAutoDismissResult {
    visible: boolean;
    dismiss: () => void;
}

/**
 * Shows the banner, then hides it after `durationMs`. Hiding just flips a
 * flag rather than unmounting directly, so the caller can wrap the content
 * in `AnimatePresence` and let the exit animation actually play before
 * `onExitComplete` fires `onDismiss`.
 */
export function useAutoDismiss(durationMs: number | undefined): UseAutoDismissResult {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!durationMs) return;
        const timer = setTimeout(() => setVisible(false), durationMs);
        return () => clearTimeout(timer);
    }, [durationMs]);

    return { visible, dismiss: () => setVisible(false) };
}