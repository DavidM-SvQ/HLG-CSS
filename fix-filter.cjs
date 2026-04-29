const fs = require('fs');

function fixFiles(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Let's remove the broken filters first
  content = content.replace(/filter: \(node\) => !node\.classList \|\| \(node\.classList && !node\.classList\.contains\("copy-button-ignore"\)\),?/g, '');
  
  // Then we properly add the filter using HTMLElement type to satisfy TS
  // We'll target `scale: 3,` and replace it with `scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),`
  
  // But wait, what if there's an existing filter? I should remove any `filter: (node: any) => ...` as well just in case.
  content = content.replace(/filter:\s*\(node: any\)\s*=>\s*!\(node\.classList\s*&&\s*node\.classList\.contains\("copy-button-ignore"\)\),?/g, '');
  content = content.replace(/filter:\s*\(node\)\s*=>[^,]*,?/g, '');

  content = content.replace(/scale:\s*3,/g, 'scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),');

  fs.writeFileSync(file, content);
}

['src/SeasonReportView.tsx', 'src/MonthlyReportView.tsx', 'src/App.tsx'].forEach(fixFiles);
console.log('Fixed files');
