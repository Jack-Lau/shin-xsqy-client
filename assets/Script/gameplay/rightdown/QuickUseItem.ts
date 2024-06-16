import { CurrencyStack, TitleRedeemResult, PetDetail, Equipment, Pet } from "../../net/Protocol";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import ItemConfig from "../../bag/ItemConfig";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { NetUtils } from "../../net/NetUtils";
import BagData from "../../bag/BagData";
import { WebsocketHandler } from "../../net/WebsocketHandler";
import { TipsManager } from "../../base/TipsManager";
import { TitleConfig } from "../../player/title/TitleConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import PetExhibitPanel from "../pet/PetExhibitPanel";
import ChangeSchoolPanel from "../school/ChangeSchoolPanel";
import EquipmentExhibitPanel from "../equipment/EquipmentExhibitPanel";
import { PetData } from "../pet/PetData";

export module QuickUseItem {
    let consumable = {};
    let initial = false;

    interface Consumable {
        id: number,
        name: string,
        effectID: number,
        effectParameter: number,
    }

    async function getConfig () {
        if (!initial) {
            consumable = await ConfigUtils.getConfigJson('CurrencyToConsumables');
        }
        return consumable;
    }

    async function getConsumable (currencyId: number): Promise<Consumable> {
        let config = await getConfig();
        return R.prop(currencyId, config);
    }

    let isUsing: boolean = false;
    export async function use(cid: number) {
        if (isUsing) {
            return;
        }
        isUsing = true;
        // let cid = stack.currencyId;
        let consumable = await getConsumable(cid);
        if (!consumable) {
            isUsing = false;
            return;
        }

        switch (consumable.effectID) {
            case 1: { // TRASURE
                useTrasureMap();
                break;
            }
            case 2: {
                exchangeAward(cid);
                break;
            }
            case 3: { // 兑换称号
                exchangeTitle(cid);
                break;
            }
            case 4: {
                exchangeEquipment(cid);
                break;
            }
            case 5: {
                exchangePet(cid);
                break;
            }
            case 6: {
                exchangeFashion(cid);
                break;
            }
            case 7: {
                exchangeGodPet(cid);
                break;
            }
			case 8: {
				exchangeSchoolSkillLevelLimit(cid);
				break;
			}
			case 9: {
				exchangeChangeSchool(cid);
				break;
			}
			case 10: {
				exchangeTempAbility(cid);
				break;
			}
        }
		//
        isUsing = false;
    }

    function useTrasureMap () {
        EventDispatcher.dispatch(Notify.OPEN_DIG_TREASURE, { name: 'DIG' });
    }

    async function exchangeTitle (cid: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/title/redeem', [cid]);
        if (response.status === 0) {
            let result = response.content as TitleRedeemResult;
            if (result.title) {
                let config = await TitleConfig.getConfigById(result.title.definitionId);
                TipsManager.showMessage(`获得称号“${config.name}”！`);
                BagData.getInstance().addTitleToBag(result.title)
            } else {
                TipsManager.showMessage('您已拥有该称号，已自动转换为元宝');
            }
        }
    }

    async function exchangeAward (cid: number) {
       await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/award/redeem', [cid]);
    }

    async function exchangeEquipment(cid: number) {
        let equipment = await NetUtils.post<Equipment>('/equipment/redeem', [cid])
        if (equipment.isRight) {
            let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentExhibitPanel', EquipmentExhibitPanel) as EquipmentExhibitPanel;
            panel.init(equipment.right);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }
    }
     
    async function exchangePet(cid: number) {
        let pet = await NetUtils.post<PetDetail>('/pet/redeem', [cid])
        if (pet.isRight) {
            let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
            panel.initAsAward(pet.right);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            PetData.updatePetIds();
        }
    } 

    async function exchangeGodPet(cid: number) {
        let pet = await NetUtils.post<Pet>('/legendaryPet/redeemSpecial', [cid])
        if (pet.isRight) {
            let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
            panel.initAsAward({pet: pet.right, parameters: []});
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            PetData.updatePetIds();
        }
    }

    async function exchangeFashion(cid: number) {
        let fashion = await NetUtils.post<PetDetail>('/fashion/redeem', [cid])
        if (fashion.isRight) {
            TipsManager.showMsgFromConfig(1183);
        }
    }
	
	async function exchangeSchoolSkillLevelLimit (cid: number) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/school/redeemExtraAbilityLevelLimit', [cid]);
        if (response.status === 0) {
			TipsManager.showMessage('克己之玉的力量使您可以掌握更高一级的门派技能了！');
        }
    }
	
	async function exchangeChangeSchool (cid: number) {
		EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {})
        let panel = await CommonUtils.getPanel('gameplay/school/changeSchoolPanel', ChangeSchoolPanel) as ChangeSchoolPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
	
    let exchangeTempAbilityIsSending = false
	async function exchangeTempAbility (cid: number) {
        if (exchangeTempAbilityIsSending) {
            TipsManager.showMessage("正在服用...")
            return;
        }
        exchangeTempAbilityIsSending = true
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/drug/take', [cid]);
        exchangeTempAbilityIsSending = false
        if (response.status === 0) {
			let result = response.content;
			switch (result.type) {
				case 1: {
					let str1 = '服用了一枚 ' + result.name;
					let str2 = result.attr_name_1 + '<color=#4EFF00>+' + (result.attr_value_1 > 1 ? result.attr_value_1 : (result.attr_value_1 * 100 + '%')) + '</c>!';
					let str3 = result.attr_name_2 + '<color=#4EFF00>+' + (result.attr_value_2 > 1 ? result.attr_value_2 : (result.attr_value_2 * 100 + '%')) + '</c>!';
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str1));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str2));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str3));
					break;
				}
				case 2: {
					let str1 = '服用了一枚 ' + result.name;
					let str2 = result.attr_name_1 + '<color=#4EFF00>+' + (result.attr_value_1 > 1 ? result.attr_value_1 : (result.attr_value_1 * 100 + '%')) + '</c>!';
					let str3 = result.attr_name_2 + '<color=#4EFF00>+' + (result.attr_value_2 > 1 ? result.attr_value_2 : (result.attr_value_2 * 100 + '%')) + '</c>!';
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str1));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str2));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str3));
					TipsManager.showMessage('药品的持续时间刷新了！');
					break;
				}
				case 3: {
					let str1 = '服用了一枚 ' + result.name;
					let str2 = '但好像什么事都没有发生。。。';
					let str3 = '诶。。。。。。';
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str1));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str2));
					TipsManager.showMessage(CommonUtils.replaceAttributeName(str3));
					break;
				}
			}
			//
			EventDispatcher.dispatch(Notify.MAIN_UI_REFRESH_DRUG, {});
        }
    }

}
