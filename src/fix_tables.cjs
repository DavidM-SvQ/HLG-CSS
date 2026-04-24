const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const unscoredMapOld = `                                      return filtered.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">`;

const unscoredMapNew = `                                      return filtered.map((c, idx) => {
                                        let isHiddenVisual = false;
                                        if (isUnscoredCopying) {
                                            if (isUnscoredCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isUnscoredCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        if (isHiddenVisual && isUnscoredCopying) return null;
                                        
                                        return (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">`;

code = code.replace(unscoredMapOld, unscoredMapNew);


const undebutedMapOld = `                                      return filtered.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">`;

const undebutedMapNew = `                                      return filtered.map((c, idx) => {
                                        let isHiddenVisual = false;
                                        if (isUndebutedCopying) {
                                            if (isUndebutedCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isUndebutedCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        if (isHiddenVisual && isUndebutedCopying) return null;
                                        
                                        return (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">`;

code = code.replace(undebutedMapOld, undebutedMapNew);


// We also need to fix missing '}' on those map functions where we changed from '(c, idx) => (' to '(c, idx) => {'

const unscoredFixOld = `                                            {c.dias}
                                          </td>
                                        </tr>
                                      ));`;
const unscoredFixNew = `                                            {c.dias}
                                          </td>
                                        </tr>
                                      );});`;
code = code.replace(unscoredFixOld, unscoredFixNew);

// Unfortunately there are two mappings (undebuted and unscored)
// Because my regex replacement above is generic, it might miss replacing both if they text exactly matches? Let's check with replace but ensure they hit correctly.
// Oh wait, unscored and undebuted might have exactly the same lines at the end.
const arrayEnds = code.split('</tr>\n                                      ));');
if (arrayEnds.length === 3) { // It appears twice
  code = arrayEnds.join('</tr>\n                                      );});');
}
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed missing parts');
