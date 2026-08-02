const roundTeamPoints = { "1": 1, "0": 2, "FA": 3, "2": 4 };
const allRounds = Array.from(new Set(Object.keys(roundTeamPoints))).sort((a,b) => parseInt(a) - parseInt(b));
console.log(allRounds);
