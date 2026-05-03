import { useEffect } from "react";

export function useCrosshair() {
  useEffect(() => {
    const styleId = "crosshair-dynamic-style";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement;
      if (!cell) return;

      const container = target.closest(".crosshair-container") as HTMLElement;
      if (!container) return;

      const table = cell.closest("table") as HTMLTableElement;
      if (!table) return;

      const index = cell.cellIndex + 1; // nth-child is 1-based

      // Check if we need to update
      if (container.dataset.crosshairCol === String(index)) return;
      container.dataset.crosshairCol = String(index);

      // Get appropriate hover class color. Default to a light tint.
      // We will use a subtle semi-transparent color so text is readable
      // or a solid color. a neutral-100 is rgb(245 245 245).
      styleTag.innerHTML = `
        .crosshair-container table tr:hover > td,
        .crosshair-container table tr:hover > th {
            box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.05) !important;
        }

        .crosshair-container table td:nth-child(${index}),
        .crosshair-container table th:nth-child(${index}) {
            box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.05) !important;
        }

        /* For the intersection, the shadows don't add up correctly, but hover handles row and nth-child handles column so it is fine */
      `;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const container = target.closest(".crosshair-container") as HTMLElement;
      if (container) {
        delete container.dataset.crosshairCol;
        styleTag.innerHTML = "";
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    // Not mouseleave on document, but wait, mouseout from table?
    // We can use mouseout to detect leaving the container
    const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const container = target.closest(".crosshair-container") as HTMLElement;
        if (container) {
            // Check if relatedTarget is inside container
            if (!container.contains(e.relatedTarget as Node)) {
                delete container.dataset.crosshairCol;
                styleTag.innerHTML = "";
            }
        }
    }
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);
}
