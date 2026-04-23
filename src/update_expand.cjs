const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const expandNodeOld = `    targets.forEach(node => {
      originalStyles.push({
        node,
        maxHeight: node.style.maxHeight,
        overflowY: node.style.overflowY,
        overflowX: node.style.overflowX,
        overflow: node.style.overflow
      });
      node.style.setProperty('max-height', 'none', 'important');
      node.style.setProperty('overflow-y', 'visible', 'important');
      node.style.setProperty('overflow-x', 'visible', 'important');
      node.style.setProperty('overflow', 'visible', 'important');
    });

    const originalElementStyle = {
      display: element.style.display,
      width: element.style.width,
      minWidth: element.style.minWidth,
      background: element.style.background
    };
    
    element.style.setProperty('display', 'inline-block', 'important');
    element.style.setProperty('width', 'auto', 'important');
    element.style.setProperty('min-width', '100%', 'important');
    if (!element.style.background && !element.style.backgroundColor) {
      element.style.setProperty('background', '#ffffff', 'important');
    }

    return () => {
      originalStyles.forEach(({ node, maxHeight, overflowY, overflowX, overflow }) => {
        node.style.maxHeight = maxHeight;
        node.style.overflowY = overflowY;
        node.style.overflowX = overflowX;
        node.style.overflow = overflow;
      });
      
      element.style.display = originalElementStyle.display;
      element.style.width = originalElementStyle.width;
      element.style.minWidth = originalElementStyle.minWidth;
      element.style.background = originalElementStyle.background;
    };`;

const expandNodeNew = `    targets.forEach(node => {
      originalStyles.push({
        node,
        maxHeight: node.style.maxHeight,
        height: node.style.height,
        overflowY: node.style.overflowY,
        overflowX: node.style.overflowX,
        overflow: node.style.overflow
      } as any);
      node.style.setProperty('max-height', 'none', 'important');
      node.style.setProperty('height', 'auto', 'important');
      node.style.setProperty('overflow-y', 'visible', 'important');
      node.style.setProperty('overflow-x', 'visible', 'important');
      node.style.setProperty('overflow', 'visible', 'important');
    });

    const originalElementStyle = {
      display: element.style.display,
      width: element.style.width,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      minWidth: element.style.minWidth,
      background: element.style.background
    };
    
    element.style.setProperty('display', 'inline-block', 'important');
    element.style.setProperty('width', 'auto', 'important');
    element.style.setProperty('height', 'auto', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    element.style.setProperty('min-width', '100%', 'important');
    if (!element.style.background && !element.style.backgroundColor) {
      element.style.setProperty('background', '#ffffff', 'important');
    }

    return () => {
      originalStyles.forEach(({ node, maxHeight, height, overflowY, overflowX, overflow }: any) => {
        node.style.maxHeight = maxHeight;
        node.style.height = height;
        node.style.overflowY = overflowY;
        node.style.overflowX = overflowX;
        node.style.overflow = overflow;
      });
      
      element.style.display = originalElementStyle.display;
      element.style.width = originalElementStyle.width;
      element.style.height = originalElementStyle.height;
      element.style.maxHeight = originalElementStyle.maxHeight;
      element.style.minWidth = originalElementStyle.minWidth;
      element.style.background = originalElementStyle.background;
    };`;

code = code.replace(expandNodeOld, expandNodeNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Done expanding.');
