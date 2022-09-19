export const registerHandlebarsHelpers = function() {

    Handlebars.registerHelper('isStringNotEmpty', function (stringtotest) {
        return stringtotest.length > 0;
      });
    
    Handlebars.registerHelper('hasAnytraining', function (system) {
        return system.trainings.weapons.war || system.trainings.weapons.heavy || system.trainings.armors.shield || system.trainings.armors.war || system.trainings.armors.heavy;
    });

    Handlebars.registerHelper('removeMarkup', function (text) {
        const markup = /<(.*?)>/gi;
        return new Handlebars.SafeString(text.replace(markup, ''));
    });
    
    Handlebars.registerHelper('removeStyling', function (text) {
        const styling = /style="[^"]+"/gi;
        return new Handlebars.SafeString(text.replace(styling, ''));
    });

    Handlebars.registerHelper('keepMarkup', function (text) {  
        return new Handlebars.SafeString(text);
    });

    Handlebars.registerHelper('localizeabbr', function (text) {  
        return game.i18n.localize(text+"ABBR");
    });

    // If is not equal
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });

    // if not
    Handlebars.registerHelper('ifn', function (v1, options) {
        if (!v1) return options.fn(this);
        else return options.inverse(this);
    });

    // if equal
    Handlebars.registerHelper('ife', function (v1, v2, options) {
        if (v1 === v2) return options.fn(this);
        else return options.inverse(this);
    });

    // if greater
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2) return options.fn(this);
        else return options.inverse(this);
    });

    // if all true
    Handlebars.registerHelper('ifat', function (...args) {
        // remove handlebar options
        let options = args.pop();
        return args.indexOf(false) === -1 ? options.fn(this) : options.inverse(this);
    });   

    Handlebars.registerHelper('keyIndex', function (str) {
        return 'system.power.' + str + '.description';
    });

    Handlebars.registerHelper('addOne', function (v1) {
        let newOne = parseInt(v1) + 1;
        return newOne;
    });

    Handlebars.registerHelper('isSettingEnabled', function(configKey) {
		return game.settings.get('cleenmain', configKey);
	});    

    Handlebars.registerHelper('toFixed', function (v1, v2) {
        return v1.toFixed(v2);  
    });

    // Times
    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });  

    Handlebars.registerHelper('and', function (val1, val2) {
        return val1 && val2;
    });
    
    Handlebars.registerHelper('getCategoryLabel', function(type, category) {
        if (type === "armor") {
            return game.i18n.localize("CLEENMAIN.armor.category."+category);
        }
        else if (type === "weapon") {
            return game.i18n.localize("CLEENMAIN.weapon.category."+category);
        }        
    });

    Handlebars.registerHelper('getCheckboxIcon', function (value) {
        if (value) return "fas fa-square";
        return "far fa-square";
    });

    Handlebars.registerHelper('getWeaponSkillName', function (actor, item) {
       const it = actor.items.get(item._id);
       return it.weaponSkillName(actor);;
    });

    Handlebars.registerHelper('getWeaponSkill', function (actor, item) {
        const it = actor.items.get(item._id);
        return it.weaponSkill(actor);;
    });

    Handlebars.registerHelper('getWeaponDamage', function (actor, item) {
       const it = actor.items.get(item._id);       
       return it.weaponDamage(actor);
    });

    Handlebars.registerHelper('getDefenceValue', function (actor) {
       return actor.defence;
    });

    Handlebars.registerHelper('getSkillValue', function (actor, item) {
        const skillValue = actor.getSkillValue(item);
       return skillValue;
    });

    Handlebars.registerHelper('isNotEmptyString', function (value) {
        if (value === null ) return false;
        if (value === "") return false;
        return true;
    });

    Handlebars.registerHelper('getActedStatus', function (combatant) {
        if (combatant.hasActed) return "<a><i class='fas fa-hand-paper'></i></a>"; 
        return "<a class='act'><i class='far fa-hand-paper'></i></a>";
    });

    Handlebars.registerHelper('getCombatTrackerColor', function (isPlayer, isNpc) {
        if (isPlayer) return "player";
        if (isNpc) return "npc";
    });
    
}
