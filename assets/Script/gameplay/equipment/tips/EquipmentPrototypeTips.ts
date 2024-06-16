import { CommonUtils } from "../../../utils/CommonUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import ItemConfig, { EquipmentPrototype, ItemQuality } from "../../../bag/ItemConfig";
import PlayerData from "../../../data/PlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipmentPrototypeTips extends cc.Component {
    // 基础信息
    @property(cc.Sprite)
    colorSprite: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.Sprite)
    partSprite: cc.Sprite = null;

    // 强化等级
    @property(cc.Label)
    enhanceTitleLabel: cc.Label = null;
    @property(cc.Layout)
    enhanceStarLayout: cc.Layout = null;

    // 基础属性
    @property(cc.Label)
    baseAttrTitleLabel: cc.Label = null;
    @property(cc.Layout)
    baseAttrLayout: cc.Layout = null;
    @property(cc.Label)
    attr1Label: cc.Label = null;
    @property(cc.Label)
    attr1ExtraLabel: cc.Label = null;
    @property(cc.Label)
    attr2Label: cc.Label = null;
    @property(cc.Label)
    attr2ExtraLabel: cc.Label = null;

    // 战力
    @property(cc.Label)
    fcLabel: cc.Label = null;

    // 装备描述
    @property(cc.Label)
    descriptionLabel: cc.Label = null;

    // 强化特效
    @property(cc.Label)
    enhance4Label: cc.Label = null;
    @property(cc.Label)
    enhance7Label: cc.Label = null;
    @property(cc.Label)
    enhance10Label: cc.Label = null;
	
	// 附魂描述
    @property(cc.Label)
    soulLabel: cc.Label = null;
    @property(cc.Layout)
    soulLayout: cc.Layout = null;
    @property([cc.Label])
    soulGradeLabels: Array<cc.Label> = [];
    @property(cc.Label)
    soulTypeLabel: cc.Label = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    qualityAtlas: cc.SpriteAtlas = null;
	
    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    async init(prototype: EquipmentPrototype) {
        let itemDisplay = ItemConfig.getInstance().getItemDisplayById(prototype.id, PlayerData.getInstance().prefabId);
        if (!itemDisplay.isValid()) {
            return;
        }
        let display = itemDisplay.getValue();
        
        // head
        this.colorSprite.spriteFrame = this.qualityAtlas.getSpriteFrame(this.getQuality(prototype.quality));
        this.nameLabel.string = display.name;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(prototype.quality));
        this.iconSprite.spriteFrame = this.getSf(itemDisplay.getValue().iconId.toString());
        this.partSprite.spriteFrame = this.getSf(prototype.part);
        
        // 强化等级
        this.enhanceTitleLabel.string = '最大强化等级 (' + this.getRange(prototype.quality) + ')';
        let maxEnhanceLevel = this.getMaxEnhanceLevel(prototype.quality);
        this.enhanceStarLayout.node.children.forEach((ele, index) => {
            ele.active = index < maxEnhanceLevel;
        });

        // 基础属性
        let name1 = CommonUtils.replaceAttributeName(prototype.attr1.name)
        this.attr1Label.string = name1.length > 2 ? name1.substr(2) : name1;
        this.attr1ExtraLabel.string = '+ (' + prototype.attr1.min + '~' + prototype.attr1.max + ')';
        let name2 = CommonUtils.replaceAttributeName(prototype.attr2.name)
        this.attr2Label.string = name2.length > 2 ? name2.substr(2) : name2;
        this.attr2ExtraLabel.string = '+ (' + prototype.attr2.min + '~' + prototype.attr2.max + ')';

        // fc 
        let dict = {
            '最大生命': 0.135,
            '物伤': 0.5,
            '法伤': 0.5,
            '物防': 1.255,
            '法防': 1.255,
            '速度': 3.0,
            '幸运': 3.18,
        }
        let cal = prototype => {
            let p1 = R.prop(R.path(['attr1', 'name'], prototype), dict);
            let p2 = R.prop(R.path(['attr2', 'name'], prototype), dict);
            let min = R.path(['attr1', 'min'], prototype) * p1 +  R.path(['attr2', 'min'], prototype) * p2;
            let max = R.path(['attr1', 'max'], prototype) * p1 +  R.path(['attr2', 'max'], prototype) * p2;
            return '+ (' +  Math.floor(min) + '~' + Math.floor(max) + ')';
        }
        this.fcLabel.string = cal(prototype);
		
		// 附魂属性
		let equipmentSoulPart = await ConfigUtils.getConfigJson('EquipmentSoulPart');
		if (prototype.quality == ItemQuality.Green || prototype.quality == ItemQuality.Blue) {
			this.soulLabel.string = '不可附魂';
			this.soulLayout.node.active = false;
		} else {
			this.soulLabel.string = '可附魂';
			this.soulLayout.node.active = true;
			if (prototype.quality == ItemQuality.Purple) {
				this.soulGradeLabels[0].node.active = true;
				this.soulGradeLabels[1].node.active = true;
				this.soulGradeLabels[2].node.active = true;
				this.soulGradeLabels[3].node.active = false;
			} else {
				this.soulGradeLabels[0].node.active = true;
				this.soulGradeLabels[1].node.active = true;
				this.soulGradeLabels[2].node.active = true;
				this.soulGradeLabels[3].node.active = true;
			}
			for (let i = 1 ; i <= 6; i ++) {
				if (equipmentSoulPart[i].part == this.getPart(prototype.part)) {
					this.soulTypeLabel.string = equipmentSoulPart[i].name_1 + ' ' 
					+ equipmentSoulPart[i].name_2 + ' ' 
					+ equipmentSoulPart[i].name_3 + ' '
					+ equipmentSoulPart[i].name_4 + ' '
					+ equipmentSoulPart[i].name_5;
					break;
				}
			}
		}

        // 描述
        this.descriptionLabel.string = display.description;
		
        // 强化特效
        if (maxEnhanceLevel < 10) { CommonUtils.safeRemove(this.enhance10Label.node); }
        if (maxEnhanceLevel < 7) { CommonUtils.safeRemove(this.enhance7Label.node); }
        if (maxEnhanceLevel < 5) { CommonUtils.safeRemove(this.enhance4Label.node); }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    getSf(key: string) {
        return this.atlas.getSpriteFrame(key);
    }

    getQuality(q: ItemQuality) {
        switch (q) {
            case ItemQuality.Green: { return 'color_2'; }
            case ItemQuality.Blue: { return 'color_3'; }
            case ItemQuality.Purple: { return 'color_4'; }
            case ItemQuality.Orange: { return 'color_5'; }
            case ItemQuality.Gold: { return 'color_6'; }
            default:  { return 'color_2'; }
        }
    }

    getRange(quality: ItemQuality) {
        let getMin = _ => (_ - 2) * 3 + 1;
        let getMax = _ => (_ - 1) * 3;
        switch (quality) {
            case ItemQuality.Green: { return getMin(2) + '~' + getMax(2); }
            case ItemQuality.Blue: { return getMin(3) + '~' + getMax(3); }
            case ItemQuality.Purple: { return getMin(4) + '~' + getMax(4); }
            case ItemQuality.Orange: { return getMin(5) + '~' + getMax(5); }
            default: { return getMin(2) + '~' + getMax(2); }
        }
    }

    getMaxEnhanceLevel(quality: ItemQuality) {
        let getMax = _ => (_ - 1) * 3;
        switch (quality) {
            case ItemQuality.Green: { return getMax(2) }
            case ItemQuality.Blue: { return getMax(3) }
            case ItemQuality.Purple: { return getMax(4) }
            case ItemQuality.Orange: { return getMax(5) }
            default: { return getMax(2); }
        }
    }
	
	getPart(part: string){
		switch (part) {
			case 'weapon': return 10;
			case 'head': return 21;
			case 'clothes': return 22;
			case 'shoes': return 23;
			case 'belt': return 24;
			case 'necklace': return 25;
			default: return 10;
		}
	}
	
}