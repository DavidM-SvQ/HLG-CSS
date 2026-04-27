import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// remove my line 2 insertion
const badLineRe = /^import \{ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis \} from "recharts";\r?\n/m;
content = content.replace(badLineRe, "");

// Add AreaChart, Area, ComposedChart, Tooltip as RechartsTooltip inside the existing import
const existingRecharts = /import \{\s*BarChart,\s*Bar,\s*XAxis,\s*YAxis,\s*Tooltip,\s*ResponsiveContainer,\s*Cell,\s*CartesianGrid,\s*LabelList,\s*LineChart,\s*Line,\s*Legend,\s*ScatterChart,\s*Scatter,\s*ZAxis,\s*ReferenceLine,\s*ReferenceArea,\s*\}\s*from\s*"recharts";/;

const newRecharts = `import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  ReferenceArea,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";`;

content = content.replace(existingRecharts, newRecharts);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
