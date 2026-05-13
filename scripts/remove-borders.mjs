import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else if (dirPath.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

const tableClassesToRemove = [
  'divide-y divide-neutral-100',
  'divide-y divide-neutral-200',
  'border-separate border-spacing-0',
  'border border-neutral-200 border-neutral-100 border-neutral-50', // these are sometimes clustered
];

walk('./src/components/tabs', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace divide-y divide-neutral-100 and divide-neutral-200 with space-y-1 or just nothing
  content = content.replace(/className="[^"]*(divide-y divide-neutral-100)[^"]*"/g, (match, group1) => {
    return match.replace(group1, 'divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50');
  });

  content = content.replace(/className="[^"]*(divide-y divide-neutral-200)[^"]*"/g, (match, group1) => {
    return match.replace(group1, 'divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50');
  });

  content = content.replace(/border-separate border-spacing-0 shadow-sm border border-neutral-[12]00/g, 'bg-white rounded-xl shadow-sm');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
