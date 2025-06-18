/**
 * @fileoverview Efficient Rendering Utilities
 * @description Implements state comparison, DocumentFragment batching, and debouncing
 * @version 1.0.0
 */

'use strict';

//# sourceURL=utils_efficient_rendering.js

// === STATE COMPARISON ===

/**
 * Deep comparison of two objects/values for rendering optimization
 * @param {*} oldState - Previous state
 * @param {*} newState - New state
 * @returns {boolean} True if states are identical
 */
export function deepEqual(oldState, newState) {
    if (oldState === newState) return true;
    
    if (oldState == null || newState == null) return oldState === newState;
    
    if (typeof oldState !== typeof newState) return false;
    
    if (typeof oldState !== 'object') return false;
    
    if (Array.isArray(oldState) !== Array.isArray(newState)) return false;
    
    const oldKeys = Object.keys(oldState);
    const newKeys = Object.keys(newState);
    
    if (oldKeys.length !== newKeys.length) return false;
    
    for (const key of oldKeys) {
        if (!newKeys.includes(key)) return false;
        if (!deepEqual(oldState[key], newState[key])) return false;
    }
    
    return true;
}

/**
 * Shallow comparison for performance when deep comparison isn't needed
 * @param {Object} oldState - Previous state
 * @param {Object} newState - New state
 * @returns {boolean} True if states are shallowly equal
 */
export function shallowEqual(oldState, newState) {
    if (oldState === newState) return true;
    
    if (oldState == null || newState == null) return false;
    
    const oldKeys = Object.keys(oldState);
    const newKeys = Object.keys(newState);
    
    if (oldKeys.length !== newKeys.length) return false;
    
    for (const key of oldKeys) {
        if (oldState[key] !== newState[key]) return false;
    }
    
    return true;
}

/**
 * State-aware rendering wrapper that only renders when state changes
 * @param {*} oldState - Previous state
 * @param {*} newState - New state
 * @param {Function} renderFn - Function to call if state has changed
 * @param {boolean} useDeepComparison - Whether to use deep or shallow comparison
 * @returns {*} Result of renderFn or null if no render needed
 */
export function renderIfChanged(oldState, newState, renderFn, useDeepComparison = false) {
    const compareFn = useDeepComparison ? deepEqual : shallowEqual;
    
    if (compareFn(oldState, newState)) {
        return null; // No render needed
    }
    
    return renderFn(newState, oldState);
}

// === DOCUMENT FRAGMENT BATCHING ===

/**
 * Batch DOM operations using DocumentFragment
 * @param {HTMLElement} targetElement - Element to append to
 * @param {Function} operationFn - Function that adds elements to fragment
 * @returns {DocumentFragment} The created fragment (for testing/inspection)
 */
export function batchDOMOperations(targetElement, operationFn) {
    if (!targetElement || typeof operationFn !== 'function') {
        console.warn('[Efficient Rendering] Invalid parameters for batchDOMOperations');
        return null;
    }
    
    const fragment = document.createDocumentFragment();
    
    try {
        operationFn(fragment);
        targetElement.appendChild(fragment);
        return fragment;
    } catch (error) {
        console.error('[Efficient Rendering] Error in batchDOMOperations:', error);
        return null;
    }
}

/**
 * Batch append multiple elements to a target using DocumentFragment
 * @param {HTMLElement} targetElement - Element to append to
 * @param {HTMLElement[]} elements - Array of elements to append
 * @returns {boolean} Success status
 */
export function batchAppendElements(targetElement, elements) {
    if (!targetElement || !Array.isArray(elements)) {
        console.warn('[Efficient Rendering] Invalid parameters for batchAppendElements');
        return false;
    }
    
    if (elements.length === 0) return true;
    
    return batchDOMOperations(targetElement, (fragment) => {
        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                fragment.appendChild(element);
            }
        });
    }) !== null;
}

/**
 * Batch replace content of an element using DocumentFragment
 * @param {HTMLElement} targetElement - Element to replace content of
 * @param {HTMLElement[]} newElements - New elements to replace with
 * @returns {boolean} Success status
 */
export function batchReplaceContent(targetElement, newElements) {
    if (!targetElement) {
        console.warn('[Efficient Rendering] Invalid target element for batchReplaceContent');
        return false;
    }
    
    // Clear existing content efficiently
    targetElement.innerHTML = '';
    
    if (!newElements || newElements.length === 0) return true;
    
    return batchAppendElements(targetElement, newElements);
}

/**
 * Create multiple elements in batch and return fragment
 * @param {Array} elementSpecs - Array of {tag, attributes, content, children} objects
 * @returns {DocumentFragment} Fragment containing created elements
 */
export function batchCreateElements(elementSpecs) {
    const fragment = document.createDocumentFragment();
    
    if (!Array.isArray(elementSpecs)) return fragment;
    
    elementSpecs.forEach(spec => {
        if (!spec || !spec.tag) return;
        
        const element = document.createElement(spec.tag);
        
        // Set attributes
        if (spec.attributes) {
            Object.entries(spec.attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'textContent') {
                    element.textContent = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
        }
        
        // Set content
        if (spec.content) {
            element.textContent = spec.content;
        }
        
        // Add children
        if (spec.children && Array.isArray(spec.children)) {
            batchAppendElements(element, spec.children);
        }
        
        fragment.appendChild(element);
    });
    
    return fragment;
}

// === DEBOUNCING FOR RAPID STATE CHANGES ===

/**
 * Debounce function for limiting rapid state changes
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 100) {
    let timeoutId = null;
    
    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function for limiting rapid state changes
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay = 100) {
    let lastCall = 0;
    let timeoutId = null;
    
    return function throttled(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                func.apply(this, args);
            }, delay - (now - lastCall));
        }
    };
}

/**
 * Create a debounced state updater
 * @param {Function} updateFn - State update function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced update function
 */
export function createDebouncedStateUpdater(updateFn, delay = 100) {
    return debounce(updateFn, delay);
}

/**
 * Resize event debouncer specifically for window resize
 * @param {Function} resizeHandler - Resize handler function
 * @param {number} delay - Debounce delay (default 100ms for resize)
 * @returns {Function} Debounced resize handler
 */
export function createDebouncedResizeHandler(resizeHandler, delay = 100) {
    return debounce(resizeHandler, delay);
}

// === COMBINED EFFICIENT RENDERING WRAPPER ===

/**
 * Complete efficient rendering solution combining all optimizations
 * @param {Object} options - Rendering options
 * @param {*} options.oldState - Previous state
 * @param {*} options.newState - New state
 * @param {HTMLElement} options.targetElement - Element to render to
 * @param {Function} options.renderFn - Function that creates elements array
 * @param {boolean} options.useDeepComparison - Use deep state comparison
 * @param {number} options.debounceDelay - Debounce delay for rapid changes
 * @returns {Promise<boolean>} Promise resolving to render success status
 */
export function efficientRender(options) {
    const {
        oldState,
        newState,
        targetElement,
        renderFn,
        useDeepComparison = false,
        debounceDelay = 0
    } = options;
    
    // Validate inputs
    if (!targetElement || typeof renderFn !== 'function') {
        console.warn('[Efficient Rendering] Invalid parameters for efficientRender');
        return Promise.resolve(false);
    }
    
    // Create render function
    const doRender = () => {
        return new Promise((resolve) => {
            // Skip render if state hasn't changed
            const result = renderIfChanged(oldState, newState, () => {
                try {
                    const elements = renderFn(newState, oldState);
                    return batchReplaceContent(targetElement, elements);
                } catch (error) {
                    console.error('[Efficient Rendering] Error in render function:', error);
                    return false;
                }
            }, useDeepComparison);
            
            if (result === null) {
                resolve(true); // No render needed, consider it successful
            } else {
                resolve(result);
            }
        });
    };
    
    // Apply debouncing if requested
    if (debounceDelay > 0) {
        const debouncedRender = debounce(doRender, debounceDelay);
        debouncedRender();
        return Promise.resolve(true); // Return immediately for debounced calls
    }
    
    return doRender();
}

// === PERFORMANCE MONITORING ===

/**
 * Performance monitoring for rendering operations
 */
export class RenderingPerformanceMonitor {
    constructor() {
        this.stats = {
            totalRenders: 0,
            skippedRenders: 0,
            renderTime: 0,
            fragmentOperations: 0,
            debouncedCalls: 0
        };
    }
    
    /**
     * Start timing a render operation
     * @returns {number} Start time
     */
    startTiming() {
        return performance.now();
    }
    
    /**
     * End timing and record stats
     * @param {number} startTime - Start time from startTiming()
     * @param {boolean} wasSkipped - Whether render was skipped
     */
    endTiming(startTime, wasSkipped = false) {
        const duration = performance.now() - startTime;
        this.stats.renderTime += duration;
        
        if (wasSkipped) {
            this.stats.skippedRenders++;
        } else {
            this.stats.totalRenders++;
        }
    }
    
    /**
     * Record fragment operation
     */
    recordFragmentOperation() {
        this.stats.fragmentOperations++;
    }
    
    /**
     * Record debounced call
     */
    recordDebouncedCall() {
        this.stats.debouncedCalls++;
    }
    
    /**
     * Get performance stats
     * @returns {Object} Performance statistics
     */
    getStats() {
        return {
            ...this.stats,
            averageRenderTime: this.stats.totalRenders > 0 
                ? this.stats.renderTime / this.stats.totalRenders 
                : 0,
            renderEfficiency: this.stats.totalRenders + this.stats.skippedRenders > 0
                ? this.stats.skippedRenders / (this.stats.totalRenders + this.stats.skippedRenders)
                : 0
        };
    }
    
    /**
     * Reset stats
     */
    reset() {
        this.stats = {
            totalRenders: 0,
            skippedRenders: 0,
            renderTime: 0,
            fragmentOperations: 0,
            debouncedCalls: 0
        };
    }
}

// Global performance monitor instance
export const performanceMonitor = new RenderingPerformanceMonitor(); 