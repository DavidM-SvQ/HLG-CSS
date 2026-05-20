const fs = require('fs');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.match(/\.(tsx|ts)$/)) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('src');
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  let inEffect = false;
  let effectLines = [];
  let depth = 0;
  
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('useEffect(')) {
      inEffect = true;
      effectLines = [];
      depth = 0;
    }
    if (inEffect) {
      effectLines.push(lines[i]);
      depth += (lines[i].match(/\{/g) || []).length;
      depth -= (lines[i].match(/\}/g) || []).length;
      
      if (depth === 0 && effectLines.length > 1) { 
         inEffect = false;
         const effectStr = effectLines.join('\n');
         const setters = effectStr.match(/set[A-Z][a-zA-Z0-9]*\(/g);
         if (setters) {
            console.log('\n--- ' + file + ':' + (i - effectLines.length + 2) + ' ---');
            console.log(effectStr);
         }
      }
    }
  }
}
