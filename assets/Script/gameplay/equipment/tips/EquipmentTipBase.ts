import BagItem from "../../../bag/BagItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import { ConfigUtils } from "../../../utils/ConfigUtil";
import { ItemQuality } from "../../../bag/ItemConfig";
import { Equipment } from "../../../net/Protocol";
import { EquipUtils } from "../utils/EquipmentUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipmentTipBase extends cc.Component {
    // 基础信息
    @property(cc.Button)
    vsBtn: cc.Button = null;
    @property(cc.Sprite)
    colorSprite: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.Button)
    moreInfoBtn: cc.Button = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;

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
    
    // 特效
    @property(cc.RichText)
    effectRT: cc.RichText = null;
    
    @property(cc.Sprite)
    jnqhSp: cc.Sprite = null;
    @property(cc.Sprite)
    qhSp: cc.Sprite = null;
    
    // 技能强化
    @property(cc.Node)
    skillEnhanceNode: cc.Node = null;
    @property(cc.Sprite)
    skillNameSprite: cc.Sprite = null;
    
    // 装备描述
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    
    // 强化特效
    @property(cc.Label)
    enhance4Label: cc.Label = null;
    @property(cc.Sprite)
    enhance4Flag: cc.Sprite = null;
    @property(cc.Label)
    enhance7Label: cc.Label = null;
    @property(cc.Sprite)
    enhance7Flag: cc.Sprite = null;
    @property(cc.Label)
    enhance10Label: cc.Label = null;
    @property(cc.Sprite)
    enhance10Flag: cc.Sprite = null;
	
	// 附魂描述
    @property(cc.Label)
    soulLabel: cc.Label = null;
    @property(cc.Layout)
    soulLayout: cc.Layout = null;
    @property(cc.Label)
    soulAttr1Label: cc.Label = null;
    @property(cc.Label)
    soulAttr2Label: cc.Label = null;
	@property(cc.Label)
    soulAttr3Label: cc.Label = null;
    
    // 底部按钮
    @property(cc.Button)
    moreBtn: cc.Button = null;
    @property(cc.Node)
    buttonGroup: cc.Node = null;
    @property(cc.Button)
    lianhuaBtn: cc.Button = null;
    @property(cc.Button)
    enhanceBtn: cc.Button = null;
    @property(cc.Button)
    armBtn: cc.Button = null;
    @property(cc.Sprite)
    arrowSprite: cc.Sprite = null;
    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    
    @property(cc.SpriteAtlas)
    altas: cc.SpriteAtlas = null;
    
    @property(cc.SpriteAtlas)
    qualityAtlas: cc.SpriteAtlas = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    bagItem: BagItem = null;
    
    start() {
        if (this.moreBtn) {
            this.moreBtn.node.on(cc.Node.EventType.TOUCH_END, this.moreBtnOnClick.bind(this));
        }
    }
    
    moreBtnOnClick() {
        this.buttonGroup.active = !this.buttonGroup.active;
        this.arrowSprite.node.scaleY = this.buttonGroup.active ? -1 : 1;
    }
    
    async init(bagItem: BagItem, prefabId = null) {
        this.bagItem = bagItem;
        let itemDisplay = EquipUtils.getDisplay(bagItem.data as Equipment, prefabId);
        let equipmentPrototype = bagItem.getPrototype();
        if (!itemDisplay.isValid() || !equipmentPrototype.isValid()) {
            return;
        }
        let display = itemDisplay.getValue();
        let prototype = equipmentPrototype.getValue();
        
        // head
        this.colorSprite.spriteFrame = this.qualityAtlas.getSpriteFrame(this.getQuality(prototype.quality));
        this.nameLabel.string = display.name;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(prototype.quality));
        // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getTipColorByQuality(prototype.quality));
        
        this.iconSprite.spriteFrame = this.getSf(itemDisplay.getValue().iconId.toString());
        
        // 强化等级
        let enhanceLevel = R.prop('enhanceLevel', bagItem.data)
        this.enhanceTitleLabel.string = '强化等级+' + enhanceLevel;
        this.enhanceStarLayout.node.children.forEach((ele, index) => {
            let starSrc = enhanceLevel > index ? 'icon_xingxing' : 'icon_kongxingxing';
            ele.getComponent(cc.Sprite).spriteFrame = this.getSf(starSrc);
            ele.active = index < R.prop('maxEnhanceLevel', bagItem.data);
        });
		if (enhanceLevel >= 10) {
			const action = cc.repeatForever(cc.rotateTo(10, 360))
			this.bgLighting.node.active = true;
			this.bgLighting.node.runAction(action)
		} else {
			this.bgLighting.node.active = false;
		}
    
        // 基础属性
        let baseAttr1 = R.path(['baseParameters', 0, 'value'], bagItem.data);
        let baseAttr2 = R.path(['baseParameters', 1, 'value'], bagItem.data);
        let scale : number = EquipUtils.getScale((bagItem.data as Equipment).enhanceLevel);
        let scaleStr = Math.floor((1 + scale) * 100) + '%';
        let realAttr = (x : number, y : number) => Math.floor(x * (1 + y))
        this.attr1Label.string = 
            R.path(['baseParameters', 0, 'name'], bagItem.data).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + '+' + realAttr(baseAttr1, scale);
        this.attr2Label.string = 
            R.path(['baseParameters', 1, 'name'], bagItem.data).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + '+' + realAttr(baseAttr2, scale);
        this.attr1ExtraLabel.string = `(${baseAttr1}*${scaleStr})`;
        this.attr2ExtraLabel.string = `(${baseAttr2}*${scaleStr})`;
    
        // 特效
        let effectsText = R.prop('effectsText', bagItem.data);
        let effectIds = effectsText == "" ? []: effectsText.split(',').map(x => parseInt(x));
        let str = "";
        effectIds.filter(x => x >= 600).forEach((id, index) => {
            let name = EquipUtils.getSpSkill(id).name;
            str += `<img src='${id}'/>${name}` + (((index + 1) % 3 == 0) ? "" : "  ");
        })
    
        let effectFc = R.reduce((x, y) => {
            if (y >= 600) {
                let config = EquipUtils.getSpSkill(y);
                return x + config.fc;
            } else if (y < 600 && y >= 500) {
                let config = EquipUtils.getEnhanceSkill(y);
                return x + config.fc
            } else {
                return x;
            }
        }, 0, effectIds)
        this.fcLabel.string = (realAttr(R.prop('baseFc', bagItem.data), scale) + effectFc) + '';
    
        if (str == "") {
            CommonUtils.safeRemove(this.effectRT.node);
        } else {
            this.effectRT.string = str;
        }
    
        // 技能强化
        let equipment = bagItem.data as Equipment;
        let enhanceId = R.find(x => x < 600, effectIds);
        if (enhanceId) {
            this.skillNameSprite.spriteFrame = this.getSf(enhanceId + '');
            let schoolId = this.getSchoolId(enhanceId);
            this.jnqhSp.spriteFrame = this.getSf('jnqh_' + schoolId);
            this.qhSp.spriteFrame = this.getSf('qh_' + schoolId);
        } else {
            CommonUtils.safeRemove(this.skillEnhanceNode);
        }
    
        // 描述
        this.descriptionLabel.string = display.description;
        
        // 强化特效
        let maxEnhanceLevel = R.prop('maxEnhanceLevel', bagItem.data);
        if (maxEnhanceLevel < 10) { CommonUtils.safeRemove(this.enhance10Label.node); }
        if (maxEnhanceLevel < 7) { CommonUtils.safeRemove(this.enhance7Label.node); }
        if (maxEnhanceLevel < 4) { CommonUtils.safeRemove(this.enhance4Label.node); }
    
        let everLevel = equipment.highestEnhanceLevelEver;
        this.enhance4Label.string = everLevel >= 4 ?  "强化4专属特效 已激活" :  "强化4专属特效 未激活";
        this.enhance4Flag.node.active = everLevel >= 4;
        if (everLevel >= 4) {
            this.enhance4Label.node.color = cc.Color.fromHEX(this.enhance4Label.node.color, '#FFBB19')
        } else {
            this.enhance4Label.node.color = cc.Color.fromHEX(this.enhance4Label.node.color, '#D1D1D1')
        }
        // this.enhance4Label.node.color = everLevel >= 4 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 
    
        this.enhance7Label.string = everLevel >= 7 ?  "强化7重铸系统 已激活" :  "强化7重铸系统 未激活";
        this.enhance7Flag.node.active = everLevel >= 7;
        if (everLevel >= 7) {
            this.enhance7Label.node.color = cc.Color.fromHEX(this.enhance7Label.node.color, '#FFBB19')
        } else {
            this.enhance7Label.node.color = cc.Color.fromHEX(this.enhance7Label.node.color, '#D1D1D1')
        }
        // this.enhance7Label.node.color = everLevel >= 7 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 
    
        this.enhance10Label.string = everLevel >= 10 ?  "强化10技能强化 已激活" :  "强化10技能强化 未激活";
        this.enhance10Flag.node.active = everLevel >= 10;
        if ( everLevel >= 10 ) {
            this.enhance10Label.node.color = cc.Color.fromHEX(this.enhance10Label.node.color, '#FFBB19')
        } else {
            this.enhance10Label.node.color = cc.Color.fromHEX(this.enhance10Label.node.color, '#D1D1D1')
        }
        // this.enhance10Label.node.color = everLevel >= 10 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 
		
		// 附魂属性
		let equipmentSoulLevel = await ConfigUtils.getConfigJson('EquipmentSoulLevel');
		let equipmentSoulName = await ConfigUtils.getConfigJson('EquipmentSoulName');
		if (prototype.quality == ItemQuality.Green || prototype.quality == ItemQuality.Blue) {
			this.soulLabel.node.active = false;
			this.soulLayout.node.active = false;
		} else {
			let soulLevel = R.prop('soulLevel', bagItem.data);
			this.soulLabel.node.active = true;
			this.soulLayout.node.active = true;
			this.soulLabel.string = '附魂属性 ' + soulLevel + '级';
			let soulName_1 = R.prop('soulName_1', bagItem.data);
			if (soulName_1 != null) {
				let soulNameId_1 = R.prop('soulNameId_1', bagItem.data);
				this.soulAttr1Label.string = soulName_1 + ' +' + this.getSoulAttr(equipmentSoulLevel[soulLevel], soulName_1, equipmentSoulName[soulNameId_1].factor);
				this.soulAttr1Label.node.color = cc.Color.fromHEX(this.soulAttr1Label.node.color, CommonUtils.getTipColorByQuality(equipmentSoulName[soulNameId_1].color));
			} else {
				this.soulAttr1Label.string = '无';
				this.soulAttr1Label.node.color = cc.Color.fromHEX(this.soulAttr1Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_2 = R.prop('soulName_2', bagItem.data);
			if (soulName_2 != null) {
				let soulNameId_2 = R.prop('soulNameId_2', bagItem.data);
				this.soulAttr2Label.string = soulName_2 + ' +' + this.getSoulAttr(equipmentSoulLevel[soulLevel], soulName_2, equipmentSoulName[soulNameId_2].factor);
				this.soulAttr2Label.node.color = cc.Color.fromHEX(this.soulAttr2Label.node.color, CommonUtils.getTipColorByQuality(equipmentSoulName[soulNameId_2].color));
			} else {
				this.soulAttr2Label.string = '无';
				this.soulAttr2Label.node.color = cc.Color.fromHEX(this.soulAttr2Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_3 = R.prop('soulName_3', bagItem.data);
			if (soulName_3 != null) {
				let soulNameId_3 = R.prop('soulNameId_3', bagItem.data);
				this.soulAttr3Label.string = soulName_3 + ' +' + this.getSoulAttr(equipmentSoulLevel[soulLevel], soulName_3, equipmentSoulName[soulNameId_3].factor);
				this.soulAttr3Label.node.color = cc.Color.fromHEX(this.soulAttr3Label.node.color, CommonUtils.getTipColorByQuality(equipmentSoulName[soulNameId_3].color));
			} else {
				this.soulAttr3Label.string = '无';
				this.soulAttr3Label.node.color = cc.Color.fromHEX(this.soulAttr3Label.node.color, CommonUtils.getTipColorByQuality());
			}
		}
		
		//
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
    
    getSf(key: string) {
        return this.altas.getSpriteFrame(key);
    }
    
    getSchoolId(effectId: number) {
        if (effectId >= 500 && effectId <= 505) {
            return 101;
        } else if (effectId >= 506 && effectId <= 511) {
            return 102;
        } else if (effectId >= 512 && effectId <= 517) {
            return 103;
        } else {
            return 104;
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

}