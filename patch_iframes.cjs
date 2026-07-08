const fs = require('fs');

const path = 'src/components/tabs/admin/AdminDatosV2Tab.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `  const [expandedIframes, setExpandedIframes] = useState<Record<string, boolean>>({ resultados: true });`;
const replacement1 = `  const [expandedIframes, setExpandedIframes] = useState<Record<string, boolean>>({});`;

content = content.replace(target1, replacement1);
fs.writeFileSync(path, content, 'utf8');
console.log("Patched iframes successfully");
