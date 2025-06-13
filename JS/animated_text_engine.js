// FILE: js/animated_text_engine.js
'use strict';

import { getCharacterImage } from './ui.js'; 
import { focusOnLatestMessage } from './camera_control.js';

const TYPEWRITER_SPEED_MS = 25; 
const EMOJI_ANIMATION_DURATION_MS = 500; 
const HIGH_IMPACT_PAUSE_MS = 1500; 
const DEFAULT_PAUSE_MS = 500; 

let currentTimeoutId = null;
let animationQueueInternal = [];
let currentMessageIndex = 0;
let simulationContainerElement = null;
let onStepCompleteCallback = null; 

export function stopCurrentAnimation() {
    if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
    }
}

export function startAnimationSequence(queue, container, onComplete) {
    stopCurrentAnimation(); 
    animationQueueInternal = [...queue]; 
    currentMessageIndex = 0;
    simulationContainerElement = container;
    onStepCompleteCallback = onComplete;

    if (animationQueueInternal.length === 0) {
        console.warn("Animation queue is empty.");
        if (onStepCompleteCallback) onStepCompleteCallback(true); 
        return;
    }
    
    processNextMessage();
}

function processNextMessage() {
    if (!simulationContainerElement) { // Guard if container somehow becomes null mid-sequence
        console.error("Simulation container is null, cannot process messages.");
        if (onStepCompleteCallback) onStepCompleteCallback(true); // End of queue due to error
        return;
    }
    if (currentMessageIndex >= animationQueueInternal.length) {
        console.log("Animation queue finished.");
        if (onStepCompleteCallback) onStepCompleteCallback(true); 
        return;
    }

    const message = animationQueueInternal[currentMessageIndex];
    currentMessageIndex++;

    renderMessage(message);
}

function renderMessage(message) {
    if (!simulationContainerElement || !message || typeof message.text !== 'string') {
        console.error("Invalid message object or container for rendering:", message);
        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallback) onStepCompleteCallback(false); // Still call callback
            processNextMessage();
        }, DEFAULT_PAUSE_MS);
        return;
    }

    const lineElement = document.createElement('div');
    lineElement.className = 'simulation-line';
    if (message.isPhaseHeader) lineElement.classList.add('phase-header-simulated');
    if (message.isMoveAction) lineElement.classList.add('move-action-simulated');
    if (message.isDialogue) {
        lineElement.classList.add('dialogue-simulated');
        // Add specific class for dialogue type (spoken, internal, action)
        if(message.dialogueType) lineElement.classList.add(`dialogue-${message.dialogueType}`);
    }
    if (message.isEnvironmental) lineElement.classList.add('environmental-simulated');

    if (message.actorId) {
        const iconUrl = getCharacterImage(message.actorId); 
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
    
    // Prepend emoji to textSpan if it's a move action and emoji exists
    if (message.isMoveAction && message.moveType) { 
        const emoji = getEmojiForMoveType(message.moveType, message.effectivenessLabel);
        if (emoji) {
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'simulation-move-emoji';
            emojiSpan.textContent = emoji + ' '; 
            textSpan.appendChild(emojiSpan); 
        }
    }
    lineElement.appendChild(textSpan);
    
    simulationContainerElement.appendChild(lineElement);
    focusOnLatestMessage(simulationContainerElement, lineElement); 

    typeMessage(textSpan, message.text, () => {
        const emojiElement = textSpan.querySelector('.simulation-move-emoji');
        if (emojiElement && message.impactLevel) {
            animateEmoji(emojiElement, message.impactLevel);
        }

        const pauseDuration = message.pauseAfter || 
                              (message.impactLevel === 'high' || message.impactLevel === 'critical' ? HIGH_IMPACT_PAUSE_MS : DEFAULT_PAUSE_MS);
        
        currentTimeoutId = setTimeout(() => {
            if (onStepCompleteCallback) onStepCompleteCallback(false); 
            processNextMessage(); 
        }, pauseDuration);
    });
}

function typeMessage(element, text, onFinished) {
    let i = 0;
    // If there's an emoji already, we type after it.
    // Otherwise, we clear and type.
    const existingEmoji = element.querySelector('.simulation-move-emoji');
    let textContentTarget = element;

    if (existingEmoji) {
        // Create a new span for the text itself, to append after the emoji
        let actualTextSpan = element.querySelector('.typewriter-target');
        if (!actualTextSpan) {
            actualTextSpan = document.createElement('span');
            actualTextSpan.className = 'typewriter-target';
            element.appendChild(actualTextSpan);
        }
        textContentTarget = actualTextSpan;
    }
    textContentTarget.innerHTML = ''; // Clear only the target span for text

    function type() {
        if (i < text.length) {
            textContentTarget.insertAdjacentText('beforeend', text.charAt(i));
            i++;
            currentTimeoutId = setTimeout(type, TYPEWRITER_SPEED_MS);
        } else {
            if (onFinished) onFinished();
        }
    }
    type();
}

function animateEmoji(emojiElement, impactLevel) {
    if (!emojiElement) return;
    let animationClass = '';
    switch (impactLevel?.toLowerCase()) { // Add null check for impactLevel
        case 'critical':
        case 'high':
            animationClass = 'emoji-animate-high'; 
            break;
        case 'strong': // Strong is often considered high impact
             animationClass = 'emoji-animate-high'; 
            break;
        case 'medium':
            animationClass = 'emoji-animate-medium'; 
            break;
        case 'normal': // Normal impact
            animationClass = 'emoji-animate-medium';
            break;
        case 'low':
            animationClass = 'emoji-animate-low'; 
            break;
        default:
            return; 
    }
    emojiElement.classList.add(animationClass);
    setTimeout(() => {
        emojiElement.classList.remove(animationClass);
    }, EMOJI_ANIMATION_DURATION_MS);
}

function getEmojiForMoveType(moveType, effectivenessLabel) {
    if (!moveType) return '➡️'; // Default if moveType is undefined
    if (effectivenessLabel === 'Critical') return '💥';
    if (effectivenessLabel === 'Strong') return '🔥'; // Strong can still use its own emoji
    
    switch (moveType.toLowerCase()) {
        case 'fire': return '🔥';
        case 'water': return '💧';
        case 'ice': return '❄️'; // Specific for ice
        case 'earth': return '🪨';
        case 'metal': return '⚙️'; // Specific for metal
        case 'air': return '💨';
        case 'lightning': return '⚡';
        case 'physical': return '⚔️';
        case 'utility': return '🛠️'; // More distinct utility emoji
        case 'special': return '✨'; // For chi-blocking, bloodbending etc.
        case 'offense': return '⚔️'; // Fallback for general offense
        case 'defense': return '🛡️'; // Fallback for general defense
        default: return '➡️'; 
    }
}