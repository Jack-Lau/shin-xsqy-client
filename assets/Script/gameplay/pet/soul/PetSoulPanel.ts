// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { NetUtils } from "../../../net/NetUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import { ItemQuality, PetQuality, ItemCategory } from "../../../bag/ItemConfig";
import { TipsManager } from "../../../base/TipsManager";
import BagData from "../../../bag/BagData";
import PagingControl from "../../../base/PagingControl";
import ItemFrame from "../../../base/ItemFrame";
import PlayerData from "../../../data/PlayerData";
import PetAttributeModelling from "../attribute/PetAttributeModelling";
import PetPanel from "../PetPanel";
import PetSoulWashPanel from "./PetSoulWashPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PetSoulPanel extends cc.Component {
	
    @property(cc.Sprite)
    icons: Array<cc.Sprite> = [];
    @property(ItemFrame)
    pinziIcons: Array<ItemFrame> = [];
    @property(cc.Toggle)
    toggles: Array<cc.Toggle> = [];
    @property(cc.Node)
    toPlayIcons: Array<cc.Node> = [];
    @property(cc.Label)
    showRankLabels: Array<cc.Label> = [];
	
    @property(PagingControl)
    page: PagingControl = null;
    @property(PetAttributeModelling)
    petModelling: PetAttributeModelling = null;
	
    @property(cc.Label)
    expLabel: cc.Label = null;
	@property(cc.Sprite)
    expSprite: cc.Sprite = null;
	@property(cc.Label)
    costLabel: cc.Label = null;
	
    @property(cc.Label)
    attr1Label: cc.Label = null;	
    @property(cc.Label)
    attr2Label: cc.Label = null;	
    @property(cc.Label)
    attr3Label: cc.Label = null;
    @property(cc.Label)
    attr4Label: cc.Label = null;	
    @property(cc.Label)
    attr5Label: cc.Label = null;	
    @property(cc.Label)
    attr6Label: cc.Label = null;
	
    @property(cc.Label)
    newAttr1Label: cc.Label = null;	
    @property(cc.Label)
    newAttr2Label: cc.Label = null;	
    @property(cc.Label)
    newAttr3Label: cc.Label = null;
    @property(cc.Label)
    newAttr4Label: cc.Label = null;	
    @property(cc.Label)
    newAttr5Label: cc.Label = null;	
    @property(cc.Label)
    newAttr6Label: cc.Label = null;

	@property(cc.Button)
	washBtn: cc.Button = null;
	@property(cc.Button)
	soulBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
	
	@property(cc.Sprite)
    soulEffect: cc.Sprite = null;

	from: PetPanel = null;
    isMagic: boolean = false;
    pageData: Array<Optional<PetDetail>> = [];
	selected: number = 0;
    battlePets: Array<number> = [0, 0, 0];
	petSoulWashPanel: PetSoulWashPanel = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}
	
	initEvents() {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.updateSelected.bind(this, index));
        });
		this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 43));
		this.washBtn.node.on(cc.Node.EventType.TOUCH_END, this.showWash.bind(this));
		this.soulBtn.node.on(cc.Node.EventType.TOUCH_END, this.soul.bind(this));
		EventDispatcher.on(Notify.PET_DATA_CHANGE, this.onPetDataChange);
	}
	
    async init(currentPage = 1, selected = 0) {
        if (PetData.getPetMaxPage() == 0) {
            TipsManager.showMessage('没有获得宠物');
            return;
        }
        this.selected = selected;
        this.page.init(PetData.getPetMaxPage(), this.updatePage.bind(this), currentPage);
        this.updatePage(currentPage, false);
    }
	
    async updatePage(page: number, isInit = true) {
        let data = await PetData.getPetsByPage(page - 1);
        if (data == null || data.length == 0) {
            return;
        }
        this.pageData = data;
        this.icons.forEach((icon, index) => {
            icon.spriteFrame = null;
            this.pinziIcons[index].node.active = false;
            this.toggles[index].node.active = false;
        });
        data.forEach(async (item, index) => {
            this.toggles[index].node.active = true;
            if (item.isValid()) {
				let rank = item.getValue().pet.rank;
                if (rank > 0) {
                    this.showRankLabels[index].string = '+' + rank.toString();
                } else {
                    this.showRankLabels[index].string = '';
                }
				//
                let config = await PetData.getConfigById(item.getValue().pet.definitionId);
                if (config.isValid()) {
                    let iconID = config.getValue().prefabId;
                    this.icons[index].spriteFrame = await ResUtils.getPetHeadIconById(iconID);
                    await this.toColor(this.pinziIcons[index], config.getValue().color, rank);
                }
            }
        });
		//
        this.battlePets[0] = PlayerData.getInstance().battlePetId1.getValue();
        this.battlePets[1] = PlayerData.getInstance().battlePetId2.getValue();
        this.battlePets[2] = PlayerData.getInstance().battlePetId3.getValue();
        this.toPlayIcons.forEach((icon, index) => {
            if (page == 1 && index < this.pageData.length && this.isBattle(this.pageData[index].fmap(x => x.pet).fmap(x => x.id).getOrElse(0))) {
                icon.active = true;
            } else {
                icon.active = false;
            }
        });
        this.from.currentPage = page;
        this.page.setPage(page);
        if (isInit) {
            await this.updateSelected(0);
        } else {
            await this.updateSelected(this.selected);
        }
    }
	
    async updateSelected(select: number) {
        this.selected = select;
        if (this.pageData.length <= select) {
            this.selected = 0;
        }
        this.from.selected = this.selected;
        this.toggles[this.selected].check();
        if (!this.pageData[this.selected].isValid()) {
            console.error(this.selected + ' 数据错误');
            return;
        }
        let petDetail = this.pageData[this.selected].getValue();
        await this.petModelling.setData(petDetail, this);
		//
		let pet = petDetail.pet;
		let config = await PetData.getConfigById(pet.definitionId);
		let petSoulLevel = await ConfigUtils.getConfigJson('PetSoulLevel');
		let petSoulName = await ConfigUtils.getConfigJson('PetSoulName');
		let level = pet.soulLevel;
		let exp = pet.soulExp;
		let levelupExp = petSoulLevel[level].purple_exp;
		let quality = config.getValue().color;
		if (quality >= PetQuality.Orange) {
			levelupExp = petSoulLevel[level].orange_exp;
		}
		this.expLabel.string = level + '级   ' + exp + ' / ' + (level >= petSoulLevel.length ? 0 : levelupExp);
		if (levelupExp > 0) {
			this.expSprite.node.width = 488 * (exp / levelupExp);
		} else {
			this.expSprite.node.width = 488;
		}
		//
		let soulName_1 = pet.soulName_1;
		if (soulName_1 != null) {
			let soulNameId_1 = (pet.soulNameId_1 != null ? pet.soulNameId_1 : 0);
			this.attr1Label.string = soulName_1 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_1, petSoulName[soulNameId_1].factor);
			this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_1].color));
			this.newAttr1Label.string = soulName_1 + '';
			this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_1].color));
			if (level >= petSoulLevel.length) {
				this.newAttr1Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_1, petSoulName[soulNameId_1].factor);
			} else {
				this.newAttr1Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_1, petSoulName[soulNameId_1].factor);
			}
		} else {
			this.attr1Label.string = '无+0';
			this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr1Label.string = '无+0';
			this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_2 = pet.soulName_2;
		if (soulName_2 != null) {
			let soulNameId_2 = (pet.soulNameId_2 != null ? pet.soulNameId_2 : 0);
			this.attr2Label.string = soulName_2 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_2, petSoulName[soulNameId_2].factor);
			this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_2].color));
			this.newAttr2Label.string = soulName_2 + '';
			this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_2].color));
			if (level >= petSoulLevel.length) {
				this.newAttr2Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_2, petSoulName[soulNameId_2].factor);
			} else {
				this.newAttr2Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_2, petSoulName[soulNameId_2].factor);
			}
		} else {
			this.attr2Label.string = '无+0';
			this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr2Label.string = '无+0';
			this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_3 = pet.soulName_3;
		if (soulName_3 != null) {
			let soulNameId_3 = (pet.soulNameId_3 != null ? pet.soulNameId_3 : 0);
			this.attr3Label.string = soulName_3 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_3, petSoulName[soulNameId_3].factor);
			this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_3].color));
			this.newAttr3Label.string = soulName_3 + '';
			this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_3].color));
			if (level >= petSoulLevel.length) {
				this.newAttr3Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_3, petSoulName[soulNameId_3].factor);
			} else {
				this.newAttr3Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_3, petSoulName[soulNameId_3].factor);
			}
		} else {
			this.attr3Label.string = '无+0';
			this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr3Label.string = '无+0';
			this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_4 = pet.soulName_4;
		if (soulName_4 != null) {
			let soulNameId_4 = (pet.soulNameId_4 != null ? pet.soulNameId_4 : 0);
			this.attr4Label.string = soulName_4 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_4, petSoulName[soulNameId_4].factor);
			this.attr4Label.node.color = cc.Color.fromHEX(this.attr4Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_4].color));
			this.newAttr4Label.string = soulName_4 + '';
			this.newAttr4Label.node.color = cc.Color.fromHEX(this.newAttr4Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_4].color));
			if (level >= petSoulLevel.length) {
				this.newAttr4Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_4, petSoulName[soulNameId_4].factor);
			} else {
				this.newAttr4Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_4, petSoulName[soulNameId_4].factor);
			}
		} else {
			this.attr4Label.string = '无+0';
			this.attr4Label.node.color = cc.Color.fromHEX(this.attr4Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr4Label.string = '无+0';
			this.newAttr4Label.node.color = cc.Color.fromHEX(this.newAttr4Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_5 = pet.soulName_5;
		if (soulName_5 != null) {
			let soulNameId_5 = (pet.soulNameId_5 != null ? pet.soulNameId_5 : 0);
			this.attr5Label.string = soulName_5 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_5, petSoulName[soulNameId_5].factor);
			this.attr5Label.node.color = cc.Color.fromHEX(this.attr5Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_5].color));
			this.newAttr5Label.string = soulName_5 + '';
			this.newAttr5Label.node.color = cc.Color.fromHEX(this.newAttr5Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_5].color));
			if (level >= petSoulLevel.length) {
				this.newAttr5Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_5, petSoulName[soulNameId_5].factor);
			} else {
				this.newAttr5Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_5, petSoulName[soulNameId_5].factor);
			}
		} else {
			this.attr5Label.string = '无+0';
			this.attr5Label.node.color = cc.Color.fromHEX(this.attr5Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr5Label.string = '无+0';
			this.newAttr5Label.node.color = cc.Color.fromHEX(this.newAttr5Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		let soulName_6 = pet.soulName_6;
		if (soulName_6 != null) {
			let soulNameId_6 = (pet.soulNameId_6 != null ? pet.soulNameId_6 : 0);
			this.attr6Label.string = soulName_6 + '+' + this.getSoulAttr(petSoulLevel[level], soulName_6, petSoulName[soulNameId_6].factor);
			this.attr6Label.node.color = cc.Color.fromHEX(this.attr6Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_6].color));
			this.newAttr6Label.string = soulName_6 + '';
			this.newAttr6Label.node.color = cc.Color.fromHEX(this.newAttr6Label.node.color, CommonUtils.getForgeColorByQuality(petSoulName[soulNameId_6].color));
			if (level >= petSoulLevel.length) {
				this.newAttr6Label.string += '+' + this.getSoulAttr(petSoulLevel[level], soulName_6, petSoulName[soulNameId_6].factor);
			} else {
				this.newAttr6Label.string += '+' + this.getSoulAttr(petSoulLevel[level + 1], soulName_6, petSoulName[soulNameId_6].factor);
			}
		} else {
			this.attr6Label.string = '无+0';
			this.attr6Label.node.color = cc.Color.fromHEX(this.attr6Label.node.color, CommonUtils.getForgeColorByQuality());
			this.newAttr6Label.string = '无+0';
			this.newAttr6Label.node.color = cc.Color.fromHEX(this.newAttr6Label.node.color, CommonUtils.getForgeColorByQuality());
		}
		//
		let own = BagData.getInstance().getCurrencyNum(195);
		let cost = petSoulLevel[level].purple_exp;
		if (quality >= PetQuality.Orange) {
			cost = petSoulLevel[level].orange_exp;
		}
		cost = Math.min(own, cost - exp);
		if (level >= petSoulLevel.length) {
			cost = 0;
		}
		this.costLabel.string = cost;
        this.costLabel.node.color = cc.Color.fromHEX(this.costLabel.node.color, cost < 1 ? '#ff5050' : '#0C6D08')
		//
		this.setWashModel();
    }
	
    async toColor(effect, color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                effect.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                effect.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                effect.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                effect.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                effect.node.active = false;
                break;
        }
        effect.node.active = true;
    }
	
    isBattle(ID: number) {
        return this.battlePets.indexOf(ID) != -1;
    }
	
	getSoulAttr(petSoulLevel: any, soulName: string, factor: number) {
		switch(soulName) {
			case '外伤': return (petSoulLevel.外伤 * factor).toFixed(0);
			case '内伤': return (petSoulLevel.内伤 * factor).toFixed(0);
			case '外防': return (petSoulLevel.外防 * factor).toFixed(0);
			case '内防': return (petSoulLevel.内防 * factor).toFixed(0);
			case '气血': return (petSoulLevel.气血 * factor).toFixed(0);
			case '幸运': return (petSoulLevel.幸运 * factor).toFixed(0);
			case '速度': return (petSoulLevel.速度 * factor).toFixed(0);
			case '招式': return (petSoulLevel.招式 * 100 * factor).toFixed(2) + '%';
			case '抵抗': return (petSoulLevel.抵抗 * 100 * factor).toFixed(2) + '%';
			case '连击': return (petSoulLevel.连击 * 100 * factor).toFixed(2) + '%';
			case '吸血': return (petSoulLevel.吸血 * 100 * factor).toFixed(2) + '%';
			case '暴击': return (petSoulLevel.暴击 * 100 * factor).toFixed(2) + '%';
			case '暴效': return (petSoulLevel.暴效 * 100 * factor).toFixed(2) + '%';
			case '招架': return (petSoulLevel.招架 * 100 * factor).toFixed(2) + '%';
			case '神佑': return (petSoulLevel.神佑 * 100 * factor).toFixed(2) + '%';
			default: return 0;
		}
	}
	
	async showWash() {
        let panel = await CommonUtils.getPanel('gameplay/pet/PetSoulWashPanel', PetSoulWashPanel) as PetSoulWashPanel;
		panel.init(this.pageData[this.selected].getValue());
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
		this.petSoulWashPanel = panel;
	}
	
	async soul() {
        let petDetail = this.pageData[this.selected];
        if (!petDetail.isValid()) {
            console.error(this.selected + ' 数据错误');
            return;
        }
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/soul', [petDetail.getValue().pet.id]);
		if (response.status === 0) {
            this.soulEffect.node.active = true;
            this.soulEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.5);
            this.soulEffect.node.active = false;
			//
			TipsManager.showMessage('成功向宠物注入魂晶，宠物的附魂之力提升了！');
            PetData.updatePetInfo({ pet: response.content, parameters: [] });
            PlayerData.getInstance().updateFc();
		}
	}
	
	async setWashModel(){
		if (this.petSoulWashPanel != null) {
			let petDetail = this.pageData[this.selected].getValue();
			this.petSoulWashPanel.setModel(petDetail);
		}
	}
	
    onDestroy() {
        EventDispatcher.off(Notify.PET_DATA_CHANGE, this.onPetDataChange);
    }

    onPetDataChange = async function (event) {
        await this.updatePage(event.detail.page, false);
    }.bind(this);

    // update (dt) {}
}
