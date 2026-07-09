const originalLine = " 1	 Pogacar Tadej	1	11593	 UAE Team Emirates-XRG	Mostrar más";
const trimLine = originalLine.trim();
const match = trimLine.match(/^([0-9]+[a-zA-Z]?)[^\w]/);
console.log("Trimmed:", trimLine);
console.log("Match:", match);
