// Simple test to verify desperation triggers
console.log('Testing desperation triggers...');

// Simulate a character at low health
const testCharacter = {
  name: 'Azula',
  currentHealth: 8, // Below 10 threshold
  resources: { chi: 8 }, // Above 6 threshold
  flags: { usedDesperation: false } // Not used yet
};

// Test the desperation trigger
function shouldTriggerDesperation(character) {
  return (
    character.currentHealth <= 10 && 
    !character.flags?.usedDesperation &&
    (character.resources.chi || 0) >= 6
  );
}

const shouldTrigger = shouldTriggerDesperation(testCharacter);
console.log('Should trigger desperation:', shouldTrigger);
console.log('Character state:', testCharacter); 