const fs = require('fs');
const content = fs.readFileSync('src/components/tabs/admin/AdminDatosV2Tab.tsx', 'utf8');

const magicString = '))}import React';
const splitIndex = content.indexOf(magicString);

if (splitIndex === -1) {
  console.log("Could not find magic string");
  process.exit(1);
}

const originalContent = content.substring(splitIndex + 3);
fs.writeFileSync('src/components/tabs/admin/AdminDatosV2Tab.tsx', originalContent, 'utf8');
console.log("Restored original file.");
