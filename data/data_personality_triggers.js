'use strict';

export const personalityTriggers = {
    provoked: (character, opponent, battleState) => {
        const { opponentLandedCriticalHit, opponentTaunted, allyTargeted, ally } = battleState;
        return opponentLandedCriticalHit || opponentTaunted || (allyTargeted && ally && ['ty-lee', 'zuko'].includes(ally.id));
    },
    serious_fight: (character, opponent, battleState) => {
        const { ally, opponentUsedLethalForce } = battleState;
        return (ally && ally.hp < ally.maxHp * 0.3) || opponentUsedLethalForce;
    },
    authority_challenged: (character, opponent, battleState) => {
        const { opponentLandedSignificantHits, opponentTaunted } = battleState;
        return (opponentLandedSignificantHits >= 2) || opponentTaunted;
    },
    underestimated: (character, opponent, battleState) => {
        const { opponentTauntedAgeOrStrategy } = battleState;
        return opponentTauntedAgeOrStrategy || (opponent.lastMoveEffectiveness === 'Weak' && opponent.lastMove.power > 50);
    },
    in_control: (character, opponent, battleState) => {
        const { characterReceivedCriticalHit } = battleState;
        return (character.hp > character.maxHp * 0.5) && !characterReceivedCriticalHit && (opponent.mentalState.level === 'stable' || opponent.mentalState.level === 'stressed');
    },
    desperate_broken: (character, opponent, battleState) => {
        return (character.hp < character.maxHp * 0.3) || (character.mentalState.level === 'broken');
    },
    desperate_mentally_broken: (character, opponent, battleState) => {
        const { allyDowned } = battleState;
        return (character.id === 'katara' && ((character.hp < character.maxHp * 0.1) || (allyDowned) || (character.criticalHitsTaken >= 2) || (character.mentalState.level === 'broken')));
    },
    doubted: (character, opponent, battleState) => {
        const { opponentTauntedBlindness, opponentLandedBlindHit } = battleState;
        return opponentTauntedBlindness || opponentLandedBlindHit;
    },
    mortal_danger: (character, opponent, battleState) => {
        const { ally } = battleState;
        return (ally && ally.hp < ally.maxHp * 0.05) || (character.hp < character.maxHp * 0.2);
    },
    honor_violated: (character, opponent, battleState) => {
        const { opponentCheated, allyDisarmedUnfairly } = battleState;
        return opponentCheated || allyDisarmedUnfairly;
    },
    meticulous_planning: (character, opponent, battleState) => {
        return (opponent.lastMove?.isHighRisk && opponent.lastMoveEffectiveness === 'Weak') || (battleState.location?.tags?.includes('trap_favorable'));
    },
    confident_stance: (character, opponent, battleState) => {
        const { characterLandedStrongOrCriticalHitLastTurn, allyBuffedSelf } = battleState;
        return characterLandedStrongOrCriticalHitLastTurn || allyBuffedSelf;
    },
    skill_challenged: (character, opponent, battleState) => {
        const { opponentTauntedSkillOrTradition, opponentAttackedFirstAggressively } = battleState;
        return opponentTauntedSkillOrTradition || opponentAttackedFirstAggressively;
    },
    disrespected: (character, opponent, battleState) => {
        const { opponentTauntedAgeOrStrategy } = battleState;
        return battleState.locationId === 'omashu' && opponentTauntedAgeOrStrategy;
    },
}; 