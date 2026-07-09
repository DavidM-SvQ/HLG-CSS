fetch("https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv")
.then(res => console.log("export OK:", res.ok))
.catch(err => console.log("export error:", err));

fetch("https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub?output=csv")
.then(res => console.log("pub OK:", res.ok))
.catch(err => console.log("pub error:", err));
