import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "./Notify";
import { ActivityType } from "../gameplay/activity/ActivityData";

export module GameConfig {
	
	export let debug = true;
	export let is138 = true;
	
    export let isWxLogin: boolean = false;
	export let isFromKXQ = false; // 是否来自氪星球
    export let isInGame: boolean = false;
	export let wxLogout: boolean = false;

    export let isInBattle = false;
    export let isInGambling = false;

    export enum OnlineStatus { OFF_LINE = 0, IDLE = 1, BATTLE = 2, MINIGAME = 3 };

    export function startGambling() {
        isInGambling = true;
        EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
    }

    export function stopGambling() {
        isInGambling = true;
        EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
    }

    export let getAccountType = () => {
        if (isFromKXQ) {
            return 13;
        } else if (isWxLogin) {
            return 12;
        } else {
            return 11;
        }
    }

    export const VERSION = 'v1.0.0';
	export const SERIAL_NUMBER = 1;
    export const DATE = '2022.03.01';

    export const currentQQGroup = 'null';
	
    export let timeInfo = null;
    export let playMusic: boolean = false;
    export let whiteListIsOn: boolean = false;
    export let serverIsOff: boolean = false;
	export let autoRejectPK: boolean = false;
	export let currentActivityPageType = ActivityType.Daily;

    export const RUN_SPEED = 8;
}
