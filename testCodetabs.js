import fetch from 'node-fetch';

async function main() {
  const docId = "1imDY8fCIlJkRNlDLPzumsa4oCXuLAcG8rqEsA5CfpTQ";
  const gid = "1739088392";

  const targetUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;

  console.log("Fetching via api.codetabs.com...");
  const res = await fetch(proxyUrl);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Content length:", text.length);
  console.log("Includes DNF?", text.includes("DNF"));
  console.log("Includes DNS?", text.includes("DNS"));
}

main();
