import { SyncMessage, BattleResponse, TurnInfo, BattleResult } from "../net/Protocol";
import { NetUtils } from "../net/NetUtils";
import { BattleConfig, BattleType } from "./BattleConfig";
import BattleScene from "./BattleScene";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import PlayerData from "../data/PlayerData";
import { CommonUtils } from "../utils/CommonUtils";

export enum GamePlay { KingsFight }

export module BattleUtils {
    export let battleScene: BattleScene = null;
    let currentSync = {};
    let lens = R.lensProp('extra');
    export let fromGamePlay = GamePlay.KingsFight;

    // export type MultiplayerBattleStatus = "INIT" | "BEFORE_BATTLE" | "PREPARED" | "BEFORE_TURN" | "IN_TURN" | "AFTER_TURN" | "AFTER_BATTLE" | "CLEAN" | "END";
    export async function sendSync(sync: SyncMessage) {
        currentSync = sync;
        let route = `/multiplayerBattle/${BattleConfig.getInstance().battleSessionId}/sync`
        switch (sync.syncStatus) {
            case "BEFORE_BATTLE": {
                BattleConfig.getInstance().battleSessionId = sync.extra;
                let json = R.set(lens, {}, currentSync);
                // 这里尚未设置battleSessionId, 不能使用route
                await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, `/multiplayerBattle/${BattleConfig.getInstance().battleSessionId}/sync`, [], json) as any;
                break;
            }
            case "PREPARED": {
                let data = sync.extra as BattleResult;
                // 开始加载 并在加载完毕之后发送PREPARED
                BattleConfig.getInstance().battleType = BattleType.MUTIL_PLAYER;
                await doBeforeEnterBattle(sync.extra);
                await BattleConfig.getInstance().startLoadingWithPromise(CommonUtils.makePromise(data), () => {
                    BattleConfig.getInstance().battleType = BattleType.NORMAL;
                })
                // await BattleConfig.getInstance().startLoading(data, () => {
                //     BattleConfig.getInstance().battleType = BattleType.NORMAL;
                // });
                let json = R.set(lens, {}, currentSync);
                await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, route, [], json) as any;
                break;
            }
            case "BEFORE_TURN": {
                battleScene && battleScene.forceStartOperation();
                break;
            }
            case "AFTER_BATTLE": {
                battleScene.endBattleNextTurn = true;
                let turnInfo = sync.extra as TurnInfo;
                battleScene && (battleScene.pleaseWaitFlag.node.active = false);
                battleScene && battleScene.initByTurnInfo({ content: turnInfo });
                break;
            }
            case "AFTER_TURN": {
                let turnInfo = sync.extra as TurnInfo;
                battleScene && (battleScene.pleaseWaitFlag.node.active = false);
                battleScene && battleScene.initByTurnInfo({ content: turnInfo });
                break;
            }
            case "CLEAN": {
                battleScene && battleScene.exitBattle();
                let json = R.set(lens, {}, currentSync);
                await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, route, [], json) as any;
                break;
            }
        }
    }

    export async function sendAfterBattleSync() {
        let json = R.set(lens, {}, currentSync);
        console.debug('send after battle');
        await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, `/multiplayerBattle/${BattleConfig.getInstance().battleSessionId}/sync`, [], json);
    }

    // 发送Action Sync
    export async function sendActionSync(action) {
        battleScene && (battleScene.pleaseWaitFlag.node.active = true);
        let json = R.set(lens, action, currentSync);
        await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, `/multiplayerBattle/${BattleConfig.getInstance().battleSessionId}/sync`, [], json) as any;
        battleScene && (battleScene.sendingOperation = false);
    }

    export async function sendAfterTurnSync() {
        let json = R.set(lens, {}, currentSync);
        await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, `/multiplayerBattle/${BattleConfig.getInstance().battleSessionId}/sync`, [], json);
    }

    export async function startSinglePlayerBattle(response: BattleResponse) {
        BattleConfig.getInstance().battleSessionId = response.battleSessionId;
        await doBeforeEnterBattle(response.result);
        await BattleConfig.getInstance().startLoadingWithPromise(CommonUtils.makePromise(response.result), () => {
            BattleConfig.getInstance().battleType = BattleType.NORMAL
        })
        // await BattleConfig.getInstance().startLoading(response.result, () => {
        //     BattleConfig.getInstance().battleType = BattleType.NORMAL;
        // });
    }

    export function startMutilPlayerBattle() {

    }

    async function doBeforeEnterBattle(battleResult: BattleResult) {
        switch (fromGamePlay) {
            case GamePlay.KingsFight: {
                let accountId = -1;
                for (let unit of battleResult.unitInitInfo) {
                    if (unit.type == "TYPE_PLAYER" && unit.sourceId != PlayerData.getInstance().accountId) {
                        accountId = unit.sourceId;
                        break;
                    }
                }
                EventDispatcher.dispatch(Notify.KINGS_FIGHT_MATCH_END, { accountId: accountId });
                await CommonUtils.wait(2.5);
                EventDispatcher.dispatch(Notify.KINGS_FIGHT_SEARCH_FORCE_CLOSE, {});
                break;
            }
        }
    }

    export async function backToBattle(sessionId: number) {
        let syncMsg = await NetUtils.get<SyncMessage>('/multiplayerBattle/{id}/viewSync', [sessionId]);
        let onStatus = ["PREPARED", "BEFORE_TURN", "IN_TURN", "AFTER_TURN"]
        let battleIsOn = syncMsg.fmap(x => onStatus.indexOf(x.syncStatus) != -1).getOrElse(false);
        if (battleIsOn) {
            let result = await NetUtils.get<BattleResult>('/multiplayerBattle/{id}', [sessionId]);
            if (result.isRight) {
                BattleConfig.getInstance().battleType = BattleType.MUTIL_PLAYER;
                BattleConfig.getInstance().battleSessionId = sessionId;
                await BattleConfig.getInstance().startLoadingWithPromise(CommonUtils.makePromise(result.right), () => {
                    BattleConfig.getInstance().battleType = BattleType.NORMAL;
                })
                // await BattleConfig.getInstance().startLoading(result.right, () => {
                //     BattleConfig.getInstance().battleType = BattleType.NORMAL;
                // });
                // check again
                let syncMsg2 = await NetUtils.get<SyncMessage>('/multiplayerBattle/{id}/viewSync', [sessionId]);
                let battleIsOn2 = syncMsg2.fmap(x => onStatus.indexOf(x.syncStatus) != -1).getOrElse(false);
                if (!battleIsOn2) {
                    battleScene && battleScene.exitBattle();
                }
            }
        }
    }
}