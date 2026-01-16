import express, { Request, Response } from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

interface PriceRequestBody {
  url: string
  priceAnchor: string
}

// Endpoint to check price
app.post("/check-price", async (req: Request, res: Response) => {
  try {
    const { url, priceAnchor } = req.body as PriceRequestBody
    if (!url || !priceAnchor) return res.status(400).json({ error: "Missing url or priceAnchor" })

    const response = await fetch(url)
    const html = await response.text()

    // Escape special regex chars in anchor
    const escapedAnchor = priceAnchor.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')
    // Match the anchor even if there are extra spaces or tags
    const regex = new RegExp(escapedAnchor.split("").join("[\\s\\S]*?"), "i")
    const match = html.match(regex)
    if (!match) return res.status(404).json({ error: "Anchor not found on page" })

    // Extract first number from matched string
    const numMatch = match[0].match(/[\d,.]+/)
    if (!numMatch) return res.status(404).json({ error: "Price number not found" })

    const price = parseFloat(numMatch[0].replace(/,/g, ""))
    res.json({ price })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to fetch page" })
  }
})

// Health check
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
