# LinkedIn Post: Trader-7 — When AI Outputs Need Guardrails

**Ready to post**

---

Your AI is smart enough to find trades. It's not smart enough to set stop-losses.

I've been building Trader-7 — an LLM-powered crypto trading system — for 11 days. It uses Claude and DeepSeek to find and validate trades. It's made +$271 (+9.0%) on paper.

But this week, 3 consecutive BTC trades got stopped out by noise.

Same pattern every time: the AI placed stops at ~1.15% — the average range of a single hourly candle. Our trades hold for 3-48 hours. The math doesn't work.

I pulled 103 signals from the logs. 76% of BTC signals violated the minimum we explicitly asked for in the prompt.

We told the LLM: "stops must be 1.5-4.0%"
The LLM said: "here's 1.15%"

Prompt engineering has limits.

The fix was 19 lines of code:

After the LLM generates its signal, we check: is this stop tighter than 1.5x the Average True Range? If yes, widen it programmatically. If the wider stop makes the profit target unrealistic, the trade gets rejected entirely.

The right trade with bad risk parameters shouldn't be taken.

The broader lesson for anyone building AI systems:

1. "Working correctly" and "working effectively" are different. Our initial 1.0x ATR floor ran without errors but changed nothing.

2. Some problems don't need more data — they need more math. 57% noise stop-out probability is a design flaw you can prove from signals alone.

3. Layer your safety nets. ATR floor catches tight stops. R:R check catches unrealistic targets. The validator catches bad market conditions.

Current stats (Day 11):
+$271.42 (+9.0%) | 32 trades | 43.8% win rate | Sharpe 4.21

Still paper trading. Still learning. The architecture keeps getting tighter.

What guardrails have you had to add to your AI systems?

---

*Trader-7 is experimental. Paper trading only. Not financial advice.*

#AI #LLM #Trading #BuildInPublic #MachineLearning
