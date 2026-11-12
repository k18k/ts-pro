---
name: review
description: Review TypeScript changes against the ts-pro rules with a fresh-context reviewer. Use when the user asks to review a diff, a branch, a pull request or "my changes" in a ts-pro project.
argument-hint: "[git range, branch or pull request; default is uncommitted changes]"
---

# Review

What to review: $ARGUMENTS (when empty: staged and unstaged changes against `HEAD`).

1. Run the `ts-pro:reviewer` agent and give it only the range to review. It has not seen how the code was written, which is the point: do not pass it your reasoning or a summary of the change.
2. Relay its findings as it reports them, most serious first.
3. Fix nothing unless the developer asks.
