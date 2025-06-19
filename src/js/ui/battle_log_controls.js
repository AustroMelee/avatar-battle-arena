/**
 * @fileoverview Battle Log Controls Module
 * @description Handles toggling and copying of detailed battle logs.
 * Keeps event binding isolated and provides clean control interfaces.
 * @version 1.0
 */

"use strict";

/**
 * Sets up toggle functionality for battle logs
 * @param {HTMLElement} toggleBtn - Toggle button element
 * @param {HTMLElement} logContent - Log content element to toggle
 */
export function setupToggleLogControl(toggleBtn, logContent) {
    if (!toggleBtn || !logContent) {
        console.warn("Toggle log control setup failed: missing elements");
        return;
    }

    // Ensure initial state is collapsed
    if (!logContent.classList.contains("collapsed")) {
        logContent.classList.add("collapsed");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.textContent = "Show Detailed Battle Logs ►";
    }

    // Set up toggle event
    toggleBtn.onclick = () => {
        const isCollapsed = logContent.classList.toggle("collapsed");
        toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
        toggleBtn.textContent = isCollapsed 
            ? "Show Detailed Battle Logs ►" 
            : "Hide Detailed Battle Logs ▼";
    };
}

/**
 * Sets up copy functionality for battle logs
 * @param {HTMLElement} copyBtn - Copy button element
 * @param {HTMLElement} logContent - Log content element to copy from
 */
export function setupCopyLogControl(copyBtn, logContent) {
    if (!copyBtn || !logContent) {
        console.warn("Copy log control setup failed: missing elements");
        return;
    }

    copyBtn.onclick = async () => {
        try {
            // Dynamically import copyToClipboard to avoid circular dependency
            const { copyToClipboard } = await import("../utils_clipboard.js");
            await copyToClipboard(logContent.textContent || "");
            
            // Update button feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "📋 Copied!";
            
            setTimeout(() => {
                copyBtn.textContent = originalText || "📋 Copy Battle Logs";
            }, 2000);
            
        } catch (err) {
            console.error("Failed to copy detailed logs:", err);
            
            // Update button with error feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "Error Copying";
            
            setTimeout(() => {
                copyBtn.textContent = originalText || "📋 Copy Battle Logs";
            }, 2000);
        }
    };
}

/**
 * Sets up both toggle and copy controls for battle logs
 * @param {HTMLElement} toggleBtn - Toggle button element
 * @param {HTMLElement} copyBtn - Copy button element
 * @param {HTMLElement} logContent - Log content element
 */
export function setupBattleLogControls(toggleBtn, copyBtn, logContent) {
    setupToggleLogControl(toggleBtn, logContent);
    setupCopyLogControl(copyBtn, logContent);
}

/**
 * Resets battle log controls to initial state
 * @param {HTMLElement} toggleBtn - Toggle button element
 * @param {HTMLElement} copyBtn - Copy button element
 * @param {HTMLElement} logContent - Log content element to reset
 */
export function resetBattleLogControls(toggleBtn, copyBtn, logContent) {
    if (logContent) {
        logContent.innerHTML = "";
        if (!logContent.classList.contains("collapsed")) {
            logContent.classList.add("collapsed");
        }
    }

    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.textContent = "Show Detailed Battle Logs ►";
    }

    if (copyBtn) {
        copyBtn.textContent = "📋 Copy Battle Logs";
    }
}

export function initializeBattleLogControls() {
    // ...
    // Copy to clipboard functionality
    // const copyButton = document.getElementById("copy-log-button");
    // copyButton.addEventListener("click", async () => {
    //     const logContent = document.getElementById("battle-log-content");
    //     if (logContent) {
    //         // Dynamically import copyToClipboard to avoid circular dependency
    //         // const { copyToClipboard } = await import("../utils_clipboard.js");
    //         // await copyToClipboard(logContent.textContent || "");
    //         // copyButton.textContent = "Copied!";
    //         // setTimeout(() => (copyButton.textContent = "Copy Log"), 2000);
    //     }
    // });
} 