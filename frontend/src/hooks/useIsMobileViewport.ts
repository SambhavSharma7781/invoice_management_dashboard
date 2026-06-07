import { useEffect, useState } from "react";

export function useIsMobileViewport(breakpoint = 640) {
  const query = `(max-width: ${breakpoint - 1}px)`;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return isMobile;
}
