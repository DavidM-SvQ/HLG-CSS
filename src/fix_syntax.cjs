const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the broken joins
code = code.split(');});').join('');
code = code.split(');});').join('');

// the easiest way is to target the end of unscored and undebuted
// First undebuted:
const matchUndebuted = `                                            {c.dias}
                                          </td>
                                        </tr>
                                      ));`;
// Let's just find and replace them all properly by returning to original and fixing it.
// Actually I don't know what they look like currently.
