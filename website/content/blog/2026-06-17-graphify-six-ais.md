---
title: "I Almost Told You a Lie. Six AIs Handed It to Me, in Unison."
slug: graphify-six-ais
date: 2026-06-17
excerpt: "A field note from researching Graphify: the real privacy model, the honest token numbers, and why I check the source before I publish."
tags:
  - AI
  - cognitive sovereignty
  - build in public
  - research
image: /images/blog/graphify-six-ais.webp
imageAlt: "A row of carved wooden birds beside an open book on a sunlit windowsill"
draft: false
---

*A field note from researching Graphify: the real privacy model, the honest token numbers, and why I check the source before I publish.*

Last week I had a paragraph half-written warning you that Graphify quietly uploads your codebase. Then I checked.

Here's how I got there. Graphify is the tool everyone's currently breathless about: 68,000 GitHub stars, a Karpathy tweet for a midwife, point it at a folder and it builds a knowledge graph your AI assistant queries instead of grepping through files one at a time. I was writing a research brief on whether it's worth my time, so I did the thing I do now as a matter of course. I asked six different models to research it independently, then I read all six against each other.

They were useful. They caught things I'd missed. And on one point, all six agreed: Graphify's "deep mode" uploads your file contents to the cloud, and it does so by default. One of them put it in bold. For me that's a real problem, because the folders I'd point this at contain client work and the odd API key I've forgotten to move. A tool that ships your code off by default is a tool I warn people about.

So I started writing the warning.

Then, because the claim was specific and I was about to act on it, I opened the actual repository and read what deep mode does.

It's opt-in. Plain `graphify .` parses your code locally, and on a code-only folder it now runs with no API key at all. Nothing leaves the machine. Deep mode is a flag you have to type, `--mode deep`, and that one does send content out for richer analysis. The default is local. The upload is the exception you ask for. Six models had it backwards, confidently, in unison, and I was two sentences from passing it on to you with my name on it.

That gap is the whole post. Not the gap between the models and the truth. The gap between me almost shipping it and me checking.

---

## Why they all agreed, and why that's the dangerous part

You'd think six models disagreeing would be the worrying outcome. It's the opposite. Disagreement is a flashing light: it tells you the ground is soft, go look. Unanimity feels like confirmation. It reads as "well, they can't all be wrong," which is exactly the thought that nearly cost me.

But they can all be wrong, and for a boring reason. They're drinking from the same well. The internet filled up with Graphify explainers in April, a lot of them written fast, several of them blurring "deep mode exists" into "deep mode is the default." The models trained and searched across that same soup. Six independent researchers who all read the same wrong blog posts aren't six sources. They're one source with six accents.

This is the trap underneath the slop. It isn't that AI writes rubbish, though plenty does. It's that the rubbish compounds. One unchecked claim gets repeated until repetition starts to look like evidence, and a model trained on the repetition hands it back to you with total confidence and no idea it's holding a rumour.

And it doesn't only err in one direction. While I was checking the privacy claim, I went looking for the real token saving, because the headline everywhere is "71.5x fewer tokens" and that smelled like marketing. It is: one favourable mixed corpus stuffed with PDFs and images, which flatters the number enormously. But my own earlier notes, taken from a few video walkthroughs, had landed on 2-4x, and I'd half-believed that too. The independent benchmarks on actual code repos converge on roughly 7x. So the truth sat between two confident wrong numbers: a viral one that oversold it by tenfold, and my own that undersold it by half. Same poisoned well, errors pointing opposite ways, and I'd nearly carried both.

---

## The check that saved me took ninety seconds

This is the useful part, so I'll be specific.

The models gave me a claim that was specific, falsifiable, and consequential. Those three properties together are the trigger. Specific, because "uploads by default" is a precise mechanical assertion, not a vibe. Falsifiable, because there's a primary source that settles it: the code. Consequential, because I was about to act on it, tell people, change a recommendation.

When a claim has all three, you go to the source. Not another summary of the source. The source. For a tool, that's the repository and the docs. For a number, it's the filing or the paper. For a quote, it's the transcript. I opened the README and the security file, searched for "deep," and read the three lines that mattered. Ninety seconds. The unanimous verdict of six frontier models lost to ninety seconds of reading the thing itself.

You don't do this for everything. You'd never finish a sentence. The filter is those three properties. Most of what a model tells you is low-stakes, or unfalsifiable, or so vague there's nothing to check. Let that go. But the moment a claim is specific *and* checkable *and* you're about to do something because of it, that's when the model has earned a fact-check rather than your trust. Especially when every model agrees. *Especially* then.

---

## What this has to do with how I work

I bang on about cognitive sovereignty, and it can sound like a slogan, so here's what it actually means at the keyboard. It means I'm the judge. Not the models. They research, they draft, they argue with each other, and that's genuinely valuable; the six-model panel is a good tool and I'll keep using it. But the panel doesn't get a vote on what's true. It gets a vote on what's worth checking.

The failure mode I'm guarding against isn't laziness. It's deference. The output is fluent, the formatting is clean, six of them said the same thing, and some quiet part of your brain files it under "settled" and moves on. Fluency is not accuracy. Consensus among models that read the same sources is not corroboration. The more polished the output, the more deliberately you have to hold the judge's seat, because everything about the presentation is inviting you to give it up.

I nearly gave it up. That's the honest bit. I'm not writing this from above the problem. I'm writing it from two sentences into the mistake, which is the only place you can write about it from without lying.

---

So: Graphify runs local by default, the real saving is about 7x on actual code rather than the 71.5x on the poster, and it's worth a trial on a big repo. Useful tool. That's the practical takeaway, and it's worth having.

The bigger one is the ninety seconds. Next time a model hands you something specific, checkable, and worth acting on, and especially when several of them hand you the same thing, go and read the source before you act. It's the cheapest insurance you'll ever buy, and it's the difference between using these tools and being used by them.

That's most of what I do here. I build with these tools in the open, I test what they tell me before I pass it on, and I write up what actually held and what didn't, including the times I nearly got it wrong. Not takes from the beach. A field report from someone in the water. If that's useful to you, the rest of it lives at [jamiewatters.work](https://jamiewatters.work), and I post the same way on [X](https://x.com/Jamie_within) and [LinkedIn](https://www.linkedin.com/in/jamie-watters-solo).
