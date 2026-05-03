import fs from 'fs';

function checkFile(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    console.log(filename, "filter calls:", (content.match(/\.filter\(/g) || []).length);
    console.log(filename, "useMemo calls:", (content.match(/useMemo\(/g) || []).length);
}

checkFile('src/components/tabs/DraftView.tsx');
checkFile('src/components/tabs/TeamView.tsx');
checkFile('src/components/tabs/RaceView.tsx');
checkFile('src/App.tsx');
