const lines = [
"1	 Pogacar Tadej	1	11593	 UAE Team Emirates-XRG	Mostrar más",
"11	 Vingegaard Jonas	2	8625	 Team Visma | Lease a Bike	Mostrar más",
"2	 del Toro Isaac *	3	5340	 UAE Team Emirates-XRG	Mostrar más"
];

for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([0-9]+[a-zA-Z]?)[^\w]/) || trimmed.match(/^([0-9]+[a-zA-Z]?)$/);
    console.log(`Line: ${trimmed}`);
    console.log(`Match:`, match ? match[1] : null);
    const lineParts = line.split(/[\s\t]+/);
    const firstWord = lineParts[0].replace(/[^a-zA-Z0-9]/g, '');
    let fallback = "";
    if (/^[0-9]+[a-zA-Z]?$/.test(firstWord)) {
      fallback = firstWord;
    }
    console.log(`Fallback:`, fallback);
}
