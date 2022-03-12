import { CLEENMAIN } from "./config.js";

export class Skills {


    /**
     * @name getSkillValue
     * @description Calculate the value of a skill : base + bonus + 2 if the skill is developed
     * @param {*} base 
     * @param {*} bonus 
     * @param {Boolean} developed 
     * @returns 
     */
    static getSkillValue (base, bonus, developed) {
        return parseInt(base) + parseInt(bonus) + parseInt((developed ? 2 : 0));
    }
}