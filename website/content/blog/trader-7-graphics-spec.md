# Trader-7 Blog Post — Graphics Specifications

**Target file size:** <100KB each (PNG or WebP preferred)
**Dimensions:** 1200x675px (16:9, good for social sharing + blog)
**Style:** Dark theme to match trading vibe, clean/minimal, no gradients or 3D effects

---

## Graphic 1: Stop Width Comparison (HERO IMAGE)

**Purpose:** Instantly show the gap between our AI's stops and professional standard

**Type:** Horizontal bar chart

**Content:**
```
Bar 1: "Our AI (BTC)"     → 1.15% (0.78x ATR) — RED
Bar 2: "Minimum Safe"     → 1.5x ATR — YELLOW/AMBER  
Bar 3: "Professional"     → 1.5-2.0x ATR — GREEN
Bar 4: "Turtle Traders"   → 2.0x ATR — GREEN
```

**Visual notes:**
- Dark background (#1a1a2e or similar)
- Bars should be horizontal, labeled clearly
- Add a vertical dashed line at 1.5x ATR labeled "NOISE THRESHOLD"
- Our AI bar should clearly be left of that line (in the danger zone)
- Title: "Where Stops Were Set vs. Where They Should Be"

**File:** `stop-width-comparison.png`
**Size:** <80KB

---

## Graphic 2: The 57% Problem

**Purpose:** Make the probability visceral

**Type:** Donut/pie chart or simple visual

**Content:**
```
57% — "Stopped by noise" (RED)
43% — "Thesis has a chance" (GREEN/dim)
```

**Visual notes:**
- Large "57%" in center of donut
- Subtitle below: "Chance your BTC trade dies to noise within 24 hours"
- Subtext: "With 1.15% stop + 2% daily volatility"
- Dark background, red for the danger portion

**File:** `noise-stopout-probability.png`
**Size:** <50KB (simple graphic)

---

## Graphic 3: Before/After the Fix

**Purpose:** Show the mechanical improvement

**Type:** Two-panel comparison

**Content:**
```
LEFT PANEL (❌ Before):
- Candlestick snippet (3-5 candles)
- Tight stop line very close to entry
- Label: "Stop: 1.15% (inside noise band)"
- Red X or "STOPPED OUT"

RIGHT PANEL (✅ After):
- Same candles
- Wider stop line with breathing room
- Label: "Stop: 1.7% (1.5x ATR floor)"
- Green checkmark or "TRADE SURVIVES"
```

**Visual notes:**
- Split panel, clear left/right divide
- Don't need real chart data — stylized candles are fine
- Show the stop-loss line as a horizontal dashed line
- Arrow or highlight showing the "breathing room" on the right panel
- Title: "The ATR Floor Fix"

**File:** `before-after-atr-floor.png`
**Size:** <100KB

---

## Graphic 4: The Three Stopped Trades (OPTIONAL)

**Purpose:** Show the specific pattern that triggered the investigation

**Type:** Simple table or trade cards

**Content:**
```
Trade 124 | BTC LONG  | Stop: 1.18% | 3.3 hrs | -$34
Trade 125 | BTC LONG  | Stop: 1.03% | 9.1 hrs | -$8
Trade 126 | BTC SHORT | Stop: 1.13% | 7.75 hrs | -$17
                                      TOTAL: -$59
```

**Visual notes:**
- Could be styled as "trade cards" or a clean table
- Red accent for losses
- Show the pattern: all stops are ~1.1%
- Optional: small "Both directions. Same problem." caption

**File:** `three-stopped-trades.png`
**Size:** <60KB

---

## Priority Order

1. **Stop Width Comparison** — Most impactful, use as hero/social share image
2. **The 57% Problem** — Simple, shareable, makes the point fast
3. **Before/After** — Good for the "fix" section
4. **Three Trades** — Optional, the markdown table in the post may suffice

---

## Tools That Work Well

- **Canva:** Set custom dimensions (1200x675), export as PNG, use compression
- **Figma:** Great for precise layouts, export at 1x with compression
- **Excalidraw:** Good for the before/after sketch style
- **Carbon** (carbon.now.sh): If you want code-style snippets

**Compression tip:** Run final PNGs through TinyPNG or Squoosh to hit <100KB

---

## File Naming Convention

```
/images/blog/trader-7/
  stop-width-comparison.png
  noise-stopout-probability.png
  before-after-atr-floor.png
  three-stopped-trades.png (optional)
```
