const fs = require('fs');

const code = fs.readFileSync('race_tmp.txt', 'utf8');

// Find all words that look like variables
const words = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
const uniqueWords = [...new Set(words)];

// List of built-ins and keywords
const ignore = new Set([
  'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'function', 'true', 'false', 'null', 'undefined',
  'import', 'export', 'default', 'className', 'key', 'map', 'filter', 'reduce', 'push', 'sort', 'includes', 'length',
  'Math', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'console', 'document', 'window', 'React',
  'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h2', 'h3', 'h4', 'p', 'button', 'svg', 'path',
  'text', 'bg', 'border', 'flex', 'font', 'p', 'm', 'w', 'h', 'px', 'py', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
  'pt', 'pb', 'pl', 'pr', 'items', 'justify', 'gap', 'rounded', 'shadow', 'text', 'line', 'hover', 'transition',
  'duration', 'cursor', 'uppercase', 'lowercase', 'capitalize', 'truncate', 'break', 'whitespace', 'overflow',
  'hidden', 'visible', 'scroll', 'auto', 'relative', 'absolute', 'fixed', 'sticky', 'top', 'bottom', 'left', 'right',
  'z', 'opacity', 'blend', 'filter', 'backdrop', 'blur', 'scale', 'rotate', 'translate', 'skew', 'origin',
  'col', 'row', 'grid', 'flex', 'inline', 'block', 'hidden', 'visible', 'collapse', 'separate', 'spacing', 'none',
  'from', 'to', 'via', 'via', 'ring', 'outline', 'bold', 'semibold', 'medium', 'normal', 'light', 'thin',
  'black', 'white', 'gray', 'red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'transparent', 'current',
  'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', 'vw', 'vh', 'rem', 'em', 'px',
  'align', 'baseline', 'stretch', 'center', 'start', 'end', 'between', 'around', 'evenly', 'wrap', 'nowrap',
  't', 'b', 'l', 'r', 'x', 'y', 'in', 'out', 'up', 'down', 'left', 'right', 'width', 'height', 'max', 'min',
  'as', 'of', 'new', 'typeof', 'instanceof', 'void', 'delete', 'yield', 'await', 'async', 'try', 'catch', 'finally',
  'throw', 'switch', 'case', 'default', 'break', 'continue', 'do', 'while', 'for', 'in', 'of', 'with', 'class',
  'extends', 'super', 'this', 'get', 'set', 'static', 'public', 'private', 'protected', 'implements', 'interface',
  'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'async', 'await', 'eval', 'arguments', 'require',
  'exports', 'module', 'process', 'global', 'Buffer', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'setImmediate', 'clearImmediate', 'isNaN', 'isFinite', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent',
  'keys', 'values', 'entries', 'assign', 'freeze', 'seal', 'preventExtensions', 'isExtensible', 'isSealed', 'isFrozen',
  'Array', 'String', 'Number', 'Boolean', 'RegExp', 'Date', 'Error', 'EvalError', 'RangeError', 'ReferenceError',
  'SyntaxError', 'TypeError', 'URIError', 'JSON', 'Math', 'console', 'Intl',
  'any', 'string', 'number', 'boolean', 'Record', 'idx', 'r', 'c', 'v', 'i', 'j', 'k'
]);

const locals = new Set();
const potentialDeps = new Set();

const lines = code.split('\n');
lines.forEach(line => {
  // Rough local declarations
  const declMatch = line.match(/(const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g);
  if (declMatch) {
    declMatch.forEach(m => {
       const v = m.replace(/const|let|var|=| /g, '');
       locals.add(v);
    });
  }
  // catch destructuring (const { a, b } = ...)
  const destMatch = line.match(/(const|let|var)\s+\{\s*([^}]+)\s*\}/);
  if (destMatch) {
     destMatch[2].split(',').forEach(v => locals.add(v.trim()));
  }
});

for (let w of uniqueWords) {
  if (!ignore.has(w) && !locals.has(w)) {
     potentialDeps.add(w);
  }
}

console.log("Locals found:", locals.size);
console.log("Potential DEPs:");
console.log([...potentialDeps].filter(x => !x.match(/^[0-9]+$/)).slice(0, 50).join(', '));
