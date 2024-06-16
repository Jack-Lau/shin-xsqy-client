// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import EquipmentSoulWashPanel from "./EquipmentSoulWashPanel";
import { EquipUtils } from "../utils/EquipmentUtils";
import { ResUtils } from "../../../utils/ResUtils";
import ItemWithEffect from "../../../base/ItemWithEffect";
import CommonPanel from "../../../base/CommonPanel";
import Optional from "../../../cocosExtend/Optional";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
import { EquipmentPart } from "../../../bag/ItemConfig";
import BagData from "../../../bag/BagData";
import { MovieclipUtils } from "../../../utils/MovieclipUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import { ItemQuality } from "../../../bag/ItemConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipmentSoulPanel extends CommonPanel {
	
    // 主装备
    @property(cc.Sprite)
    mainIcon: cc.Sprite = null;
    @property(cc.Label)
    mainNameLabel: cc.Label = null;
	
    @property(cc.Label)
    expLabel: cc.Label = null;
	@property(cc.Sprite)
    expSprite: cc.Sprite = null;
	
    @property(cc.Label)
    attr1Label: cc.Label = null;	
    @property(cc.Label)
    attr2Label: cc.Label = null;	
    @property(cc.Label)
    attr3Label: cc.Label = null;	
	@property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    newAttrName1Label: cc.Label = null;	
    @property(cc.Label)
    newAttrName2Label: cc.Label = null;
    @property(cc.Label)
    newAttrName3Label: cc.Label = null;
    @property(cc.Label)
    newAttrVal1Label: cc.Label = null;	
    @property(cc.Label)
    newAttrVal2Label: cc.Label = null;
    @property(cc.Label)
    newAttrVal3Label: cc.Label = null;
	
	@property([ItemWithEffect])
    items: Array<ItemWithEffect> = [];
    @property([cc.Node])
    flagNodes: Array<cc.Node> = [];

	@property(cc.Button)
	washBtn: cc.Button = null;
	
	@property(cc.Label)
    costLabel: cc.Label = null;
	@property(cc.Button)
	soulBtn: cc.Button = null;
	
	@property(cc.Sprite)
    soulEffect: cc.Sprite = null;
	
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}
	
    init() {
        this.initEquipmentItems();
        this._state.value = 0;
    }

	initEvents() {
        let _this = this;
        this.items.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, () => {
                if (index != _this._state.value) {
                    _this._state.value = index;
                }
            });
        });
        this.mainIcon.node.on(cc.Node.EventType.TOUCH_END, () => {
            let equipment = PlayerData.getInstance().equipments[this.getPart(_this._state.value)];
            if (!equipment.valid) {
                TipsManager.showMessage('尚未选中装备');
            } else {
                EquipUtils.showEquipmentTips(equipment.val)();
            }
        });
		//
		this.washBtn.node.on(cc.Node.EventType.TOUCH_END, this.showWash.bind(this));
		this.soulBtn.node.on(cc.Node.EventType.TOUCH_END, this.soul.bind(this));
	}
	
    refreshState() {
        let index = this._state.value;
        let equipment = PlayerData.getInstance().equipments[this.getPart(index)]
        this.initMain(equipment);
        this.initCost(equipment);
        this.flagNodes.forEach((node, nIndex) => {
            node.active = index == nIndex;
        });
        super.refreshState();
    }
	
    initEquipmentItems() {
        let arr = R.values(PlayerData.getInstance().equipments);
        if (arr.length < 6) { return; }
        this.items.forEach((item, index) => {
            let equipment = arr[index];
            this.initEquipmentItem(item, equipment, index);
        });
    }
	
    async initEquipmentItem(item: ItemWithEffect, equipment: Optional<Equipment>, index: number) {
        let display = equipment.monadBind(EquipUtils.getDisplay);
        let prototype = equipment.monadBind(EquipUtils.getProto);
        let iconSf = null;
        if (!equipment.valid) {
            let part = this.getPart(index);
            iconSf = await ResUtils.getEmptyEquipmentIconByPart(part);
        } else {
            iconSf = await ResUtils.getEquipmentIconById(display.val.iconId);
        }
        let desc = equipment.fmap(x => x.enhanceLevel).fmap(x => x == 0 ? '' : '+' + x.toString());
        let color = prototype.fmap(x => x.quality)
        let showEffect = display.fmap(x => x.showBorderEffect).getOrElse(false);
		if (equipment.valid) {
			showEffect = showEffect || (equipment.val.enhanceLevel >= 10 ? true : false)
		}
		//
        let info = {
            iconSf: iconSf,
            desc: desc.getOrElse(''),
            color: color.getOrElse(null),
            showEffect,
            cb: null
        }
        item.init(info);
    }
	
    async initMain(equipment: Optional<Equipment>) {
        let config = equipment.monadBind(EquipUtils.getDisplay);
        if (equipment.valid && config.valid) {
            let info = equipment.val;
            this.mainIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/icon/equipment_tip_icon', '' + config.val.iconId)
            this.mainNameLabel.string = config.val.name;
			//
			let prototype = equipment.monadBind(EquipUtils.getProto);
			let equipmentSoulLevel = await ConfigUtils.getConfigJson('EquipmentSoulLevel');
			let equipmentSoulName = await ConfigUtils.getConfigJson('EquipmentSoulName');
			let level = equipment.fmap(x => x.soulLevel).getOrElse(0);
			let exp = equipment.fmap(x => x.soulExp).getOrElse(0);
			let levelupExp = equipmentSoulLevel[level].purple_exp;
			let quality = prototype.fmap(x => x.quality).getOrElse(0);
			if (quality >= ItemQuality.Orange) {
				levelupExp = equipmentSoulLevel[level].orange_exp;
			}
			this.expLabel.string = exp + ' / ' + (level >= equipmentSoulLevel.length ? 0 : levelupExp);
			if (levelupExp > 0) {
				this.expSprite.node.width = 488 * (exp / levelupExp);
			} else {
				this.expSprite.node.width = 488;
			}
			//
			if (level >= equipmentSoulLevel.length) {
				this.levelLabel.string = '已达最高等级';
			} else {
				this.levelLabel.string = level + '级' + ' -> ' + (level + 1) + '级';
			}
			//
			let soulName_1 = equipment.fmap(x => x.soulName_1).getOrElse(null);
			if (soulName_1 != null) {
				let soulNameId_1 = equipment.fmap(x => x.soulNameId_1).getOrElse(0);
				this.attr1Label.string = soulName_1 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_1, equipmentSoulName[soulNameId_1].factor);
				this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_1].color));
				this.newAttrName1Label.string = soulName_1 + ' ';
				this.newAttrName1Label.node.color = cc.Color.fromHEX(this.newAttrName1Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_1].color));
				if (level >= equipmentSoulLevel.length) {
					this.newAttrVal1Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level], soulName_1, equipmentSoulName[soulNameId_1].factor);
				} else {
					this.newAttrVal1Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level + 1], soulName_1, equipmentSoulName[soulNameId_1].factor);
				}
			} else {
				this.attr1Label.string = '无 +0';
				this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrName1Label.string = '无 ';
				this.newAttrName1Label.node.color = cc.Color.fromHEX(this.newAttrName1Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrVal1Label.string = '+0';
			}
			let soulName_2 = equipment.fmap(x => x.soulName_2).getOrElse(null);
			if (soulName_2 != null) {
				let soulNameId_2 = equipment.fmap(x => x.soulNameId_2).getOrElse(0);
				this.attr2Label.string = soulName_2 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_2, equipmentSoulName[soulNameId_2].factor);
				this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_2].color));
				this.newAttrName2Label.string = soulName_2 + ' ';
				this.newAttrName2Label.node.color = cc.Color.fromHEX(this.newAttrName2Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_2].color));
				if (level >= equipmentSoulLevel.length) {
					this.newAttrVal2Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level], soulName_2, equipmentSoulName[soulNameId_2].factor);
				} else {
					this.newAttrVal2Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level + 1], soulName_2, equipmentSoulName[soulNameId_2].factor);
				}
			} else {
				this.attr2Label.string = '无 +0';
				this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrName2Label.string = '无 ';
				this.newAttrName2Label.node.color = cc.Color.fromHEX(this.newAttrName2Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrVal2Label.string = '+0';
			}
			let soulName_3 = equipment.fmap(x => x.soulName_3).getOrElse(null);
			if (soulName_3 != null) {
				let soulNameId_3 = equipment.fmap(x => x.soulNameId_3).getOrElse(0);
				this.attr3Label.string = soulName_3 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_3, equipmentSoulName[soulNameId_3].factor);
				this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_3].color));
				this.newAttrName3Label.string = soulName_3 + ' ';
				this.newAttrName3Label.node.color = cc.Color.fromHEX(this.newAttrName3Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_3].color));
				if (level >= equipmentSoulLevel.length) {
					this.newAttrVal3Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level], soulName_3, equipmentSoulName[soulNameId_3].factor);
				} else {
					this.newAttrVal3Label.string = '+' + this.getSoulAttr(equipmentSoulLevel[level + 1], soulName_3, equipmentSoulName[soulNameId_3].factor);
				}
			} else {
				this.attr3Label.string = '无 +0';
				this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrName3Label.string = '无 ';
				this.newAttrName3Label.node.color = cc.Color.fromHEX(this.newAttrName3Label.node.color, CommonUtils.getForgeColorByQuality());
				this.newAttrVal3Label.string = '+0';
			}
        } else {
            this.mainIcon.spriteFrame = this.atlas.getSpriteFrame('bg_zhuangbeijianying');
            this.mainNameLabel.string = '请选择装备';
			this.expLabel.string = '0 / 0';
			this.expSprite.node.width = 488;
			this.levelLabel.string = '？级 -> ？级';
			this.attr1Label.string = '？ +？';
			this.attr2Label.string = '？ +？';
			this.attr3Label.string = '？ +？';
			this.newAttrName1Label.string = '？ ';
			this.newAttrName2Label.string = '？ ';
			this.newAttrName3Label.string = '？ ';
			this.newAttrVal1Label.string = '+？';
			this.newAttrVal2Label.string = '+？';
			this.newAttrVal3Label.string = '+？';
        }
    }
	
    async initCost(equipment: Optional<Equipment>) {
		let prototype = equipment.monadBind(EquipUtils.getProto);
		let equipmentSoulLevel = await ConfigUtils.getConfigJson('EquipmentSoulLevel');
		let level = equipment.fmap(x => x.soulLevel).getOrElse(0);
		let exp = equipment.fmap(x => x.soulExp).getOrElse(0);
		let own = BagData.getInstance().getCurrencyNum(195);
		let cost = equipmentSoulLevel[level].purple_exp;
		let quality = prototype.fmap(x => x.quality).getOrElse(0);
		if (quality >= ItemQuality.Orange) {
			cost = equipmentSoulLevel[level].orange_exp;
		}
		cost = Math.min(own, cost - exp);
		if (level >= equipmentSoulLevel.length) {
			cost = 0;
		}
        //
		this.costLabel.string = cost;
        this.costLabel.node.color = cc.Color.fromHEX(this.costLabel.node.color, cost < 1 ? '#ff5050' : '#0C6D08')
    }
	
    getPart(index: number) {
        switch (index) {
            case 0: return EquipmentPart.Weapon;
            case 1: return EquipmentPart.Head;
            case 2: return EquipmentPart.Necklace;
            case 3: return EquipmentPart.Clothes;
            case 4: return EquipmentPart.Belt;
            case 5: return EquipmentPart.Shoes;
            default: return EquipmentPart.Weapon;
        }
    }
	
	getSoulAttr(equipmentSoulLevel: any, soulName: string, factor: number) {
		switch(soulName) {
			case '外伤': return (equipmentSoulLevel.外伤 * factor).toFixed(0);
			case '内伤': return (equipmentSoulLevel.内伤 * factor).toFixed(0);
			case '外防': return (equipmentSoulLevel.外防 * factor).toFixed(0);
			case '内防': return (equipmentSoulLevel.内防 * factor).toFixed(0);
			case '气血': return (equipmentSoulLevel.气血 * factor).toFixed(0);
			case '幸运': return (equipmentSoulLevel.幸运 * factor).toFixed(0);
			case '速度': return (equipmentSoulLevel.速度 * factor).toFixed(0);
			case '招式': return (equipmentSoulLevel.招式 * 100 * factor).toFixed(2) + '%';
			case '抵抗': return (equipmentSoulLevel.抵抗 * 100 * factor).toFixed(2) + '%';
			case '连击': return (equipmentSoulLevel.连击 * 100 * factor).toFixed(2) + '%';
			case '吸血': return (equipmentSoulLevel.吸血 * 100 * factor).toFixed(2) + '%';
			case '暴击': return (equipmentSoulLevel.暴击 * 100 * factor).toFixed(2) + '%';
			case '暴效': return (equipmentSoulLevel.暴效 * 100 * factor).toFixed(2) + '%';
			case '招架': return (equipmentSoulLevel.招架 * 100 * factor).toFixed(2) + '%';
			case '神佑': return (equipmentSoulLevel.神佑 * 100 * factor).toFixed(2) + '%';
			default: return 0;
		}
	}
	
	async showWash() {
        let index = this._state.value;
        let equipment = PlayerData.getInstance().equipments[this.getPart(index)]
        let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentSoulWashPanel', EquipmentSoulWashPanel) as EquipmentSoulWashPanel;
		panel.init(this._state.value, equipment, this);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
	}
	
	async soul() {
        let index = this._state.value;
        let equipment = PlayerData.getInstance().equipments[this.getPart(index)]
        if (!equipment.valid) {
            TipsManager.showMessage('尚未选择任何装备');
            return;
        }
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/action/{id}/soul', [equipment.val.id]);
		if (response.status === 0) {
            this.soulEffect.node.active = true;
            this.soulEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.5);
            this.soulEffect.node.active = false;
			//
			TipsManager.showMessage('成功向装备注入魂晶，装备的附魂之力提升了！');
			PlayerData.getInstance().updateFc();
            let newEquipment = new Optional<Equipment>(response.content);
            PlayerData.getInstance().equipments[this.getPart(this._state.value)] = newEquipment;
			this.refreshState();
		}
	}
	
    // update (dt) {}
}
