// CONTEXT: Intent Alignment Service
// RESPONSIBILITY: Calculate how well moves align with tactical intent

import { Ability } from '@/common/types';
import { Intent } from './intentSystem';

/**
 * @description Calculates how well a move aligns with the current tactical intent
 * @param {Ability} move - The move to evaluate
 * @param {Intent} intent - The current tactical intent
 * @returns {number} Alignment score from 0-10
 */
export function calculateIntentAlignment(move: Ability, intent: Intent): number {
  let alignment = 5; // Base neutral alignment
  
  switch (intent.type) {
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        alignment += 3;
      }
      if (move.power > 30) {
        alignment += 2;
      }
      if (move.type === 'attack') {
        alignment += 1;
      }
      break;
      
    case 'go_for_finish':
      if (move.power > 40) {
        alignment += 3;
      }
      if (move.tags?.includes('high-damage')) {
        alignment += 2;
      }
      if (move.type === 'attack') {
        alignment += 2;
      }
      break;
      
    case 'defend':
      if (move.type === 'defense_buff') {
        alignment += 3;
      }
      if (move.tags?.includes('healing')) {
        alignment += 2;
      }
      if (move.tags?.includes('desperate')) {
        alignment += 1;
      }
      break;
      
    case 'stall':
      if (move.type === 'defense_buff') {
        alignment += 2;
      }
      if (move.tags?.includes('rest')) {
        alignment += 3;
      }
      if (move.chiCost && move.chiCost <= 2) {
        alignment += 1;
      }
      break;
      
    case 'restore_chi':
      if (move.tags?.includes('rest')) {
        alignment += 4;
      }
      if (move.chiCost && move.chiCost <= 1) {
        alignment += 2;
      }
      if (move.type === 'defense_buff') {
        alignment += 1;
      }
      break;
      
    case 'standard_attack':
      if (move.type === 'attack') {
        alignment += 2;
      }
      if (move.power > 20 && move.power <= 40) {
        alignment += 1;
      }
      break;
      
    case 'wait_and_see':
      if (move.chiCost && move.chiCost <= 1) {
        alignment += 2;
      }
      if (move.tags?.includes('rest')) {
        alignment += 1;
      }
      break;
      
    case 'pressure_enemy':
      if (move.type === 'attack') {
        alignment += 2;
      }
      if (move.power > 15) {
        alignment += 1;
      }
      break;
      
    case 'counter_attack':
      if (move.tags?.includes('counter')) {
        alignment += 3;
      }
      if (move.type === 'attack') {
        alignment += 1;
      }
      break;
      
    case 'build_momentum':
      if (move.type === 'attack') {
        alignment += 2;
      }
      if (move.power > 25) {
        alignment += 1;
      }
      break;
      
    case 'desperate_attack':
      if (move.type === 'attack') {
        alignment += 3;
      }
      if (move.power > 30) {
        alignment += 2;
      }
      if (move.tags?.includes('desperate')) {
        alignment += 1;
      }
      break;
      
    case 'conservative_play':
      if (move.chiCost && move.chiCost <= 2) {
        alignment += 2;
      }
      if (move.type === 'defense_buff') {
        alignment += 1;
      }
      break;
  }
  
  // Penalize moves that are counterproductive to the intent
  if (intent.type === 'go_for_finish' && move.type === 'defense_buff') {
    alignment -= 2;
  }
  
  if (intent.type === 'defend' && move.type === 'attack' && move.power > 30) {
    alignment -= 2;
  }
  
  if (intent.type === 'restore_chi' && move.chiCost && move.chiCost > 3) {
    alignment -= 2;
  }
  
  return Math.max(0, Math.min(10, alignment));
}

/**
 * @description Gets alignment reasons for a move and intent
 * @param {Ability} move - The move to analyze
 * @param {Intent} intent - The current tactical intent
 * @returns {string[]} Array of alignment reasons
 */
export function getIntentAlignmentReasons(move: Ability, intent: Intent): string[] {
  const reasons: string[] = [];
  
  switch (intent.type) {
    case 'break_defense':
      if (move.tags?.includes('piercing')) {
        reasons.push('Piercing move for defense breaking');
      }
      if (move.power > 30) {
        reasons.push('High power for defense breaking');
      }
      if (move.type === 'attack') {
        reasons.push('Attack move for defense breaking');
      }
      break;
      
    case 'go_for_finish':
      if (move.power > 40) {
        reasons.push('High power for finishing');
      }
      if (move.tags?.includes('high-damage')) {
        reasons.push('High damage move for finishing');
      }
      if (move.type === 'attack') {
        reasons.push('Attack move for finishing');
      }
      break;
      
    case 'defend':
      if (move.type === 'defense_buff') {
        reasons.push('Defense move for defending');
      }
      if (move.tags?.includes('healing')) {
        reasons.push('Healing move for defending');
      }
      if (move.tags?.includes('desperate')) {
        reasons.push('Desperate move for defending');
      }
      break;
      
    case 'stall':
      if (move.type === 'defense_buff') {
        reasons.push('Defense move for stalling');
      }
      if (move.tags?.includes('rest')) {
        reasons.push('Rest move for stalling');
      }
      if (move.chiCost && move.chiCost <= 2) {
        reasons.push('Low cost move for stalling');
      }
      break;
      
    case 'restore_chi':
      if (move.tags?.includes('rest')) {
        reasons.push('Rest move for chi restoration');
      }
      if (move.chiCost && move.chiCost <= 1) {
        reasons.push('Low cost move for chi restoration');
      }
      if (move.type === 'defense_buff') {
        reasons.push('Defense move for chi restoration');
      }
      break;
      
    case 'standard_attack':
      if (move.type === 'attack') {
        reasons.push('Attack move for standard play');
      }
      if (move.power > 20 && move.power <= 40) {
        reasons.push('Moderate power for standard play');
      }
      break;
      
    case 'wait_and_see':
      if (move.chiCost && move.chiCost <= 1) {
        reasons.push('Low cost move for waiting');
      }
      if (move.tags?.includes('rest')) {
        reasons.push('Rest move for waiting');
      }
      break;
      
    case 'pressure_enemy':
      if (move.type === 'attack') {
        reasons.push('Attack move for pressure');
      }
      if (move.power > 15) {
        reasons.push('Good power for pressure');
      }
      break;
      
    case 'counter_attack':
      if (move.tags?.includes('counter')) {
        reasons.push('Counter move for counter-attacking');
      }
      if (move.type === 'attack') {
        reasons.push('Attack move for counter-attacking');
      }
      break;
      
    case 'build_momentum':
      if (move.type === 'attack') {
        reasons.push('Attack move for momentum');
      }
      if (move.power > 25) {
        reasons.push('Good power for momentum');
      }
      break;
      
    case 'desperate_attack':
      if (move.type === 'attack') {
        reasons.push('Attack move for desperate situation');
      }
      if (move.power > 30) {
        reasons.push('High power for desperate situation');
      }
      if (move.tags?.includes('desperate')) {
        reasons.push('Desperate move for desperate situation');
      }
      break;
      
    case 'conservative_play':
      if (move.chiCost && move.chiCost <= 2) {
        reasons.push('Low cost move for conservative play');
      }
      if (move.type === 'defense_buff') {
        reasons.push('Defense move for conservative play');
      }
      break;
  }
  
  return reasons;
} 