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
                { name: "social", physical: false, skills: ["art", "authority", "eloquence", "psychology"] },
                { name: "mental", physical: false, skills: ["knowledge", "research", "intellect", "langage", "perception", "survival", "willpower"] },
                { name: "defence", physical: true, skills: ["defence"] }
        ],
        npcCategory: {
                support: "CLEENMAIN.npccategory.support",
                secondfiddle: "CLEENMAIN.npccategory.secondfiddle",
                boss: "CLEENMAIN.npccategory.boss"
        },
        bonus: ["lethalattack", "multipleattacks", "efficiency", "caution", "quick"],
        penalty: ["minorinjury", "danger", "difficulty", "risk", "slowness"],
        skillsModifiedBehaviour: ["defence"],
        infoTemplate:{
                badshape:"<p>Tant qu’un personnage possède des points de vitalité, ceux qu’il a perdus correspondent à de la simple fatigue, des contusions légères ou des plaies sans gravité. S’il ne possède plus de point de vitalité, il est <strong>mal en point</strong> et il subit un <strong>-2 à toutes ses actions</strong>.</p><p>Le joueur d’un personnage qui devient <strong>mal en point</strong> effectue : </p><ul><li>Un test de <strong>Résistance / (5 + dégâts subis)</strong>. En cas d’échec, le personnage est en danger de mort et décède à la fin du 1d6e round suivant.</li><li>Un test de <strong>Volonté / (5 + dégâts subis)</strong>. En cas d’échec, le personnage est inconscient pendant 2d6 rounds – sauf s’il décède plus tôt. Un personnage inconscient lâche ce qu’il tient en main et tombe au sol. Si un adversaire à portée décide de l’achever, il le tue automatiquement en y consacrant une action.</li></ul><p>Tant que son personnage est <strong>mal en point</strong>, le joueur effectue ces tests à chaque nouvelle blessure.<br />Le joueur ne compte alors plus les points de Vitalité que perd son personnage, seulement le nombre de blessures qu’il subit au-delà de celle qui l’a mis mal en point. Chacune génère un malus de <strong>-5 aux tests de Résistance et Volonté</strong> déterminant s’il est en danger de mort et / ou inconscient.<br /><br /></p>",
                heroism:"<p>Grâce aux points d’héroïsme, cinq effets sont possibles : </p><ul><li>Effectuer un test de compétence avec 4d6 au lieu de 3 habituels. Coût : 1 point d’héroïsme</li><li>Après avoir effectué un test, l’annuler et le recommencer (en lançant le même nombre de dés). Coût : 1 point d’héroïsme</li><li>Déclencher l’effet héroïque d’un de ses atouts. Coût : 1 point d’héroïsme</li><li>Au moment de subir des dégâts annoncés par le MJ, les annuler, ainsi que les désagréments qui les accompagneraient. Coût : 2 points d’héroïsme</li><li>Encaisser des dégâts à la place d’un allié proche. Coût : 2 points d’héroïsme</li></ul><p>Un joueur peut utiliser les points d’Héroïsme comme il le souhaite, cumulant différents effets s’il le désire. Cependant, il ne peut utiliser chacun des cinq effets présentés ci-dessus qu’une seule fois par tour de jeu, mais ce en plus de l’action et des défenses de son personnage.</p><p><em>Récupération des points d’héroïsme</em> : Ils sont récupérés au début d'un scénario.<br /></p></div>"
        },
        boon_effect: {
                health_bonus : "Bonus to health, options: {value : number}  for example {value: 4}",
                skill_bonus: "Bonus to skill roll, options: {reference: string, value : number}  for example {reference: 'willpower', value: 3}",
                skill_bonus_1d6: "Bonus 1d6 to skill roll, options: {reference: string}  for example {reference: 'willpower'}",
                skill_heroism_bonus1d6: "+2d6 when using heroism on skill, options: {reference: string}  for example {reference: 'willpower'}",
                badShape_skillBonus: "Bonus instead of -2 on skills when in bad shape, options: {value : number}  for example {value: 2}",
                badShape_damageBonus: "Bonus on damage when in bad shape, options: {value : string}  for example {value:'1d6'}",
                badShape_noWoundMalus: "No malus on Resistance roll from wounds when in bad shape",
                badShape_skill_heroism_bonus1d6:"+2d6 when using heroism on skill while in bad shape, options: {reference: string}  for example {reference: 'willpower'}",
                protection_bonus: "permanent bonus to protection, option: {value : number} example: {value: 4}",
                boon_uses : "Boon can be used limited times, but more than 1, option: {limitedUse2 : true, limitedUse3 : true}}",
                always2dice: "(Biotech boon) all biotech boosted rolls uses 2 dice instead of 1",
                melee_bonus : "melee bonus damage increased by value",
                ranged_bonus : "ranged bonus damage increased by value",
                biotech_profile : "all skills have +2, referenceList skills have +3, options: {referenceList: array}"
        },
        max_heroism: {
            "TWO_PLAYERS": 10,
            "THREE_PLAYERS": 8,
            "FOUR_PLAYERS": 6,
            "FIVE_PLAYERS": 4        
        },
        npc_level: {
            "support": "support",
            "secondfiddle": "secondfiddle",
            "boss": "boss"
        }
};

export const HEALTH_STATUS = {
        "normal": "CLEENMAIN.health.status.normal",
        "badShape": "CLEENMAIN.health.status.badshape",
        "unconscious": "CLEENMAIN.health.status.unconscious",
        "riskOfDeath": "CLEENMAIN.health.status.riskofdeath"
}

