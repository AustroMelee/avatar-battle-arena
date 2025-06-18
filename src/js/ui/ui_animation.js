/**
 * @fileoverview Manages UI animations.
 */

"use strict";

const DEFAULT_ANIMATION_DURATION = 300;

/**
 * Animates showing an element.
 * @param {HTMLElement} element - The element to animate.
 * @returns {Promise<void>}
 */
export async function animateShow(element) {
    return new Promise((resolve) => {
        element.style.display = "block";
        element.style.opacity = "0";
        element.style.transform = "translateY(-20px)";
        
        requestAnimationFrame(() => {
            element.style.transition = `opacity ${DEFAULT_ANIMATION_DURATION}ms ease, transform ${DEFAULT_ANIMATION_DURATION}ms ease`;
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
            
            setTimeout(resolve, DEFAULT_ANIMATION_DURATION);
        });
    });
}

/**
 * Animates hiding an element.
 * @param {HTMLElement} element - The element to animate.
 * @returns {Promise<void>}
 */
export async function animateHide(element) {
    return new Promise((resolve) => {
        element.style.transition = `opacity ${DEFAULT_ANIMATION_DURATION}ms ease, transform ${DEFAULT_ANIMATION_DURATION}ms ease`;
        element.style.opacity = "0";
        element.style.transform = "translateY(-20px)";
        
        setTimeout(() => {
            element.style.display = "none";
            resolve();
        }, DEFAULT_ANIMATION_DURATION);
    });
} 