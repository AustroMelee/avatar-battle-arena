/**
 * @fileoverview Battle Loop Manager
 * @description Manages the main battle simulation loop with smaller, focused components
 * @version 1.0
 */

'use strict';

import { MAX_TOTAL_TURNS } from './config_game.js';
import { BATTLE_PHASES } from './engine_battle-phase.js';
import { STALEMATE_CONFIG } from './config_phase_transitions.js';
import { evaluateTerminalState } from './engine_terminal_state.js';
import { charactersMarkedForDefeat } from './engine_curbstomp_manager.js';
import { safeGet } from './utils_safe_accessor.js';

/**
 * Battle Loop Manager class that orchestrates the battle simulation
 */
export class BattleLoopManager {
    constructor(fighter1, fighter2, battleState, phaseState) {
        // Defensive Programming: Validate critical constructor parameters
        if (!fighter1 || typeof fighter1 !== 'object') {
            throw new TypeError('[Battle Loop] fighter1 must be a valid fighter object');
        }
        if (!fighter2 || typeof fighter2 !== 'object') {
            throw new TypeError('[Battle Loop] fighter2 must be a valid fighter object');
        }
        if (!battleState || typeof battleState !== 'object') {
            throw new TypeError('[Battle Loop] battleState must be a valid state object');
        }
        if (!phaseState || typeof phaseState !== 'object') {
            throw new TypeError('[Battle Loop] phaseState must be a valid phase state object');
        }

        // Validate fighter objects have required properties
        this.validateFighter(fighter1, 'fighter1');
        this.validateFighter(fighter2, 'fighter2');

        this.fighter1 = fighter1;
        this.fighter2 = fighter2;
        this.battleState = battleState;
        this.phaseState = phaseState;
        this.battleEventLog = [];
        this.turn = 0;
        this.battleOver = false;
        this.winnerId = null;
        this.loserId = null;
        this.isStalemate = false;
        
        try {
            // Initialize turn order with error recovery
            this.initiator = this.determineInitiator();
            this.responder = this.initiator.id === fighter1.id ? fighter2 : fighter1;
        } catch (error) {
            console.error('[Battle Loop] Error during initialization:', error);
            // Fallback: Default to fighter1 as initiator
            this.initiator = fighter1;
            this.responder = fighter2;
        }
    }

    /**
     * Validates a fighter object has required properties
     * @private
     */
    validateFighter(fighter, paramName) {
        const requiredProps = ['id', 'name', 'health', 'energy', 'powerTier'];
        for (const prop of requiredProps) {
            if (fighter[prop] === undefined || fighter[prop] === null) {
                throw new Error(`[Battle Loop] ${paramName}.${prop} is required but missing`);
            }
        }
        
        // Type validation for numeric properties
        if (typeof fighter.health !== 'number' || fighter.health < 0) {
            throw new TypeError(`[Battle Loop] ${paramName}.health must be a non-negative number`);
        }
        if (typeof fighter.energy !== 'number' || fighter.energy < 0) {
            throw new TypeError(`[Battle Loop] ${paramName}.energy must be a non-negative number`);
        }
        if (typeof fighter.powerTier !== 'number') {
            throw new TypeError(`[Battle Loop] ${paramName}.powerTier must be a number`);
        }
    }

    /**
     * Determines who goes first based on power tier or random selection
     */
    determineInitiator() {
        try {
            // Defensive Programming: Ensure fighters exist and have valid power tiers
            const f1PowerTier = safeGet(this.fighter1, 'powerTier', 0);
            const f2PowerTier = safeGet(this.fighter2, 'powerTier', 0);
            
            if (f1PowerTier > f2PowerTier) {
                return this.fighter1;
            } else if (f2PowerTier > f1PowerTier) {
                return this.fighter2;
            } else {
                // Random selection with fallback
                try {
                    return Math.random() < 0.5 ? this.fighter1 : this.fighter2;
                } catch (randomError) {
                    console.warn('[Battle Loop] Random selection failed, defaulting to fighter1');
                    return this.fighter1;
                }
            }
        } catch (error) {
            console.error('[Battle Loop] Error determining initiator:', error);
            return this.fighter1; // Safe fallback
        }
    }

    /**
     * Main battle loop execution
     */
    async executeBattleLoop() {
        try {
            console.log('[Battle Loop] Starting main battle loop');
            console.debug(`[Battle Loop] Battle configuration: ${safeGet(this.fighter1, 'name', 'Unknown')} vs ${safeGet(this.fighter2, 'name', 'Unknown')}, Turn order: ${safeGet(this.initiator, 'name', 'Unknown')} first`);
            
            // Defensive Programming: Validate state before starting
            this.validateBattleState();
            
            // Pre-battle setup
            await this.executePreBattlePhase();
            
            // Main combat loop with safety checks
            while (this.turn < MAX_TOTAL_TURNS && !this.battleOver && this.turn < 1000) { // Hard limit safety
                try {
                    await this.executeTurn();
                    this.turn++;
                    
                    // Defensive Programming: Ensure fighters still exist before switching
                    if (this.initiator && this.responder) {
                        [this.initiator, this.responder] = [this.responder, this.initiator];
                    } else {
                        console.error('[Battle Loop] Fighter objects became null during battle');
                        this.battleOver = true;
                        break;
                    }
                    
                    // Check for prolonged battle stalemate
                    if (this.shouldCheckForStalemate()) {
                        this.checkStalemateConditions();
                    }
                } catch (turnError) {
                    console.error(`[Battle Loop] Error during turn ${this.turn}:`, turnError);
                    // Try to recover or end battle gracefully
                    this.battleOver = true;
                    break;
                }
            }
            
            // Safety check for infinite loop prevention
            if (this.turn >= 1000) {
                console.warn('[Battle Loop] Battle terminated due to excessive turns (safety limit)');
                this.isStalemate = true;
                this.battleOver = true;
            }
            
            // Post-battle cleanup
            this.executePostBattlePhase();
            
            return this.getBattleResults();
        } catch (error) {
            console.error('[Battle Loop] Critical error in battle execution:', error);
            // Return a safe fallback result
            return this.getEmergencyBattleResult(error);
        }
    }

    /**
     * Validates the battle state is ready for execution
     * @private
     */
    validateBattleState() {
        if (!this.initiator || !this.responder) {
            throw new Error('[Battle Loop] Invalid turn order - missing initiator or responder');
        }
        if (this.turn < 0) {
            throw new Error('[Battle Loop] Invalid turn number');
        }
        if (!Array.isArray(this.battleEventLog)) {
            this.battleEventLog = []; // Defensive recovery
            console.warn('[Battle Loop] Battle event log was not an array - initialized empty array');
        }
    }

    /**
     * Creates an emergency battle result in case of critical failure
     * @private
     */
    getEmergencyBattleResult(error) {
        console.error('[Battle Loop] Creating emergency battle result due to:', error);
        return {
            winnerId: null,
            loserId: null,
            isStalemate: true,
            battleEventLog: this.battleEventLog || [],
            error: error.message || 'Critical battle error',
            emergencyTermination: true
        };
    }

    /**
     * Executes pre-battle phase including initial banter and curbstomp checks
     */
    async executePreBattlePhase() {
        console.log('[Battle Loop] Executing pre-battle phase');
        
        // Initial banter and setup would go here
        // This replaces the initial narrative setup from the original function
        
        // Pre-battle curbstomp checks
        this.checkPreBattleCurbstompConditions();
        
        // Check if battle ended in pre-battle phase
        const terminalOutcome = evaluateTerminalState(this.fighter1, this.fighter2, this.isStalemate);
        if (terminalOutcome.battleOver) {
            this.battleOver = terminalOutcome.battleOver;
            this.winnerId = terminalOutcome.winnerId;
            this.loserId = terminalOutcome.loserId;
            this.isStalemate = terminalOutcome.isStalemate;
        }
    }

    /**
     * Executes a single turn of combat
     */
    async executeTurn() {
        console.log(`[Battle Loop] Executing turn ${this.turn}`);
        console.debug(`[Battle Loop] Turn ${this.turn}: ${this.initiator.name} (HP: ${this.initiator.health}, Energy: ${this.initiator.energy}) vs ${this.responder.name} (HP: ${this.responder.health}, Energy: ${this.responder.energy})`);
        
        // Update battle state for current turn
        this.updateBattleStateForTurn();
        
        // Handle phase transitions
        this.handlePhaseTransitions();
        
        // Process turn segments for both fighters
        await this.processTurnSegment(this.initiator, this.responder);
        
        if (!this.battleOver) {
            await this.processTurnSegment(this.responder, this.initiator);
        }
        
        // Update turn-based state
        this.updateTurnState();
    }

    /**
     * Updates battle state at the start of each turn
     */
    updateBattleStateForTurn() {
        this.battleState.turn = this.turn;
        
        // Reset turn-specific flags
        this.battleState.opponentLandedCriticalHit = false;
        this.battleState.opponentTaunted = false;
        this.battleState.opponentUsedLethalForce = false;
        this.battleState.opponentLandedSignificantHits = 0;
        this.battleState.characterReceivedCriticalHit = false;
        this.battleState.characterLandedStrongOrCriticalHitLastTurn = false;
    }

    /**
     * Handles phase transitions if needed
     */
    handlePhaseTransitions() {
        // Import and use the phase transition logic
        // This replaces the phase transition code from the original function
        console.log(`[Battle Loop] Current phase: ${this.phaseState.currentPhase}`);
        
        // Phase transition logic would go here
        // For now, this is a placeholder that maintains the interface
    }

    /**
     * Processes a single fighter's turn segment
     */
    async processTurnSegment(attacker, defender) {
        console.log(`[Battle Loop] Processing turn segment: ${attacker.name} vs ${defender.name}`);
        
        // Check if attacker is marked for defeat
        if (charactersMarkedForDefeat.has(attacker.id)) {
            attacker.aiLog.push(`[Action Skipped]: ${attacker.name} is already marked for defeat and cannot act this segment.`);
            return;
        }
        
        if (this.battleOver || this.isStalemate) {
            return;
        }
        
        // Update battle state for personality checks
        this.updateBattleStateForPersonality(attacker, defender);
        
        // Check curbstomp conditions
        this.checkCurbstompConditions(attacker, defender);
        
        // Process character action (move selection, execution, etc.)
        await this.processCharacterAction(attacker, defender);
        
        // Check for battle end after action
        this.checkBattleEndConditions();
    }

    /**
     * Updates battle state for personality trigger evaluation
     */
    updateBattleStateForPersonality(attacker, defender) {
        this.battleState.opponentLandedCriticalHit = 
            safeGet(defender, 'lastMoveForPersonalityCheck.effectiveness', '') === 'Critical';
        this.battleState.opponentUsedLethalForce = 
            safeGet(defender, 'lastMoveForPersonalityCheck.isHighRisk', false);
        this.battleState.characterReceivedCriticalHit = false;
    }

    /**
     * Checks curbstomp conditions for the current fighters
     */
    checkCurbstompConditions(attacker, defender) {
        // Curbstomp condition checking logic would go here
        // This is a placeholder for the curbstomp system integration
        console.log(`[Battle Loop] Checking curbstomp conditions for ${attacker.name} vs ${defender.name}`);
    }

    /**
     * Processes a character's action during their turn
     */
    async processCharacterAction(attacker, defender) {
        // Handle stunned state
        if (attacker.isStunned) {
            this.handleStunnedCharacter(attacker);
            return;
        }
        
        // Process tactical state duration
        this.updateTacticalState(attacker);
        
        // Character action processing (move selection, calculation, etc.) would go here
        console.log(`[Battle Loop] Processing action for ${attacker.name}`);
        
        // This is where the original processTurnSegment logic would be broken down further
    }

    /**
     * Handles a stunned character's turn
     */
    handleStunnedCharacter(character) {
        character.aiLog.push(`[Action Skipped]: ${character.name} is stunned and cannot act this segment.`);
        
        const stunEvent = {
            type: 'stun_event',
            actorId: character.id,
            characterName: character.name,
            text: `${character.name} is stunned and unable to move!`,
            html_content: `<p class="narrative-action char-${character.id}">${character.name} is stunned and unable to move!</p>`
        };
        
        this.battleEventLog.push(stunEvent);
        character.isStunned = false;
    }

    /**
     * Updates a character's tactical state duration
     */
    updateTacticalState(character) {
        if (character.tacticalState) {
            character.tacticalState.duration--;
            
            if (character.tacticalState.duration <= 0) {
                character.aiLog.push(`[Tactical State Expired]: ${character.name} is no longer ${character.tacticalState.name}.`);
                character.tacticalState = null;
            }
        }
    }

    /**
     * Updates state at the end of each turn
     */
    updateTurnState() {
        // Environmental impact calculations
        this.updateEnvironmentalState();
        
        // Energy recovery
        this.processEnergyRecovery();
        
        // Other end-of-turn updates
    }

    /**
     * Updates environmental state based on battle damage
     */
    updateEnvironmentalState() {
        // Environmental state update logic would go here
        console.log('[Battle Loop] Updating environmental state');
    }

    /**
     * Processes energy recovery for both fighters
     */
    processEnergyRecovery() {
        // Energy recovery logic would go here
        console.log('[Battle Loop] Processing energy recovery');
    }

    /**
     * Checks pre-battle curbstomp conditions
     */
    checkPreBattleCurbstompConditions() {
        // Pre-battle curbstomp checking logic
        console.log('[Battle Loop] Checking pre-battle curbstomp conditions');
    }

    /**
     * Checks if battle should check for stalemate conditions
     */
    shouldCheckForStalemate() {
        return this.turn >= STALEMATE_CONFIG.MIN_TURN_FOR_DETECTION &&
               !STALEMATE_CONFIG.EXCLUDED_PHASES.includes(this.phaseState.currentPhase);
    }

    /**
     * Checks for stalemate conditions
     */
    checkStalemateConditions() {
        const config = STALEMATE_CONFIG;
        
        if (this.fighter1.consecutiveDefensiveTurns >= config.CONSECUTIVE_DEFENSIVE_TURNS &&
            this.fighter2.consecutiveDefensiveTurns >= config.CONSECUTIVE_DEFENSIVE_TURNS &&
            Math.abs(this.fighter1.hp - this.fighter2.hp) < config.HP_DIFFERENCE_THRESHOLD) {
            
            // Mark both for defeat to trigger stalemate
            if (this.fighter1.hp > 0) charactersMarkedForDefeat.add(this.fighter1.id);
            if (this.fighter2.hp > 0) charactersMarkedForDefeat.add(this.fighter2.id);
            
            const terminalOutcome = evaluateTerminalState(this.fighter1, this.fighter2, true);
            this.battleOver = terminalOutcome.battleOver;
            this.winnerId = terminalOutcome.winnerId;
            this.loserId = terminalOutcome.loserId;
            this.isStalemate = terminalOutcome.isStalemate;
            
            this.fighter1.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
            this.fighter2.aiLog.push("[Stalemate Condition Met]: Prolonged defensive engagement.");
        }
    }

    /**
     * Checks for battle end conditions after each action
     */
    checkBattleEndConditions() {
        const terminalOutcome = evaluateTerminalState(this.fighter1, this.fighter2, this.isStalemate);
        
        if (terminalOutcome.battleOver) {
            this.battleOver = terminalOutcome.battleOver;
            this.winnerId = terminalOutcome.winnerId;
            this.loserId = terminalOutcome.loserId;
            this.isStalemate = terminalOutcome.isStalemate;
        }
    }

    /**
     * Executes post-battle phase including final narration
     */
    executePostBattlePhase() {
        console.log('[Battle Loop] Executing post-battle phase');
        
        // Handle timeout victory if battle wasn't resolved by KO or curbstomp
        if (!this.battleOver) {
            this.handleTimeoutVictory();
        }
        
        // Add final narration events
        this.addFinalNarrationEvents();
        
        // Generate fighter summaries
        this.generateFighterSummaries();
    }

    /**
     * Handles victory by timeout (health-based decision)
     */
    handleTimeoutVictory() {
        const terminalOutcome = evaluateTerminalState(this.fighter1, this.fighter2, false);
        this.battleOver = terminalOutcome.battleOver;
        this.winnerId = terminalOutcome.winnerId;
        this.loserId = terminalOutcome.loserId;
        this.isStalemate = terminalOutcome.isStalemate;
        
        if (!this.battleOver) {
            if (this.fighter1.hp === this.fighter2.hp) {
                this.isStalemate = true;
            } else {
                this.winnerId = (this.fighter1.hp > this.fighter2.hp) ? this.fighter1.id : this.fighter2.id;
                this.loserId = (this.winnerId === this.fighter1.id) ? this.fighter2.id : this.fighter1.id;
            }
        }
    }

    /**
     * Adds final narration events to the battle log
     */
    addFinalNarrationEvents() {
        // Final narration logic would go here
        console.log('[Battle Loop] Adding final narration events');
    }

    /**
     * Generates summaries for both fighters
     */
    generateFighterSummaries() {
        // Fighter summary generation logic would go here
        console.log('[Battle Loop] Generating fighter summaries');
    }

    /**
     * Returns the final battle results
     */
    getBattleResults() {
        return {
            log: this.battleEventLog,
            winnerId: this.winnerId,
            loserId: this.loserId,
            isDraw: this.isStalemate,
            finalState: {
                fighter1: { ...this.fighter1 },
                fighter2: { ...this.fighter2 }
            },
            environmentState: this.battleState.environmentState,
            phaseSummary: this.phaseState.phaseSummaryLog,
            totalTurns: this.turn
        };
    }
}

/**
 * Factory function to create and execute a battle loop
 */
export async function executeBattleLoop(fighter1, fighter2, battleState, phaseState) {
    const battleLoop = new BattleLoopManager(fighter1, fighter2, battleState, phaseState);
    return await battleLoop.executeBattleLoop();
} 