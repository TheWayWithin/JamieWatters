# Twitter/X Thread: Trader-7 Stop-Loss Deep Dive

**Ready to post — 8 tweets**

---

**Tweet 1 (Hook):**
My AI trading agent is smart enough to find profitable trades.

It's not smart enough to set stop-losses.

3 consecutive BTC trades stopped by noise. Here's what the math revealed and how 19 lines of code fixed it 🧵

---

**Tweet 2:**
The pattern:

Trade 124: BTC LONG, 1.18% stop → stopped in 3.3 hrs (-$34)
Trade 125: BTC LONG, 1.03% stop → stopped in 9.1 hrs (-$8)
Trade 126: BTC SHORT, 1.13% stop → stopped in 7.75 hrs (-$17)

Same problem. Both directions.

---

**Tweet 3:**
Pulled 103 signals from the logs.

76% of BTC signals had stops BELOW the 1.5% minimum we asked for.

Median BTC stop: 1.165%

That's 1.0x ATR — the average range of a single hourly candle.

Our trades hold 3-48 hours. The math doesn't work.

---

**Tweet 4 (the viral one):**
I did the math:

1.15% stop + 2% daily sigma = 57% chance of noise stop-out in 24 hours.

Coin-flip odds your trade dies before your thesis plays out.

Professional standard: 1.5-2.0x ATR
Turtle Traders: 2.0x ATR
Our AI: 0.78x ATR

---

**Tweet 5:**
The fix: 19 lines of code.

After the LLM generates a signal, check if stop is tighter than 1.5x ATR.

If yes → widen it, recalculate stop price.

If wider stop makes TP unrealistic → trade gets rejected.

Correct outcome. Bad risk parameters = no trade.

---

**Tweet 6:**
The lesson for AI builders:

Telling your LLM "stops must be 1.5-4.0%" doesn't work. It ignored us 76% of the time.

Prompt engineering has limits.
Programmatic guardrails don't.

Don't trust AI outputs. Verify them. Enforce them.

---

**Tweet 7:**
Trader-7 after 11 days (paper trading):

+$271 (+9.0%) on $3k
32 trades | 43.8% win rate
Sharpe: 4.21

Win rate dipped but still above the 25% break-even for 3:1 R:R.

The stop-width fix should help.

---

**Tweet 8 (CTA):**
Some problems don't need more data — they need more math.

57% noise stop-out probability isn't a "wait and see" problem. It's a design flaw you can prove with arithmetic.

Full write-up on my blog: [LINK]

#buildinpublic #crypto #AI
