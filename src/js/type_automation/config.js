/**
 * @fileoverview Configuration for the type automation utility.
 */

"use strict";

/**
 * Module-specific type import configurations.
 * @type {Object<string, string[]>}
 */
export const MODULE_TYPE_CONFIGS = {
    "engine_": ["Fighter", "BattleState", "PhaseState", "BattleEvent", "MoveResult"],
    "ui_": ["UIState", "SelectionState", "RenderState", "AnimationState"],
    "utils_": ["ValidationResult", "ConfigOptions", "PerformanceMetrics"],
    "data_": ["Fighter", "Move", "Location", "Effect"],
    "ai_": ["AiDecision", "AiAnalysis", "AiPersonality", "AiMemory"],
    "battle_": ["BattleEvent", "BattleState", "BattleResult"],
    "config_": ["ConfigOptions", "ValidationResult"],
    "constants_": [],
};

/**
 * Common type mappings for parameter inference.
 * @type {Object<string, string>}
 */
export const COMMON_TYPE_MAPPINGS = {
    "id": "string", "name": "string", "text": "string", "message": "string",
    "url": "string", "path": "string", "count": "number", "index": "number",
    "value": "number", "amount": "number", "duration": "number", "enabled": "boolean",
    "visible": "boolean", "active": "boolean", "valid": "boolean", "callback": "Function",
    "handler": "Function", "listener": "Function", "element": "HTMLElement",
    "button": "HTMLButtonElement", "input": "HTMLInputElement", "event": "Event",
    "error": "Error", "data": "Object", "config": "Object", "options": "Object",
    "state": "Object", "result": "Object",
}; 