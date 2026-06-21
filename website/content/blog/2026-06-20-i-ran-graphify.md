---
title: "I Ran Graphify. The Privacy Trap Is Real, Just Not the One Everyone Warned Me About"
slug: "i-ran-graphify"
date: 2026-06-20
excerpt: "Six AIs told me Graphify uploads your code. I checked by running it, and the actual gotcha is smaller, quieter, and easy to miss."
tags: [ai, tools, privacy, building-in-public, graphify]
image: /images/blog/i-ran-graphify.webp
imageAlt: "A reassuring padlock on the front door of a house, while a small side window stands quietly open in the background."
readTime: 7
draft: false
---

A few days ago I wrote that six different AI models all told me, with full confidence, that Graphify uploads your code to a server. They were wrong. The tool is local-first, MIT-licensed, builds its graph on your machine. The post wrote itself: don't trust the consensus, check the source.

So this week I checked harder. I ran it.

And there is a privacy trap. It is real. It is just not the one any of those six models warned me about, and it is the kind of thing you only find by putting your own hands on the tool rather than asking a model what it thinks.

---

First, what Graphify actually is, because the hype around it is loud and the honest version is more useful. It parses your codebase into a graph using AST and tree-sitter, no embeddings, so an agent can query structure instead of grepping and reading whole files. It is free, MIT, about 68k stars on GitHub, a YC S26 company, currently v0.8.x and still young enough that things move around between versions.

The pitch is token savings. The viral number is "71.5x fewer tokens," which is a cherry-picked best case and you should mentally bin it. Independent testing lands far lower and depends entirely on what unit you measure. One careful per-session test found around 7 to 8 percent. The saving is modest on a normal session and only gets large on big code repositories you query over and over.

I wanted my own number, so I built a disposable copy of agent-11, ran it local-only, and did an architecture A/B query both ways.

The token win is real. On that query, the Graphify route used about 47 percent less context than the minimum grep-and-read, and about 83 percent less than a thorough grep-and-read. Roughly 1.5k tokens versus 3k to 9.3k. The build itself was fast and free: 1,675 nodes in 6 seconds, and the run reported zero input and zero output tokens. Nothing left the machine. So far, exactly as advertised.

Then two problems showed up. One is about me. One is about the tool.

---

The one about me first, because it is the bigger lesson.

Graphify was the wrong tool for this repo, and that is my fault, not the tool's. agent-11 is about 88 percent markdown. The product is prose: the agents, the missions, the commands. Local mode only graphs code, which is the other 12 percent, and roughly half of that was throwaway test fixtures I had committed and forgotten. So the graph I built mapped my install and deploy plumbing in loving detail and almost none of the thing I actually ship.

That is not a flaw in Graphify. That is me reaching for a code-structure tool on a repo that is mostly not code. The token savings compound when you point this at something that is 80 percent or more real code and you query it repeatedly. Point it at a pile of markdown and you have built a beautiful map of the wrong country.

---

Now the tool one. The privacy trap.

I want to describe this carefully, because the loud version of this story is wrong and I am not going to swap one piece of confident nonsense for another. This is observed behaviour, not intent.

The default build auto-detects any API key sitting in your shell environment. I had `OPENAI_API_KEY` set, as you do. When that key is present, the default build will call the model API to name the graph's "communities," the clusters it finds in your code. It does this without the `--mode deep` flag. You do not opt in. You do not get asked.

So the claim "it runs locally" is true only if your shell is clean. If you have a key set, which most of us building with AI all day do, the default build phones a model and your structure goes with the request. Not your whole codebase. Not secretly uploaded to Graphify's servers, which is what the six models breathlessly claimed. But a call to a model API you did not knowingly authorise, triggered by a key you set for something else entirely.

To guarantee local-only, I had to strip the key per command and pass `--no-label`. Once I did that, it was genuinely local: zero in, zero out. But the default is not local, and "local-first" quietly means "local unless you happen to have a key lying around," which is a very different sentence.

That is the trap. Not malice. A default that does a surprising thing because it found a credential you left in the room.

---

So here is the honest verdict. I am deleting Graphify from the agent-11 workflow. Not because it is a bad tool, it is a good one, but because it was the wrong tool for a markdown repo and I was running it under a local-only constraint its defaults quietly break.

It flips to a yes in two cases. Point it at a code-heavy repo, 80 percent or more real code, queried often, and the savings compound into something that matters. Or accept `--mode deep` with a key and understand that your content is going to a model, which means you have chosen to drop the local-only rule on purpose rather than by accident.

The thing I keep relearning: the consensus was wrong, and so was I, but in different directions. Six models invented a server upload that does not happen. I missed a default API call that does. The only way to know which fears are real is to run the thing yourself and watch what actually leaves the machine.

If you are using Graphify under any kind of privacy constraint, check your shell for a stray API key before your next build, strip it, and pass `--no-label`. Then watch the build report. Zero in, zero out is the only line that proves it stayed on your machine.
