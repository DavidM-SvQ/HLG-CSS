const fs = require('fs');
const path = require('path');

function replaceIcons(content, filePath) {
  let changed = false;

  // Replacements Map
  // Cases to replace '<Copy ' with '<Camera '
  // We need to be careful: only if it's for 'Copiar imagen' or 'Copiar gráfico como imagen' or 'Copiar al portapapeles' or 'Copiar completa'
  // But wait, it's easier to just blindly replace `<Copy className=` with `<Camera className=` if the file is one of the list EXCEPT for ExportToolbar text.
  // Actually, let's look at ExportToolbar. ExportToolbar has `<Copy className={textCopyLabel ? ...}`. We can skip ExportToolbar for `<Copy`.

  if (!filePath.includes('ExportToolbar.tsx')) {
    if (content.includes('<Copy className')) {
      content = content.replace(/<Copy className/g, '<Camera className');
      changed = true;
    }
  }

  if (content.includes('<Download className')) {
    content = content.replace(/<Download className/g, '<CloudDownload className');
    changed = true;
  }

  if (changed) {
    // Add imports
    const importMatch = content.match(/import \{(.*?)\} from "lucide-react";/);
    if (importMatch) {
      let imports = importMatch[1].split(',').map(s => s.trim());
      if (content.includes('<Camera') && !imports.includes('Camera')) {
        imports.push('Camera');
      }
      if (content.includes('<CloudDownload') && !imports.includes('CloudDownload')) {
        imports.push('CloudDownload');
      }
      // Re-build import
      const newImport = `import { ${imports.join(', ')} } from "lucide-react";`;
      content = content.replace(importMatch[0], newImport);
    }
  }

  return { content, changed };
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const origResult = fs.readFileSync(fullPath, 'utf-8');
      const { content, changed } = replaceIcons(origResult, fullPath);
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
