/**
 * @fileoverview Manages UI layout updates.
 */

"use strict";

import { markAllComponentsDirty } from "./ui_state.js";

/**
 * Updates layout after window resize.
 */
export function updateLayout() {
    console.debug("[UI] Updating layout after resize");
    // This will need to get the list of required elements from somewhere
    // For now, I'll pass an empty array.
    markAllComponentsDirty([]); 
} 