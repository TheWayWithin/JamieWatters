---
title: "I built the same tool two ways to settle an argument"
slug: "same-tool-two-ways"
date: 2026-07-16
excerpt: "Spec-first or goal-first? I didn't believe either side, so I built the same tool both ways with one spec and one model. Both worked. The bill didn't tie."
tags: [ai-coding, agents, building-in-public]
image: /images/blog/same-tool-two-ways.png
imageAlt: "Two workbenches building the same object, one cluttered with scaffolding, one spare, both producing an identical result."
readTime: 5
draft: false
---

There are two claims about building software with AI that I hear constantly, and I believe neither.

The first: hand the model a goal, get out of the way, and it produces something remarkable. The second: no, you need a proper framework, a written spec, a pipeline of quality gates, or it falls apart. They cannot both be right, and I suspected neither was. So instead of holding an opinion, I ran the experiment.

I built the same product twice. One spec, one model, two methods, and a scorecard I agreed with myself *before* either build started, so I could not quietly rework the criteria to fit whatever came out.

---

Method A was spec-first. I fed the spec into agent-11, the build framework I maintain, as a formal PRD, and let its pipeline scaffold and build the thing: foundations, bootstrap, quality gates, the lot.

Method B was goal-first. I wrote one structured prompt, the kind the AI-coding crowd calls a goal prompt: seven parts covering the deliverable, the quality bar, the tools it was allowed to use, explicit permission to make its own calls, a self-verification loop, where to put the results, and a one-line restatement of the goal. Then I pasted it and walked away.

Same underlying spec. Same model. The method was the only variable.

The product was small and real. It is called Executor File: an encrypted file that lets your executor find every account and asset you own and know what you want done with each, with no passwords stored anywhere inside it. Bounded, clearly specified, the sort of thing you can describe on a page.

---

Here is the part I did not expect: both builds worked. Not "mostly worked". I ran the actual encryption round trip on each one. Encrypt the file, split the key three ways, reconstruct it from any two of the three shares, decrypt, and confirm the output was byte-for-byte identical to the original. Both passed. Both refused to store credentials. Both kept the real data out of version control. I had each build independently reviewed to check I was not fooling myself.

So both claims died in the same afternoon. Goal-first was not magic; it was simply a correct build. And the framework was not the price of quality; the lean prompt produced an equally correct product. The self-verification step inside the goal prompt caught real bugs on its own, with no framework around it at all.

Where the two parted was everywhere except correctness.

The goal-first build took me zero hands-on minutes and zero interventions: one prompt, then review. The framework build took roughly four minutes of my attention and three points where I had to step in, some of them just to clear false alarms from the framework's own safety hooks.

Goal-first finished in 18 minutes. The framework took 1 hour 28.

Goal-first cost $12.64. The framework cost $22.51, close to double.

And the repositories told the plainest story of all. The goal-first build was 12 files that map one-to-one onto the spec. The framework build produced an equally good 10-file product, then buried it under roughly 125 files of scaffolding the tool never needed. Same product, drowned. On the parts a real person actually touches, the README and the printed instructions a grieving executor has to follow, the lean build was at least as good, and on anticipating the ways things go wrong, it was better.

---

Now the caveat, because without it this is just a cheap shot.

This was one experiment, on one small, well-specified tool. That is exactly the case where goal-first should win: the spec was already written, the scope was tight, the surface was small. It tells you nothing about a large, ambiguous product where the spec is discovered as you go and five systems have to agree. There, the structure I just called a tax may be the very thing that keeps the whole build coherent. I did not test that, and I will not pretend I did.

So the finding is narrow, and I will state it narrowly. For a bounded, well-specified build, a good goal prompt beat my framework on effort, time, cost, and clutter, and matched it on correctness and quality. Use goal-first for the small clear jobs. Keep the heavier process for the big ambiguous ones.

The thing I will actually keep is smaller than the verdict. That self-verification loop, the instruction to test its own work and *prove* it rather than assert it, did the heavy lifting. It caught the bugs. The clause costs one paragraph, and it is the whole difference between a demo and something you can trust. Both builds, for the record, shared one real failure: neither left behind an automated test, so their correctness is proven today and unguarded tomorrow. I am fixing that. Honesty means saying it out loud.

---

I shipped the winner. Executor File is public now, on its own domain. I turned the seven-part structure into a small reusable command so I never have to remember it. And I am folding the two lessons back into agent-11: give small tools a lean profile instead of the full scaffolding, and build that self-verification clause into every job.

The wider point was never goal-first versus frameworks. It is that I nearly adopted a strong opinion on someone else's say-so, twice, in opposite directions. The experiment cost about two hours and thirty-five dollars, and it swapped two beliefs for one measurement.

If you build with these tools and you are carrying a conviction you have not actually tested, run the cheap version of it on your own work this week. What would you find if you measured it instead of arguing it?
