export const initializeHandlebars = () => {
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
  };
  
  function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/cleenmain/templates/sheets/atout-sheet.html",
        "systems/cleenmain/templates/sheets/equipment-sheet.html",
        "systems/cleenmain/templates/sheets/pj-sheet.html",
        "systems/cleenmain/templates/sheets/pnj-sheet.html",
        "systems/cleenmain/templates/sheets/weapon-sheet.html",
        "systems/cleenmain/templates/partials/atout-card.html",
        "systems/cleenmain/templates/sheets/tab/player-combat.html",
        "systems/cleenmain/templates/sheets/tab/player-atouts.html",
        "systems/cleenmain/templates/sheets/tab/player-equipment.html",
        "systems/cleenmain/templates/sheets/tab/player-bio.html",
        "systems/cleenmain/templates/sheets/tab/player-notes.html"
    ];
    return loadTemplates(templatePaths);
  }
  
  function registerHandlebarsHelpers() {
    Handlebars.registerHelper('isStringNotEmpty', function (text) {
      return text.length > 0;
    });
  
    Handlebars.registerHelper('hasAnyFormation', function (data) {
      return data.formations.armes.guerre || data.formations.armes.lourde || data.formations.armures.bouclier || data.formations.armures.guerre || data.formations.armures.lourde;
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
  
    // Ifis not equal
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
    // if equal
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
      if(game.settings.get('symbaroum',v1) ) return options.fn(this);
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
  
  }