const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Adjust scale for full table download/copy based on row count
const copyOld = `      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 4,
        backgroundColor: '#ffffff',
        style: { `;
const copyNew = `      const dataUrl = await domToDataUrl(tableContainer, {
        scale: subset === 'full' ? 1.5 : 4,
        backgroundColor: '#ffffff',
        style: { `;

code = code.replace(copyOld, copyNew);
// Note: handleDownloadTopCyclistsDraft also has this snippet, let's replace globally (it appears twice in these functions).
code = code.replace(/scale: 4,\s*backgroundColor: '#ffffff',\s*style: {/g, "scale: subset === 'full' ? 1.5 : 4,\n        backgroundColor: '#ffffff',\n        style: {");


// 2. Fix hide rows manually in handleCopy/handleDownload. If a row is hidden, html-to-image might still compute a large container if not careful, OR the previous state triggers a re-render.
// Wait! `handleCopyTopCyclistsDraft` sets \`setIsTopCyclistsDraftCopying(subset || 'full')\`, which causes a re-render asynchronously. Wait! This is EXACTLY the issue!
// `domToDataUrl` starts running BEFORE React re-renders. Then WHILE `html-to-image` is asynchronously reading the DOM and waiting for images, React RE-RENDERS the component because of the state change!
// When React re-renders, it recreates the DOM nodes and disrupts html-to-image!
// To fix this, we should NOT set state at all, OR wait for it.
// Since we are applying `.hidden` manually, we CAN just remove the `setIsTopCyclistsDraftCopying` entirely for the table state, OR use it only for showing checkmarks.
// I'll add a setTimeout before capture to let React settle.

const copyStartOld = `    setIsTopCyclistsDraftCopying(subset || 'full');
    
    const tableContainer = topCyclistsDraftRef.current;
    const rows = tableContainer.querySelectorAll('.top-cyclists-row');
    const restore = expandNodeForCapture(tableContainer);`;

const copyStartNew = `    setIsTopCyclistsDraftCopying(subset || 'full');
    
    // Wait for React to re-render the button states before capturing
    await new Promise(resolve => setTimeout(resolve, 200));

    const tableContainer = topCyclistsDraftRef.current;
    if (!tableContainer) return;
    const rows = tableContainer.querySelectorAll('.top-cyclists-row');
    const restore = expandNodeForCapture(tableContainer);`;

code = code.replace(copyStartOld, copyStartNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Done fix options.');
