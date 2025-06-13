// FILE: js/animated_text_engine.js
'use strict';

import { getCharacterImage } from './ui.js'; // Assume ui.js will export this
import { focusOnLatestMessage } from './camera_control.js';

const TYPEWRITER_SPEED_MS = 25; // Milliseconds per character
const EMOJI_ANIMATION_DURATION_MS = 500; // How long emoji animations last
const HIGH_IMPACT_PAUSE_MS = 1500; // Pause for high-impact moves
const DEFAULT_PAUSE_MS = 500; // Default pause after a line

let currentTimeoutId = null;
let animationQueueInternal = [];
let currentMessageIndex = 0;
let simulationContainerElement = null;
let onStepCompleteCallback = null; // Callback for simulation_mode_manager

/**
 * Stops any ongoing animation and clears timeouts.
 */
export function stopCurrentAnimation() {
    if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
    }
    // Any other cleanup for ongoing animations if necessary
}

/**
 * Starts processing the animation queue.
 * @param {Array<object>} queue - The queue of message objects to animate.
 * @param {HTMLElement} container - The DOM element to render animations into.
 * @param {Function} onComplete - Callback when a step is done or queue is empty.
 */
export function startAnimationSequence(queue, container, onComplete) {
    stopCurrentAnimation(); // Ensure any previous animation is stopped
    animationQueueInternal = [...queue]; // Copy the queue
    currentMessageIndex = 0;
    simulationContainerElement = container;
    onStepCompleteCallback = onComplete;

    if (animationQueueInternal.length === 0) {
        console.warn("Animation queue is empty.");
        if (onStepCompleteCallback) onStepCompleteCallback(true); // true for end of queue
        return;
    }
    
    processNextMessage();
}

/**
 * Processes the next message in the queue.
 */
function processNextMessage() {
    if (currentMessageIndex >= animationQueueInternal.length) {
        console.log("Animation queue finished.");
        if (onStepCompleteCallback) onStepCompleteCallback(true); // End of queue
        return;
    }

    const message = animationQueueInternal[currentMessageIndex];
    currentMessageIndex++;

    renderMessage(message);
}

/**
 * Renders a single message object with animations.
 * @param {object} message - The message object to render.
 *                          { actorId, moveType, impactLevel, text, pauseAfter, characterName, moveName, effectivenessLabel }
 */
function renderMessage(message) {
    if (!simulationContainerElement || !message || typeof message.text !== 'string') {
        console.error("Invalid message object or container for rendering:", message);
        // Skip this message and proceed
        currentTimeoutId = setTimeout(processNextMessage, DEFAULT_PAUSE_MS);
        return;
    }

    const lineElement = document.createElement('div');
    lineElement.className = 'simulation-line';
    if (message.isPhaseHeader) lineElement.classList.add('phase-header-simulated');
    if (message.isMoveAction) lineElement.classList.add('move-action-simulated');
    if (message.isDialogue) lineElement.classList.add('dialogue-simulated');
    if (message.isEnvironmental) lineElement.classList.add('environmental-simulated');


    // 1. Character Icon (if actorId provided)
    if (message.actorId) {
        const iconUrl = getCharacterImage(message.actorId); // This function needs to exist in ui.js or be passed
        if (iconUrl) {
            const iconImg = document.createElement('img');
            iconImg.src = iconUrl;
            iconImg.alt = message.characterName || message.actorId;
            iconImg.className = 'simulation-char-icon';
            lineElement.appendChild(iconImg);
        }
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'simulation-text-content';
    lineElement.appendChild(textSpan);

    // 2. Emoji (if moveType provided for move actions)
    if (message.moveType && message.moveName) { // Only for actual moves
        const emoji = getEmojiForMoveType(message.moveType, message.effectivenessLabel);
        if (emoji) {
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'simulation-move-emoji';
            emojiSpan.textContent = emoji + ' '; // Add space after emoji
            textSpan.appendChild(emojiSpan); // Prepend emoji to text
            
            // Trigger emoji animation based on impactLevel later, after text is typed
        }
    }
    
    simulationContainerElement.appendChild(lineElement);
    focusOnLatestMessage(simulationContainerElement, lineElement); // Camera follow

    // 3. Typewriter Text
    typeMessage(textSpan, message.text, () => {
        // After text is typed:
        // 4. Animate Emoji (if applicable)
        const emojiElement = textSpan.querySelector('.simulation-move-emoji');
        if (emojiElement && message.impactLevel) {
            animateEmoji(emojiElement, message.impactLevel);
        }

        // 5. Pause and proceed
        const pauseDuration = message.pauseAfter || 
                              (message.impactLevel === 'high' || message.impactLevel === 'critical' ? HIGH_IMPACT_PAUSE_MS : DEFAULT_PAUSE_MS);
        
        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallback) onStepCompleteCallback(false); // false for not end of queue (unless it is)
            processNextMessage(); // Process next message after pause
        }, pauseDuration);
    });
}

/**
 * Types out a message character by character.
 * @param {HTMLElement} element - The DOM element to type into.
 * @param {string} text - The text to type.
 * @param {Function} onFinished - Callback when typing is complete.
 */
function typeMessage(element, text, onFinished) {
    let i = 0;
    element.innerHTML = ''; // Clear previous content
    // Find if there's an emoji to preserve it during typing
    const emojiSpan = element.querySelector('.simulation-move-emoji');
    if (emojiSpan) {
        element.appendChild(emojiSpan.cloneNode(true)); // Re-add emoji if it was there
    }
    
    function type() {
        if (i < text.length) {
            // Append to existing content after emoji (if any)
            element.insertAdjacentText('beforeend', text.charAt(i));
            i++;
            currentTimeoutId = setTimeout(type, TYPEWRITER_SPEED_MS);
        } else {
            if (onFinished) onFinished();
        }
    }
    type();
}

/**
 * Animates an emoji based on impact level.
 * @param {HTMLElement} emojiElement - The emoji span element.
 * @param {string} impactLevel - 'low', 'medium', 'high', 'critical'.
 */
function animateEmoji(emojiElement, impactLevel) {
    if (!emojiElement) return;

    let animationClass = '';
    switch (impactLevel.toLowerCase()) {
        case 'critical':
        case 'high':
            animationClass = 'emoji-animate-high'; // e.g., enlarge and shake
            break;
        case 'strong':
        case 'medium':
            animationClass = 'emoji-animate-medium'; // e.g., shake
            break;
        case 'normal':
        case 'low':
            animationClass = 'emoji-animate-low'; // e.g., subtle pulse
            break;
        default:
            return; // No animation for weak or unspecified
    }

    emojiElement.classList.add(animationClass);
    setTimeout(() => {
        emojiElement.classList.remove(animationClass);
    }, EMOJI_ANIMATION_DURATION_MS);
}

/**
 * Gets an appropriate emoji for a move type and effectiveness.
 * (Simplified for this example)
 * @param {string} moveType - e.g., 'Offense', 'Defense', 'fire', 'water'
 * @param {string} effectivenessLabel - e.g., 'Strong', 'Weak'
 * @returns {string} Emoji character or empty string.
 */
function getEmojiForMoveType(moveType, effectivenessLabel) {
    if (effectivenessLabel === 'Critical') return '💥';
    if (effectivenessLabel === 'Strong') return '🔥';
    
    switch (moveType?.toLowerCase()) {
        case 'fire': return '🔥';
        case 'water': case 'ice': return '💧';
        case 'earth': case 'metal': return '🪨';
        case 'air': return '💨';
        case 'lightning': return '⚡';
        case 'physical': case 'utility': return '⚔️';
        case 'special': return '✨';
        // Add more as needed
        default: return '➡️'; // Default for generic actions
    }
}