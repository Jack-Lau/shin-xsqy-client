import { GameConfig } from "../config/GameConfig";

export default class SideEffect {
    private static _instance: SideEffect = null;
    
    public static getInstance(str: string): SideEffect {
        if (!this._instance) {
            this._instance = new SideEffect();
        }
        if (GameConfig.debug) {
            console.log('%c ' + str, 'background: #222; color: #bada55');
        }
        return this._instance;
    }
}