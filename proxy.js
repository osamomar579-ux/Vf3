module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-replicate-key,x-replicate-path");
  if (req.method === "OPTIONS") return res.status(200).end();

  const key = req.headers["x-replicate-key"] || process.env.REPLICATE_API_KEY || "";
  if (!key.startsWith("r8_")) return res.status(401).json({ error: "Bad API key" });

  const path = req.headers["x-replicate-path"] || "";
  if (!path) return res.status(400).json({ error: "Missing path" });

  try {
    const r = await fetch(`https://api.replicate.com/v1/${path}`, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(req.method === "POST" ? { Prefer: "wait=5" } : {}),
      },
      ...(req.method === "POST" && req.body ? { body: JSON.stringify(req.body) } : {}),
    });
    const d = await r.json();
    return res.status(r.status).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
