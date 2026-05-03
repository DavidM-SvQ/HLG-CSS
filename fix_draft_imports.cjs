const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

const additionalImports = `
import { ChevronDown, ChevronUp, Copy, CheckCircle2, UploadCloud, Activity, FileText, Download, HelpCircle, ArrowUpDown, BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { expandNodeForCapture } from '../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';
`;

code = code.replace(
  "import { Search, Minimize2, Maximize2, X, Filter } from 'lucide-react';",
  "import { Search, Minimize2, Maximize2, X, Filter } from 'lucide-react';" + additionalImports
);

code = code.replace(
  "export interface DraftViewProps {",
  "export interface DraftViewProps {\n  leaderboard: any;\n  getFlagEmoji: any;\n  teamToPlayerMap: any;\n  playerOrderMap: any;"
);

code = code.replace(
  "allRaces\n}) => {",
  "allRaces,\n  leaderboard,\n  getFlagEmoji,\n  teamToPlayerMap,\n  playerOrderMap\n}) => {"
);

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log('DraftView imports fixed.');
