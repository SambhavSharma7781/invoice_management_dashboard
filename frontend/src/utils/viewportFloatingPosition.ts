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
