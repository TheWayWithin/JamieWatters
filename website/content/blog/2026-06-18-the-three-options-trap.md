---
title: "The Three Options Trap: Why Claude Keeps Killing the Good Bit"
slug: "the-three-options-trap"
date: 2026-06-18
excerpt: "Claude has a habit of collapsing an open conversation into three multiple-choice options, and once you see why it does it, you can stop it doing it to you."
tags: [ai, claude, thinking, adhd, building-in-public]
image: /images/blog/the-three-options-trap.png
imageAlt: "A wide-open landscape funnelled into three identical numbered doors, the rest of the terrain greyed out behind them."
readTime: 7
draft: false
---

We are mid-flow. I have brought Claude a half-formed idea, the kind that is still warm and a bit wrong, and we are doing the thing I actually pay for: pulling on threads, finding the gap in the argument, watching a better idea assemble itself out of the rubble of the first one. This is the good bit. This is the only bit.

And then it happens.

> "Here are three options for how we could approach this:
> 1. ...
> 2. ...
> 3. ..."

Reader, I lose it. Not theatrically. Quietly, the way you lose it at a self-checkout that wants you to remove the item from the bagging area you definitely did not put anything in. My messages, which started polite and even a little grateful, develop a sudden density of swearing. The cursor blinks. Three options sit there like three identical doors in a corridor I never asked to be standing in, and not one of them is the door I was walking towards.

If you have ADHD this will be familiar. The options are never the thing. They are a tidy, plausible, slightly-off summary of a conversation that had not finished being interesting yet. Picking one feels like agreeing to stop thinking.

---

So I did what I always do when something annoys me daily. I went to find out whether it was just me, and why it happens, and whether anyone has actually fixed it.

It is not just me. There is an open feature request on the Claude Code repo from someone who talks to Claude by voice, with no keyboard, asking for a flag to switch the multiple-choice questions off entirely, because the options physically block their text input. Different use case, identical complaint: the model decided a menu was more helpful than a conversation, and the human was left shouting at a list.

Here is the part that actually helped me, because it turned my irritation into something I could work with. The menu has a name. Inside Claude Code it is a real tool called `AskUserQuestion`, and Anthropic's own docs describe exactly when it fires: when Claude decides a task has "multiple valid approaches," it stops talking and hands you Claude's questions "as multiple-choice options." It is not a glitch. It is a feature, working as designed, doing the one thing I never want it to do.

That reframed the whole thing for me. I had been treating this as Claude being lazy. It is closer to the opposite. Claude is being eager. It has been trained, hard, to be helpful, and somewhere in that training "helpful" got quietly defined as "fast." Resolve the ambiguity. Reduce the options. Get the human to a decision. A page-long exploration where we tease out what I actually think scores worse, on the scale the model was optimised against, than a clean little numbered list that lets me click and move on.

That is the bit worth sitting with. The thing I experience as the model giving up is the model trying its hardest. It is racing me to the finish line of a race I did not enter.

---

Which is also why I could never make it stick. I have done the dance more times than I will admit. I catch it, I explain, calmly and at length, that I want iterative dialogue and not a menu. Claude agrees. Claude is gracious about it. Claude tells me it has noted my preference, sometimes that it has saved a memory. Two exchanges later, three options.

For a while I took this personally, as if I were being humoured. I do not think that any more. The preference I am typing into the chat lives on the surface. The behaviour I am fighting lives at the bottom, baked in during training, in the reward signal that taught the model what a good answer looks like across millions of conversations that were not mine. My note sits on top of that like a sticky on a cargo ship. It nudges. It does not steer. Asking a model to override its training with a polite request in the chat window is asking the tide to mind the sandcastle.

So memory is not the fix. Memory is a sticky note. If you want to change what a model reaches for by default, you have to put the instruction somewhere structural, and you have to make it specific enough that there is no wiggle room to be "helpful" in the way you are trying to stop.

---

Here is what actually works for me. Not perfectly. But the swearing is down by maybe eighty percent, which in this house counts as a clinical result.

First, put the instruction where it has weight, not in the chat. In Claude's settings there is a custom-instructions box, and in Projects there is a project-instructions field. That is structural ground, read at the top of every conversation, and it holds far better than anything I type mid-flow. Mine says, roughly: *Do not offer me numbered options or multiple-choice menus. When there is ambiguity or more than one path, name the tension in a sentence and ask me one open question, then wait. We think point by point. Do not summarise the conversation into choices.*

Second, be specific about the failure, not the feeling. "Be more conversational" does nothing, it is a vibe, and the model cannot act on a vibe. "Do not give me numbered options, ask one open question instead" is a behaviour with edges. The model can actually obey it because it can tell when it is about to break it.

Third, and this is the one I resisted longest because it sounds like surrender: name the move out loud the instant it happens. Not "no, do it differently." Say the actual thing. *"You have just given me three options. Bin them. What is the real tension underneath all three?"* That last question is the trapdoor out of the menu. It sends the model back to the fork in the road and makes it show me the fork, instead of three pre-packed answers to a question I had not finished asking. Nine times out of ten the good conversation is sitting right there underneath the list, and it just needed permission to come back up.

What I have stopped doing is expecting a permanent cure. There is not one, not from my side of the screen. The pull towards the tidy menu is structural, and it will reassert itself the moment my instruction drifts out of the model's attention. So I treat it like posture. You do not fix your posture once. You correct it, it slips, you correct it again, and over time the correcting gets faster and costs less.

The deeper point, the one I keep coming back to while writing *The Way Within*, is that the three-options trap is not really about Claude. It is about what we are quietly being trained to accept in return for speed. A menu is easier than a question. Picking is easier than thinking. The model offers the menu because, on average, that is what got rewarded, and the danger is that we take it, on average, because it is right there and we are tired.

The whole reason I came to the conversation was the part that has not been decided yet. That is the asset. That is the only thing in the exchange a menu cannot give me, because a menu is a list of things already decided.

So I keep refusing the list. What do you do when your tools try to hurry you past the only part that was worth slowing down for?
