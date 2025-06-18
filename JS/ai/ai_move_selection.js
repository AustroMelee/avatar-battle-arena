/**
 * @fileoverview AI Move Selection and Randomization
 * @description Handles softmax probabilities, distribution sampling, and final move selection.
 * Pure selection logic with controlled randomness.
 * @version 1.0
 */

'use strict';

import { safeGet } from '../utils_safe_accessor.js';

/**
 * Default struggle move for fallback cases
 */
const STRUGGLE_MOVE = {
    name: "Struggle",
    verb: 'struggle',
    type: 'Offense',
    power: 10,
    element: 'physical',
    moveTags: []
};

/**
 * Converts move weights to probabilities using softmax
 * Temperature controls randomness: lower = more deterministic, higher = more random
 */
export function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return [];
    }

    const temp = Math.max(0.01, temperature); // Prevent division by zero
    const positiveMoves = weightedMoves.filter(m => m.weight > 0 && m.move);

    // If no positive moves, distribute equally among valid moves
    if (positiveMoves.length === 0) {
        const validMoves = weightedMoves.filter(m => m.move);
        return validMoves.map(m => ({ 
            ...m, 
            probability: 1 / validMoves.length 
        }));
    }

    // Softmax calculation with numerical stability
    const maxWeight = Math.max(...positiveMoves.map(m => m.weight));
    let weightExpSum = 0;

    const movesWithExp = positiveMoves.map(m => {
        const expWeight = Math.exp((m.weight - maxWeight) / temp);
        weightExpSum += expWeight;
        return { ...m, expWeight };
    });

    // Handle edge case where all exponentials are 0
    if (weightExpSum === 0) {
        return movesWithExp.map(m => ({ 
            ...m, 
            probability: 1 / movesWithExp.length 
        }));
    }

    // Convert to probabilities
    return movesWithExp.map(m => ({ 
        ...m, 
        probability: m.expWeight / weightExpSum 
    }));
}

/**
 * Selects a move from probability distribution using random sampling
 * Uses cumulative distribution function for selection
 */
export function selectFromDistribution(movesWithProbs) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        return {
            move: STRUGGLE_MOVE,
            reasons: ['EmergencyFallback'],
            probability: 1.0
        };
    }

    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const moveInfo of movesWithProbs) {
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) {
            return moveInfo;
        }
    }

    // Fallback to last move if rounding errors occur
    return movesWithProbs[movesWithProbs.length - 1];
}

/**
 * Calculates temperature based on predictability
 * Higher predictability = lower temperature = more deterministic
 */
export function calculateTemperature(predictability) {
    const basePredictability = Math.max(0, Math.min(1, predictability || 0.5));
    return (1.0 - basePredictability) * 1.5 + 0.5;
}

/**
 * Selects the highest weighted move deterministically
 */
export function selectDeterministicMove(weightedMoves) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return {
            move: STRUGGLE_MOVE,
            reasons: ['NoMovesAvailable'],
            weight: 0.001
        };
    }

    const validMoves = weightedMoves.filter(m => m.weight > 0 && m.move);
    
    if (validMoves.length === 0) {
        return {
            move: STRUGGLE_MOVE,
            reasons: ['NoValidMoves'],
            weight: 0.001
        };
    }

    return validMoves.reduce((best, current) => 
        current.weight > best.weight ? current : best
    );
}

/**
 * Performs weighted random selection with temperature-based randomness
 */
export function selectRandomizedMove(weightedMoves, predictability) {
    const validMoves = weightedMoves.filter(m => m.weight > 0 && m.move?.name !== "Struggle");

    if (validMoves.length === 0) {
        return {
            move: STRUGGLE_MOVE,
            weight: 1.0,
            reasons: ['FallbackOnlyStruggle'],
            probability: 1.0
        };
    }

    const temperature = calculateTemperature(predictability);
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    return selectFromDistribution(movesWithProbs);
}

/**
 * Main move selection function with fallback handling
 */
export function selectMoveFromWeights(weightedMoves, predictability, forceRandomization = false) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return {
            move: STRUGGLE_MOVE,
            reasons: ['NoInputMoves'],
            probability: 1.0,
            weight: 0.001
        };
    }

    // Use deterministic selection for very high predictability (unless forced)
    if (!forceRandomization && predictability >= 0.95) {
        const result = selectDeterministicMove(weightedMoves);
        return {
            ...result,
            probability: 1.0, // Deterministic = 100% probability
            temperature: 0
        };
    }

    // Use randomized selection
    const result = selectRandomizedMove(weightedMoves, predictability);
    return {
        ...result,
        temperature: calculateTemperature(predictability)
    };
}

/**
 * Gets selection statistics for debugging and analysis
 */
export function getSelectionStats(movesWithProbs) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        return { totalMoves: 0, entropy: 0, topProbability: 0 };
    }

    const totalMoves = movesWithProbs.length;
    const probabilities = movesWithProbs.map(m => m.probability || 0);
    const topProbability = Math.max(...probabilities);
    
    // Calculate entropy (measure of randomness)
    const entropy = -probabilities.reduce((sum, p) => {
        if (p <= 0) return sum;
        return sum + p * Math.log2(p);
    }, 0);

    return {
        totalMoves,
        entropy: entropy.toFixed(3),
        topProbability: (topProbability * 100).toFixed(1) + '%',
        averageProbability: (1 / totalMoves * 100).toFixed(1) + '%'
    };
}

/**
 * Validates that probabilities sum to approximately 1.0
 */
export function validateProbabilities(movesWithProbs, tolerance = 0.001) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        return true;
    }

    const sum = movesWithProbs.reduce((total, m) => total + (m.probability || 0), 0);
    return Math.abs(sum - 1.0) <= tolerance;
} 