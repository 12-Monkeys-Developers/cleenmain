export const CLEENMAIN = {
        skills: ["acrobatics", "art", "athletics", "authority", "combat", "knowledge","defense", "stealth", "research", "riding","eloquence", "intellect", "language",
                "muscles","perception", "drive", "psychology", "reflexes","resistance","healing", "survival", "technical", "willpower"],
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
                physical: ["acrobatics", "athletics", "combat", "defense", "riding", "muscles", "resistance"],
                dexterity: ["stealth", "drive", "reflexes", "healing", "technical"],
                social: ["art", "command", "eloquence", "psychology"],
                mental: ["knowledge", "research", "intellect", "langage", "perception", "survival", "willpower"]
        },
        npccategory: {
                support: "CLEENMAIN.npccategory.support",
                secondfiddle: "CLEENMAIN.npccategory.secondfiddle",
                boss: "CLEENMAIN.npccategory.boss"
        },
        bonus: ["lethalattack", "mutlipleattacks", "efficiency", "caution"], /*"quick"*/
        penalty: ["minorinjury", "danger", "difficulty", "risk"] /*"slow"*/
};
