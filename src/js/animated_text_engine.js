// FILE: js/animated_text_engine.js
"use strict";

// Version 1.1: Null-Safety Pass

import { focusOnLatestMessage } from "./camera_control.js"; // camera_control.js should be robust

const TYPEWRITER_SPEED_MS = 25;
const EMOJI_ANIMATION_DURATION_MS = 500;
const HIGH_IMPACT_PAUSE_MS = 1500;
const DEFAULT_PAUSE_MS = 500;

let currentTimeoutId = null;
let animationQueueInternal = [];
let currentMessageIndex = 0;
let simulationContainerElement = null;
let onStepCompleteCallbackInternal = null; // Renamed to avoid conflict

export function stopCurrentAnimation() {
    if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
    }
}

export function startAnimationSequence(queue, container, onComplete) {
    stopCurrentAnimation();
    animationQueueInternal = Array.isArray(queue) ? [...queue] : []; // Ensure queue is an array
    currentMessageIndex = 0;
    simulationContainerElement = container; // Assume container is valid HTMLElement if passed
    onStepCompleteCallbackInternal = typeof onComplete === "function" ? onComplete : null;

    if (!simulationContainerElement) {
        console.error("Animated Text Engine: Simulation container is null. Cannot start animation.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true); // Indicate completion (due to error)
        return;
    }

    if (animationQueueInternal.length === 0) {
        console.warn("[Animated Text Engine] Animation queue is empty.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true);
        return;
    }

    console.debug(`[Animated Text Engine] Starting animation with ${animationQueueInternal.length} events`);
    processNextMessage();
}

function processNextMessage() {
    if (!simulationContainerElement) {
        console.error("Animated Text Engine: Simulation container became null during processing.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true); // End due to error
        return;
    }
    if (currentMessageIndex >= animationQueueInternal.length) {
        console.log("[Animated Text Engine] Animation queue finished.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true);
        return;
    }

    const message = animationQueueInternal[currentMessageIndex];
    currentMessageIndex++;

    if (!message || typeof message.text !== "string") { // Basic validation of message object
        console.warn("Animated Text Engine: Skipping invalid message object:", message);
        // Schedule next message processing to keep the queue moving
        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(false); // Indicate a step was "processed" (skipped)
            processNextMessage();
        }, DEFAULT_PAUSE_MS);
        return;
    }

    renderMessage(message);
}

function processAndAnimateEvent(event) {
    try {
        // Defensive Programming: Comprehensive event validation
        if (!event) {
            console.warn("[Animated Text Engine] Event is null or undefined");
            return null;
        }
        
        if (typeof event !== "object") {
            console.warn("[Animated Text Engine] Event is not an object:", typeof event);
            return null;
        }
        
        if (!event.type || typeof event.type !== "string") {
            console.warn("[Animated Text Engine] Event missing or invalid type property:", event);
            return null;
        }

    let lineClass = "";
    let htmlContent = "";

    switch (event.type) {
        case "turn_marker": {
            lineClass = "turn-marker-simulated";
            const { portrait, characterName, turn } = event;
            const nameSpan = `<span class="turn-marker-name char-${event.actorId}">${characterName}</span>`;
            const turnSpan = `<span class="turn-marker-turn">Turn ${turn}</span>`;
            htmlContent = `
                <img src="${portrait}" alt="${characterName}" class="turn-marker-portrait">
                <div class="turn-marker-info">
                    ${nameSpan}
                    ${turnSpan}
                </div>
            `;
            break;
        }

        case "move_action_event":
            lineClass = "move-action-simulated";
            htmlContent = event.html_content;
            break;
        case "dialogue_event":
            lineClass = "dialogue-simulated";
            htmlContent = event.html_content;
            break;
        case "environmental_summary_event":
            lineClass = "environmental-simulated";
            htmlContent = event.html_content;
            break;
        case "phase_header_event":
            lineClass = "phase-header-simulated";
            htmlContent = event.html_content;
            break;
        case "final_blow_event":
        case "conclusion_event":
        case "stalemate_result_event":
            lineClass = "phase-header-simulated"; // Use a similar prominent style
            htmlContent = event.html_content;
            break;
        default:
            // For simple text events or unknown types, render them plainly.
            if (event.text) {
                lineClass = "narrative-info"; // A generic class
                htmlContent = `<p>${event.text}</p>`;
            } else {
                return null; // Don't render anything if we can't process it.
            }
    }

        const lineElement = document.createElement("div");
        lineElement.className = `simulation-line ${lineClass}`;
        lineElement.innerHTML = htmlContent;

        return lineElement;
    } catch (error) {
        console.error("[Animated Text Engine] Error processing event:", error, event);
        // Return a safe fallback element
        const fallbackElement = document.createElement("div");
        fallbackElement.className = "simulation-line narrative-info";
        fallbackElement.innerHTML = "<p>Error processing event</p>";
        return fallbackElement;
    }
}

function renderMessage(message) { // message is already validated by processNextMessage
    const lineElement = processAndAnimateEvent(message);

    if (!lineElement) {
        // If event couldn't be processed, just move on.
        const pauseDuration = message.pauseAfter || DEFAULT_PAUSE_MS;
        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(false);
            processNextMessage();
        }, pauseDuration);
        return;
    }

    if (simulationContainerElement) { // Ensure container still exists
        // Use DocumentFragment for efficient DOM operations
        import("./utils_efficient_rendering.js").then(({ batchAppendElements }) => {
            batchAppendElements(simulationContainerElement, [lineElement]);
            focusOnLatestMessage(simulationContainerElement, lineElement); // focusOnLatestMessage should be robust
        }).catch(() => {
            // Fallback to direct append if module isn't available
            simulationContainerElement.appendChild(lineElement);
            focusOnLatestMessage(simulationContainerElement, lineElement);
        });
    }

    // Since we are now rendering full HTML, the "typing" effect is less relevant
    // for complex components. We will just pause and proceed.
    // We can add more sophisticated animations per-type later if needed.
    const pauseDuration = message.pauseAfter || DEFAULT_PAUSE_MS;
    currentTimeoutId = setTimeout(() => {
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(false);
        processNextMessage();
    }, pauseDuration);
}

function typeMessage(element, text, onFinished) {
    if (!element || typeof text !== "string") { // Basic validation
        console.warn("Animated Text Engine (typeMessage): Invalid element or text.", { element, text });
        if (typeof onFinished === "function") onFinished();
        return;
    }

    let i = 0;
    const existingEmoji = element.querySelector(".simulation-move-emoji");
    let textContentTarget = element;

    if (existingEmoji) {
        let actualTextSpan = element.querySelector(".typewriter-target");
        if (!actualTextSpan) {
            actualTextSpan = document.createElement("span");
            actualTextSpan.className = "typewriter-target";
            element.appendChild(actualTextSpan);
        }
        textContentTarget = actualTextSpan;
    }
    textContentTarget.innerHTML = ""; // Clear only the target span

    function type() {
        if (currentTimeoutId === null && i > 0) return; // Animation was stopped

        if (i < text.length) {
            textContentTarget.insertAdjacentText("beforeend", text.charAt(i));
            i++;
            currentTimeoutId = setTimeout(type, TYPEWRITER_SPEED_MS);
        } else {
            currentTimeoutId = null; // Clear ID as this typing session is done
            if (typeof onFinished === "function") onFinished();
        }
    }
    type();
}

function animateEmoji(emojiElement, impactLevel) {
    if (!emojiElement) return; // Guard against null element

    let animationClass = "";
    // Safe access to impactLevel and toLowerCase
    const level = typeof impactLevel === "string" ? impactLevel.toLowerCase() : "low";

    switch (level) {
        case "high":
            animationClass = "emoji-high-impact";
            break;
        case "medium":
            animationClass = "emoji-medium-impact";
            break;
        case "low":
            animationClass = "emoji-animate-low";
            break;
        default:
            return; // No animation for unknown levels
    }
    emojiElement.classList.add(animationClass);
    setTimeout(() => {
        emojiElement.classList.remove(animationClass);
    }, EMOJI_ANIMATION_DURATION_MS);
}