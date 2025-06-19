/**
 * @fileoverview The main HTML Log Builder class.
 */

"use strict";

import { processEvent } from "./event_handlers.js";
import { resetBuilder, finalizeBuilder } from "./state.js";
import { getErrorMessage, getDefaultMessage } from "./html_generators.js";

export class HtmlLogBuilder {
    htmlLog = "";
    currentTurnDivOpen = false;
    currentPhaseDivOpen = false;
    currentTurn = -1;

    constructor() {
        this.reset();
    }

    build(structuredLogEvents) {
        if (!Array.isArray(structuredLogEvents)) {
            return getErrorMessage("Invalid log data.");
        }
        if (structuredLogEvents.length === 0) {
            return getDefaultMessage();
        }

        this.reset();
        for (const event of structuredLogEvents) {
            this.processEvent(event);
        }
        return this.finalize();
    }

    reset() {
        Object.assign(this, resetBuilder());
    }

    processEvent(event) {
        processEvent(this, event);
    }

    finalize() {
        return finalizeBuilder(this);
    }
} 