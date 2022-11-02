export class CemChat {

    /**
     * 
     * @param {*} actor The emitter of the chat message
     */
    constructor(actor) {
        this.actor = actor;
        this.chat = null;
        this.content = null;
        this.template = null;
        this.data = null;
        this.chatData = null;
        this.flags = null;
        this.roll = null;
    }

    /**
     * @description Sets the specified message content
     * @param {*} content 
     * @returns the instance
     */
    withContent(content) {
        this.content = content;
        return this;
    }

    /**
     * @description Sets the specified template used to create the message content
     * @param {*} template The path of the file template to set
     * @returns the instance
     */    
    withTemplate(template) {
        this.template = template;
        return this;
    }

    /**
     * @description Sets the specified data used to create the message content
     * @param {*} data The data of the file template to set
     * @returns the instance
     */
    withData(data) {
        this.data = data;
        return this;
    }

    /**
     * @description Sets the flags parameter
     * @param {*} flags 
     * @returns the instance
     */
    withFlags(flags) {
        this.flags = flags;
        return this;
    }

    /**
     * Indicates if the chat is a roll.
     * @param roll True if the chat is a roll.
     * @returns the instance.
     */
    withRoll(roll) {
        this.roll = roll;
        return this;
    }

    /**
     * @description Creates the chat message
     * @returns this instance
     */
    async create() {

        // Retrieve the message content
        if (!this.content && this.template && this.data) {
            this.content = await this._createContent();
        }

        // Exit if message content can't be created
        if (!this.content) {
            return null;
        }

        // Create the chat data
        const d = {
            user: game.user.id,
            speaker: {
                actor: this.actor.id,
                alias: this.actor.name,
                scene: null,
                token: null,
            },
            content: this.content
        }

        // Set the roll parameter if necessary
        if (this.roll) {
            d.roll = this.roll;
            d.rollMode = this.data.rollMode;
            d.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
        }
        // Set the flags parameter if necessary
        if (this.flags) {
            d.flags = this.flags;
        }

        // Set the whisper and blind parameters according to the player roll mode settings
        //switch (game.settings.get('core', 'rollMode')) {
        switch (this.data.rollMode) {
            case 'gmroll':
                d.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
                break;
            case 'blindroll':
                d.whisper = ChatMessage.getWhisperRecipients('GM').map((u) => u.id);
                d.blind = true;
                break;
            case 'selfroll':
                d.whisper = [game.user.id];
                break;
        }
        const pool = PoolTerm.fromRolls(this.data.rolls);
        d.roll = Roll.fromTerms([pool]);
       
        this.chatData = d;

        return this;

    }

    /**
     * @description Creates the message content from the registered template
     * @returns the message content or null i an error occurs
     * @private
     */
    async _createContent() {

        // Update the data to provide to the template
        const d = duplicate(this.data);
        d.owner = this.actor.id;

        // Call the template renderer.
        return await renderTemplate(this.template, d);

    }

    /**
    * @description Displays the chat message
    * @returns this instance
    */
    async display() {
        // Create the chat
        this.chat = await ChatMessage.create(this.chatData);
        return this;
    }

}