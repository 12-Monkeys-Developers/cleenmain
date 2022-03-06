export const cleenmain = {};

cleenmain.weapon={
        category : {
                standard: "cleenmain.weapon.category.standard",
                war: "cleenmain.weapon.category.war",
                heavy: "cleenmain.weapon.category.heavy"
        }
};
cleenmain.armor={
        category : {
                standard: "cleenmain.armor.category.standard",
                war: "cleenmain.armor.category.war",
                heavy: "cleenmain.armor.category.heavy",
                shield: "cleenmain.armor.category.shield"
        }
};

cleenmain.npcskills = {
        physical : ["acrobatics", "athletics", "meleecombat", "defence", "riding", "strenght", "resistance"],
        dexterity : ["rangedcombat", "stealth", "pilot", "reflexes", "healing", "technical"],
        social : ["art", "command", "eloquence", "psychology"],
        mental : ["knowledge", "research", "intellect", "langage", "perception", "survival", "volonte"]
};

cleenmain.skill = ["acrobatics", "athletics", "meleecombat", "defence", "riding", "strenght", "resistance",
"rangedcombat", "stealth", "pilot", "reflexes", "healing", "technical","art", "command", "eloquence", "psychology",
"knowledge", "research", "intellect", "langage", "perception", "survival", "willpower"];
        
cleenmain.npccategory = {
        support: "cleenmain.npccategory.support",
        secondfiddle: "cleenmain.npccategory.secondfiddle",
        boss: "cleenmain.npccategory.boss"
};


cleenmain.bonus = [
        "murderous",
        "manytargets",
        "efficient",
        "cover"/*,
        "quick"*/
];

cleenmain.penalty= [
        "lightwound",
        "exposed",
        "difficulty",
        "jeopardy"/*,
        "slow"*/
]
