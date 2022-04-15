export const CLEENMAIN = {
        skills: [
                { name: "acrobatics", physical: true },
                { name: "art", physical: false },
                { name: "athletics", physical: true },
                { name: "authority", physical: false },
                { name: "combat", physical: true },
                { name: "knowledge", physical: false },
                { name: "defence", physical: true },
                { name: "stealth", physical: true },
                { name: "research", physical: false },
                { name: "riding", physical: true },
                { name: "eloquence", physical: false },
                { name: "intellect", physical: false },
                { name: "language", physical: false },
                { name: "muscles", physical: true },
                { name: "perception", physical: false },
                { name: "drive", physical: true },
                { name: "psychology", physical: false },
                { name: "reflexes", physical: true },
                { name: "resistance", physical: true },
                { name: "healing", physical: false },
                { name: "survival", physical: true },
                { name: "technical", physical: false },
                { name: "willpower", physical: false }
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
        npcSkills: [
                { name: "physical", physical: true, skills: ["acrobatics", "athletics", "combat", "defence", "riding", "muscles", "resistance"] },
                { name: "dexterity", physical: true, skills: ["stealth", "drive", "reflexes", "healing", "technical"] },
                { name: "social", physical: false, skills: ["art", "command", "eloquence", "psychology"] },
                { name: "mental", physical: false, skills: ["knowledge", "research", "intellect", "langage", "perception", "survival", "willpower"] },
                { name: "defence", physical: true, skills: ["defence"] }
        ],
        npcCategory: {
                support: "CLEENMAIN.npccategory.support",
                secondfiddle: "CLEENMAIN.npccategory.secondfiddle",
                boss: "CLEENMAIN.npccategory.boss"
        },
        bonus: ["lethalattack", "mutlipleattacks", "efficiency", "caution", "quick"],
        penalty: ["minorinjury", "danger", "difficulty", "risk", "slowness"]
};

export const HEALTH_STATUS = {
        "normal": "CLEENMAIN.health.status.normal",
        "badShape": "CLEENMAIN.health.status.badshape",
        "unconscious": "CLEENMAIN.health.status.unconscious",
        "riskOfDeath": "CLEENMAIN.health.status.riskofdeath"
}