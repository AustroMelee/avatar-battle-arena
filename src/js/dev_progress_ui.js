/**
 * @fileoverview Development Progress UI
 * @description Progress indicator management for development mode
 * @version 1.0
 */

"use strict";

/**
 * Creates and displays a progress bar for batch operations
 * @param {string} initialMessage - Initial message to display
 * @returns {Object} Progress bar controller with update and remove methods
 */
export function createProgressBar(initialMessage = "Starting...") {
    const progressBar = document.createElement("div");
    progressBar.style.position = "fixed";
    progressBar.style.bottom = "20px";
    progressBar.style.right = "20px";
    progressBar.style.backgroundColor = "rgba(0,0,0,0.8)";
    progressBar.style.color = "white";
    progressBar.style.padding = "10px";
    progressBar.style.borderRadius = "5px";
    progressBar.style.zIndex = "1000";
    progressBar.style.fontFamily = "monospace";
    progressBar.style.fontSize = "14px";
    progressBar.textContent = initialMessage;
    
    document.body.appendChild(progressBar);
    
    return {
        update: (message) => {
            progressBar.textContent = message;
        },
        updateProgress: (completed, errors, total) => {
            progressBar.textContent = `Progress: ${completed + errors}/${total} (Errors: ${errors})`;
        },
        remove: () => {
            if (progressBar.parentNode) {
                document.body.removeChild(progressBar);
            }
        }
    };
}

/**
 * Creates a detailed progress display with statistics
 * @param {string} title - Title for the progress display
 * @returns {Object} Detailed progress controller
 */
export function createDetailedProgress(title = "Batch Operation") {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.backgroundColor = "rgba(0,0,0,0.9)";
    container.style.color = "white";
    container.style.padding = "15px";
    container.style.borderRadius = "8px";
    container.style.zIndex = "1001";
    container.style.fontFamily = "monospace";
    container.style.fontSize = "12px";
    container.style.minWidth = "300px";
    container.style.maxWidth = "400px";
    
    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.margin = "0 0 10px 0";
    titleElement.style.color = "#4CAF50";
    
    const statusElement = document.createElement("div");
    statusElement.style.marginBottom = "8px";
    
    const progressElement = document.createElement("div");
    progressElement.style.marginBottom = "8px";
    
    const errorElement = document.createElement("div");
    errorElement.style.color = "#f44336";
    errorElement.style.marginBottom = "8px";
    
    const detailsElement = document.createElement("div");
    detailsElement.style.fontSize = "11px";
    detailsElement.style.opacity = "0.8";
    
    container.appendChild(titleElement);
    container.appendChild(statusElement);
    container.appendChild(progressElement);
    container.appendChild(errorElement);
    container.appendChild(detailsElement);
    
    document.body.appendChild(container);
    
    return {
        updateStatus: (status) => {
            statusElement.textContent = `Status: ${status}`;
        },
        updateProgress: (completed, errors, total) => {
            const percentage = Math.round((completed + errors) / total * 100);
            progressElement.innerHTML = `
                Progress: ${completed + errors}/${total} (${percentage}%)
                <div style="background: #333; height: 4px; margin-top: 4px; border-radius: 2px;">
                    <div style="background: #4CAF50; height: 100%; width: ${percentage}%; border-radius: 2px;"></div>
                </div>
            `;
        },
        updateErrors: (errors, errorDetails = []) => {
            if (errors > 0) {
                errorElement.textContent = `Errors: ${errors}`;
                if (errorDetails.length > 0) {
                    const lastError = errorDetails[errorDetails.length - 1];
                    detailsElement.textContent = `Last error: ${lastError.error}`;
                }
            } else {
                errorElement.textContent = "";
                detailsElement.textContent = "";
            }
        },
        setDetails: (details) => {
            detailsElement.textContent = details;
        },
        remove: () => {
            if (container.parentNode) {
                document.body.removeChild(container);
            }
        }
    };
} 