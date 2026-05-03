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
    paddingBottom: node.style.paddingBottom,
  }));
  
  const originalTableStyles = tables.map((node) => ({
    node,
    width: node.style.width,
    minWidth: node.style.minWidth,
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

  targets.forEach((node) => {
    node.style.setProperty('max-height', 'none', 'important');
    node.style.setProperty('height', 'auto', 'important');
    node.style.setProperty('overflow-y', 'visible', 'important');
    node.style.setProperty('overflow-x', 'visible', 'important');
    node.style.setProperty('overflow', 'visible', 'important');
  });
  
  tables.forEach((node) => {
    node.style.setProperty('width', 'max-content', 'important');
    node.style.setProperty('min-width', 'max-content', 'important');
  });
  
  cells.forEach((node) => {
    node.style.setProperty('white-space', 'nowrap', 'important');
  });

  ignoreElements.forEach((node) => {
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('opacity', '0', 'important');
  });

  const scrollWidth = element.scrollWidth;
  const targetWidth = Math.max(scrollWidth, 800);

  element.style.setProperty('display', 'inline-block', 'important');
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
      styleObj.node.style.paddingBottom = styleObj.paddingBottom;
    });
    originalTableStyles.forEach((styleObj) => {
      styleObj.node.style.width = styleObj.width;
      styleObj.node.style.minWidth = styleObj.minWidth;
    });
    originalCellStyles.forEach((styleObj) => {
       styleObj.node.style.whiteSpace = styleObj.whiteSpace;
    });
    originalIgnoreStyles.forEach((styleObj) => {
      styleObj.node.style.display = styleObj.display;
      styleObj.node.style.opacity = styleObj.opacity;
    });
  };
};
