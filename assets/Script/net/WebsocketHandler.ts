import PlayerData from "../data/PlayerData";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { TipsManager } from "../base/TipsManager";
import { CommonUtils } from "../utils/CommonUtils";
import BagData from "../bag/BagData";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";
import { Pet, Equipment, AwardResult, MjdhBattleLog } from "./Protocol";
import { PetData } from "../gameplay/pet/PetData";
import { PetUtils } from "../gameplay/pet/PetUtils";
import PetExhibitPanel from "../gameplay/pet/PetExhibitPanel";
import { BattleUtils } from "../battle/BattleUitls";
import { BattleConfig } from "../battle/BattleConfig";
import KingsFightBattleWin from "../gameplay/kingsFight/KingsFightBattleWin";
import KingsFightBattleLose from "../gameplay/kingsFight/KingsFightBattleLose";
import { GameConfig } from "../config/GameConfig";
import PKHandleReceivePanel from "../gameplay/pk/PKHandleReceivePanel";
import { NetUtils } from "./NetUtils";

export module WebsocketHandler {
	
    export function handler(message) {
        if (!message) {
            return;
        }
        let route = message.headers.destination;
        let json = JSON.parse(message.body);
        if (json.status != 0) {
            // code handler
            return;
        }
        switch (route) {
            case "/user/queue/currency/currencyChanged": {
                currencyChange(json.content.currencyId, json.content.beforeAmount, json.content.afterAmount);
                break;
            }
            case "/topic/mail/mailSent":
            case "/user/queue/mail/mailSent": {
                let event = new EventDispatcher.NotifyEvent(Notify.MAIN_UI_SET_REDDOT_VISIBLE);
                event.detail = {
                    name: 'mailBtn',
                    visible: true
                }
                EventDispatcher.dispatchEvent(event);
                break;
            }
            case "/topic/chat/message": {
                let event = new EventDispatcher.NotifyEvent(Notify.CHAT_NEW_MSG);
                event.detail = {
                    msg: json.content
                }
                EventDispatcher.dispatchEvent(event);
                break;
            }
            case "/user/queue/quest/started": { // 新任务开始
                let event = new EventDispatcher.NotifyEvent(Notify.QUEST_NEW_QUEST);
                event.detail = {
                    quest: json.content
                }
                EventDispatcher.dispatchEvent(event);
                break;
            }
            case "/user/queue/quest/completed": {
                let event = new EventDispatcher.NotifyEvent(Notify.QUEST_FINISH_QUEST);
                event.detail = {
                    quest: json.content
                }
                EventDispatcher.dispatchEvent(event);
                break;
            }
            case "/user/queue/award/award": {
                handleAward(json.content);
                break;
            }
            case "/user/queue/player/levelup": {
                let level = json.content.afterLevel;
                PlayerData.getInstance().updateFc();
                PlayerData.getInstance().playerLevel = level;
                EventDispatcher.dispatch(Notify.PLAYER_LEVEL_UP, {});
                break;
            }
            case '/user/queue/ethereumExchange/withdrawCompleted':
            case '/user/queue/ethereumExchange/depositCompleted':
            case '/user/queue/ethereumExchange/equipmentWithdrawCompleted':
            case '/user/queue/ethereumExchange/petWithdrawCompleted': {
                EventDispatcher.dispatch(Notify.WALLET_OPERATION_COMPLETE, {});
                break;
            }
            case '/user/queue/ethereumExchange/equipmentDepositCompleted': {
                // 更新背包中装备
                let equipmentId = json.content.equipmentId;
                walletOperationComplete(equipmentId)
                break;
            }
            case '/user/queue/ethereumExchange/petDepositCompleted': {
                // 更新宠物Ids
                PetData.updatePetIds();
                EventDispatcher.dispatch(Notify.WALLET_OPERATION_COMPLETE, {});
                break;
            }
            case '/user/queue/party/supportExpired': {
                TipsManager.showMsgFromConfig(1045);
                EventDispatcher.dispatch(Notify.TEAMMATE_CHANGED, {});
                break;
            }
            case '/user/queue/friend/apply/receive': {
                EventDispatcher.dispatch(Notify.WEB_FRIEND_APPLY, json.content);
                break;
            }
            case '/user/queue/friend/apply/pass': {
                EventDispatcher.dispatch(Notify.WEB_FRIEND_PASS, json.content);
                break;
            }
            case "/user/queue/chat/message/private": {
                EventDispatcher.dispatch(Notify.FRIEND_CHAT_NEW_MSG, json.content);
                break;
            }
            case '/user/queue/multiplayerBattle/sync': {
                BattleUtils.sendSync(json.content);
                break;
            }
            case '/user/queue/mjdh/singlePlayerBattleStarted': {
                BattleUtils.startSinglePlayerBattle(json.content);
                break;
            }
            case '/user/queue/mjdh/multiplayerBattleStarted': {
                BattleUtils.startMutilPlayerBattle();
                break;
            }
            case '/user/queue/mjdh/battleEnd': {
                let log = (json.content) as MjdhBattleLog;
                if (log.winnerAccountId == PlayerData.getInstance().accountId) {
                    showKingsFightWin(log.winnerBeforeGrade, log.winnertAftereGrade);
                } else {
                    showKingsFightLose(log.loserBeforeGrade, log.loserAfterGrade);
                }
                break;
            }
			case '/user/queue/pk/handleSend': {
				let sendEvent = json.content;
				if (GameConfig.autoRejectPK == false && GameConfig.isInBattle == false && GameConfig.isInGambling == false) {
					handlePKSend(sendEvent.sender);
				} else {
					//
				}
				break;
			}
			case '/user/queue/pk/handleReceive': {
				let receiveEvent = json.content;
				if (receiveEvent.sender.player.accountId == PlayerData.getInstance().accountId) {
					EventDispatcher.dispatch(Notify.PK_WAIT_RECEIVE_PANEL_CLOSE, {});
					//
					if (receiveEvent.singleResponse != null) {
						TipsManager.showMessage("开始与<color=#4EFF00> " + receiveEvent.receiver.player.playerName + " </c>的切磋练习！");
						BattleUtils.startSinglePlayerBattle(receiveEvent.singleResponse);
					} else {
						if (receiveEvent.isOK) {
							TipsManager.showMessage("开始与<color=#4EFF00> " + receiveEvent.receiver.player.playerName + " </c>的切磋！");
							BattleUtils.startMutilPlayerBattle();
						} else {
							TipsManager.showMessage("<color=#4EFF00>" + receiveEvent.receiver.player.playerName + "</c> 拒绝了您的切磋邀请");
							//
							let callback = async () => {
								let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/async', [receiveEvent.receiver.player.accountId]) as any;
								if (response.status == 0) {
								}
							}
							CommonUtils.showRichSCBox(
								`此位少侠现在不便切磋，是否与其幻影进行切磋练习？`,
								`切磋练习为非实时对战`,
								null,
								callback
							);
						}
					}
				} else if (receiveEvent.receiver.player.accountId == PlayerData.getInstance().accountId) {
					if (receiveEvent.isOK) {
						TipsManager.showMessage("开始与<color=#4EFF00> " + receiveEvent.sender.player.playerName + " </c>的切磋！");
						BattleUtils.startMutilPlayerBattle();
                        EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
                            data: CommonUtils.makePromise(receiveEvent.singleResponse.result),
                            beforeCb: () => { 
                                BattleConfig.getInstance().battleSessionId = receiveEvent.singleResponse.battleSessionId; 
                            },
                            afterCb: () => {}
                        })
					} else {
						TipsManager.showMessage("您拒绝了<color=#4EFF00> " + receiveEvent.sender.player.playerName + " </c>的切磋邀请");
					}
				}
				break;
			}
        }
    }

    async function showKingsFightWin(fromGrade: number, toGrade: number) {
        if (GameConfig.isInBattle) {
            await CommonUtils.wait(0.5);
            showKingsFightWin(fromGrade, toGrade);
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightBattleWin', KingsFightBattleWin) as KingsFightBattleWin;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        await panel.playTween(fromGrade, toGrade);
    }

    async function showKingsFightLose(fromGrade: number, toGrade: number) {
        if (GameConfig.isInBattle) {
            await CommonUtils.wait(0.5);
            showKingsFightLose(fromGrade, toGrade);
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightBattleLose', KingsFightBattleLose) as KingsFightBattleLose;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        await panel.playTween(fromGrade, toGrade);
    }

    async function walletOperationComplete(equipmentId) {
        if (equipmentId) {
            await BagData.getInstance().pushEquipmentIdToBag(equipmentId);
        }
        EventDispatcher.dispatch(Notify.WALLET_OPERATION_COMPLETE, {});
    }

    function currencyChange(currencyId, beforeAmount, afterAmount) {
        if (currencyId == 150) {
            PlayerData.getInstance().ybAmount = afterAmount;
        } else if (currencyId == 151) {
            PlayerData.getInstance().kbAmount = afterAmount;
        } else if (currencyId == 152) {
            // let delta = afterAmount - beforeAmount;
            // if (delta > 5) {
            //     TipsManager.showMessage("任务完成！获得" + (afterAmount - beforeAmount) + "<img src='icon_nengliang'/>");
            // }
            // PlayerData.getInstance().exp
        } else if (currencyId == 153) {
            EventDispatcher.dispatch(Notify.PLAYER_UPDATE_EXP, {});
        } else if (currencyId == 155) {
            PlayerData.getInstance().hyAmount = afterAmount;
        }

        let show = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId).fmap(x => x.disappear);
        // 背包中货币
        if (show.valid && show.val == 1) {
            BagData.getInstance().updateCurrencyAmount(currencyId, afterAmount);
        }
    }

    export function handleAward(award: AwardResult) {
        let pets = award.pets;
        let equipments = award.equipments;
        handleAwardPet(pets);
        handleAwardEquipment(equipments);
        for (let cs of award.currencyStacks) {
            if (cs.amount == 0) continue;
			//
			let display = ItemConfig.getInstance().getItemDisplayById(cs.currencyId, PlayerData.getInstance().prefabId);
			let color = CommonUtils.getTipColorByQuality(display.fmap(x => x.quality).getOrElse(ItemQuality.Blue));
			let name = display.fmap(x => x.name).getOrElse('未知领域');
			let icon = display.fmap(x => x.iconId).getOrElse(20028);
			//
            if (cs.currencyId == 150) {
                TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='currency_icon_150'/>");
            } else if (cs.currencyId == 151) {
                if (cs.amount < 1000) {
                    continue;
                }
                TipsManager.showAwardMsg("获得 " + CommonUtils.toCKb(cs.amount) + "<img src='currency_icon_151'/>");
            } else if (cs.currencyId == 152) {
                TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='icon_nengliang'/>");
            } else if (cs.currencyId == 153) {
                TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='currency_icon_153'/>");
            } else if (cs.currencyId == 155) {
                TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='currency_icon_155'/>");
            } else {
                if (cs.currencyId >= 20005 && cs.currencyId <= 20021) {
                    TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='currency_icon_other'/><color=" + color + ">" + name + "</c>");   
                } else {
                    TipsManager.showAwardMsg("获得 " + cs.amount + "<img src='currency_icon_" + icon + "'/><color=" + color + ">" + name + "</c>");
                }
            }
        }
    }

    async function handleAwardPet(pets: Array<Pet>) {
        if (!pets || pets.length == 0) { return; }
        let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
        panel.initAsAward({ pet: pets[0], parameters: [] });
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        PetData.updatePetIds();
    }

    function handleAwardEquipment(equipments: Array<Equipment>) {
        if (!equipments) { return; }
        equipments.forEach(e => {
            TipsManager.showEquipmentMsg("恭喜获得 ${EquipmentName}", e);
            BagData.getInstance().pushEquipmentToBag(e);
        })
    }
	
	async function handlePKSend(playerDetail) {
		let panel = await CommonUtils.getPanel('gameplay/pk/PKHandleReceivePanel', PKHandleReceivePanel) as PKHandleReceivePanel;
		panel.init(playerDetail);
		EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
	}

}
