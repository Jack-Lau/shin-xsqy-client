import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { BattleConfig } from "../battle/BattleConfig";
import { GameConfig } from "../config/GameConfig";
import { CommonUtils } from "../utils/CommonUtils";
import KbWheel from "../gameplay/kbwheel/KbWheel";
import AntiquePanel from "../gameplay/antique/AntiquePanel";
import HspmPanel from "../gameplay/hspm/HspmPanel";
import EquipmentForgePanel from "../gameplay/equipment/forge/EquipmentForgePanel";
import JinGuangTaPanel from "../gameplay/jinguangta/JinGuangTaPanel";
import PetGainPanel from "../gameplay/pet/PetGainPanel";
import SjjsPanel from "../gameplay/sjjs/SjjsPanel";
import PetPanel from "../gameplay/pet/PetPanel";
import { MentorUtils } from "../gameplay/mentor/MentorUtils";
import MysteryStorePanel from "../gameplay/mysteryStore/MysteryStorePanel";
import PlayerData from "../data/PlayerData";
import { TipsManager } from "../base/TipsManager";
import RivalPanel from "../gameplay/rival/RivalPanel";
import TigerMachinePanel from "../gameplay/tigerMachine/TigerMachinePanel";
import KingFightSelectPanel from "../gameplay/kingsFight/KingsFightSelectPanel";
import DigOrePanel from "../gameplay/digOre/DigOrePanel";
import NewYearPanel from "../gameplay/newYear/NewYearPanel";
import { precondition } from "../utils/BaseFunction";
import { YxjyData } from "../gameplay/yxjy/YxjyData";
import { ResUtils } from "../utils/ResUtils";
import SecondConfirmBox from "../base/SecondConfirmBox";
import { NetUtils } from "../net/NetUtils";
import { YxjyRecord } from "../net/Protocol";
import YxjyPanel from "../gameplay/yxjy/YxjyPanel";
import HlttPanel from "../gameplay/hltt/HlttPanel";
import RedPacketPanel from "../gameplay/redPacket/RedPacketPanel";
import TreasureBowlPanel from "../gameplay/treasureBowl/TreasureBowlPanel";

export module BroadcastHandler {
	
    let isHandling: boolean = false;
	
    export async function handle(senderId: number, extraParams?: any) {
        if (GameConfig.isInBattle) {
            return;
        }
        if (isHandling) {
            return;
        } else {
            isHandling = true;
        }
        EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
        switch (senderId) {
            case 1: { // 仙石大转盘
                let panel = await CommonUtils.getPanel('kbWheel', KbWheel) as KbWheel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 2: { // 西域商人
			    if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/antique/AntiquePanel', AntiquePanel) as AntiquePanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 3: { // 黑市拍卖
				if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1094);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/hspm/hspmPanel', HspmPanel) as HspmPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 4: { // 装备打造
                let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentForgePanel', EquipmentForgePanel) as EquipmentForgePanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 5: { // 金光塔
				if (PlayerData.getInstance().playerLevel < 40) {           
                    TipsManager.showMsgFromConfig(1033);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/jinguangta/JinGuangTaPanel', JinGuangTaPanel) as JinGuangTaPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 6: { // 宠物扭蛋机
                let panel = await CommonUtils.getPanel('gameplay/pet/PetGainPanel', PetGainPanel) as PetGainPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 7: { // 装备强化
                let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentForgePanel', EquipmentForgePanel) as EquipmentForgePanel;
                panel.container.toggleItems[1].check()
                panel.switchToEnhance();
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 8: { // 三界经商
				if (PlayerData.getInstance().playerLevel < 40) {           
                    TipsManager.showMsgFromConfig(1068);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/sjjs/sjjsPanel', SjjsPanel) as SjjsPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 9: { // 宠物冲星
                let panel = await CommonUtils.getPanel('gameplay/pet/petPanel', PetPanel) as PetPanel;
                panel.toggles[2].check();
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 10: { // 神秘商人
                let panel = await CommonUtils.getPanel('gameplay/mysteryStore/mysteryStorePanel', MysteryStorePanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 11: { // 师徒
                MentorUtils.openMentorPanel();
                break;
            }
            case 12: { // 乱斗
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1116);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/rival/RivalPanel', RivalPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 13: { // 摇翻天
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/tigerMachine/TigerMachinePanel', TigerMachinePanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 14: { // 王者决战
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMessage('提升至50级即可参加王者决战');
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightSelectPanel', KingFightSelectPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 15: { // 矿山探宝
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1195);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/digOre/DigOrePanel', DigOrePanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 16: { // 新年活动 活动界面（限时分页）
                //let panel = await CommonUtils.getPanel('gameplay/newYear/NewYearPanel', NewYearPanel);
                //EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
				let panel = await CommonUtils.getPanel('gameplay/activity/ActivityPanel', ActivityPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 17: { // 元宵佳肴参与确认
                let accountId = parseInt(R.prop('accountId', extraParams));
                let playerName = R.prop('playerName', extraParams);
                if (precondition(accountId != undefined) &&
                    precondition(PlayerData.getInstance().playerLevel >= 50, "少侠等级不足50") &&
                    precondition(PlayerData.getInstance().accountId != accountId, 1265) &&
                    precondition(YxjyData.record.fmap(x => x.todayAttendedCount).getOrElse(0) < 5, 1266) &&
                    precondition(YxjyData.record.fmap(x => x.attendedAccountIds.indexOf(accountId) == -1).getOrElse(false), 1267)
                ) {
                    let sf = await ResUtils.loadSpriteFromAltas('ui/gameplay/yxjy/yxjy_panel', 'font_yuanxiaojiayaoyaoqing')
                    let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
                    let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
                    scb.titleSp.spriteFrame = sf;

                    let cb = async () => {
                        let result = await NetUtils.post<YxjyRecord>('/yuanxiaojiayao/attend', [accountId]);
                        if (result.isRight) {
                            TipsManager.showMsgFromConfig(1269);
                            TipsManager.showGainCurrency({currencyId: 20054, amount: 1});
                            YxjyData.record = result.toOptional();
                        }
                    }
                    let count = YxjyData.record.fmap(x => x.todayAttendedCount).getOrElse(0);
                    scb.init(CommonUtils.textToRichText(`[211c1c]确定接受[ffffff]  [116c08]${playerName}[ffffff]  [211c1c]的佳肴邀请？[ffffff]<br/>[991616](今日已赴宴 ${count}/5次)[ffffff]`), cb);
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: scb });
                }
                break;
            }
            case 18: { // 打开元宵佳肴主界面
			    if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/yxjy/yxjyPanel', YxjyPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 19: { // 欢乐筒筒
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/hltt/hlttPanel', HlttPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 20: { // 红包六六六
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/redPacket/RedPacketPanel', RedPacketPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
            case 21: { // 长乐聚宝盆
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/treasureBowl/TreasureBowlPanel', TreasureBowlPanel);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
                break;
            }
        }
        isHandling = false;
    }

}

