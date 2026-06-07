export const VIEWPORT_MARGIN = 12;
export const FLOATING_GAP = 8;
export const MAX_MENU_HEIGHT_PX = 320;
export const MAX_MENU_HEIGHT_VH = 0.6;
export const MOBILE_BREAKPOINT = 640;

export type HorizontalAlign = "start" | "end";

export interface AnchorPlacement {
  openAbove: boolean;
  alignEnd: boolean;
  width: number;
  maxHeight: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getMaxMenuHeight(
  viewportHeight: number,
  availableSpace: number,
  maxPx = MAX_MENU_HEIGHT_PX
) {
  return Math.min(
    maxPx,
    viewportHeight * MAX_MENU_HEIGHT_VH,
    Math.max(availableSpace, 0)
  );
}

export function computeAnchorPlacement(
  trigger: DOMRect,
  preferredWidth: number,
  viewportWidth: number,
  viewportHeight: number,
  align: HorizontalAlign = "start",
  maxHeightPx = MAX_MENU_HEIGHT_PX
): AnchorPlacement {
  const width = Math.min(preferredWidth, viewportWidth - VIEWPORT_MARGIN * 2);

  const spaceBelow =
    viewportHeight - VIEWPORT_MARGIN - trigger.bottom - FLOATING_GAP;
  const spaceAbove = trigger.top - VIEWPORT_MARGIN - FLOATING_GAP;

  const openAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(
    200,
    getMaxMenuHeight(
      viewportHeight,
      openAbove ? spaceAbove : spaceBelow,
      maxHeightPx
    )
  );

  let alignEnd = align === "end";

  if (!alignEnd && trigger.left + width > viewportWidth - VIEWPORT_MARGIN) {
    alignEnd = true;
  }

  if (alignEnd && trigger.right - width < VIEWPORT_MARGIN) {
    alignEnd = false;
  }

  return { openAbove, alignEnd, width, maxHeight };
}

/** @deprecated Use computeAnchorPlacement for document-relative anchoring. */
export interface FloatingRect {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "above" | "below";
}

/** @deprecated Fixed positioning helper — prefer computeAnchorPlacement. */
export function computeFloatingPosition(
  trigger: DOMRect,
  preferredWidth: number,
  viewportWidth: number,
  viewportHeight: number,
  align: HorizontalAlign = "start"
): FloatingRect {
  const placement = computeAnchorPlacement(
    trigger,
    preferredWidth,
    viewportWidth,
    viewportHeight,
    align
  );

  const spaceBelow =
    viewportHeight - VIEWPORT_MARGIN - trigger.bottom - FLOATING_GAP;
  const spaceAbove = trigger.top - VIEWPORT_MARGIN - FLOATING_GAP;

  let top =
    placement.openAbove
      ? trigger.top - FLOATING_GAP - placement.maxHeight
      : trigger.bottom + FLOATING_GAP;

  top = clamp(
    top,
    VIEWPORT_MARGIN,
    viewportHeight - VIEWPORT_MARGIN - placement.maxHeight
  );

  let left = placement.alignEnd
    ? trigger.right - placement.width
    : trigger.left;

  left = clamp(
    left,
    VIEWPORT_MARGIN,
    viewportWidth - placement.width - VIEWPORT_MARGIN
  );

  return {
    top,
    left,
    width: placement.width,
    maxHeight: placement.maxHeight,
    placement: placement.openAbove ? "above" : "below",
  };
}

export function isRectFullyInViewport(
  rect: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  margin = VIEWPORT_MARGIN
) {
  return (
    rect.x >= margin - 1 &&
    rect.y >= margin - 1 &&
    rect.x + rect.width <= viewportWidth - margin + 1 &&
    rect.y + rect.height <= viewportHeight - margin + 1
  );
}
