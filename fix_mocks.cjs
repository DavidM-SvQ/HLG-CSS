const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

code = code.replace(
  "const isDraftTableCopying = false;",
  `const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);
  const handleCopyDraftTableImage = (part?: any) => {};`
);

code = code.replace(
  "const isDraftDatosTableCopying = false;",
  "const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState<string | false>(false);"
);

// handleDownloadDraftTableImage is missing
code = code.replace(
  "const handleDownloadDraftTableImage = () => {};",
  "const handleDownloadDraftTableImage = (part?: any) => {};"
);

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log('Mocks replaced with states');
