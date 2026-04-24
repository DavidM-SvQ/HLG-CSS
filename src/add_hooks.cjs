const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add refs and state for both tables
const refsHookOld = `  const detailedBreakdownRef = useRef<HTMLDivElement>(null);
  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);`;
const refsHookNew = `  const detailedBreakdownRef = useRef<HTMLDivElement>(null);
  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);
  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);`;
code = code.replace(refsHookOld, refsHookNew);

const statesHookOld = `  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | null>(null);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = useState(false);
  
  const [isChartExpanded, setIsChartExpanded] = useState(false);`;
const statesHookNew = `  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | null>(null);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = useState(false);
  const [isUnscoredCopying, setIsUnscoredCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | null>(null);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | null>(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);
  
  const [isChartExpanded, setIsChartExpanded] = useState(false);`;
code = code.replace(statesHookOld, statesHookNew);

const expandHookOld = `  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);`;
const expandHookNew = `  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = useState(false);
  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);`;
code = code.replace(expandHookOld, expandHookNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Done hooks additions.');
