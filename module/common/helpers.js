export const registerHandlebarsHelpers = function() {

    Handlebars.registerHelper('isStringNotEmpty', function (stringtotest) {
        return stringtotest.length > 0;
      });
    
    Handlebars.registerHelper('hasAnytraining', function (data) {
        return data.trainings.weapons.war || data.trainings.weapons.heavy || data.trainings.armors.shield || data.trainings.armors.war || data.trainings.armors.heavy;
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
        return 'data.power.' + str + '.description';
    });

    Handlebars.registerHelper('addOne', function (v1) {
        let newOne = parseInt(v1) + 1;
        return newOne;
    });

    Handlebars.registerHelper('ifSetting', function (v1, options) {
        if (game.settings.get('symbaroum',v1)) return options.fn(this);
        else return options.inverse(this);
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

    // Times
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

}
