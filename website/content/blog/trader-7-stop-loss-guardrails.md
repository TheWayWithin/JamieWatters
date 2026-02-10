# Your AI Is Smart Enough to Find Trades. It's Not Smart Enough to Set Stop-Losses.

**Date**: February 10, 2026  
**Author**: Jamie Watters  
**Project**: Trader-7 — An LLM-Powered Crypto Trading System

---

Three trades. Three stop-outs. $59 gone to noise.

| Trade | Direction | Stop Width | Duration | Result |
|-------|-----------|-----------|----------|--------|
| 124 | LONG | 1.18% | 3.3 hours | Stopped out (-$34) |
| 125 | LONG | 1.03% | 9.1 hours | Stopped out (-$8) |
| 126 | SHORT | 1.13% | 7.75 hours | Stopped out (-$17) |

Three different trades. Two different directions. Same result: price wiggled through the stop before the thesis had time to play out.

Meanwhile, ETH and XRP trades — with slightly wider stops — were closing as winners.

Something was systematically wrong with how our AI placed BTC stops.

---

## Where Trader-7 Stands (Day 11)

| Metric | Value |
|--------|-------|
| Starting Capital | $3,000 |
| Current P&L | **+$271.42 (+9.0%)** |
| Total Trades | 32 completed |
| Win Rate | 43.8% |
| Sharpe Ratio | 4.21 |

Still paper trading. But the losses revealed something worth fixing.

---

## What the Data Showed

I pulled 103 signals from the logs. The finding was damning:

**76% of BTC signals violated the prompt's own 1.5% minimum stop constraint.**

DeepSeek V3.2 — our signal generator — was placing BTC stops at a median of 1.165%. That's roughly **1.0x ATR** — the average amount BTC moves in a single hourly candle.

Our trades hold for 3-48 hours. See the problem?

---

## The Math That Proves It

With a 1.15% stop and ~2% daily volatility, the probability of a noise-driven stop-out within 24 hours is approximately **57%**.

Your trade has a coin-flip chance of dying before your thesis even plays out.

![The 57% Problem - BTC trades stopped by noise](/images/blog/trader-7/57-percent-problem.jpg)

For context:
- **Professional standard**: 1.5-2.0x ATR
- **Turtle Traders**: 2.0x ATR  
- **Our AI**: 0.39-0.78x ATR

![Stop Width Comparison - Our AI vs Industry Standards](/images/blog/trader-7/stop-width-comparison.jpg)

Not even close.

---

## The Fix: 19 Lines of Code

The solution was simple: an ATR-based stop floor.

After the LLM generates its signal, we check: is this stop tighter than 1.5x ATR? If yes, widen it to 1.5x ATR and recalculate the stop price. Take-profit adjusts automatically to maintain risk-reward.

![Before/After: Stop Width Fix](/images/blog/trader-7/before-after-stop-width.jpg)

```
[ATR_FLOOR] XRP-PERP: Stop widened from 1.39% to 1.95% (1.5x ATR)
```

What if the wider stop makes the profit target unrealistic? The existing R:R sanity check rejects the trade. That's correct — if a trade can't survive normal noise AND have a realistic target, it shouldn't be taken.

### The False Start

I initially deployed at 1.0x ATR. The logs looked fine — code ran without errors. But it barely changed anything. The LLM's stops were already sitting at 1.0x ATR naturally.

"Working correctly" isn't the same as "working effectively."

Bumped to 1.5x. Now the floor has teeth.

---

## What Builders Can Take From This

Whether you're building a trading system, a recommendation engine, or any AI that makes consequential decisions:

**1. AI outputs need guardrails, not just better prompts.**  
We told DeepSeek "stops must be 1.5-4.0%." It ignored us 76% of the time. Prompt engineering has limits. Programmatic enforcement doesn't.

**2. Check impact, not just absence of errors.**  
Our 1.0x floor deployed cleanly. Zero errors. But it wasn't actually changing behavior. Always verify the actual impact.

**3. Some problems need math, not more data.**  
The stop-width issue was provable from 103 signals. No backtesting needed. No "let's run it for a month." The probability calculation told us everything.

**4. Layer your safety nets.**  
ATR floor widens stops. R:R check catches unrealistic targets. The validator rejects bad market conditions. Three systems, each catching what the others miss.

---

## What's Next

The 1.5x ATR floor is live. Monitoring over the next 48-72 hours:
- Do BTC trades hold longer?
- Does stop-out rate decrease?
- Do we need 2.0x (the Turtle Trader standard)?

Eleven days in. $271 profit. 32 trades. The architecture keeps getting tighter.

---

*Trader-7 is an experimental LLM-powered trading system in paper trading mode. Past performance is not indicative of future results. This is not financial advice.*
