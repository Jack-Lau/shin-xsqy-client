// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { EquipUtils } from "../utils/EquipmentUtils";
import { ResUtils } from "../../../utils/ResUtils";
import Optional from "../../../cocosExtend/Optional";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
import BagData from "../../../bag/BagData";
import { MovieclipUtils } from "../../../utils/MovieclipUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import { EquipmentPart } from "../../../bag/ItemConfig";
import EquipmentSoulPanel from "./EquipmentSoulPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EquipmentSoulWashPanel extends cc.Component {
	
    @property(cc.Sprite)
    mainIcon: cc.Sprite = null;
    @property(cc.Label)
    mainNameLabel: cc.Label = null;
	
    @property(cc.Label)
    attr1Label: cc.Label = null;	
    @property(cc.Label)
    attr2Label: cc.Label = null;	
    @property(cc.Label)
    attr3Label: cc.Label = null;	
    @property(cc.Label)
    newAttr1Label: cc.Label = null;	
    @property(cc.Label)
    newAttr2Label: cc.Label = null;
    @property(cc.Label)
    newAttr3Label: cc.Label = null;
	
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;

	@property(cc.Button)
	washBtn: cc.Button = null;
	@property(cc.Button)
	closeBtn: cc.Button = null;

	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property(cc.Sprite)
    washEffect: cc.Sprite = null;
	
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
	
	index = null;
	equipment = null;
	equipmentSoulPanel: EquipmentSoulPanel = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		this.washBtn.node.on(cc.Node.EventType.TOUCH_END, this.wash.bind(this));
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
        this.mainIcon.node.on(cc.Node.EventType.TOUCH_END, () => {
            let equipment = PlayerData.getInstance().equipments[this.getPart(this.index)];
            if (!equipment.valid) {
                TipsManager.showMessage('尚未选中装备');
            } else {
                EquipUtils.showEquipmentTips(equipment.val)();
            }
        });
	}
	
	async init(index: any, equipment: Optional<Equipment>, equipmentSoulPanel: EquipmentSoulPanel) {
		this.index = index;
		this.equipment = equipment;
		this.equipmentSoulPanel = equipmentSoulPanel;
		this.refresh(equipment);
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
	}
	
	async refresh(equipment: Optional<Equipment>) {
        let config = equipment.monadBind(EquipUtils.getDisplay);
        if (equipment.valid && config.valid) {
            this.mainIcon.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/icon/equipment_tip_icon', '' + config.val.iconId)
            this.mainNameLabel.string = config.val.name;
			//
			let prototype = equipment.monadBind(EquipUtils.getProto);
			let equipmentSoulLevel = await ConfigUtils.getConfigJson('EquipmentSoulLevel');
			let equipmentSoulName = await ConfigUtils.getConfigJson('EquipmentSoulName');
			let level = equipment.fmap(x => x.soulLevel).getOrElse(0);
			//
			let soulName_1 = equipment.fmap(x => x.soulName_1).getOrElse(null);
			if (soulName_1 != null) {
				let soulNameId_1 = equipment.fmap(x => x.soulNameId_1).getOrElse(0);
				this.newAttr1Label.string = soulName_1 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_1, equipmentSoulName[soulNameId_1].factor);
				this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_1].color));
			} else {
				this.newAttr1Label.string = '无 +0';
				this.newAttr1Label.node.color = cc.Color.fromHEX(this.newAttr1Label.node.color, CommonUtils.getForgeColorByQuality());
			}
			let soulName_2 = equipment.fmap(x => x.soulName_2).getOrElse(null);
			if (soulName_2 != null) {
				let soulNameId_2 = equipment.fmap(x => x.soulNameId_2).getOrElse(0);
				this.newAttr2Label.string = soulName_2 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_2, equipmentSoulName[soulNameId_2].factor);
				this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_2].color));
			} else {
				this.newAttr2Label.string = '无 +0';
				this.newAttr2Label.node.color = cc.Color.fromHEX(this.newAttr2Label.node.color, CommonUtils.getForgeColorByQuality());
			}
			let soulName_3 = equipment.fmap(x => x.soulName_3).getOrElse(null);
			if (soulName_3 != null) {
				let soulNameId_3 = equipment.fmap(x => x.soulNameId_3).getOrElse(0);
				this.newAttr3Label.string = soulName_3 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], soulName_3, equipmentSoulName[soulNameId_3].factor);
				this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[soulNameId_3].color));
			} else {
				this.newAttr3Label.string = '无 +0';
				this.newAttr3Label.node.color = cc.Color.fromHEX(this.newAttr3Label.node.color, CommonUtils.getForgeColorByQuality());
			}
			//
			let oldSoulName_1 = this.equipment.fmap(x => x.soulName_1).getOrElse(null);
			if (oldSoulName_1 != null) {
				let oldSoulNameId_1 = this.equipment.fmap(x => x.soulNameId_1).getOrElse(0);
				this.attr1Label.string = oldSoulName_1 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], oldSoulName_1, equipmentSoulName[oldSoulNameId_1].factor);
				this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[oldSoulNameId_1].color));
			} else {
				this.attr1Label.string = '无 +0';
				this.attr1Label.node.color = cc.Color.fromHEX(this.attr1Label.node.color, CommonUtils.getForgeColorByQuality());
			}	
			let oldSoulName_2 = this.equipment.fmap(x => x.soulName_2).getOrElse(null);
			if (oldSoulName_2 != null) {
				let oldSoulNameId_2 = this.equipment.fmap(x => x.soulNameId_2).getOrElse(0);
				this.attr2Label.string = oldSoulName_2 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], oldSoulName_2, equipmentSoulName[oldSoulNameId_2].factor);
				this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[oldSoulNameId_2].color));
			} else {
				this.attr2Label.string = '无 +0';
				this.attr2Label.node.color = cc.Color.fromHEX(this.attr2Label.node.color, CommonUtils.getForgeColorByQuality());
			}	
			let oldSoulName_3 = this.equipment.fmap(x => x.soulName_3).getOrElse(null);
			if (oldSoulName_3 != null) {
				let oldSoulNameId_3 = this.equipment.fmap(x => x.soulNameId_3).getOrElse(0);
				this.attr3Label.string = oldSoulName_3 + ' +' + this.getSoulAttr(equipmentSoulLevel[level], oldSoulName_3, equipmentSoulName[oldSoulNameId_3].factor);
				this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality(equipmentSoulName[oldSoulNameId_3].color));
			} else {
				this.attr3Label.string = '无 +0';
				this.attr3Label.node.color = cc.Color.fromHEX(this.attr3Label.node.color, CommonUtils.getForgeColorByQuality());
			}					
        } else {
            this.mainIcon.spriteFrame = this.atlas.getSpriteFrame('bg_zhuangbeijianying');
            this.mainNameLabel.string = '请选择装备';
			this.attr1Label.string = '？ +？';
			this.attr2Label.string = '？ +？';
			this.attr3Label.string = '？ +？';
			this.newAttr1Label.string = '？ +？';
			this.newAttr2Label.string = '？ +？';
			this.newAttr3Label.string = '？ +？';
        }
		//
        let own = PlayerData.getInstance().ybAmount;
        this.ownLabel.string = String(own);
        const cost = 10000;
        this.costLabel.string = '/' + cost;
        this.ownLabel.node.color = cc.Color.fromHEX(this.ownLabel.node.color, cost > own ? '#ff5050' : '#0C6D08')
		//
		this.equipment = equipment;
	}
	
	async wash() {
        if (!this.equipment.valid) {
            TipsManager.showMessage('尚未选择任何装备');
            return;
        }
        const COST = 10000;
        if (PlayerData.getInstance().ybAmount < COST) {
            TipsManager.showMessage('所需的元宝不足，快去赚些吧');
            return;
        }
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/action/{id}/wash', [this.equipment.val.id]);
		if (response.status === 0) {
            this.washEffect.node.active = true;
            this.washEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.5);
            this.washEffect.node.active = false;
			//
			TipsManager.showMessage('洗炼成功，附魂的级别和种类发生了变化！');
			PlayerData.getInstance().updateFc();
            let newEquipment = new Optional<Equipment>(response.content);
            PlayerData.getInstance().equipments[this.getPart(this.index)] = newEquipment;
			this.refresh(newEquipment);
		}
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.2, 1);
		this.node.runAction(cc.sequence(fadeAction, cc.callFunc(this.closePanel.bind(this))));
	}
	
	closePanel() {
		this.equipmentSoulPanel.refreshState();
		CommonUtils.safeRemove(this.node);
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

    // update (dt) {}
}
