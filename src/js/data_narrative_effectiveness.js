// FILE: data_narrative_effectiveness.js
"use strict";

// Defines the effectiveness levels for moves and their associated emojis.
// This block defines descriptive words for attack outcomes.

export const effectivenessLevels = {
    Critical: {
        impact: ["a devastating", "a brutal", "a bone-shattering", "a picture-perfect"],
        outcome: ["finds a critical weakness", "strikes with overwhelming power", "lands with stunning precision"],
        adverb: ["brutally", "decisively", "perfectly", "critically"],
        emoji: "💥"
    },
    Strong: {
        impact: ["a powerful", "a solid", "a forceful", "an effective"],
        outcome: ["hits its mark", "connects cleanly", "lands squarely"],
        adverb: ["powerfully", "effectively", "cleanly", "directly"],
        emoji: "🔥"
    },
    Normal: {
        impact: ["a solid", "a direct", "an adequate", "a standard"],
        outcome: ["makes contact", "finds its target", "connects"],
        adverb: ["solidly", "directly", "adequately", "normally"],
        emoji: "⚔️"
    },
    Weak: {
        impact: ["a glancing", "a weak", "a feeble", "an ineffective"],
        outcome: ["barely connects", "grazes the target", "fails to penetrate"],
        adverb: ["weakly", "feebly", "ineffectively", "barely"],
        emoji: "💤"
    },
    Ineffective: {
        impact: ["a completely ineffective", "a useless", "a pathetic", "a failed"],
        outcome: ["misses entirely", "is completely avoided", "fails to connect"],
        adverb: ["ineffectively", "uselessly", "pathetically", "completely"],
        emoji: "❌"
    },
    // Legacy compatibility for existing code
    WEAK: { label: "Weak", emoji: "💤" },
    NORMAL: { label: "Normal", emoji: "⚔️" },
    STRONG: { label: "Strong", emoji: "🔥" },
    CRITICAL: { label: "Critical", emoji: "💥" },
    REDIRECTED_SUCCESS: { label: "RedirectedSuccess", emoji: "⚡↩️" },
    REDIRECTED_FAIL: { label: "RedirectedFail", emoji: "⚡🤕" }
};