const fs = require('fs');
const appTxt = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '{/* Unscored Cyclists Table */}';
const startIdx = appTxt.indexOf(startMarker);

// Just find the </>\n                          ) : (
const regex = /(<\/div>\s*<\/div>\s*<\/>\s*\)\s*:\s*\()/;
const match = regex.exec(appTxt.substring(startIdx));

if (!match) {
  console.log('End not found');
  process.exit(1);
}

const endIdx = startIdx + match.index; // before </div

// extract and append </div>\n</div> (the two wrapping divs we're excluding by ending at match.index)
const tablesHTML = appTxt.substring(startIdx, endIdx);

let code = fs.readFileSync('src/SeasonReportView.tsx', 'utf8');
const replaceMarker = '{/* SECTION 5';
const replaceIdx = code.indexOf(replaceMarker);

if (replaceIdx !== -1) {
    code = code.substring(0, replaceIdx) + tablesHTML + "\n" + code.substring(replaceIdx);
    fs.writeFileSync('src/SeasonReportView.tsx', code);
    console.log('Tables injected correctly');
} else {
    console.log('SECTION 5 not found');
}
