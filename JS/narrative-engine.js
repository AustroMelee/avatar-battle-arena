'use strict';

import { characters, locations } from './data/index.js';

// ===================================================================================
// NARRATIVE TEMPLATES - The heart of the "Doom File"
// All verbs and sentence structures are pre-written and grammatically guaranteed.
// ===================================================================================

const templates = {
    opening: [
        "The battle commenced as {InitiatorName} unleashed {InitiatorTechnique}, forcing {ResponderName} to immediately counter with {ResponderTechnique}.",
        "Without a moment's hesitation, {InitiatorName} went on the offensive, executing {InitiatorTechnique}. {ResponderName} was quick to respond, deploying {ResponderTechnique}.",
        "The fight began with a sudden move from {InitiatorName}, who attempted {InitiatorTechnique}. {ResponderName} stood their ground, meeting the assault with {ResponderTechnique}.",
        "{InitiatorName} made the first move, a textbook execution of {InitiatorTechnique}, putting {ResponderName} on the defensive, who answered with {ResponderTechnique}.",
        "An aggressive opening from {InitiatorName} saw them use {InitiatorTechnique}, but {ResponderName} was prepared and skillfully parried with {ResponderTechnique}."
    ],
    advantageAttack: [
        "Sensing an opportunity, {InitiatorName} pressed the advantage, relentlessly attacking with {InitiatorTechnique}. A desperate {ResponderName} could only use {ResponderTechnique} to fend them off.",
        "With momentum on their side, {InitiatorName} dominated the exchange, launching {InitiatorTechnique}. {ResponderName} was left scrambling, forced to defend with {ResponderTechnique}.",
        "Seeing their opponent off-balance, {InitiatorName} unleashed another powerful move: {InitiatorTechnique}. {ResponderName} struggled to regain their footing, countering with a hasty {ResponderTechnique}.",
        "The battlefield belonged to {InitiatorName}, who calmly executed {InitiatorTechnique}, further controlling the pace of the fight. {ResponderName} was forced into a reactive stance, using {ResponderTechnique}.",
        "{InitiatorName} gave no ground, continuing the assault with {InitiatorTechnique}. {ResponderName}'s defense, {ResponderTechnique}, began to show strain."
    ],
    disadvantageAttack: [
        "Fighting from behind, {InitiatorName} tried to turn the tide, gambling with {InitiatorTechnique}. However, {ResponderName} was unfazed and easily handled the move with {ResponderTechnique}.",
        "In a desperate bid to create some space, {InitiatorName} attempted {InitiatorTechnique}. The attempt was deftly shut down by {ResponderName}, who countered with {ResponderTechnique}.",
        "Despite being on the back foot, {InitiatorName} looked for an opening, trying {InitiatorTechnique}. It was not enough, as {ResponderName} simply overpowered it with {ResponderTechnique}.",
        "It was a risky move from {InitiatorName}, but they had to try something. They launched {InitiatorTechnique}, but {ResponderName} was ready and waiting with {ResponderTechnique}.",
        "{InitiatorName} attempted to regain the initiative with {InitiatorTechnique}, but the disciplined {ResponderName} saw it coming and replied with {ResponderTechnique}."
    ],
    terrainInteraction: [
        "Cleverly using the {LocationFeature}, {InitiatorName} executed {InitiatorTechnique}, catching {ResponderName} by surprise. {ResponderName} had to use the surrounding {LocationTerrain} to defend with {ResponderTechnique}.",
        "The {LocationTerrain} itself became a weapon for {InitiatorName}, who unleashed {InitiatorTechnique}. {ResponderName} was forced to adapt quickly, countering with {ResponderTechnique}.",
        "An environmental shift gave {InitiatorName} the perfect opening. They seized the moment, using {InitiatorTechnique} amidst the chaos. {ResponderName} was barely able to respond with {ResponderTechnique}.",
        "{InitiatorName} incorporated the {LocationFeature} into their attack, deploying {InitiatorTechnique} from an unexpected angle. {ResponderName} met the attack with {ResponderTechnique}."
    ],
    finishingMove: [
        "The end came swiftly. {WinnerName} channeled all their energy into a final, decisive {FinishingMove}, leaving {LoserName} unable to continue.",
        "It was over. {WinnerName}'s {FinishingMove} connected, sealing the victory and leaving {LoserName} defeated on the battlefield.",
        "Seeing the decisive moment, {WinnerName} prepared the final blow. They unleashed {FinishingMove}, and {LoserName} could not recover.",
        "The battle reached its climax. With a final, powerful display of skill, {WinnerName} executed {FinishingMove}, ending the fight.",
        "A sudden opening was all {WinnerName} needed. Their {FinishingMove} was perfectly executed, bringing the confrontation to a close and securing victory over {LoserName}."
    ]
};

// ===================================================================================
// HELPER FUNCTIONS
// ===================================================================================

function getRandomElement(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gets the full text of a character's technique.
 * @param {object} character - The character object.
 * @param {boolean} isFinisher - Whether to specifically look for a finishing move.
 * @returns {string} The full text of the technique.
 */
function getTechniqueText(character, isFinisher = false) {
    if (!character || !character.techniques || character.techniques.length === 0) {
        return "a standard maneuver";
    }

    let technique;
    if (isFinisher) {
        // Find a technique marked as a finisher
        const finishers = character.techniques.filter(t => t.finisher);
        if (finishers.length > 0) {
            technique = getRandomElement(finishers);
        }
    }

    // If no finisher was requested or found, get any random technique
    if (!technique) {
        technique = getRandomElement(character.techniques);
    }

    // Fallback if something goes wrong
    if (!technique) {
        return "a surprise attack";
    }
    
    // Construct the full phrase
    return `${technique.verb}ing ${technique.object} ${technique.method}`;
}

// ===================================================================================
// MAIN NARRATIVE GENERATOR
// ===================================================================================

/**
 * Generates a full play-by-play battle narrative.
 * This is the primary exported function.
 * @returns {string} The HTML string for the story.
 */
export function generatePlayByPlay(f1Id, f2Id, locId, battleOutcome) {
    const { winnerId, loserId } = battleOutcome;
    const f1 = characters[f1Id];
    const f2 = characters[f2Id];
    const loc = locations[locId];
    const winner = characters[winnerId];
    const loser = characters[loserId];

    let story = [];
    let initiator, responder;

    // --- BEAT 1: The Opening ---
    initiator = (f1.powerTier >= f2.powerTier) ? f1 : f2;
    responder = (initiator.id === f1.id) ? f2 : f1;
    const openingTemplate = getRandomElement(templates.opening);
    const openingBeat = openingTemplate
        .replace(/{InitiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{ResponderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{InitiatorTechnique}/g, getTechniqueText(initiator))
        .replace(/{ResponderTechnique}/g, getTechniqueText(responder));
    story.push(openingBeat);

    // --- BEAT 2: Mid-game - Winner Pressing Advantage ---
    initiator = winner;
    responder = loser;
    const advantageTemplate = getRandomElement(templates.advantageAttack);
    const advantageBeat = advantageTemplate
        .replace(/{InitiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{ResponderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{InitiatorTechnique}/g, getTechniqueText(initiator))
        .replace(/{ResponderTechnique}/g, getTechniqueText(responder));
    story.push(advantageBeat);
    
    // --- BEAT 3: Mid-game - Loser's Counter-Attempt / Terrain Interaction ---
    initiator = loser;
    responder = winner;
    // For simplicity, we'll just use a disadvantage attack template here, but you could expand this
    // to check for terrain advantages like in previous versions if desired.
    const midGameTemplate = getRandomElement(templates.disadvantageAttack);
    const midGameBeat = midGameTemplate
        .replace(/{InitiatorName}/g, `<span class="char-${initiator.id}">${initiator.name}</span>`)
        .replace(/{ResponderName}/g, `<span class="char-${responder.id}">${responder.name}</span>`)
        .replace(/{InitiatorTechnique}/g, getTechniqueText(initiator))
        .replace(/{ResponderTechnique}/g, getTechniqueText(responder));
    story.push(midGameBeat);

    // --- BEAT 4: The Finishing Move ---
    const finishingTemplate = getRandomElement(templates.finishingMove);
    const finishingBeat = finishingTemplate
        .replace(/{WinnerName}/g, `<span class="char-${winner.id}">${winner.name}</span>`)
        .replace(/{LoserName}/g, `<span class="char-${loser.id}">${loser.name}</span>`)
        .replace(/{FinishingMove}/g, getTechniqueText(winner, true)); // Request a finisher
    story.push(finishingBeat);

    // Join all the story beats together, wrapped in <p> tags for nice formatting.
    return story.map(beat => `<p>${beat}</p>`).join('');
}