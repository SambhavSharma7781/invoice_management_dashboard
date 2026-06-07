import { useEffect, type RefObject } from "react";

interface UseCloseOnScrollOptions {
  /** Do not close when the scroll event originates inside this element. */
  ignoreScrollWithinRef?: RefObject<HTMLElement | null>;
}

export function useCloseOnScroll(
  open: boolean,
  onClose: () => void,
  options: UseCloseOnScrollOptions = {}
) {
  const { ignoreScrollWithinRef } = options;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleScroll = (event: Event) => {
      const scrollTarget = event.target;

      if (
        ignoreScrollWithinRef?.current &&
        scrollTarget instanceof Node &&
        ignoreScrollWithinRef.current.contains(scrollTarget)
      ) {
        return;
      }

      onClose();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, onClose, ignoreScrollWithinRef]);
}
