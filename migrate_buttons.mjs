import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.match(/<button[\s>]/) || content.includes('</button>')) {
    content = content.replace(/<button([\s>])/g, '<Button$1');
    content = content.replace(/<\/button>/g, '</Button>');
    
    if (content.includes('<Button')) {
      if (!content.includes('import { Button }')) {
        const dirPath = path.dirname(file);
        let relPath = path.relative(dirPath, 'src/components/ui/button').replace(/\\/g, '/');
        if (!relPath.startsWith('.')) {
           relPath = './' + relPath;
        }
        
        const importStmt = `import { Button } from "${relPath}";\n`;
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
        } else {
          content = importStmt + content;
        }
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
