// FILE: utils_clipboard.js
'use strict';
/**
Copies text to the clipboard using the modern Clipboard API.
Provides a user-friendly alert for success or failure.
@param {string} text - The text content to copy.
@returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
*/
export async function copyToClipboard(text) {
if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.writeText) {
// Fallback for environments without Clipboard API (e.g., older browsers, some non-browser contexts)
console.warn("Clipboard API not available. Attempting fallback copy method.");
try {
const textarea = document.createElement('textarea');
textarea.value = text;
textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in some browsers
textarea.style.opacity = '0'; // Hide textarea
document.body.appendChild(textarea);
textarea.focus();
textarea.select();
document.execCommand('copy');
document.body.removeChild(textarea);
alert("Logs copied to clipboard! (Fallback method)");
return true;
} catch (err) {
console.error('Fallback copy method failed:', err);
alert("Failed to copy logs to clipboard. Please try manually copying from the console.");
return false;
}
}
try {
await navigator.clipboard.writeText(text);
alert("Logs copied to clipboard!");
return true;
} catch (err) {
console.error('Failed to copy logs using Clipboard API:', err);
alert("Failed to copy logs to clipboard. Please enable clipboard access or try manually copying from the console.");
return false;
}
}

/**
 * Returns a random element from an array.
 * @param {Array<any>} arr - The input array.
 * @returns {any} A random element from the array.
 */
export function getRandomElement(arr) {
    if (!arr || arr.length === 0) {
        return undefined;
    }
    return arr[Math.floor(Math.random() * arr.length)];
}