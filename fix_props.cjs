const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/draftCyclistStats=\{draftCyclistStats\}\n/g, "");
appCode = appCode.replace(/getStatColor=\{getStatColor\}\n/g, "");
appCode = appCode.replace(/monthColors=\{monthColors\}\n/g, "");
appCode = appCode.replace(/monthOrder=\{monthOrder\}\n/g, "");
appCode = appCode.replace(/allRaces=\{allRaces\}\n/g, "");
fs.writeFileSync('src/App.tsx', appCode);

// Fix DraftView.tsx
let draftCode = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');
draftCode = draftCode.replace(/import \{ ExportToolbar \} from '\.\.\/ui\/ExportToolbar';\n/g, "");
draftCode = draftCode.replace(/draftCyclistStats: any;\n/g, "");
draftCode = draftCode.replace(/getStatColor: \((.*?)\) => string;\n/g, "");
draftCode = draftCode.replace(/monthColors: any;\n/g, "");
draftCode = draftCode.replace(/monthOrder: any;\n/g, "");
draftCode = draftCode.replace(/allRaces: any;\n/g, "");

draftCode = draftCode.replace(/draftCyclistStats,\n/g, "");
draftCode = draftCode.replace(/getStatColor,\n/g, "");
draftCode = draftCode.replace(/monthColors,\n/g, "");
draftCode = draftCode.replace(/monthOrder,\n/g, "");
draftCode = draftCode.replace(/allRaces,\n/g, "");

// Remove '{publicTab === "draft" && (' and concluding ')}' from DraftView.tsx if it's there
draftCode = draftCode.replace(/\{publicTab === "draft" && \(/g, "");
draftCode = draftCode.replace(/This comparison appears to be unintentional because the types/g, ""); // well, that's just comment.

// Mock more functions and vars for DraftView
const extraMocks = `
  const isDraftDatosTableCopying = false;
  const handleCopyDraftDatosTableImage = () => {};
  const handleDownloadDraftDatosTableImage = () => {};
  const handleDownloadDraftTableImage = () => {};
  
  const getStatColor = (val: number, max: number, min: number = 0, inverted: boolean = false, allowZero: boolean = false, minNonZero: number = 0) => {
    if (val === 0 && !allowZero) return "";
    let t = 0;
    if (max > min) {
      const effectMin = allowZero ? min : minNonZero;
      t = Math.max(0, Math.min(1, (val - effectMin) / (max - effectMin)));
    }
    t = Number.isNaN(t) ? 0 : t;
    const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
    return \`bg-[\${"hsl(" + hue + ", 80%, 45%)"}] text-white\`;
  };
`;

draftCode = draftCode.replace(/const isDraftTableCopying = false;/g, "const isDraftTableCopying = false;\n" + extraMocks);

fs.writeFileSync('src/components/tabs/DraftView.tsx', draftCode);
console.log('Props and mocks fixed.');
