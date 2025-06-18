// FILE: ui_momentum-escalation-display.js
"use strict";

// State-driven momentum and escalation display - delegates to centralized state manager

import { updateMomentumDisplay, updateEscalationDisplay } from "./state_manager.js";

// Re-export state manager functions for backward compatibility
export { updateMomentumDisplay, updateEscalationDisplay };