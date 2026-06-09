const line = "12 MARTINEZ Lenny";
const name1 = "martin g";
const regex = new RegExp(`\\b${name1.replace(/ /g, '\\s+')}\\b`, "i");
console.log(regex.test(line));

const name2 = "martinez lenny";
const regex2 = new RegExp(`\\b${name2.replace(/ /g, '\\s+')}\\b`, "i");
console.log(regex2.test(line));

const name3 = "van aert";
const line3 = "21 van aert wout";
const regex3 = new RegExp(`\\b${name3.replace(/ /g, '\\s+')}\\b`, "i");
console.log(regex3.test(line3));
