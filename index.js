const express = require("express");
const fetch = require("node-fetch"); // Replit includes node-fetch by default
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to check price
app.post("/check-price", async (req, res) => {
  try {
    const { url, priceAnchor } = req.body;
    if (!url || !priceAnchor) return res.status(400).json({ error: "Missing url or priceAnchor" });

    const response = await fetch(url);
    const html = await response.text();

    // Escape special regex chars in anchor
    const escapedAnchor = priceAnchor.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');
    // Match the anchor even if there are extra spaces or tags
    const regex = new RegExp(escapedAnchor.split("").join("[\\s\\S]*?"), "i");
    const match = html.match(regex);
    if (!match) return res.status(404).json({ error: "Anchor not found on page" });

    // Extract first number from matched string
    const numMatch = match[0].match(/[\d,.]+/);
    if (!numMatch) return res.status(404).json({ error: "Price number not found" });

    const price = parseFloat(numMatch[0].replace(/,/g, ""));
    res.json({ price });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
