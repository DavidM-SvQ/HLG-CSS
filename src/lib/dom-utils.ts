export const expandNodeForCapture = (element: HTMLElement) => {
  const targets = Array.from(element.querySelectorAll<HTMLElement>('.overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .table-responsive-wrapper, [style*="max-height"], [class*="max-h-"]'));
  targets.push(element);

  const tables = Array.from(element.querySelectorAll<HTMLElement>('table'));
  const cells = Array.from(element.querySelectorAll<HTMLElement>('td, th'));
  const ignoreElements = Array.from(element.querySelectorAll<HTMLElement>('.copy-button-ignore'));

  const originalStyles = targets.map((node) => ({
    node,
    maxHeight: node.style.maxHeight,
    height: node.style.height,
    overflowY: node.style.overflowY,
    overflowX: node.style.overflowX,
    overflow: node.style.overflow,
    display: node.style.display,
    width: node.style.width,
    minWidth: node.style.minWidth,
    maxWidth: node.style.maxWidth,
    paddingBottom: node.style.paddingBottom,
  }));
  
  const originalTableStyles = tables.map((node) => ({
    node,
    width: node.style.width,
    minWidth: node.style.minWidth,
    maxWidth: node.style.maxWidth,
  }));
  
  const originalCellStyles = cells.map((node) => ({
    node,
    whiteSpace: node.style.whiteSpace,
  }));

  const originalIgnoreStyles = ignoreElements.map((node) => ({
    node,
    display: node.style.display,
    opacity: node.style.opacity,
  }));

  const truncates = Array.from(element.querySelectorAll<HTMLElement>('.truncate'));
  const originalTruncateStyles = truncates.map((node) => ({
    node,
    whiteSpace: node.style.whiteSpace,
    overflow: node.style.overflow,
    textOverflow: node.style.textOverflow,
  }));

  const flexShrinks = Array.from(element.querySelectorAll<HTMLElement>('.min-w-0'));
  const originalFlexShrinks = flexShrinks.map((node) => ({
    node,
    minWidth: node.style.minWidth,
    flexShrink: node.style.flexShrink,
  }));

  truncates.forEach((node) => {
    node.style.setProperty('white-space', 'nowrap', 'important');
    node.style.setProperty('overflow', 'visible', 'important');
    node.style.setProperty('text-overflow', 'clip', 'important');
  });

  flexShrinks.forEach((node) => {
    node.style.setProperty('min-width', 'max-content', 'important');
    node.style.setProperty('flex-shrink', '0', 'important');
  });

  targets.forEach((node) => {
    node.style.setProperty('max-height', 'none', 'important');
    node.style.setProperty('height', 'auto', 'important');
    node.style.setProperty('overflow-y', 'visible', 'important');
    node.style.setProperty('overflow-x', 'visible', 'important');
    node.style.setProperty('overflow', 'visible', 'important');
    node.style.setProperty('max-width', 'none', 'important');
  });
  
  tables.forEach((node) => {
    node.style.setProperty('width', 'max-content', 'important');
    node.style.setProperty('min-width', 'max-content', 'important');
    node.style.setProperty('max-width', 'none', 'important');
  });
  
  cells.forEach((node) => {
    node.style.setProperty('white-space', 'nowrap', 'important');
  });

  ignoreElements.forEach((node) => {
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('opacity', '0', 'important');
  });

  const isChart = element.querySelector('.recharts-wrapper') !== null;
  
  element.classList.add('is-exporting');

  // To avoid huge whitespace on table exports, we can shrink-wrap it to max-content
  element.style.setProperty('display', 'inline-flex', 'important');
  element.style.setProperty('flex-direction', 'column', 'important');
  element.style.setProperty('width', 'max-content', 'important');
  element.style.setProperty('min-width', 'min-content', 'important');
  element.style.setProperty('max-width', 'none', 'important');
  element.style.setProperty('justify-content', 'flex-start', 'important');
  element.style.setProperty('align-items', 'stretch', 'important');

  let maxDescendantScrollWidth = 0;
  const allDescendants = Array.from(element.querySelectorAll<HTMLElement>('*'));
  allDescendants.forEach(child => {
    if (child.scrollWidth > maxDescendantScrollWidth) {
      maxDescendantScrollWidth = child.scrollWidth;
    }
  });

  let targetWidth = Math.max(element.scrollWidth, maxDescendantScrollWidth);

  // If it is a chart and it collapsed, or we just want charts to be wide:
  if (isChart && targetWidth < 800) {
    // Restore the block layout temporarily to measure its natural full width
    element.style.setProperty('display', 'flex', 'important');
    element.style.setProperty('width', '100%', 'important');
    element.style.setProperty('min-width', '100%', 'important');
    const fullScrollWidth = Math.max(element.scrollWidth, maxDescendantScrollWidth);
    targetWidth = Math.max(fullScrollWidth, 800);
  }

  // Now apply the final decided targetWidth
  element.style.setProperty('display', 'inline-flex', 'important');
  element.style.setProperty('flex-direction', 'column', 'important');
  element.style.setProperty('width', `${targetWidth}px`, 'important');
  element.style.setProperty('min-width', `${targetWidth}px`, 'important');
  element.style.setProperty('padding-bottom', '32px', 'important');

  return () => {
    originalStyles.forEach((styleObj) => {
      styleObj.node.style.maxHeight = styleObj.maxHeight;
      styleObj.node.style.height = styleObj.height;
      styleObj.node.style.overflowY = styleObj.overflowY;
      styleObj.node.style.overflowX = styleObj.overflowX;
      styleObj.node.style.overflow = styleObj.overflow;
      styleObj.node.style.display = styleObj.display;
      styleObj.node.style.width = styleObj.width;
      styleObj.node.style.minWidth = styleObj.minWidth;
      styleObj.node.style.maxWidth = styleObj.maxWidth;
      styleObj.node.style.paddingBottom = styleObj.paddingBottom;
    });
    originalTableStyles.forEach((styleObj) => {
      styleObj.node.style.width = styleObj.width;
      styleObj.node.style.minWidth = styleObj.minWidth;
      styleObj.node.style.maxWidth = styleObj.maxWidth;
    });
    originalCellStyles.forEach((styleObj) => {
       styleObj.node.style.whiteSpace = styleObj.whiteSpace;
    });
    originalIgnoreStyles.forEach((styleObj) => {
      styleObj.node.style.display = styleObj.display;
      styleObj.node.style.opacity = styleObj.opacity;
    });
    originalTruncateStyles.forEach((styleObj) => {
      styleObj.node.style.whiteSpace = styleObj.whiteSpace;
      styleObj.node.style.overflow = styleObj.overflow;
      styleObj.node.style.textOverflow = styleObj.textOverflow;
    });
    originalFlexShrinks.forEach((styleObj) => {
      styleObj.node.style.minWidth = styleObj.minWidth;
      styleObj.node.style.flexShrink = styleObj.flexShrink;
    });
    element.classList.remove('is-exporting');
  };
};
