import { NetUtils } from "../net/NetUtils";
import { Notify } from "../config/Notify";
import { EventDispatcher } from "./event/EventDispatcher";
import { IdleMineRecord, MineArenaComplex, MineArenaRecord, GoldTowerChallengeEntity } from "../net/Protocol";
import PlayerData from "../data/PlayerData";
import { QuestManager } from "../quest/QuestManager";
import { QuestProxy } from "../quest/QuestProxy";

export namespace ReddotUtils {
	
    export async function checkMail() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/mail/existsUnread', []) as any;
        if (response.status == 0) {
            let event = new EventDispatcher.NotifyEvent(Notify.MAIN_UI_SET_REDDOT_VISIBLE);
            event.detail = {
                name: 'mailBtn',
                visible: response.content
            }
            EventDispatcher.dispatchEvent(event)
        }
    }

    export async function checkKbWheel(energy: number) {
        if (undefined == energy) {
            return;
        }
        let event = new EventDispatcher.NotifyEvent(Notify.MAIN_UI_SET_REDDOT_VISIBLE);
        event.detail = {
            name: 'kbWheelBtn',
            visible: energy >= 100
        }
        EventDispatcher.dispatchEvent(event)
    }

    export async function checkSjjs(): Promise<boolean> {
        if (PlayerData.getInstance().playerLevel <= 45) {
            return false;
        }
        await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/idleMine/get', []);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/balance', []);
        if (response.status === 0) {
            let data = response.content as IdleMineRecord;
            return data.mineQueueMapId_1 == undefined
                || !data.mineQueueMapId_2 == undefined
                || !data.mineQueueMapId_3 == undefined
        }
        return false;
    }

    export async function checkYqs() {
        let response = await NetUtils.post<MineArenaRecord>('/arena/resolveReward', []);
        EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, {name: 'yqsBtn', visible: response.fmap(x => !x.resolvedRewardDelivered).getOrElse(false)})
    }

    // 藏宝红点
    export async function checkCbt() {
		
        let record = QuestProxy.getQuestRecord(720027);
        let showRedDot = record.fmap(x => x.startedCount == 0).getOrElse(false);
        EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, {name: 'trasureBtn', visible: showRedDot});
    }

    // 金光塔红点
    export async function checkJgt() {
        let result1 = await NetUtils.get<GoldTowerChallengeEntity>('/goldTower/getGoldTowerChallenge', []);
        if (result1.isRight) {
            let showRedDot = result1.right.availableChallengeCount >= 1 && result1.right.lastFloorCount < 80;
            EventDispatcher.dispatch(Notify.MAIN_UI_SET_REDDOT_VISIBLE, {name: 'jgtBtn', visible: showRedDot});
        }
    }

}