// FILE: utils_clipboard.js
'use strict';
/**
Copies text to the clipboard using the modern Clipboard API.
Provides a user-friendly alert for success or failure.
@param {string} text - The text content to copy.
@returns {Promise<boolean>} A promise that resolves to true if successful, false otherwise.
*/
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

/**
 * Gets a random element from an array.
 * @param {Array<any>} arr - The array to pick from.
 * @returns {any|null} A random element from the array, or null if the array is empty.
 */
// This function is being replaced by getRandomElementSeeded in utils_seeded_random.js
// Kept for reference or if specific non-seeded behavior is needed elsewhere.
// export const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;