/**
 * @fileoverview Manages notifications for the replay UI.
 */

"use strict";

/**
 * Shows a notification to the user.
 * @param {string} message - The message to display.
 * @param {'info' | 'success' | 'warning' | 'error'} type - The type of notification.
 */
export function showNotification(message, type = "info") {
    // Implementation would go here. For now, we'll just log to the console.
    console.log(`[Notification] ${type.toUpperCase()}: ${message}`);
} 