const fs = require('fs');

let code = fs.readFileSync('src/SeasonReportView.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { Copy, FileText, Download, CheckCircle2, Maximize2, Minimize2, ClipboardList, UploadCloud } from "lucide-react";',
  'import { Copy, FileText, Download, CheckCircle2, Maximize2, Minimize2, ClipboardList, UploadCloud, UserMinus, ChevronDown, ChevronUp } from "lucide-react";'
);

// 2. Add extra props to interface
const propsStr = `interface SeasonReportViewProps {
  files: {
    carreras: any;
    puntos: any;
    elecciones: any;
    resultados: any;
  };
  leaderboard: any[] | null;
  cyclistRoundMap?: Record<string, string>;
  cyclistMetadata?: Record<string, any>;
  playerOrderMap?: Record<string, string>;
}`;
code = code.replace(/interface SeasonReportViewProps \{[\s\S]*?leaderboard:.*?\n\}/, propsStr);

// 3. Add to the component signature
code = code.replace(
  'export const SeasonReportView: React.FC<SeasonReportViewProps> = ({',
  'export const SeasonReportView: React.FC<SeasonReportViewProps> = ({\n  cyclistRoundMap = {},\n  cyclistMetadata = {},\n  playerOrderMap = {},'
);

// 4. Inject getVal and state functionality at the top of the component
const injectStates = `

  const getVal = (row: any, key: string) => {
    if (!row) return "";
    if (row[key] !== undefined) return row[key];
    const caseInsensitiveKey = Object.keys(row).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    return caseInsensitiveKey ? row[caseInsensitiveKey] : "";
  };

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = useState(false);
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useState<string>("pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>("pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = useState(false);

  const [isUnscoredCopying, setIsUnscoredCopying] = useState<string | null>(null);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<string | null>(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);

  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);

  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);

  const handleCopyUnscored = (size: string) => {};
  const handleCopyUnscoredText = () => {};
  const handleDownloadUnscored = (size: string) => {};

  const handleCopyUndebuted = (size: string) => {};
  const handleCopyUndebutedText = () => {};
  const handleDownloadUndebuted = (size: string) => {};

`;

const startIdx = code.indexOf('const selectedMonths: number[] = [];');
code = code.substring(0, startIdx) + injectStates + code.substring(startIdx);

const tablesJSX = fs.readFileSync('temp_tables.tsx', 'utf8');

const anchor = '{/* SECTION 5: Premio Panenkita {monthsText ?';
const anchorIdx = code.indexOf(anchor);

if (anchorIdx > -1) {
  code = code.substring(0, anchorIdx) + '\n' + tablesJSX + '\n' + code.substring(anchorIdx);
} else {
  console.log("Could not find SECTION 5 anchor");
}

fs.writeFileSync('src/SeasonReportView.tsx', code);
console.log("done");
