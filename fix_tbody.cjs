const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const badPart = "                          {uniqueTeams.map((t) => (\n                            <option key={t} value={t}>\n                              {t}\n                            </option>\n  \n                          );\n                        })}\n                        {rowVirtualizer.getVirtualItems().length > 0 && (\n                          <tr>\n                            <td colSpan={8} style={{ height: rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end }} />\n                          </tr>\n                        )}";
const goodPart = "                          {uniqueTeams.map((t) => (\n                            <option key={t} value={t}>\n                              {t}\n                            </option>\n                          ))}";

code = code.replace(badPart, goodPart);

const targetTBodyEnd = "                          </tr>\n                        ))}\n                      </tbody>";
const targetTbodyGood = "                          </tr>\n                        );\n                        })}\n                        {rowVirtualizer.getVirtualItems().length > 0 && (\n                          <tr>\n                            <td colSpan={8} style={{ height: rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end }} />\n                          </tr>\n                        )}\n                      </tbody>";

code = code.replace(targetTBodyEnd, targetTbodyGood);
fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
console.log('Fixed');
