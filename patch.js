const fs = require('fs');
const content = fs.readFileSync('src/lib/dom-utils.ts', 'utf8');

const newContent = content.replace(
  "element.classList.add('is-exporting');",
  `element.classList.add('is-exporting');
  
  // Force SVG clip-paths and masks to be removed during export
  // modern-screenshot sometimes fails to resolve local svg URL references
  const svgElements = Array.from(element.querySelectorAll('svg'));
  const originalSvgStyles = [];
  
  svgElements.forEach(svg => {
    const paths = Array.from(svg.querySelectorAll('path, .recharts-layer, .recharts-area-area, .recharts-line-curve, .recharts-area-curve, .recharts-line'));
    paths.forEach(node => {
      originalSvgStyles.push({
        node,
        clipPath: node.style.clipPath,
        mask: node.style.mask,
        clipPathAttr: node.getAttribute('clip-path'),
        maskAttr: node.getAttribute('mask'),
        strokeDasharray: node.style.strokeDasharray,
        strokeDashoffset: node.style.strokeDashoffset,
      });
      node.style.setProperty('clip-path', 'none', 'important');
      node.style.setProperty('mask', 'none', 'important');
      node.style.setProperty('stroke-dasharray', 'none', 'important');
      node.style.setProperty('stroke-dashoffset', '0', 'important');
      node.removeAttribute('clip-path');
      node.removeAttribute('mask');
    });
  });`
).replace(
  "element.classList.remove('is-exporting');",
  `element.classList.remove('is-exporting');
    
    originalSvgStyles.forEach((styleObj) => {
      styleObj.node.style.clipPath = styleObj.clipPath;
      styleObj.node.style.mask = styleObj.mask;
      styleObj.node.style.strokeDasharray = styleObj.strokeDasharray;
      styleObj.node.style.strokeDashoffset = styleObj.strokeDashoffset;
      if (styleObj.clipPathAttr) styleObj.node.setAttribute('clip-path', styleObj.clipPathAttr);
      if (styleObj.maskAttr) styleObj.node.setAttribute('mask', styleObj.maskAttr);
    });`
);

fs.writeFileSync('src/lib/dom-utils.ts', newContent);
