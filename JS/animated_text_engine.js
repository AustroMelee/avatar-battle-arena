// FILE: js/animated_text_engine.js
'use strict';

// Version 1.1: Null-Safety Pass

// --- NEW IMPORT ---
import { getCharacterImageFromUI as getCharacterImage } from './ui.js';
// --- END NEW IMPORT ---
import { focusOnLatestMessage } from './camera_control.js'; // camera_control.js should be robust

const TYPEWRITER_SPEED_MS = 25;
const EMOJI_ANIMATION_DURATION_MS = 500;
const HIGH_IMPACT_PAUSE_MS = 1500;
const DEFAULT_PAUSE_MS = 500;

let currentTimeoutId = null;
let animationQueueInternal = [];
let currentMessageIndex = 0;
let simulationContainerElement = null;
let onStepCompleteCallbackInternal = null; // Renamed to avoid conflict

// --- NEW FUNCTION: getCharacterImage ---
// This function was originally expected from ui.js but wasn't exported.
// Adding it here for a self-contained fix within animated_text_engine.
// --- END NEW FUNCTION ---


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
    onStepCompleteCallbackInternal = typeof onComplete === 'function' ? onComplete : null;

    if (!simulationContainerElement) {
        console.error("Animated Text Engine: Simulation container is null. Cannot start animation.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true); // Indicate completion (due to error)
        return;
    }

    if (animationQueueInternal.length === 0) {
        console.warn("Animated Text Engine: Animation queue is empty.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true);
        return;
    }

    processNextMessage();
}

function processNextMessage() {
    if (!simulationContainerElement) {
        console.error("Animated Text Engine: Simulation container became null during processing.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true); // End due to error
        return;
    }
    if (currentMessageIndex >= animationQueueInternal.length) {
        console.log("Animated Text Engine: Animation queue finished.");
        if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(true);
        return;
    }

    const message = animationQueueInternal[currentMessageIndex];
    currentMessageIndex++;

    if (!message || typeof message.text !== 'string') { // Basic validation of message object
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

function renderMessage(message) { // message is already validated by processNextMessage
    const lineElement = document.createElement('div');
    lineElement.className = 'simulation-line';
    if (message.isPhaseHeader) lineElement.classList.add('phase-header-simulated');
    if (message.isMoveAction) lineElement.classList.add('move-action-simulated');
    if (message.isDialogue) {
        lineElement.classList.add('dialogue-simulated');
        if (message.dialogueType) lineElement.classList.add(`dialogue-${message.dialogueType}`);
    }
    if (message.isEnvironmental) lineElement.classList.add('environmental-simulated');

    if (message.actorId) { // Check if actorId exists
        const iconUrl = getCharacterImage(message.actorId); // getCharacterImage should return null if not found
        if (iconUrl) {
            const iconImg = document.createElement('img');
            iconImg.src = iconUrl;
            iconImg.alt = message.characterName || message.actorId; // Fallback alt text
            iconImg.className = 'simulation-char-icon';
            lineElement.appendChild(iconImg);
        }
    }

    const textSpan = document.createElement('span');
    textSpan.className = 'simulation-text-content';

    if (message.isMoveAction && message.moveType) {
        const emoji = getEmojiForMoveType(message.moveType, message.effectivenessLabel);
        if (emoji) {
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'simulation-move-emoji';
            emojiSpan.textContent = emoji + ' '; // Add space after emoji
            textSpan.appendChild(emojiSpan);
        }
    }
    lineElement.appendChild(textSpan);

    if (simulationContainerElement) { // Ensure container still exists
        simulationContainerElement.appendChild(lineElement);
        focusOnLatestMessage(simulationContainerElement, lineElement); // focusOnLatestMessage should be robust
    }


    typeMessage(textSpan, message.text, () => { // typeMessage handles onFinished
        const emojiElement = textSpan.querySelector('.simulation-move-emoji');
        if (emojiElement && message.impactLevel) {
            animateEmoji(emojiElement, message.impactLevel); // animateEmoji should be robust
        }

        // Determine pause duration, ensuring message.pauseAfter is a number if it exists
        let pauseDuration = DEFAULT_PAUSE_MS;
        if (typeof message.pauseAfter === 'number' && message.pauseAfter > 0) {
            pauseDuration = message.pauseAfter;
        } else if (message.impactLevel === 'high' || message.impactLevel === 'critical') {
            pauseDuration = HIGH_IMPACT_PAUSE_MS;
        }

        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallbackInternal) onStepCompleteCallbackInternal(false); // Step complete, not end of queue
            processNextMessage();
        }, pauseDuration);
    });
}

function typeMessage(element, text, onFinished) {
    if (!element || typeof text !== 'string') { // Basic validation
        console.warn("Animated Text Engine (typeMessage): Invalid element or text.", { element, text });
        if (typeof onFinished === 'function') onFinished();
        return;
    }

    let i = 0;
    const existingEmoji = element.querySelector('.simulation-move-emoji');
    let textContentTarget = element;

    if (existingEmoji) {
        let actualTextSpan = element.querySelector('.typewriter-target');
        if (!actualTextSpan) {
            actualTextSpan = document.createElement('span');
            actualTextSpan.className = 'typewriter-target';
            element.appendChild(actualTextSpan);
        }
        textContentTarget = actualTextSpan;
    }
    textContentTarget.innerHTML = ''; // Clear only the target span

    function type() {
        if (currentTimeoutId === null && i > 0) return; // Animation was stopped

        if (i < text.length) {
            textContentTarget.insertAdjacentText('beforeend', text.charAt(i));
            i++;
            currentTimeoutId = setTimeout(type, TYPEWRITER_SPEED_MS);
        } else {
            currentTimeoutId = null; // Clear ID as this typing session is done
            if (typeof onFinished === 'function') onFinished();
        }
    }
    type();
}

function animateEmoji(emojiElement, impactLevel) {
    if (!emojiElement) return; // Guard against null element

    let animationClass = '';
    // Safe access to impactLevel and toLowerCase
    const level = typeof impactLevel === 'string' ? impactLevel.toLowerCase() : 'low';

    switch (level) {
        case 'critical':
        case 'high':
            animationClass = 'emoji-animate-high';
            break;
        case 'strong': // Keep existing behavior for 'strong'
             animationClass = 'emoji-animate-high';
            break;
        case 'medium':
        case 'normal':
            animationClass = 'emoji-animate-medium';
            break;
        case 'low':
            animationClass = 'emoji-animate-low';
            break;
        default:
            return; // No animation for unknown levels
    }
    emojiElement.classList.add(animationClass);
    setTimeout(() => {
        emojiElement.classList.remove(animationClass);
    }, EMOJI_ANIMATION_DURATION_MS);
}

function getEmojiForMoveType(moveType, effectivenessLabel) {
    if (typeof effectivenessLabel === 'string') {
        if (effectivenessLabel.toLowerCase() === 'critical') return '💥';
        if (effectivenessLabel.toLowerCase() === 'strong') return '🔥';
    }

    if (!moveType || typeof moveType !== 'string') return '➡️'; // Default if moveType is undefined or not a string

    switch (moveType.toLowerCase()) {
        case 'fire': return '🔥';
        case 'water': return '💧';
        case 'ice': return '❄️';
        case 'earth': return '🪨';
        case 'metal': return '⚙️';
        case 'air': return '💨';
        case 'lightning': return '⚡';
        case 'physical': return '⚔️';
        case 'utility': return '🛠️';
        case 'special': return '✨';
        case 'offense': return '⚔️';
        case 'defense': return '🛡️';
        default: return '➡️';
    }
}