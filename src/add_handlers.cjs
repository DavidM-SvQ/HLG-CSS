const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handlers = `

  const handleCopyUnscoredText = async () => {
    if (!unscoredTableRef.current || isUnscoredTextCopying) return;
    setIsUnscoredTextCopying(true);
    const table = unscoredTableRef.current.querySelector('table');
    if (!table) { setIsUnscoredTextCopying(false); return; }
    const rows = Array.from(table.rows);
    const text = rows.map((row: any) => Array.from(row.cells).map((cell: any) => cell.innerText.trim()).join('\\t')).join('\\n');
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsUnscoredTextCopying(false), 2000);
  };

  const handleCopyUnscored = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4') => {
    if (!unscoredTableRef.current || isUnscoredCopying) return;
    setIsUnscoredCopying(subset || 'full');
    await new Promise(resolve => setTimeout(resolve, 200));
    const tableContainer = unscoredTableRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);
    
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: subset === 'full' ? 1.5 : 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible', textRendering: 'optimizeLegibility' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      if (typeof ClipboardItem !== 'undefined') {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch(e) { throw e; }
        setTimeout(() => setIsUnscoredCopying(null), 2000);
      } else throw new Error('ClipboardItem not supported');
    } catch (err) {
      setIsUnscoredCopying(null);
      handleDownloadUnscored(subset);
    } finally {
      restore();
    }
  };

  const handleDownloadUnscored = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4') => {
    if (!unscoredTableRef.current) return;
    const tableContainer = unscoredTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: subset === 'full' ? 1.5 : 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible', textRendering: 'optimizeLegibility' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = (subset && subset !== 'full') ? \`-\${subset}\` : '';
      link.download = \`ciclistas-sin-puntuar\${suffix}.png\`;
      link.click();
    } catch(err) {} finally {
      restore();
    }
  };

  const handleCopyUndebutedText = async () => {
    if (!undebutedTableRef.current || isUndebutedTextCopying) return;
    setIsUndebutedTextCopying(true);
    const table = undebutedTableRef.current.querySelector('table');
    if (!table) { setIsUndebutedTextCopying(false); return; }
    const rows = Array.from(table.rows);
    const text = rows.map((row: any) => Array.from(row.cells).map((cell: any) => cell.innerText.trim()).join('\\t')).join('\\n');
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsUndebutedTextCopying(false), 2000);
  };

  const handleCopyUndebuted = async (subset?: 'full' | 'p1' | 'p2') => {
    if (!undebutedTableRef.current || isUndebutedCopying) return;
    setIsUndebutedCopying(subset || 'full');
    await new Promise(resolve => setTimeout(resolve, 200));
    const tableContainer = undebutedTableRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);
    
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible', textRendering: 'optimizeLegibility' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      if (typeof ClipboardItem !== 'undefined') {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch(e) { throw e; }
        setTimeout(() => setIsUndebutedCopying(null), 2000);
      } else throw new Error('ClipboardItem not supported');
    } catch (err) {
      setIsUndebutedCopying(null);
      handleDownloadUndebuted(subset);
    } finally {
      restore();
    }
  };

  const handleDownloadUndebuted = async (subset?: 'full' | 'p1' | 'p2') => {
    if (!undebutedTableRef.current) return;
    const tableContainer = undebutedTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible', textRendering: 'optimizeLegibility' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = (subset && subset !== 'full') ? \`-\${subset}\` : '';
      link.download = \`ciclistas-sin-debutar\${suffix}.png\`;
      link.click();
    } catch(err) {} finally {
      restore();
    }
  };
`;

code = code.replace('  const handleCopyCyclists = async () => {', handlers + '\n  const handleCopyCyclists = async () => {');

fs.writeFileSync('src/App.tsx', code);
console.log('Added handlers successfully');
