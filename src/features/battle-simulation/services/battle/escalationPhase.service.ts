  if (shouldEscalate) {
    const effect = antiRepetition.getFreshLine('system-stalemate-broken', STALEMATE_BROKEN_LINES) || STALEMATE_BROKEN_LINES[0];
    const { narrative, technical } = createMechanicLogEntry({
      turn: state.turn,
      actor: 'System',
      mechanic: 'Forced Escalation',
      effect: effect,
      reason: reason,
    });
    const { newState, logEntry } = forcePatternEscalation(state, attacker, escalationType, reason);
    
    if (newState.analytics) {
        newState.analytics.patternAdaptations = (newState.analytics.patternAdaptations || 0) + 1;
        console.log(`DEBUG: Analytics updated - Pattern Adaptations: ${newState.analytics.patternAdaptations}`);
    }

    newState.battleLog.push(technical);
    newState.battleLog.push(logEntry);
    newState.log.push(narrative);

    const attackerIndex = newState.participants.findIndex(p => p.name === attacker.name);
    if (attackerIndex !== -1) {
      newState.participants[attackerIndex].flags.escalationCycleCount = (newState.participants[attackerIndex].flags.escalationCycleCount || 0) + 1;
    }

    return newState;
  } 