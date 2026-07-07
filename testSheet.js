async function main() {
  const url = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv";
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.substring(0, 100));
}
main();
