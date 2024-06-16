import PlayerData from "../data/PlayerData";
import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import NpcConfig from "../config/NpcConfig";
import { CommonUtils } from "../utils/CommonUtils";
import NpcPanel from "./NpcPanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { ItemQuality } from "../bag/ItemConfig";
import { BattleConfig } from "../battle/BattleConfig";
import JgtManager from "../gameplay/jinguangta/JgtManager";
import SecondConfirmBox from "../base/SecondConfirmBox";
import BagData from "../bag/BagData";
import BagItem from "../bag/BagItem";
import YqsPanel from "../gameplay/yqs/YqsPanel";
import { QuestManager } from "../quest/QuestManager";
import { MentorUtils } from "../gameplay/mentor/MentorUtils";
import { BattleResponse, GoldTowerWipeOut } from "../net/Protocol";
import MysteryStorePanel from "../gameplay/mysteryStore/MysteryStorePanel";
import { ShopUtils } from "../shop/ShopUtils";
import WorkPanel from "../gameplay/work/WorkPanel";
import { openForum } from "../utils/NativeUtils";
import PetGainPanel from "../gameplay/pet/PetGainPanel";

export default class SelectionEventHandler {
    private static _instance: SelectionEventHandler = null;


    private constructor() {

    }

    public static getInstance(): SelectionEventHandler {
        if (!this._instance) {
            this._instance = new SelectionEventHandler();
        }
        return this._instance;
    }

    public handleEvents(selectionId: number | string) {
        let selection = NpcConfig.getInstance().npcSelections[selectionId];
        if (selection.clickEventType) {
            switch (selection.clickEventType) {
                case 1:
                case "1": {
                    this.handleOpenPanel(selection.clickEventParam);
                    break;
                }
                case 2:
                case "2": {
                    this.handleSwitchMap(selection.clickEventParam);
                    break;
                }
                case 3:
                case "3": {
                    this.handlePickQuest(selection.clickEventParam);
                    break;
                }
                case 4:
                case "4": {
                    this.handleBattle(selection.clickEventParam);
                    break;
                }
                case 5:
                case "5": {
                    this.handleJinGuangTa(selectionId);
                    break;
                }
                case 6:
                case "6": { // 阵营试炼
                    break;
                }
                default:
                    break;
            }
        }
    }

    private async handleOpenPanel(clickEventParam: string) {
        switch (clickEventParam) {
            case '抢占摇钱树':
                if (PlayerData.getInstance().playerLevel < 45) {
                    TipsManager.showMessage('提升至45级即可抢夺摇钱树');
                    return;
                }
                let panel = await CommonUtils.getPanel('gameplay/yqs/yqsPanel', YqsPanel) as YqsPanel;
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            case '师徒界面': {
                MentorUtils.openMentorPanel();
                break;
            }
            case "神秘商店": {
                const panel = await CommonUtils.getPanel<MysteryStorePanel>('gameplay/mysteryStore/mysteryStorePanel', MysteryStorePanel)
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel })
                break;
            }
            case "阿达杂货铺": {
                ShopUtils.openShopPanel(4489003);
                break;
            }
            case "阿达杂货铺-神兽": {
                ShopUtils.openShopPanel(4489004);
                break;
            }
            case "烟扬原石铺": {
                ShopUtils.openShopPanel(4489005);
                break;
            }
            case "烟扬原石铺-回购": {
                ShopUtils.openShopPanel(4489006);
                break;
            }
            case "诶诶大药房": {
                ShopUtils.openShopPanel(4489007);
                break;
            }
            case "诶诶大药房-高级": {
                ShopUtils.openShopPanel(4489008);
                break;
            }
            case "打工": {
                const panel = await CommonUtils.getPanel<WorkPanel>('gameplay/work/WorkPanel', WorkPanel)
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel })
                break;
            }
            case "论坛": {
                // "板块页": taprl0222441001
                if (cc.sys.isNative) {
                    openForum("taprl0222441001")
                } else {
                    TipsManager.showMessage("仅支持原生打开")
                }
                break;
            }
			case "钓鱼-购买钓竿": {
				if (PlayerData.getInstance().playerLevel < 60) {
                    TipsManager.showMessage('少侠需要修为达到60级方可驱使钓竿噢！');
                    return;
                }
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/fishing/get', []) as any;
					if (response.status === 0) {
                        if (response.content.fishingRecord.todayBuyFishingPoleCount >= 5) {
							let callback = async () => {
								let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/fishing/buy', []) as any;
								if (response.status == 0) {
									TipsManager.showMessage('购买了一根 <color=#50D8FF>钓竿·般</c>！');
								}
							}
							CommonUtils.showRichSCBox(
								`是否花费10000<img src='currency_icon_150'/>购买一根 <color=#50D8FF>钓竿·般</c> ？`,
								`本日已购买 ` + response.content.fishingRecord.todayBuyFishingPoleCount + ` 根钓竿`,
								null,
								callback
							);							
						} else {
							let callback = async () => {
								let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/fishing/buy', []) as any;
								if (response.status == 0) {
									TipsManager.showMessage('购买了一根 <color=#d3a2ff>钓竿·上</c>！');
								}
							}
							CommonUtils.showRichSCBox(
								`是否花费10000<img src='currency_icon_150'/>购买一根 <color=#d3a2ff>钓竿·上</c> ？`,
								`本日已购买 ` + response.content.fishingRecord.todayBuyFishingPoleCount + ` 根钓竿`,
								null,
								callback
							);			
						}
                    }
                break;
            }
			case "钓鱼-兑换钓鱼点": {
                ShopUtils.openShopPanel(4489009);
                break;
            }
			case "宠物扭蛋机": {
                const panel = await CommonUtils.getPanel<PetGainPanel>('gameplay/pet/petGainPanel', PetGainPanel)
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel })
				break;
			}
            // case '擂台':
            //     ProtocolManager.send(136001);
            //     break;
            // case '说明书':
            //     let gameManualPanel = new sdyg.GameManualPanel();
            //     PopUpManager.addPopUp(gameManualPanel, 1, false, false, MainScene.getInstance().subPanelLayer);
            //     gameManualPanel.onNextBtnClick();
            //     break;
            // case '银两商店_购买':
            //     sdyg.AppFacade.getInstance().sendNotification(UINotify.BAGPANEL_SHOP_MENU, { cmd: "shop" });
            //     break;
            // case '银两商店_出售':
            //     egret.setTimeout(sdyg.AppFacade.getInstance().sendNotification, sdyg.AppFacade.getInstance(), 300, UINotify.BAGPANEL_SHOP_MENU, { cmd: "sell" });
            //     break;
            // case "礼包兑换":
            //     let panel = new sdyg.GiftExchange();
            //     PopUpManager.addPopUp(panel, 1, true);
            //     break;
            // case "依云楼之谜":
            //     ProtocolManager.send(139001);
            //     break;
            // case "收藏桌面":
            //     let saveToHomeScreenPanel = new SaveToHomeScreen();
            //     PopUpManager.addPopUp(saveToHomeScreenPanel, 1, false, false);
            //     break;
            default:
                break;
        }
    }

    private handleSwitchMap(mapId: any) {

    }

    private async handlePickQuest(param: any) {
        switch (param) {
            case '门派任务': {
                let schoolId = PlayerData.getInstance().schoolId;
                let questId = null;
                if (schoolId === 101) {
                    questId = 720001;
                } else if (schoolId === 102) {
                    questId = 720002;
                } else if (schoolId === 103) {
                    questId = 720003;
                } else if (schoolId === 104) {
                    questId = 720004;
                }
                if (questId) {
                    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/start', [questId]) as any;
                    if (response.status === 0) {
                        TipsManager.showMessage('门派任务领取成功');
                    }
                } else {
                    TipsManager.showMessage('请先完成门派拜入任务');
                }
                break;
            }
            case "720027":
            case 720027: {
                let questIds = QuestManager.getCurrentQuestIds();
                let trasureQuestIds = [720027, 720028, 720029, 720030, 720031, 720032, 720033];
                for (let id of trasureQuestIds) {
                    if (questIds.indexOf(id) != -1) {
                        TipsManager.showMessage('您已经领取了这个任务，赶快去完成吧');
                        return;
                    }
                }
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/start', [720027]) as any;
                if (response.status === 0) {
                    TipsManager.showMessage('寻宝任务领取成功');
                }
                break;
            }
            // case "副本": {
            //     if (QuestManager.getQuestById(720001)) {
            //         TipsManager.showMessageTip("你已领取了副本任务，快去完成吧！");
            //         return;
            //     }
            //     ProtocolManager.send(101002, { value: 720001 });
            //     break;
            // }
            // case "侠客行": {
            //     if (ActivityManager.getInstance().getActivityStateById(ActivityID.XKX) != ActivityStatus.RUNNING) {
            //         TipsManager.showMessageTip("活动尚未开启！");
            //         return;
            //     }
            //     ProtocolManager.send(101002, { value: 720029 });
            //     break;
            // }
            // case "门派任务": {
            //     switch (PlayerDataManager.getInstance().getRoleSchoolId()) {
            //         case 100: {
            //             TipsManager.showMessageTip("少侠尚未拜入门派，快去拜入门派吧！");
            //             break;
            //         }
            //         case 101: {
            //             ProtocolManager.send(101002, { value: 720059 });
            //             break;
            //         }
            //         case 102: {
            //             ProtocolManager.send(101002, { value: 720058 });
            //             break;
            //         }
            //         case 103: {
            //             ProtocolManager.send(101002, { value: 720057 });
            //             break;
            //         }
            //         case 104: {
            //             ProtocolManager.send(101002, { value: 720056 });
            //             break;
            //         }
            //     }
            //     break;
            // }
        }
    }

    private handleBattle(param: string) {
        // switch (param) {
        //     case "妖魔祸患_小怪": {
        //         ProtocolManager.send(132005);
        //         break;
        //     }
        //     case "妖魔祸患_BOSS": {
        //         ProtocolManager.send(132002);
        //         break;
        //     }
        //     case "大五宝": {
        //         ProtocolManager.send(134004, { value: SelectionEventHandler.npcPanelMediator.npcPanelWithSelection.npc.tempNpcId });
        //         break;
        //     }
        //     case "阵营试炼_一星怪": {
        //         ProtocolManager.send(142002, { type: 0 });
        //         break;
        //     }
        //     case "阵营试炼_二星怪": {
        //         ProtocolManager.send(142002, { type: 1 });
        //         break;
        //     }
        //     case "阵营试炼_三星怪": {
        //         ProtocolManager.send(142002, { type: 2 });
        //         break;
        //     }
        //     case "阵营试炼_专属怪1": {
        //         ProtocolManager.send(142002, { type: 3 });
        //         break;
        //     }
        //     case "阵营试炼_专属怪2": {
        //         ProtocolManager.send(142002, { type: 3 });
        //         break;
        //     }
        //     case "阵营试炼_专属怪3": {
        //         ProtocolManager.send(142002, { type: 3 });
        //         break;
        //     }
        //     case "阵营强盗_固定": {
        //         ProtocolManager.send(145002);
        //         break;
        //     }
        //     case "阵营强盗_镜像": {
        //         ProtocolManager.send(145004, { value: SelectionEventHandler.npcPanelMediator.npcPanelWithSelection.npc.tempNpcId });
        //         break;
        //     }
        // }
    }

    private async handleJinGuangTa(selectionId: number | string) {
        let params = ""
        selectionId = parseInt(String(selectionId))
        switch (selectionId) {
            case 2070: { // 金光塔-寻人
                params = "0";
                break;
            }
            case 2071: { // 答题
                let panel = await CommonUtils.getPanel('npcPanelPrefab', NpcPanel) as NpcPanel;
                panel.initForJgt({
                    'selectionId': selectionId,
                    'npcId': JgtManager.getInstance().getCurrentRoomNpcId(),
                    'chatText': "",
                    "selectionIdArray": [2072, 2073, 2074]
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case 2072: { // 答题选项1
                params = '1';
                break;
            }
            case 2073: { // 答题选项2
                params = '2';
                break;
            }
            case 2074: { // 答题选项3
                params = '3';
                break;
            }
            case 2075: { // 寻物
                let panel = await CommonUtils.getPanel('npcPanelPrefab', NpcPanel) as NpcPanel;
                let itemName = '？？？';
				switch (JgtManager.getInstance().param1) {
					case '150':{
						itemName = '元宝';
						break;
					}
					case '154':{
						itemName = '强化石';
						break;
					}
					case '158':{
						itemName = '冲星灵丹';
						break;
					}
					case '160':{
						itemName = '灵宠要诀';
						break;
					}
					case '168':{
						itemName = '九灵仙丹';
						break;
					}
					case '185':{
						itemName = '金坷垃';
						break;
					}
				}
                panel.initForJgt({
                    'selectionId': selectionId,
                    'npcId': JgtManager.getInstance().getCurrentRoomNpcId(),
                    'chatText': "喵喵喵，喵喵喵，喵喵？（我需要" + JgtManager.getInstance().param2 + "个[" + CommonUtils.getForgeColorByQuality(ItemQuality.Blue).replace('#', '') + ']'
                        + itemName + "[ffffff]，给我的话就放你过去~",
                    "selectionIdArray": [2091]
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case 2076:
            case 2077:
            case 2078:
            case 2079: { // 四种类型的战斗
                const data = NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/startGoldTowerBattle', [])
                    .then(response =>
                        response.status != 0
                            ? null
                            : Object.assign(response?.content?.result ?? {}, { battleSessionId: response?.content?.battleSessionId, statusCode: response?.status }))


                EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
                    data,
                    beforeCb: (data) => {
                        BattleConfig.getInstance().battleSessionId = data.battleSessionId;
                        if (data.statusCode === 1203) {
                            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                        }
                    },
                    afterCb: async () => {
                        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishGoldTowerChallenge', ['0']) as any;
                        if (response2.status === 0) {
                            if (R.path(['content', 'currentRoomChallengeSuccess'], response2) == true) {
                                JgtManager.getInstance().finishChallenge();
                            } else {
                                TipsManager.showMessage('挑战失败')
                                EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                            }
                        } else if (response2.status === 1203) {
                            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                        }
                    },
                })
                // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/startGoldTowerBattle', []);
                // if (response.status === 0) {
                //     BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;
                //     let callback = async () => {
                //         let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishGoldTowerChallenge', ['0']) as any;
                //         if (response2.status === 0) {
                //             if (R.path(['content', 'currentRoomChallengeSuccess'], response2) == true) {
                //                 JgtManager.getInstance().finishChallenge();
                //             } else {
                //                 TipsManager.showMessage('挑战失败')
                //                 EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                //             }
                //         } else if (response2.status === 1203) {
                //             EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                //         }
                //     }
                //     EventDispatcher.dispatch(Notify.BATTLE_OPEN, { data: response.content.result, cb: callback });

                // } else if (response.status === 1203) {
                //     EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                // }
                break;
            }
            case 2080: { // 传送
                params = '0';
                break;
            }
            case 2081: {
                let panel = await CommonUtils.getPanel('npcPanelPrefab', NpcPanel) as NpcPanel;
                let itemName = '？？？';
				switch (JgtManager.getInstance().param1) {
					case '150':{
						itemName = '元宝';
						break;
					}
					case '154':{
						itemName = '强化石';
						break;
					}
					case '158':{
						itemName = '冲星灵丹';
						break;
					}
					case '160':{
						itemName = '灵宠要诀';
						break;
					}
					case '168':{
						itemName = '九灵仙丹';
						break;
					}
					case '185':{
						itemName = '金坷垃';
						break;
					}
				}
                panel.initForJgt({
                    'selectionId': selectionId,
                    'npcId': JgtManager.getInstance().getCurrentRoomNpcId(),
                    'chatText': "这位游侠，我这里有" + JgtManager.getInstance().param2 + "个[" + CommonUtils.getForgeColorByQuality(ItemQuality.Blue).replace('#', '') + ']'
                        + itemName + "[ffffff]，你只需要花[bc9100]" + JgtManager.getInstance().param3 + '元宝[ffffff]就能带走了，买不买呀？',
                    "selectionIdArray": [2089, 2090]
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case 2082: { // do nothing
                break;
            }
            case 2083: { // 秘密寻人-左
                params = '2083';
                break;
            }
            case 2084: { // 秘密寻人-右
                params = '2084';
                break;
            }
            case 2085:
            case 2086:
            case 2087:
            case 2088: { // 传送点1,2,3,4
                let wayPoint = selectionId - 2084;
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/gotoNextRoom', [wayPoint]);
                if (response.status === 0) {
                    JgtManager.getInstance().enterJgt();
                } else if (response.status === 1203) {
                    EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                }
                break;
            }
            case 2089: { // 特价商人，我要买
                params = "1";
                break;
            }
            case 2090: { // 特价商人，我不买
                params = '0';
                break;
            }
            case 2091: { // 寻物提交
                let num = JgtManager.getInstance().param2;
                let cid = JgtManager.getInstance().param1;
                let cb = async () => {
                    let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishGoldTowerChallenge', ['0']) as any;
                    if (response.status === 0) {
                        if (R.path(['content', 'currentRoomChallengeSuccess'], response) == true) {
                            TipsManager.showMessage('挑战成功！');
                            JgtManager.getInstance().finishChallenge();
                        } else {
                            TipsManager.showMessage('挑战失败')
                            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                        }
                    } else if (response.status === 1203) {
                        EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                    }
                }
                let panel = await CommonUtils.getPanel('npcPanelPrefab', NpcPanel) as NpcPanel;
                panel.initSmtForJgt({
                    'npcId': JgtManager.getInstance().getCurrentRoomNpcId(),
                    'currencyId': cid,
                    'amount': num,
                    'cb': cb
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                break;
            }
            case 3506: {
                const data = NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/startWipeOutBattle', [])
                    .then(response =>
                        response.status != 0
                            ? null
                            : Object.assign(response?.content?.result ?? {}, { battleSessionId: response?.content?.battleSessionId, statusCode: response?.status }))
                EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
                    data,
                    beforeCb: (data) => {
                        BattleConfig.getInstance().battleSessionId = data.battleSessionId;
                        if (data.statusCode === 1203) {
                            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                        }
                    },
                    afterCb: async () => {
                        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishWipeOutBattle', []) as any;
                        if (response2.status === 0) {
                            if (response2.content == true) {
                                JgtManager.getInstance().finishWipeOutChallenge(true);
                            } else {
                                TipsManager.showMessage('挑战失败')
                                EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                            }
                        } else if (response2.status === 1203) {
                            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                        }
                    },
                })

                // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/startWipeOutBattle', []);
                // if (response.status === 0) {
                //     BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;
                //     let callback = async () => {
                //         let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishWipeOutBattle', []) as any;
                //         if (response2.status === 0) {
                //             if (response2.content == true) {
                //                 JgtManager.getInstance().finishWipeOutChallenge(true);
                //             } else {
                //                 TipsManager.showMessage('挑战失败')
                //                 EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                //             }
                //         } else if (response2.status === 1203) {
                //             EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                //         }
                //     }
                //     EventDispatcher.dispatch(Notify.BATTLE_OPEN, { data: response.content.result, cb: callback });
                // } else if (response.status === 1203) {
                //     EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                // }
                break;
            }
            case 3507: {
                JgtManager.getInstance().finishWipeOutChallenge(false);
                break;
            }
            case 3508: {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/upToTargetFloor', []);
                if (response.status === 0) {
                    let result = response.content as GoldTowerWipeOut;
                    JgtManager.getInstance().wipeoutAwards = result.wipeOutAwards;
                    JgtManager.getInstance().enterJgt();
                } else if (response.status === 1203) {
                    EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                }
                break;
            }
            case 3509: {
                JgtManager.getInstance().enterJgt();
                break;
            }
        }

        if (params != '') {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/tryFinishGoldTowerChallenge', [params]) as any;
            if (response.status === 0) {
                if (R.path(['content', 'currentRoomChallengeSuccess'], response) == true) {
                    if (selectionId == 2089) {
                        TipsManager.showMessage('购买成功！');
                    } else {
                        TipsManager.showMessage('挑战成功！');
                    }
                    JgtManager.getInstance().finishChallenge();
                } else {
                    TipsManager.showMessage('挑战失败')
                    EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
                }
            } else if (response.status === 1203) {
                EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, { mapId: 1 });
            }
        }
    }

}
