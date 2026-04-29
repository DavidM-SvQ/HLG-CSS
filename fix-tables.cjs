const fs = require('fs');

const files = ['src/App.tsx', 'src/SeasonReportView.tsx', 'src/MonthlyReportView.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const chunks = content.split('<table');
  if (chunks.length > 1) {
    let newContent = chunks[0];
    for (let i = 1; i < chunks.length; i++) {
       const chunk = chunks[i];
       const beforeTableText = newContent.slice(-50);
       
       if (beforeTableText.includes('table-responsive-wrapper')) {
           newContent += '<table' + chunk;
       } else {
           let modifiedChunk = chunk.replace('</table>', '</table></div>');
           newContent += '<div className="table-responsive-wrapper overflow-x-auto w-full"><table' + modifiedChunk;
       }
    }
    fs.writeFileSync(file, newContent);
  }
});

console.log('Tables wrapped securely');
