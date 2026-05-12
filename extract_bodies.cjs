const fs = require('fs');
const content = fs.readFileSync('src/components/tabs/draft/DraftDatos_points.tsx', 'utf-8');
const lines = content.split('\n');
const componentBody = lines.slice(363, 844).join('\n');
fs.writeFileSync('src/components/tabs/draft/PointsComponentBody.txt', componentBody);

const summaryContent = fs.readFileSync('src/components/tabs/draft/DraftDatos_summary.tsx', 'utf-8');
const summaryLines = summaryContent.split('\n');
fs.writeFileSync('src/components/tabs/draft/SummaryComponentBody.txt', summaryContent);

const chartContent = fs.readFileSync('src/components/tabs/draft/DraftDatos_chart.tsx', 'utf-8');
const chartLines = chartContent.split('\n');
fs.writeFileSync('src/components/tabs/draft/ChartComponentBody.txt', chartContent);
