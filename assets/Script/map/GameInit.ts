import { ReddotUtils } from "../utils/ReddotUtils";
import PlayerData from "../data/PlayerData";
import { NetUtils } from "../net/NetUtils";
import { CommonUtils } from "../utils/CommonUtils";
import { GameConfig } from "../config/GameConfig";
import NetManager from "../net/NetManager";
import NpcConfig from "../config/NpcConfig";
import MapConfig from "../config/MapConfig";
import QuestConfig from "../quest/QuestConfig";
import { QuestManager } from "../quest/QuestManager";
import { BattleConfig, BattleType } from "../battle/BattleConfig";
import ItemConfig from "../bag/ItemConfig";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import BagData from "../bag/BagData";
import { Chat } from "../chat/Chat";
import MapManager from "./MapManager";
import { BattleResponse, BattleResult, SyncMessage } from "../net/Protocol";
import { BattleUtils } from "../battle/BattleUitls";
import { YxjyData } from "../gameplay/yxjy/YxjyData";

export namespace GameInit {
	
    export async function initReddot() {
        ReddotUtils.checkMail();
        PlayerData.getInstance().updateFc();
        //ReddotUtils.checkYqs();
        //ReddotUtils.checkJgt();
        //ReddotUtils.checkCbt();
        setTimeout(PlayerData.getInstance().updateKbRecord, 2000);
    }

    export async function beforeStart() {
        console.log("[initial start]")
        NetManager.getInstance().initConnection();
        await NpcConfig.getInstance().init();
        await MapConfig.getInstance().init();
        await QuestConfig.getInstance().init();
        await BattleConfig.getInstance().init();
        await ItemConfig.getInstance().init();
        await PlayerData.getInstance().init();  // 玩家数据需要背包之前初始化
        await EquipUtils.initEnhanceConfig();
        await BagData.getInstance().initData();
        await YxjyData.初始化元宵佳肴();
        Chat.ChatManager.getInstance();
        console.log("[initial end]")
    }

    export async function initCurrency() {
        // 请求所有货币信息
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}', [PlayerData.getInstance().accountId]) as any;
        if (response.status == 0) {
            for (let currency of response.content) {
                if (currency.currencyId === 150) { // 元宝
                    PlayerData.getInstance().ybAmount = currency.amount;
                } else if (currency.currencyId === 151) { // 仙石
                    PlayerData.getInstance().kbAmount = currency.amount;
                } else if (currency.currencyId === 155) {
                    PlayerData.getInstance().hyAmount = currency.amount;
                }
            }
        }
    }

    export async function initSchool() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/school/view/myself', []) as any;
        if (response.status == 0) {
            PlayerData.getInstance().schoolId = response.content.schoolId;
        } else {
            PlayerData.getInstance().schoolId = null;
        }
    }

    export async function syncTime() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/', []);
        if (response.status === 0) {
            let info = response.content;
            let date = new Date(R.prop('currentTime', info));
            let now = Date.now();
            GameConfig.timeInfo = Immutable.Map({"serverTime": date.getTime(), "clientTime": now})
            GameConfig.whiteListIsOn = R.prop('restrictedMode', info);
        } else {
            GameConfig.serverIsOff = true;
        }
    }

    export async function cleanBattle () {
        await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/clean', []);
    }

    export async function tryBackToBattle() {
        let sessionIds = (await NetUtils.get<Array<number>>('/multiplayerBattle/attendingSessionIds', [])).getOrElse([]);
        if (sessionIds.length > 0) {
            let sessionId = sessionIds[sessionIds.length - 1];
            BattleUtils.backToBattle(sessionId);
        }
    }

}
