export default async function handler(req: any, res: any) {
  const sheetUrl = req.query.url;

  if (!sheetUrl) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with status ${response.status}`);
    }
    const data = await response.text();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(data);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: error.message || "Failed to fetch spreadsheet data" });
  }
}
