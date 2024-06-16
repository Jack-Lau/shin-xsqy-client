import CommonTips from "./CommonTips";
import { CommonUtils } from "../utils/CommonUtils";
import MapScene from "../map/MapScene";
import { ResUtils } from "../utils/ResUtils";
import { ConfigUtils } from "../utils/ConfigUtil";
import Login from "../login/Login";
import { BattleConfig } from "../battle/BattleConfig";
import { GameConfig } from "../config/GameConfig";
import { Equipment, Pet } from "../net/Protocol";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import { PetData } from "../gameplay/pet/PetData";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";
import PlayerData from "../data/PlayerData";

/**
 *  input ---> [ messageCache ]
 *                      |
 *                      |
 * message  <---  doShowMessage
 * 
 */

export module TipsManager {
    let tipsArray: Array<CommonTips> = [];
    let messageCache: Array<string> = [];
    let awardMsgCache: Array<string> = [];
    let tipsPrefab: cc.Prefab = null;
    let msgConfig = null;
    let statusCodeConfig = null;
    let listening: boolean = false;

    export async function startListen () {
        if (listening) {
            return;
        }
        listening = true;
        tipsPrefab = await CommonUtils.getPanelPrefab('CommonTips') as cc.Prefab;
        setInterval(doShowMessage, 0.5);
    }

    export function showMessage(content) {
        startListen();
        messageCache.push(content);
    }

    /**
     * 注意奖励信息会在其他信息之后
     * 且战斗中不会显示奖励信息
     * 但战斗结束之后会弹出
     * @param content 内容
     */
    export function showAwardMsg(content) {
        startListen();
        awardMsgCache.push(content);
    }

    export function showEquipmentMsg(content: string, e: Equipment) {
        let quality = EquipUtils.getProto(e).fmap(x => x.quality);
        let name = EquipUtils.getDisplay(e).fmap(x => x.name).lift2((n, q) => {
            return '<color=' + CommonUtils.getTipColorByQuality(q) + '>' + n + '</c>';
        }, quality).getOrElse("");

        showAwardMsg(content.replace('${EquipmentName}', name));
    }

    export async function showPetMsg(content: string, pet: Pet) {
        let config = await PetData.getConfigById(pet.definitionId)
        let name = pet.petName;
        let nameWithColor = config.fmap(x => x.color).fmap(CommonUtils.getPetTipColorByColor).fmap(c => `<color=${c}>${name}</c>`).getOrElse(name);
        showAwardMsg(content.replace('${PetName}', nameWithColor));
    }

    export function showGainCurrency (stack: {currencyId: number, amount: number}) {
		let display = ItemConfig.getInstance().getItemDisplayById(stack.currencyId, PlayerData.getInstance().prefabId);
		let color = CommonUtils.getTipColorByQuality(display.fmap(x => x.quality).getOrElse(ItemQuality.Blue));
		let name = display.fmap(x => x.name).getOrElse('未知领域');
        const iconId = display.fmap(x => x.iconId).getOrElse(-1);
        if (iconId == 152) {
            showMessage(`获得 ${stack.amount}<img src='icon_nengliang'/><color=${color}>${name}</c>`)
        } else {
		    showMessage(`获得 ${stack.amount}<img src='currency_icon_${iconId}'/><color=${color}>${name}</c>`)
        }
    }

    export async function showMsgFromConfig(msgId) {
        if (!msgConfig) {
            msgConfig = await ConfigUtils.getConfigJson("HintInfomations")
        }
        showMessage(msgConfig[msgId].content);
    }

    export async function showMsgFromStatusCode(statusCode: number) {
        if (!statusCodeConfig) {
            statusCodeConfig = await ConfigUtils.getConfigJson("StatusCodes")
        }
        if (!statusCodeConfig[statusCode]) return;
        showMsgFromConfig(statusCodeConfig[statusCode].hintId);
    }
   
    function doShowMessage() {
        let tipStr = '';
        if (messageCache.length == 0) {
            if (awardMsgCache.length == 0 || GameConfig.isInBattle) {
                return;
            } else {
                tipStr = awardMsgCache.shift();
            }
        } else {
            tipStr = messageCache.shift();
        }
        
        if (tipsArray.length >= 5) {
            let tips = tipsArray.shift();
            if (tips.node.parent) {
                tips.node.parent.removeChild(tips.node);
            }
        }

        let newTipsInstance = cc.instantiate(tipsPrefab);
        let newTips = newTipsInstance.getComponent(CommonTips);
        newTips.init(tipStr);
        for (let i = 0; i < tipsArray.length; ++i) {
            tipsArray[i].node.y += 60;
        }
        tipsArray.push(newTips);
        let startY = 0.118 * CommonUtils.getViewHeight();
        newTips.node.y = startY;
        newTips.node.x = 0;

        let mainScene = cc.director.getScene();
        let scene = mainScene.children[0].getComponent(MapScene) as MapScene;
        if (scene) {
            newTips.node.parent = scene.tipsLayer.node;

            // add it;
            setTimeout( () => {
                if (newTips.node.parent) {
                    newTips.node.parent.removeChild(newTips.node);
                }
                let index = tipsArray.indexOf(newTips);
                if (index != -1) {
                    tipsArray.splice(index, 1);
                }
            }, 1500);
        } else {
            let loginScene = mainScene.children[0].getComponent(Login) as Login;
            if (loginScene) {
                newTips.node.parent = loginScene.tipsLayer.node;

                // add it;
                setTimeout( () => {
                    CommonUtils.safeRemove(newTips?.node)
                    let index = tipsArray.indexOf(newTips);
                    if (index != -1) {
                        tipsArray.splice(index, 1);
                    }
                }, 1500);
            }
        }
    }
}
