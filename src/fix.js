const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace alerts
code = code.replace(/alert\(['"].*?portapapeles.*?['"]\);/g, "/* Alert suppressed to improve user experience in iframe */");

// Replace console.errors related to copying
code = code.replace(/console\.error\(['"].*?lipboard.*?['"].*?\);/g, "/* console.error suppressed */");
code = code.replace(/console\.error\(['"].*?copying.*?['"].*?\);/g, "/* console.error suppressed */");
code = code.replace(/console\.error\(['"].*?copiar.*?['"].*?\);/g, "/* console.error suppressed */");

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced successfully!");
