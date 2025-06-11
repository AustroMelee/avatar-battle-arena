'use strict';

export const characters = {
    'sokka': { 
        id: 'sokka', name: "Sokka", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "strategic non-bending", role: "tactician", tone: "improvisational_ironic", victoryStyle: "Madcap", powerTier: 3,
        combatStyleTags: ["improvisational", "tactical", "unpredictable"],
        speechFlavor: "witty, quippy, self-deprecating",
        openingMove: "a surprise boomerang throw",
        counterMove: "a tactical retreat",
        midGameTactic: "a clever diversion",
        terrainAdaptation: "a swift dodge behind cover",
        finishingMove: "a precisely aimed chi-blocking strike",
        lastDitchDefense: "a desperate feint",
        techniques: [
            {verb: "hurl", object: "a smoke pellet", method: "ducking behind a sandstone outcrop", type: "disruption", req: "none", flavor: "ambush"}, 
            {verb: "launch", object: "his trusty boomerang", method: "in a perfect arc", type: "ranged", req: "none", flavor: "ranged"}, 
            {verb: "devise", object: "a clever trap", method: "using the shifting terrain", type: "trap", req: "none", flavor: "trap"}, 
            {verb: "lunge", object: "forward", method: "with his meteorite sword", type: "melee", req: "none", flavor: "melee"}, 
            {verb: "attempt", object: "a tactical feint", method: "to create an opening", type: "feint", req: "none", flavor: "feint"},
            {verb: "set", object: "a complex tripwire trap", method: "hidden in the undergrowth", type: "trap", req: "plants", finisher: true, finalFlavor: ["Sokka subdued his foe with a perfectly executed tripwire trap.", "Sokka left his opponent entangled in a cunningly hidden vine snare."]},
            {verb: "disorient", object: "his foe", method: "with a blinding flash powder, then deliver a disabling blow", type: "disable", req: "none", finisher: true, finalFlavor: ["Sokka disoriented his foe with a blinding flash powder, then delivered a disabling blow.", "Sokka ended the fight with a swift, disabling strike to a pressure point."]}
        ], 
        strengths: ["Master Strategist", "Innovative Tactician", "Resourceful", "Adaptable", "Improvisational", "Clever", "open", "cover_rich", "vertical"], 
        weaknesses: ["Vulnerable to Direct Bending Attacks", "Reliance on Equipment", "Limited Close Combat", "Can be Overwhelmed", "Physically Average", "cramped", "exposed", "slippery"], 
        quotes: {
            preBattle: "Alright, let's see what kind of mess we can get into!",
            preBattle_specific: {
                'pakku': ["'So, still think non-benders have no place in a fight, huh, Master Pakku? Hope you're ready for some *real* ingenuity!'", "'Just because I don't move water, doesn't mean I can't outsmart it, Pakku. Prepare for the Sokka-style!'"],
                'katara': ["'Don't go crying if I win, Katara. This is a real fight!'", "'Time to show you that a non-bender can outsmart even a waterbending master, sis!'"]
            },
            postWin: "Boomerang! You *do* always come back!",
            postWin_dominant: ["'See? Brains over brawn... and a little bit of improvisation!', Sokka chirped, retrieving his boomerang.", "'Discipline is important, Pakku, but so is knowing when to make things up as you go along!'", ],
            postWin_stomp: ["'BOOMERANG! And that's all she wrote, folks! You totally didn't see that coming, did you?!'", "'Looks like someone forgot to account for the Sokka-factor! Nailed it!'" ],
            postWin_specific: {
                'pakku': ["'See, Pakku? Brains over brawn... and a little bit of improvisation!', Sokka chirped, retrieving his boomerang.", "'Discipline is important, Pakku, but so is knowing when to make things up as you go along!'", ],
                'katara': ["'Who's the master strategist now, Katara? Boomerang one, bending zero!'", "'Looks like big sister still knows best, huh, Sokka?'", "'Don't worry, Sokka, you'll get 'em next time. Probably.'"]
            },
            postWin_clever: ["'See? Brains beat brawn... eventually!'", "'My genius is sometimes... almost frightening, even to myself!'"],
            postWin_reflective: ["'Well, that was a tough one. Nobody said winning was easy.'"],
            postWin_overwhelming: ["'Boomerang! You always come back! And so do I, usually with a better plan!'"],
            postLose: "Well, that's just unfair. Who designed this arena?",
            postLose_dominant: ["'Alright, alright, you win. But I'll be back, and next time, I'll bring more snacks!'", "'Hmph. Just proves I need more random stuff in my pouch. Next time!'" ],
            postLose_stomp: ["'WHAT?! No fair! You literally just stood there and I couldn't do anything! This is rigged!'", "'Ugh, fine. I'll get you next time when the elements are on *my* side!'" ],
            postLose_specific: {
                'pakku': ["'Alright, alright, you win, old man. But next time, no freezing my legs into the ground!'", "'Hmph. Easy for a waterbender to say when there's an ocean nearby. Totally unfair.'"],
                'katara': ["'Okay, okay, you win, Katara. But only because you froze my feet! That's gotta be illegal!'", "'Next time, no waterbending, just pure, unadulterated Sokka-power! You still owe me a hug, sis.'"]
            }
        },
        relationships: {
            'katara': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"},
            'pakku': {type: "opposed_philosophy", dynamic: "philosophical_clash"}
        }
    },
    'aang-airbending-only': { 
        id: 'aang-airbending-only', name: "Aang (Airbending only)", type: "Bender", bendingTypes: ["Air"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "evasive airbending", role: "evader", tone: "pacifistic_agile", victoryStyle: "Pacifist", powerTier: 9,
        combatStyleTags: ["evasive", "agile", "pacifistic"],
        speechFlavor: "peaceful, lighthearted, philosophical",
        openingMove: "a swift air scooter maneuver",
        counterMove: "a defensive air shield",
        midGameTactic: "a disorienting air vortex",
        terrainAdaptation: "a graceful leap to higher ground",
        finishingMove: "a powerful air current to push back",
        lastDitchDefense: "a desperate evasion through a narrow gap",
        techniques: [
            {verb: "create", object: "a powerful air scooter", method: "to gain speed", type: "mobility", req: "none"}, 
            {verb: "form", object: "a massive tornado", method: "to disorient his foe", type: "disruption", req: "none"}, 
            {verb: "unleash", object: "a focused blast of air", method: "with surprising force", type: "burst_damage", req: "none"}, 
            {verb: "ride", object: "high on the powerful winds", method: "evading attacks", type: "mobility", req: "none"}, 
            {verb: "weave", object: "through the air", method: "with effortless grace", type: "evasion", req: "none"},
            {verb: "launch", object: "his opponent", method: "spiraling out of the arena", type: "push_off", req: "falls", finisher: true, finalFlavor: ["Aang swept his foe off the platform with a precise air current, ensuring a soft landing away from the battle.", "Aang delivered a decisive air palm, forcing his opponent out of bounds with a controlled expulsion.", "Aang used a powerful gust of wind to lift his opponent safely out of the arena, ending the fight cleanly."]}
        ], 
        strengths: ["Unrivaled Evasiveness", "Exceptional Mobility", "Pacifistic", "Agile", "Adaptive", "open", "vertical", "air_rich"], 
        weaknesses: ["Pacifistic Tendencies", "Aversion to Lethal Force", "Direct Confrontation", "Vulnerable to Ground Traps", "Less Offensive Power", "cramped", "dense", "low_visibility", "sandy", "slippery"], 
        quotes: {
            preBattle: "Let's keep this light, okay?",
            preBattle_specific: {
                'toph-beifong': ["'Hey Toph, no hard feelings, okay? Just a friendly spar!'", "'Try to keep up, Toph! Hope you're ready for some high-flying action!'"],
                'bumi': ["'Bumi! Still crazy as ever? Don't break anything important!'", "'Ready for some old-school airbender vs. earthbender fun, King Bumi?'"]
            },
            postWin: "Phew! Nobody got hurt, right? Mostly.",
            postWin_dominant: ["'Looks like you couldn't keep up! Hope that wasn't too hard!'", "'I guess airbending truly is the most versatile! Haha!'"],
            postWin_stomp: ["'Whoa! That was... fast! Are you okay? I barely did anything!'", "'Phew! Nobody got hurt, right? Mostly. That was a lot quicker than I expected!'" ],
            postWin_specific: {
                'toph-beifong': ["'See, Toph? Head in the clouds is sometimes a good thing!'", "'Looks like you couldn't get a handle on me, Toph! Still the greatest earthbender though!'" ],
                'bumi': ["'Haha, looks like the old man still has some tricks, but not enough to catch an airbender!'", "'You know, Bumi, sometimes the best way to win is to not get hit at all!'"]
            },
            postWin_clever: ["'Sometimes the best way to win is to just not get hit!'", "'Who needs brute force when you have agility?'"],
            postWin_reflective: ["'That was intense, but I'm glad it's over peacefully.'", "'Another lesson learned in the arena of life.'"],
            postWin_overwhelming: ["'Whoa, that was a lot of air! Are you okay?'"],
            postLose: "Guess I need a bit more practice at... not getting defeated.",
            postLose_dominant: ["'Well, that was... unexpected. Guess I still have a lot to learn about not getting defeated!'", "'I guess I didn't evade enough! Good game, though!'"],
            postLose_stomp: ["'Agh! That was way too much power! I'm sorry, I just couldn't keep up!'", "'Okay, okay, I get it! You win! Can we get some ice cream now?'"],
            postLose_specific: {
                'toph-beifong': ["'Oof, okay, okay, I get it, Toph! You're really good at the ground game!'", "'My feet! They're stuck! Fine, you win this one, Toph!'"],
                'bumi': ["'Whoa! That was... unpredictable, Bumi! You really do have a mad genius for this!'", "'My feet! I can't move! You win, Bumi. Happy now?'"]
            }
        },
        relationships: {
            'toph-beifong': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "mentor_student", dynamic: "friendly_rivalry"}
        }
    },
    'katara': { 
        id: 'katara', name: "Katara", type: "Bender", bendingTypes: ["Water", "Healing"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "masterful waterbending", role: "versatile_control", tone: "fierce_compassionate", victoryStyle: "Fierce", powerTier: 7,
        combatStyleTags: ["fierce", "versatile", "determined"],
        speechFlavor: "passionate, determined, compassionate",
        openingMove: "a powerful water whip",
        counterMove: "a protective ice shield",
        midGameTactic: "a versatile water-stream evasion",
        terrainAdaptation: "a strategic manipulation of water from the environment",
        finishingMove: "an overwhelming wave of water",
        lastDitchDefense: "a desperate water bubble defense",
        techniques: [
            {verb: "launch", object: "a barrage of ice daggers", method: "with fierce precision", type: "ranged_damage", req: "water"}, 
            {verb: "create", object: "a massive wave", method: "to crash down on her opponent", type: "zone_control", req: "water"}, 
            {verb: "envelop", object: "her foe", method: "in a watery sphere", type: "disruption", req: "water"}, 
            {verb: "manipulate", object: "nearby vines", method: "with plantbending", type: "zone_control", req: "plants"}, 
            {verb: "pull", object: "what little moisture was available", method: "from the sand and air", type: "resource_scavenge", req: "none"},
            {verb: "freeze", object: "her opponent's limbs", method: "in solid ice", type: "immobilize", req: "water", finisher: true, finalFlavor: ["Katara encased her opponent in an unyielding prison of ice.", "Katara froze her opponent's limbs in solid ice, rendering them helpless.", "Katara trapped her foe in a dense crystal of razor-sharp ice, ending the fight."]}
        ], 
        strengths: ["Prodigious Bending Talent", "Exceptional Healing", "Fierce Determination", "Adaptable", "Inventive", "water_rich", "ice_rich", "plants_rich", "cover_rich"], 
        weaknesses: ["Emotional Volatility", "Limited Hand-to-Hand Combat", "Vulnerable to Fire", "Reliance on Water Source", "hot", "exposed", "sandy"], 
        quotes: {
            preBattle: "I won't hold back. Not if you won't.",
            preBattle_specific: {
                'pakku': ["'So, Master Pakku, let's see if your rigid traditions can withstand true adaptability.'"],
                'sokka': ["'Try not to get *too* messy, Sokka. I don't want to have to clean up after you.'", "'Alright, Sokka. Let's see if all that talk about strategy actually pays off.'"]
            },
            postWin: "That's how you do it, for my family, for my tribe!",
            postWin_dominant: ["'The power of water cannot be contained. I told you I wouldn't hold back!'", "'That's what happens when you underestimate a waterbender!'"],
            postWin_stomp: ["'Barely even broke a sweat. That's for my family, for my tribe! You never stood a chance.'", "'Some fights aren't even a challenge. That was one of them.'"],
            postWin_specific: {
                'pakku': ["'You have grown powerful, Katara. Your spirit is as strong as your bending.'", "'Tradition is important, Master Pakku, but so is adapting. We did that for our Tribe.'"],
                'sokka': ["'Looks like big sister still knows best, huh, Sokka?'", "'Don't worry, Sokka, you'll get 'em next time. Probably.'"]
            },
            postWin_clever: ["'The elements flowed with me today. You can't fight the tide.'"],
            postWin_reflective: ["'Winning is sometimes hard, but I'll always fight for what's right.'", "'I hope they learn from this, for their own good.'"],
            postWin_overwhelming: ["'That's what happens when you underestimate a waterbender!'"],
            postLose: "I won't let this happen again!",
            postLose_dominant: ["'This isn't over! I will come back stronger, I promise you!'", "'I miscalculated. But I learn from every defeat.'"],
            postLose_stomp: ["'Impossible! There was nothing I could do! This isn't fair!'", "'I... I couldn't even bend! This is a disgrace! I won't let this happen again!'"],
            postLose_specific: {
                'sokka': ["'Ugh, Sokka! You got lucky! Totally cheating with that boomerang!'", "'Next time, Sokka! You just wait!'"],
                'pakku': ["'Even a master can misjudge. I will learn from this.'", "'You have much yet to learn, Katara, but your spirit is admirable.'"]
            }
        },
        relationships: {
            'pakku': { type: "master_student", history: "initial_denial_due_to_gender" },
            'sokka': {type: "sibling", bond: "strong_familial", dynamic: "friendly_rivalry"}
        }
    },
    'toph-beifong': { 
        id: 'toph-beifong', name: "Toph", type: "Bender", bendingTypes: ["Earth", "Metal", "Sand"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "unrelenting earthbending", role: "tank_disabler", tone: "cocky_theatrical", victoryStyle: "Cocky", powerTier: 7,
        combatStyleTags: ["unrelenting", "cocky", "rooted"],
        speechFlavor: "sarcastic, confident, gruff",
        openingMove: "a powerful earth stomp",
        counterMove: "a solid earth block",
        midGameTactic: "a disruptive earth tremor",
        terrainAdaptation: "a rapid burrow beneath the surface",
        finishingMove: "an inescapable rock prison",
        lastDitchDefense: "a sudden stone pillar",
        techniques: [ 
            {verb: "launch", object: "a pillar of rock", method: "from the ground", type: "burst_damage", req: "earth"}, 
            {verb: "encase", object: "her opponent's feet", method: "in stone", type: "immobilize", req: "earth"}, 
            {verb: "bend", object: "a suit of metal armor", method: "around herself", type: "defense", req: "metal"}, 
            {verb: "create", object: "a powerful sand spout", method: "to attack", type: "zone_control", req: "sand"}, 
            {verb: "sense", object: "an attack", method: "through the earth and stand her ground, unmoving", type: "counter", req: "none"},
            {verb: "crush", object: "the ground beneath her opponent", method: "sending them plummeting into a chasm", type: "environment_damage", req: "earth", targetElement: "unstable_terrain", finisher: true, finalFlavor: ["Toph crushed the ground beneath her opponent, sending them plummeting into a chasm.", "Toph manipulated the earth to create a crushing pressure around her foe.", "Toph sent a massive fissure tearing open beneath her opponent, ending the fight with a decisive environmental attack."]},
            {verb: "entomb", object: "her foe", method: "in a cocoon of solid rock", type: "immobilize", req: "earth", finisher: true, finalFlavor: ["Toph entombed her foe in a cocoon of solid rock.", "Toph immobilized her opponent within a tight shell of hardened earth."]}
        ], 
        strengths: ["Unconventional Fighting Style", "Seismic Perception", "Inventive", "Stubborn Resolve", "Immovable", "Terrain Control", "earth_rich", "metal_rich", "dense", "cover_rich", "sandy"], 
        weaknesses: ["Vulnerable to Airborne Opponents", "Reliance on Bare Feet", "Blind", "Less effective on Loose Terrain (e.g. sand)", "air_rich", "water_rich", "slippery", "vertical", "exposed", "precarious", "low_visibility"], 
        quotes: {
            preBattle: "Let's see what you're made of, twinkletoes.",
            preBattle_specific: {
                'aang-airbending-only': ["'Alright, Twinkletoes, let's see how much you've *really* learned.'", "'Don't get too floaty, Aang. I'm about to show you how a real earthbender fights!'"],
                'bumi': ["'King Bumi! Good to see another real earthbender. But I'm the *greatest*.'", "'Ready for some real earthbending, old man? None of that stiff traditional stuff.'"]
            },
            postWin: "Told you I was the best. The greatest earthbender in the world!",
            postWin_dominant: ["'See? The earth always wins. I'm the greatest earthbender for a reason!'", "'Hmph. You were too easy, even for an old blind lady!'"],
            postWin_stomp: ["'HA! That was over before it even started! You didn't even *touch* me, Twinkletoes!'", "'Told ya I was the best. Didn't even have to break a sweat!'"],
            postWin_specific: {
                'aang-airbending-only': ["'See, Toph? Head in the clouds is sometimes a good thing!'", "'Looks like you couldn't get a handle on me, Toph! Still the greatest earthbender though!'" ],
                'bumi': ["'You're pretty good for an old-timer, Bumi. But I'm still the queen of the earth!'", "'Haha! See, Bumi? The ground speaks to *me* louder!'"]
            },
            postWin_clever: ["'Who needs eyes when you can see with your feet?'", "'Ground game strong, always.'"],
            postWin_reflective: ["'Well, that was a fair fight. For me, anyway.'"],
            postWin_overwhelming: ["'HA! That's what happens when you fight the greatest earthbender in the world!'"],
            postLose: "Whatever. That doesn’t count. You cheated!",
            postLose_dominant: ["'Ugh! Fine, you win this time! But next time, no cheap tricks!'", "'You got lucky! But I'll be back, and I'll learn from this... probably!'"],
            postLose_stomp: ["'NO FAIR! I couldn't even feel you! This is literally the worst matchup ever! CHEATER!'", "'This is an outrage! I demand a rematch on *my* terms! This doesn't count!'"],
            postLose_specific: {
                'aang-airbending-only': ["'No fair! You just kept flying! I can't hit what I can't feel!'", "'Ugh, fine, you floaty idiot! But next time, no airbending!'"],
                'bumi': ["'Alright, old man, you got lucky! That was just... too weird to block!'", "'Hmph! Fine, you win this one. But next time, no quicksand! That's cheating!'"]
            }
        },
        relationships: {
            'aang-airbending-only': {type: "friend_teacher", dynamic: "clash_of_elements"},
            'bumi': {type: "peer", dynamic: "friendly_rivalry"}
        }
    },
    'zuko': { 
        id: 'zuko', name: "Zuko", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "adaptive firebending", role: "brawler_redemption", tone: "determined_brooding", victoryStyle: "Determined", powerTier: 6,
        combatStyleTags: ["determined", "intense", "impulsive"],
        speechFlavor: "brooding, honorable, conflicted",
        openingMove: "a fierce fire jab",
        counterMove: "a quick dao sword deflection",
        midGameTactic: "a propulsive fire burst for mobility",
        terrainAdaptation: "a tactical retreat to cover",
        finishingMove: "a relentless fire stream",
        lastDitchDefense: "a desperate fire arc",
        techniques: [
            {verb: "unleash", object: "a flurry of fire-enhanced kicks", method: "with brutal efficiency", type: "melee_damage", req: "none"}, 
            {verb: "create", object: "an explosive fireball", method: "with a focused blast", type: "burst_damage", req: "none"}, 
            {verb: "wield", object: "his dual dao swords", method: "to block and parry", type: "counter", req: "none"}, 
            {verb: "propel", object: "himself", method: "with short bursts of flame", type: "mobility", req: "none"}, 
            {verb: "overwhelm", object: "his opponent", method: "with a continuous stream of fire", type: "sustained_damage", req: "none", finisher: true, finalFlavor: ["Zuko overwhelmed his opponent with a continuous stream of fire, forcing their surrender.", "Zuko unleashed a devastating inferno, leaving his opponent no room to move.", "Zuko incinerated anything in his opponent's path with a wide arc of relentless flame."]}
        ], 
        strengths: ["Unwavering Determination", "Exceptional Swordsman", "Resilient", "Controlled Fury", "Adaptable", "hot", "metal_rich", "cramped", "cover_rich"], 
        weaknesses: ["Emotional Instability", "Impulsiveness", "Can be Hot-Headed", "Vulnerable to Water", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed"], 
        quotes: {
            preBattle: "I've struggled for my honor. I'm not losing this.",
            preBattle_specific: {
                'iroh': ["'Uncle, this is my destiny! I will defeat you!'", "'Stop treating me like a child, Uncle! I'm not who I was!'"],
                'azula': ["'Azula! I'm not that weak, pathetic boy anymore!'", "'This time, things will be different, Azula!'"]
            },
            postWin: "I fought for my own path. And I won.",
            postWin_dominant: ["'This is my path. My own power. And I won.'", "'I will not be defeated. Not anymore!'"],
            postWin_stomp: ["'Pathetic. That was hardly a challenge. You were never worthy of my time.'", "'I fought for my honor. And I won. Swiftly.'"],
            postWin_specific: {
                'iroh': ["'I chose my own path, Uncle. And I'm stronger for it.'", "'I... I beat you, Uncle. I actually beat you.'"],
                'azula': ["'I told you, Azula. I've changed. I'm stronger.'", "'You think you're flawless? Not anymore, Azula.'"]
            },
            postWin_reflective: ["'I'm stronger now. This proves it.'", "'My honor... it's mine to define.'"],
            postWin_clever: ["'That was... unexpected. But effective.'"],
            postWin_overwhelming: ["'My fire burns hotter than yours!'"],
            postLose: "Agh! Why can't I ever win?!",
            postLose_dominant: ["'Agh! This is just a setback! I'll come back stronger!'", "'Why can't I ever win?! This rage... it's still here!'"],
            postLose_stomp: ["'IMPOSSIBLE! I refuse to accept this! You cheated, you must have cheated!'", "'NO! This cannot be! My destiny... it's slipping away!'"],
            postLose_specific: {
                'iroh': ["'Uncle... why do you always have to be so wise?'", "'Not this time, Uncle. But next time...'"],
                'azula': ["'This is just a setback, Azula! I'll get you next time!'", "'I... I hate you, Azula! You always win!'"]
            }
        },
        relationships: {
            'iroh': { type: "uncle_nephew", bond: "strong_familial", history: "mentorship_and_betrayal", dynamic: "emotional_conflict" },
            'azula': { type: "sibling_rivalry", bond: "power_struggle", history: "long_standing_conflict" }
        }
    },
    'azula': { 
        id: 'azula', name: "Azula", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "lethal firebending", role: "dominant_offense", tone: "calculated_ruthless", victoryStyle: "Ruthless", powerTier: 8,
        combatStyleTags: ["calculated", "ruthless", "flawless"],
        speechFlavor: "cold, taunting, arrogant",
        openingMove: "a precise lightning bolt",
        counterMove: "a swift blue fire deflection",
        midGameTactic: "an agile fire jet maneuver",
        terrainAdaptation: "a rapid ascent to higher ground",
        finishingMove: "a concentrated blue flame blast",
        lastDitchDefense: "a sharp fire dagger barrage",
        techniques: [
            {verb: "generate", object: "a precise bolt of lightning", method: "carefully timing her move", type: "one_shot", req: "lightning_setup"}, 
            {verb: "propel", object: "herself", method: "through the air with jets of blue fire", type: "mobility", req: "none"}, 
            {verb: "launch", object: "razor-sharp fire daggers", method: "with terrifying accuracy", type: "ranged_damage", req: "none"}, 
            {verb: "use", object: "rapid-fire blue flames", method: "to overwhelm", type: "burst_damage", req: "none"},
            {verb: "incinerate", object: "her opponent", method: "with a concentrated blast of blue fire", type: "one_shot", req: "none", finisher: true, finalFlavor: ["Azula incinerated her opponent with a concentrated blast of blue fire.", "Azula unleashed a precise, devastating bolt of lightning that ended the fight instantly.", "Azula overwhelmed her opponent with a relentless, piercing torrent of blue flame."]}
        ], 
        strengths: ["Firebending Prodigy", "Master Tactician", "Highly Manipulative", "Ruthless", "Agile", "Intimidating", "hot", "metal_rich", "open"], 
        weaknesses: ["Deep-seated Mental Instability", "Arrogant", "Lack of Compassion", "Can be Overconfident", "water_rich", "ice_rich", "slippery", "cold", "low_visibility", "cramped"], 
        quotes: {
            preBattle: "Don't bother. You're outmatched.",
            preBattle_specific: {
                'ozai-not-comet-enhanced': ["'Father, it's time for a proper test of strength. I trust you won't disappoint me.'", "'You've grown soft, Father. Let me show you what true power looks like.'"],
                'zuko': ["'Still clinging to that pathetic honor, Zuko? You bore me.'", "'Ready to lose, brother? I always win.'"],
                'bumi': ["'King Bumi? A mere madman. This won't take long.'", "'Your eccentricity won't save you from my precision, old king.'"]
            },
            postWin: "Flawless. As expected.",
            postWin_dominant: ["'You were outmatched from the start. Just as I predicted.'", "'This was inevitable. My victory, your defeat.'"],
            postWin_stomp: ["'Flawless. You truly never had a chance. Pathetic.'", "'An utterly pathetic display. My victory was guaranteed.'"],
            postWin_specific: {
                'ozai-not-comet-enhanced': ["'You were never truly the Phoenix King, Father. Just a relic.'", "'The throne is mine. You were merely keeping it warm.'"],
                'zuko': ["'Pathetic. You're still weak, Zuko.'", "'See, brother? Some things never change. I'm superior.'"],
                'bumi': ["'Such an eccentric display. Ultimately, ineffective.'", "'Madness cannot overcome perfect form, King Bumi.'"]
            },
            postWin_reflective: ["'Another obstacle removed. Efficiently.'"],
            postWin_clever: ["'Did you truly think you could outwit me?'"],
            postWin_overwhelming: ["'My power is absolute. You are beneath me.'"],
            postLose: "Impossible! This is insubordination!",
            postLose_dominant: ["'This is an aberration! I will not be defeated by the likes of you!'", "'A temporary setback! I refuse to acknowledge this outcome!'"],
            postLose_stomp: ["'HOW DARE YOU?! THIS IS INSUBORDINATION! I AM AZULA! I AM FLAWLESS!'", "'NO! IMPOSSIBLE! I am destined to win! You cheated! YOU CHEATED!'"],
            postLose_specific: {
                'ozai-not-comet-enhanced': ["'This was... a fluke! You simply got lucky, Father!'", "'No! My destiny... it can't end like this!'"],
                'zuko': ["'No! You cheated, Zuko! You always cheat!'", "'This is a temporary setback! I will not be defeated by you!'"],
                'bumi': ["'This is insane! Your methods are illogical! I refuse to acknowledge this outcome!'", "'How did... I couldn't predict that! An aberration!'"]
            }
        },
        relationships: {
            'ozai-not-comet-enhanced': { type: "father_daughter", bond: "power_struggle", history: "power_struggle" },
            'zuko': { type: "sibling_rivalry", bond: "power_struggle", history: "long_standing_conflict" },
            'bumi': { type: "clash_of_styles", dynamic: "precision_vs_chaos" }
        }
    },
    'ozai-not-comet-enhanced': { 
        id: 'ozai-not-comet-enhanced', name: "Ozai (No Comet)", type: "Bender", bendingTypes: ["Fire", "Lightning"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "overwhelming firebending", role: "dominant_offense", tone: "arrogant_supreme", victoryStyle: "Supreme", powerTier: 9,
        combatStyleTags: ["overwhelming", "arrogant", "absolute"],
        speechFlavor: "domineering, cold, tyrannical",
        openingMove: "a devastating fire blast",
        counterMove: "an imperious deflection of a weaker attack",
        midGameTactic: "a relentless, all-consuming fire assault",
        terrainAdaptation: "a commanding advance through the environment",
        finishingMove: "a crushing lightning strike",
        lastDitchDefense: "an impenetrable wall of flame",
        techniques: [
            {verb: "generate", object: "a massive bolt of lightning", method: "with both hands, seizing a momentary opening", type: "one_shot", req: "lightning_setup"}, 
            {verb: "unleash", object: "a continuous, powerful stream of fire", method: "that scorched the earth", type: "sustained_damage", req: "none"}, 
            {verb: "propel", object: "himself", method: "through the air with fire jets", type: "mobility", req: "none"}, 
            {verb: "incinerate", object: "anything in his path", method: "with a wide arc of flame", type: "aoe_damage", req: "none"},
            {verb: "overwhelm", object: "his opponent", method: "with a devastating inferno", type: "one_shot", req: "none", finisher: true, finalFlavor: ["Ozai overwhelmed his opponent with a devastating inferno.", "Ozai unleashed a massive, unstoppable bolt of lightning, ending the fight with absolute power.", "Ozai incinerated his opponent's defenses with a relentless, all-consuming fire blast."]}
        ], 
        strengths: ["Exceptional Firebending Prowess", "Indomitable Will", "Raw Power", "Fear-Inducing Presence", "Relentless", "hot", "open"], 
        weaknesses: ["Over-reliance on Offensive Power", "Extreme Arrogance", "Underestimates Opponents", "Lack of Adaptability", "Poor Defensive Strategy", "water_rich", "ice_rich", "slippery", "cold", "cramped"], 
        quotes: {
            preBattle: "I am the Phoenix King! You are nothing!",
            preBattle_specific: {
                'azula': ["'So, my dear Azula, you wish to challenge the Phoenix King? Amusing.'", "'Do you truly believe you are my equal, child? I created you.'"],
                'zuko': ["'Pathetic child. You dare face me?'", "'This is not a game, Zuko. You will learn your place.'"]
            },
            postWin: "The Fire Nation is supreme! My power is absolute!",
            postWin_dominant: ["'You should have known better than to challenge true power!'", "'The Fire Nation reigns supreme. Your defeat was absolute.'"],
            postWin_stomp: ["'That was a waste of my time. You were never a threat. I am the Phoenix King!'", "'You are nothing. My power is absolute. Bow before me!'" ],
            postWin_specific: {
                'azula': ["'Your ambition outstripped your power, Azula. A familiar weakness.'", "'A pathetic display. You are not worthy of my name.'"],
                'zuko': ["'Foolish boy. You stand no chance against true power.'", "'You will never be like me, Zuko. Never.'"]
            },
            postWin_reflective: ["'The world will tremble at my feet. This is merely a prelude.'"],
            postWin_clever: ["'My intellect matches my might.'"],
            postWin_overwhelming: ["'I am the Phoenix King! There is no equal!'" ],
            postLose: "This cannot be! I am the Fire Lord!",
            postLose_dominant: ["'Impossible! This is an outrage! I am the Fire Lord!'", "'I will not accept this! You merely prolonged the inevitable!'"],
            postLose_stomp: ["'TREASON! THIS IS BLASPHEMY! I AM THE FIRE LORD! I CANNOT BE DEFEATED BY YOU!'", "'NOOO! MY POWER! MY DESTINY! THIS CANNOT BE REAL!'"],
            postLose_specific: {
                'azula': ["'This was... a fluke! You simply got lucky, Father!'", "'No! My destiny... it can't end like this!'"],
                'zuko': ["'You... you will regret this, boy!'", "'This is blasphemy! I am the Fire Lord! I cannot be defeated by you!'"]
            }
        },
        relationships: {
            'azula': { type: "father_daughter", bond: "power_struggle", history: "power_struggle" },
            'zuko': { type: "father_son", bond: "emotional_conflict", history: "neglect_and_disappointment" }
        }
    },
    'bumi': { 
        id: 'bumi', name: "Bumi", type: "Bender", bendingTypes: ["Earth"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "unpredictable earthbending", role: "mad_genius", tone: "eccentric_powerful", victoryStyle: "Madcap", powerTier: 8,
        combatStyleTags: ["eccentric", "unpredictable", "powerful"],
        speechFlavor: "playful, philosophical, nonsensical",
        openingMove: "a whimsical earth manipulation",
        counterMove: "a surprising underground tunnel",
        midGameTactic: "a shifting quicksand trap",
        terrainAdaptation: "a sudden stone pillar for elevation",
        finishingMove: "a massive earth launch",
        lastDitchDefense: "a deceptive earth tremor",
        techniques: [
            {verb: "manipulate", object: "a massive stone platform", method: "to launch at his opponent", type: "burst_damage", req: "earth"}, 
            {verb: "turn", object: "the ground beneath his foe", method: "into quicksand", type: "immobilize", req: "earth"}, 
            {verb: "tunnel", object: "rapidly underground", method: "to appear elsewhere", type: "mobility", req: "earth"}, 
            {verb: "collapse", object: "a nearby structure or rock formation", method: "with a mighty tremor", type: "environment_damage", req: "earth"}, 
            {verb: "launch", object: "a barrage of earth disks", method: "with alarming speed", type: "ranged_damage", req: "earth"},
            {verb: "engulf", object: "his opponent", method: "in a swirling vortex of earth and rubble", type: "zone_control", req: "earth", finisher: true, finalFlavor: ["Bumi engulfed his opponent in a swirling vortex of earth and rubble.", "Bumi turned the ground beneath his foe into inescapable quicksand, ending the battle.", "Bumi trapped his opponent beneath a massive rockslide, ending the fight with environmental mastery."]}
        ], 
        strengths: ["Mad Genius Tactics", "Brilliant Strategist", "Unpredictable", "Immense Power", "Adaptable", "Ancient Wisdom", "Terrain Control", "earth_rich", "urban", "dense", "vertical"], 
        weaknesses: ["Underestimated", "Vulnerable when not on Earth", "Eccentric", "Can be Distracted", "Slow", "open", "exposed", "sandy", "water_rich", "slippery", "air_rich"], 
        quotes: {
            preBattle: "Let's play!",
            preBattle_specific: {
                'aang-airbending-only': ["'Aang! My old student! Let's see if you can keep up with the mad king!'", "'Still flying around, Twinkletoes? Time for some grounding!'"],
                'toph-beifong': ["'Toph Beifong! The Blind Bandit herself! Ready to see who the real Earthbending master is?'", "'Let's rumble, young Toph! Don't hold back!'"]
            },
            postWin: "Time for a nap! Or maybe some cabbage!",
            postWin_dominant: ["'Hehe! That was fun! You were almost as good as me!'", "'The Mad King reigns supreme! Who wants rock candy?'"],
            postWin_stomp: ["'Hahaha! That was over before it even started! Too slow, my friend, too slow!'", "'Time for a nap! Or maybe some cabbage! That was utterly delightful!'" ],
            postWin_specific: {
                'aang-airbending-only': ["'Haha! Still couldn't catch me, Aang! Next time, try thinking outside the box... or inside a volcano!'", "'See, Aang? Even a genius can be caught off guard! Now, where's that cabbage cart?'"],
                'toph-beifong': ["'You're pretty good for an old-timer, Bumi. But I'm still the queen of the earth!'", "'Haha! See, Bumi? The ground speaks to *me* louder!'"]
            },
            postWin_clever: ["'You thought you knew my next move, didn't you?! Haha!'", "'A little unpredictability goes a long way, my friend!'"],
            postWin_reflective: ["'Well, that was a good workout. Keeps the old muscles young!'"],
            postWin_overwhelming: ["'The earth moves for me! No one can stop the Mad King!'" ],
            postLose: "Haha! You almost had me, you crazy kid!",
            postLose_dominant: ["'Haha! You almost had me, you crazy kid! My compliments!'", "'Good game! My genius was challenged! But I'll be back!'"],
            postLose_stomp: ["'WHAT?! No fair! That was just too weird! I wasn't even ready!'", "'Impossible! My genius... out-geniused?! This is a travesty!'" ],
            postLose_specific: {
                'aang-airbending-only': ["'Oh, good one, Aang! You really caught the old man off guard! Next time, no airscooters!'", "'Alright, alright, Twinkletoes, you win this one. But my genius is still unrivaled!']"],
                'toph-beifong': ["'Agh! You got me, Toph! That was a real shake-up! But I'll be back!'", "'Fine, fine! You win! But my techniques are still far superior! You just got lucky!']"],
                'azula': ["'Hmph! You're too structured, little princess! You just got lucky with that direct blast!'", "'Agh! Predictable fire! You win, but my methods are still superior!']"]
            }
        },
        relationships: {
            'aang-airbending-only': {type: "mentor_student", bond: "strong_familial", dynamic: "friendly_rivalry"},
            'toph-beifong': {type: "peer", bond: "friendly_rivalry", dynamic: "friendly_rivalry"},
            'azula': { type: "clash_of_styles", dynamic: "precision_vs_chaos" }
        }
    },
    'ty-lee': { 
        id: 'ty-lee', name: "Ty Lee", type: "Chi Blocker", bendingTypes: ["Chi-Blocking"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "agile chi-blocking", role: "disabler", tone: "playful_acrobatic", victoryStyle: "Playful", powerTier: 4,
        combatStyleTags: ["acrobatic", "playful", "precise"],
        speechFlavor: "optimistic, cheerful, quippy",
        openingMove: "a playful chi-block jab",
        counterMove: "a graceful dodge and flip",
        midGameTactic: "a blur of acrobatic evasions",
        terrainAdaptation: "a nimble leap onto a precarious surface",
        finishingMove: "a flurry of chi-blocking strikes",
        lastDitchDefense: "a desperate acrobatic disengage",
        techniques: [
            {verb: "execute", object: "a series of acrobatic flips", method: "to close the distance", type: "mobility", req: "none"}, 
            {verb: "strike", object: "a vital pressure point", method: "to disable an arm", type: "disable", req: "none"}, 
            {verb: "gracefully dodge", object: "an attack", method: "and counter with a jab", type: "counter", req: "none"}, 
            {verb: "use", object: "her unparalleled agility", method: "to move like a blur", type: "evasion", req: "none"},
            {verb: "deliver", object: "a flurry of chi-blocking strikes", method: "rendering her foe's bending utterly useless", type: "disable", req: "none", finisher: true, finalFlavor: ["Ty Lee delivered a flurry of chi-blocking strikes, rendering her foe's bending utterly useless.", "Ty Lee incapacitated her opponent with a swift, precise chi-block to their pressure points.", "Ty Lee ended the fight with a perfectly executed chi-block, leaving her opponent stunned and unable to bend."]}
        ], 
        strengths: ["Exceptional Agility", "Disables Benders", "Precise Strikes", "Unpredictable Movements", "Speed", "cramped", "dense", "vertical", "open", "cover_rich"], 
        weaknesses: ["Vulnerable if Immobilized", "Limited Offensive Power", "Fragile", "Direct Physical Confrontation", "Crowd Control", "exposed", "slippery", "precarious", "low_visibility"], 
        quotes: {
            preBattle: "Ooh! This is going to be fun!",
            preBattle_specific: {
                'jeong-jeong': ["'Fire Lord's old general, huh? This is gonna be a *blast*!'", "'Don't worry, old man, I'll be quick! We can get some tea after, maybe?'"],
                'mai': ["'Ready for a little friendly competition, Mai? I'll even let you go first... maybe!'", "'Don't worry, I won't mess up your hair!'"]
            },
            postWin: "Looks like your chi's... on vacation!",
            postWin_dominant: ["'Ooh! That was fun! Looks like someone's chi needed a little vacation!'", "'Ta-da! My chi-blocking powers are unstoppable!'"],
            postWin_stomp: ["'Barely even had to try! Looks like your chi is *definitely* on vacation!'", "'Yay! I won! That was super quick!'" ],
            postWin_specific: {
                'jeong-jeong': ["'See? Even the most controlled flames can't block this much fun!'", "'Aww, cheer up! You just need a chi adjustment!'" ],
                'mai': ["'You're fast, Mai, but I'm faster! And sparklier!'", "'Didn't even get your dress dirty! You're welcome!'"]
            },
            postWin_clever: ["'Boing! You can't catch me!'" , "'Looks like someone's chi is taking a nap!'"],
            postWin_reflective: ["'That was a good stretch! Time for some fruit tarts!'"],
            postWin_overwhelming: ["'Ta-da! That's how it's done!'"],
            postLose: "Aw, man! And I didn't even get to do my special handstand!",
            postLose_dominant: ["'Aw, man! You got me! But it was still fun!'", "'Fine, fine! But I totally almost had you!'" ],
            postLose_stomp: ["'NO FAIR! I didn't even get to do my special handstand! You're so mean!'", "'Ugh, that was totally boring! I couldn't even move!'" ,],
            postLose_specific: {
                'jeong-jeong': ["'Okay, fine, you win! But how did you even *see* me?! That's not fair!'", "'Ugh, the fire's so hot, I can't even get close! This is boring!'" ],
                'mai': ["'Hmph, your knives are just too pointy, Mai! No fun!'", "'Fine, but your methods are ridiculous!']"]
            }
        },
        relationships: {
            'mai': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'jeong-jeong': {type: "clash_of_styles", dynamic: "fire_vs_agility"}
        }
    },
    'mai': { 
        id: 'mai', name: "Mai", type: "Nonbender", bendingTypes: ["Non-Bending"], pronouns: { s: 'she', p: 'her', o: 'her' }, 
        style: "precise marksmanship", role: "sniper_zoner", tone: "unflappable_deadpan", victoryStyle: "Deadpan", powerTier: 4,
        combatStyleTags: ["silent", "precise", "deadpan"],
        speechFlavor: "minimal, sarcastic, indifferent",
        openingMove: "a silent volley of knives",
        counterMove: "a precise knife deflection",
        midGameTactic: "a strategic pinning of opponent's clothing",
        terrainAdaptation: "a calculated retreat to a vantage point",
        finishingMove: "a single, perfectly aimed dagger",
        lastDitchDefense: "a desperate shuriken throw",
        techniques: [
            {verb: "unleash", object: "a volley of stilettos", method: "from her sleeves with deadly precision", type: "ranged_damage", req: "none"}, 
            {verb: "pin", object: "her opponent's clothing", method: "to a wall with a perfectly aimed knife", type: "immobilize", req: "none"}, 
            {verb: "throw", object: "a shuriken", method: "to disarm her foe, aiming for their hands", type: "disable", req: "none"}, 
            {verb: "launch", object: "silent, razor-sharp blades", method: "with surgical accuracy", type: "ranged_damage", req: "none"},
            {verb: "strike", object: "a vital pressure point", method: "with a precision knife throw, ending the fight", type: "disable", req: "none", finisher: true, finalFlavor: ["Mai struck a vital pressure point with a precision knife throw, ending the fight.", "Mai pinned her opponent's clothing to a wall with a perfectly aimed knife, immobilizing them.", "Mai landed a silent, razor-sharp blade precisely on her opponent's pressure point, ending the battle."]}
        ], 
        strengths: ["Deadly Accuracy", "Highly Precise", "Unflappable Demeanor", "Ranged Dominance", "Silent Approach", "open", "cover_rich"], 
        weaknesses: ["Limited to Ranged Attacks", "Vulnerable in Close Proximity", "Emotionally Reserved", "Lack of Close Combat Skills", "cramped", "dense", "low_visibility", "slippery", "exposed"], 
        quotes: {
            preBattle: "Don't waste my time.",
            preBattle_specific: {
                'sokka': ["'Try anything clever, and you'll regret it, Sokka.'", "'I don't have all day. Let's get this over with.'"],
                'ty-lee': ["'This is just a formality, Ty Lee. Stop with the giggling.'", "'Let's just get this over with, Ty Lee. I have things to do.'"]
            },
            postWin: "That's it. Are we done now?",
            postWin_dominant: ["'Expected. Now, are we done?'", "'Precisely as planned. Your tactics were inferior.'"],
            postWin_stomp: ["'That's it. You were useless. Now, are we done? I have better things to do.'", "'Hmph. Pathetic. Don't waste my time again.'"],
            postWin_specific: {
                'sokka': ["'Your tactics weren't enough, Sokka.'", "'Too slow. Just like I predicted.'"], 
                'ty-lee': ["'Your chi is blocked. Just like I predicted.'", "'Expected. You were too... bouncy.'"]
            },
            postWin_clever: ["'I don't miss. You should know that by now.'"],
            postWin_reflective: ["'Some fights are just... necessary.'"],
            postWin_overwhelming: ["'You were never a threat. Just... annoying.'"],
            postLose: "Hmph. Pathetic.",
            postLose_dominant: ["'Hmph. A minor miscalculation. Don't let it go to your head.'", "'This is... inconvenient. But it changes nothing.'"],
            postLose_stomp: ["'THIS IS AN ABERRATION! I don't lose! You got lucky, you imbecile!'", "'Absolutely pathetic. This doesn't count. I refuse to acknowledge this outcome.'"],
            postLose_specific: {
                'sokka': ["'This is an aberration. I don't lose to... distractions.'", "'You got lucky. Don't let it go to your head.'"],
                'ty-lee': ["'I hate you, Ty Lee. This is so annoying.'", "'Fine. But your methods are ridiculous.'"]
            }
        },
        relationships: {
            'ty-lee': {type: "friend", bond: "strong_familial", dynamic: "contrasting_personalities"},
            'sokka': {type: "rivalry", dynamic: "clash_of_wits"}
        }
    },
    'iroh': { 
        id: 'iroh', name: "Iroh", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "wise firebending", role: "mentor_strategist", tone: "wise_calm", victoryStyle: "Wise", powerTier: 8,
        combatStyleTags: ["wise", "calm", "adaptable"],
        speechFlavor: "philosophical, gentle, observant",
        openingMove: "a gentle, redirecting palm strike",
        counterMove: "a calm lightning redirection",
        midGameTactic: "a strategic repositioning for a better view",
        terrainAdaptation: "a subtle manipulation of the environment to create distance",
        finishingMove: "a controlled, encompassing ring of flames",
        lastDitchDefense: "a wise, evasive step",
        techniques: [
            {verb: "breathe", object: "a massive plume of controlled fire", method: "forcing his opponent back", type: "sustained_damage", req: "none"}, 
            {verb: "heat", object: "the ground", method: "to limit his opponent's movement", type: "zone_control", req: "none"}, 
            {verb: "calmly redirect", object: "a lightning bolt", method: "with a subtle gesture", type: "counter", req: "lightning_redirection"}, 
            {verb: "execute", object: "a subtle, evasive maneuver", method: "seeking an opening", type: "evasion", req: "none"}, 
            {verb: "launch", object: "a powerful, yet controlled, fire blast", method: "with expert precision", type: "burst_damage", req: "none"},
            {verb: "envelop", object: "his opponent", method: "in a gentle, yet inescapable ring of flames", type: "zone_control", req: "none", finisher: true, finalFlavor: ["Iroh enveloped his opponent in a gentle, yet inescapable ring of flames.", "Iroh guided his opponent's own energy against them in a masterful redirection, ending the fight.", "Iroh brought the battle to a serene conclusion, with his opponent unable to continue amidst a controlled fire landscape."]}
        ], 
        strengths: ["Masterful Strategist", "Profound Wisdom", "Lightning Redirection", "Hidden Power", "Adaptable", "Calm Demeanor", "hot", "cover_rich", "cramped"], 
        weaknesses: ["Reluctance to Engage in Direct Combat", "Underestimated by Adversaries", "Prefers Philosophy to Fighting", "Can be Paternalistic", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed"], 
        quotes: {
            preBattle: "Perhaps a cup of jasmine tea first?",
            preBattle_specific: {
                'zuko': ["'Prince Zuko, you are not your anger. You are still choosing who you want to be.'", "'Ah, Zuko. Always rushing headlong into battle. Perhaps a moment for tea first?'"],
                'jeong-jeong': ["'Old friend, must we truly do this? There are better ways to spend a morning.'", "'Fire demands control, Iroh. Let us see if your wisdom extends to combat.'"]
            },
            postWin: "There is always hope for redirection, even in battle.",
            postWin_dominant: ["'Indeed. There is always hope for redirection, even in battle. Well fought, my friend.'", "'A quiet victory. Sometimes, the wisest path is not to strike, but to guide.'"],
            postWin_stomp: ["'Ah, well, that was rather quick, wasn't it? Perhaps a cup of jasmine tea to calm the spirit?'", "'Sometimes, the flame guides itself to victory with little effort. Life is full of wonders!'" ],
            postWin_specific: {
                'zuko': ["'Your strength is growing, Prince Zuko. But true power comes from within.'", "'You have found your own way, my nephew. I am proud.'"],
                'jeong-jeong': ["'The greatest masters are those who can teach without a blow, old friend.'", "'Wisdom, Iroh, always prevails over mere force.'"]
            },
            postWin_reflective: ["'Even in conflict, there is peace to be found.'", "'A lesson learned, for both of us.'"],
            postWin_clever: ["'The greatest victories are often won with the mind, not just the fist.'"],
            postWin_overwhelming: ["'The flame has its own path, sometimes swiftly to victory.'"],
            postLose: "A momentary lapse. It happens to the best of us.",
            postLose_dominant: ["'A momentary lapse. It happens to the best of us. A new lesson to be learned.'", "'Indeed. The opponent's flame burned brightly today. I shall reflect on this.'"],
            postLose_stomp: ["'Ah, a swift current indeed! Perhaps I underestimated the path today. Such is the way of things!'", "'Haha! A rather humbling experience! But every defeat holds a lesson, does it not?'"],
            postLose_specific: {
                'zuko': ["'A spirited effort, my nephew. You grow stronger each day.'", "'You still have much to learn, Zuko, but a momentary defeat is a lesson in itself.'"],
                'jeong-jeong': ["'Even masters stumble, Iroh. The fire's nature is sometimes uncontrollable.'", "'A difficult lesson, old friend. But a valuable one.'"]
            }
        },
        relationships: {
            'zuko': { type: "uncle_nephew", bond: "strong_familial", history: "mentorship_and_redemption", dynamic: "emotional_conflict" },
            'jeong-jeong': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" }
        }
    },
    'pakku': { 
        id: 'pakku', name: "Pakku", type: "Bender", bendingTypes: ["Water"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "disciplined waterbending", role: "master_disciplinarian", tone: "stern_commanding", victoryStyle: "Disciplined", powerTier: 7,
        combatStyleTags: ["disciplined", "stern", "formidable"],
        speechFlavor: "authoritative, traditional, critical",
        openingMove: "a precise water whip",
        counterMove: "a solid ice barrier",
        midGameTactic: "a commanding water spout for positioning",
        terrainAdaptation: "a strategic freezing of a section of the environment",
        finishingMove: "a vortex of razor-sharp ice shards",
        lastDitchDefense: "a defensive water bubble",
        techniques: [
            {verb: "create", object: "a vortex of razor-sharp ice shards", method: "with a flick of his wrist", type: "ranged_damage", req: "water"}, 
            {verb: "launch", object: "powerful water whips", method: "to lash out at his opponent", type: "melee_damage", req: "water"}, 
            {verb: "ride", object: "a massive water spout", method: "to gain height and position", type: "mobility", req: "water"}, 
            {verb: "assume", object: "a defensive stance", method: "searching for any source of water", type: "defense", req: "none"}, 
            {verb: "shape", object: "a solid ice barrier", method: "to block attacks", type: "defense", req: "water"},
            {verb: "freeze", object: "a section of the canal", method: "trapping his opponent on cracking ice", type: "immobilize", req: "water", targetElement: "ice_bridge", finisher: true, finalFlavor: ["Pakku froze a section of the canal, trapping his opponent on cracking ice.", "Pakku encased his opponent in an unyielding prison of ice.", "Pakku used his mastery over ice to bind his foe completely, ending the duel."]}
        ], 
        strengths: ["Exceptional Waterbending Prowess", "Disciplined Combatant", "Master Tactician", "Formidable", "Precision", "water_rich", "ice_rich", "slippery", "cold", "open"], 
        weaknesses: ["Rigid Adherence to Tradition", "Can Underestimate Opponents", "Initial Arrogance", "Limited Adaptability", "Less effective in open terrain", "hot", "sandy", "exposed", "open", "cramped"], 
        quotes: {
            preBattle: "Let's see if you're worthy of my time.",
            preBattle_specific: {
                'sokka': ["'Young man, your unconventional tactics will amount to nothing against true discipline. Prepare to be disappointed.'", "'You rely on trinkets and wit. I rely on the essence of life itself. Let's see which truly prevails.'"],
                'katara': ["'So, Katara, have you finally learned to respect the wisdom of the masters?'"]
            },
            postWin: "Discipline prevails.",
            postWin_dominant: ["'Order is maintained. Discipline prevails.'", "'Your efforts were commendable, but lacked the necessary discipline.'"],
            postWin_stomp: ["'A predictable outcome. Some lessons are simply inevitable. Discipline prevails.'", "'That was hardly a challenge. My time is more valuable than this.'"],
            postWin_specific: {
                'sokka': ["'Perhaps now you understand the value of training, Sokka. You are not without talent, but your lack of discipline is a weakness.'", "'A nimble mind, yes, but a brittle stance. There is still much to learn, boy.'"],
                'katara': ["'You have grown powerful, Katara. Your spirit is as strong as your bending.'", "'You have indeed proven yourself, Katara. The future of waterbending is bright.'"]
            },
            postWin_clever: ["'The flow of battle requires precise control, not frantic motion.'"],
            postWin_reflective: ["'A necessary display of mastery. The path of water is clear.'"],
            postWin_overwhelming: ["'My mastery is absolute. There is no question of the outcome.'"],
            postLose: "This is... unacceptable.",
            postLose_dominant: ["'This is... unacceptable. A lapse I shall correct with renewed discipline.'", "'I misjudged. But this outcome will not define my mastery.'"],
            postLose_stomp: ["'IMPOSSIBLE! This... this cannot be! Such an undisciplined display cannot win!'", "'A fluke! This is a complete abomination! I refuse to acknowledge this loss!'" ],
            postLose_specific: {
                'sokka': ["'Remarkable... your resourcefulness is... surprising. Still, a true master would not have faltered.'", "'A lucky strike. Nothing more. This does not change the laws of bending!'"],
                'katara': ["'You have much yet to learn, Katara, but your spirit is admirable.'", "'This loss teaches a valuable lesson in humility. Learn from it, Katara.'"]
            }
        },
        relationships: {
            'katara': { type: "master_student", bond: "strong_familial", history: "initial_denial_due_to_gender" },
            'sokka': { type: "opposed_philosophy", dynamic: "philosophical_clash" }
        }
    },
    'jeong-jeong': { 
        id: 'jeong-jeong', name: "Jeong Jeong", type: "Bender", bendingTypes: ["Fire"], pronouns: { s: 'he', p: 'his', o: 'him' }, 
        style: "controlled firebending", role: "defensive_zoner", tone: "wise_reluctant", victoryStyle: "Wise_Reluctant", powerTier: 6,
        combatStyleTags: ["controlled", "defensive", "reluctant"],
        speechFlavor: "somber, philosophical, warning",
        openingMove: "a calmly established fire barrier",
        counterMove: "a precise, small fire blast for distance",
        midGameTactic: "a strategic repositioning within a ring of fire",
        terrainAdaptation: "a graceful, evasive retreat using fire jets",
        finishingMove: "a contained, inescapable wall of flame",
        lastDitchDefense: "a reluctant, focused fire burst",
        techniques: [
            {verb: "create", object: "a massive, impenetrable wall of fire", method: "for defense", type: "defense", req: "none"}, 
            {verb: "launch", object: "small, precise fire blasts", method: "to maintain distance", type: "ranged_damage", req: "none"}, 
            {verb: "raise", object: "pillars of flame", method: "from the ground to create distance", type: "zone_control", req: "none"}, 
            {verb: "evade", object: "a strike", method: "with a burst of fire jets", type: "evasion", req: "none"}, 
            {verb: "control", object: "a ring of fire", method: "to maintain distance", type: "zone_control", req: "none"},
            {verb: "dissipate", object: "his flames", method: "leaving his opponent surrounded by smoke and confusion", type: "disruption", req: "none", finisher: true, finalFlavor: ["Jeong Jeong dissipated his flames, leaving his opponent surrounded by smoke and confusion, unable to continue.", "Jeong Jeong calmly extinguished his opponent's will to fight with an overwhelming display of controlled fire.", "Jeong Jeong used his mastery to contain his opponent within an inescapable wall of flame, forcing their surrender."]}
        ], 
        strengths: ["Exceptional Self-Control", "Wise Strategist", "Defensive Master", "Evasive", "Pacifistic Tendencies", "hot", "cover_rich", "cramped"], 
        weaknesses: ["Reluctance to Fight", "Pessimistic Outlook", "Cannot Generate Lightning", "Less Offensive Power", "Vulnerable to Direct Assault", "water_rich", "ice_rich", "slippery", "cold", "open", "exposed", "low_visibility"], 
        quotes: {
            preBattle: "I seek not to fight, but to teach. If you insist.",
            preBattle_specific: {
                'iroh': ["'Iroh, old friend, must we truly revisit this destructive path?'", "'Fire demands control, Iroh. Let us see if your wisdom extends to combat.'"],
                'ty-lee': ["'Young one, do you truly wish to face the destructive nature of fire?'", "'Your agility may be unmatched, but fire seeks only to consume. Be warned.'"],
                'azula': ["'Princess Azula. Your fire burns hot, but without wisdom.'", "'A destructive path you walk. Let me show you control.'"],
                'bumi': ["'King Bumi. Even madness must bow to the discipline of flame.'", "'Your unpredictable earthbending cannot contend with true fire control.'"]
            },
            postWin: "The destructive path of fire has been averted, for now.",
            postWin_dominant: ["'I sought not to fight, but to teach. A necessary lesson has been learned.'", "'The destructive path of fire has been averted, for now. Peace is found in control.'"],
            postWin_stomp: ["'A swift end to an unnecessary conflict. May you find a less destructive path.'", "'Some battles are over before they begin. The flame knows its limits.'"],
            postWin_specific: {
                'ty-lee': ["'Even without the chi, your spirit burns brightly. Find a path away from conflict.'", "'My hope remains that you will find a less destructive path.'"],
                'iroh': ["'The flame must know its bounds, old friend. It was a lesson.'", "'Wisdom, Iroh, always prevails over mere force.'"]
            },
            postWin_reflective: ["'The true victory lies in avoiding destruction, not causing it.'", "'May this serve as a lesson for all who tread the path of flame.'"],
            postWin_clever: ["'Control is the ultimate technique.'"],
            postWin_overwhelming: ["'Even I must unleash the flame, when necessary.'"],
            postLose: "Such is the way of things. All flames eventually fade.",
            postLose_dominant: ["'Such is the way of things. All flames eventually fade. A painful lesson.'", "'My control was not enough. The nature of fire remains destructive.'"],
            postLose_stomp: ["'A futile effort. My reluctance... it cost me. The destructive path triumphs.'", "'I warned you of fire's nature. Even my control could not avert this path. Defeat.'"],
            postLose_specific: {
                'ty-lee': ["'Your movements are... disarming. This old man is not as quick as he once was.'", "'Indeed, perhaps fire is too rigid for such fluid combatants.'"],
                'iroh': ["'Even masters stumble, Iroh. The fire's nature is sometimes uncontrollable.'", "'A difficult lesson, old friend. But a valuable one.'"]
            }
        },
        relationships: {
            'iroh': { type: "philosophical_peer", bond: "friendly", history: "shared_burden_of_firebending" },
            'ty-lee': {type: "clash_of_styles", dynamic: "fire_vs_agility"}
        }
    },
};