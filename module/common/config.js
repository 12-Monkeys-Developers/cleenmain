export const CLEENMAIN = {
        skills: [
                {name: "acrobatics", physical: true},
                {name: "art", physical: false},
                {name: "athletics", physical: true},
                {name: "authority", physical: false},
                {name: "combat", physical: true},
                {name: "knowledge", physical: false},
                {name: "defence", physical: true},
                {name: "stealth", physical: true},
                {name: "research", physical: false},
                {name: "riding", physical: true},
                {name: "eloquence", physical: false},
                {name: "intellect", physical: false},
                {name: "language", physical: false},
                {name: "muscles", physical: true},
                {name: "perception", physical: false},
                {name: "drive", physical: true},
                {name: "psychology", physical: false},
                {name: "reflexes", physical: true},
                {name: "resistance", physical: true},
                {name: "healing", physical: false},
                {name: "survival", physical: true},
                {name: "technical", physical: false},
                {name: "willpower", physical: false}
        ],
        weapon: {
                category: {
                        standard: "CLEENMAIN.weapon.category.standard",
                        war: "CLEENMAIN.weapon.category.war",
                        heavy: "CLEENMAIN.weapon.category.heavy"
                },
                type: {
                        "melee": "CLEENMAIN.weapon.type.melee",
                        "ranged": "CLEENMAIN.weapon.type.ranged"
                }
        },
        armor: {
                category : {
                        standard: "CLEENMAIN.armor.category.standard",
                        war: "CLEENMAIN.armor.category.war",
                        heavy: "CLEENMAIN.armor.category.heavy",
                        shield: "CLEENMAIN.armor.category.shield"
                }
        },
        npcskills: {
                physical: ["acrobatics", "athletics", "combat", "defence", "riding", "muscles", "resistance"],
                dexterity: ["stealth", "drive", "reflexes", "healing", "technical"],
                social: ["art", "command", "eloquence", "psychology"],
                mental: ["knowledge", "research", "intellect", "langage", "perception", "survival", "willpower"]
        },
        npccategory: {
                support: "CLEENMAIN.npccategory.support",
                secondfiddle: "CLEENMAIN.npccategory.secondfiddle",
                boss: "CLEENMAIN.npccategory.boss"
        },
        bonus: ["lethalattack", "mutlipleattacks", "efficiency", "caution"],
        penalty: ["minorinjury", "danger", "difficulty", "risk"]
};

export const MAXHEROISM = {
        "TWO_PLAYERS": 10,
        "THREE_PLAYERS": 8,
        "FOUR_PLAYERS": 6,
        "FIVE_PLAYERS": 4        
};
