import { PetDetail } from "../../net/Protocol";
import { PetConfigItem, PetData } from "./PetData";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import PetTipsSkillItem from "./PetTipsSkillItem";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { PetQuality } from "../../bag/ItemConfig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PetTipsBaseInfo extends cc.Component {
    @property(cc.Sprite)
    colorSp: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Button)
    moreInfoBtn: cc.Button = null;
    @property(cc.Sprite)
    mcSp: cc.Sprite = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Layout)
    enhanceStarLayout: cc.Layout = null;
    @property(cc.Label)
    activeSkillLabel: cc.Label = null;
    @property(cc.Sprite)
    activeSkillSp: cc.Sprite = null;

    // base attr
    @property(cc.Label)
    lifeLabel: cc.Label = null;
    @property(cc.Label)
    atkLabel: cc.Label = null;
    @property(cc.Label)
    pDefLabel: cc.Label = null;
    @property(cc.Label)
    mDefLabel: cc.Label = null;
    @property(cc.Label)
    spdLabel: cc.Label = null;
	
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
	@property(cc.Label)
    soulAttr4Label: cc.Label = null;
	@property(cc.Label)
    soulAttr5Label: cc.Label = null;
	@property(cc.Label)
    soulAttr6Label: cc.Label = null;

    // skills
    @property(cc.Label)
    skillTitleLabel: cc.Label = null;
    @property(cc.Layout)
    skillLayout: cc.Layout = null;

    @property(cc.Label)
    descriptionLabel: cc.Label = null;

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

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.Prefab)
    skillItemPrefab: cc.Prefab = null;

    @property(cc.SpriteAtlas)
    activeSkillIconAtlas: cc.SpriteAtlas = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    start () {

    }

    async init (petDetail: PetDetail) {
        let petConfig = await PetData.getConfigById(petDetail.pet.definitionId);
        if (petConfig.valid) {
            this.initBase(petDetail, petConfig.val);
            this.initStar(petDetail);
            this.initAttrs(petDetail, petConfig.val);
			this.initSoul(petDetail, petConfig.val);
            this.initSkills(petDetail, petConfig.val);
            this.initActiveSkill(petDetail.pet.rank >= 10 ? petConfig.val.activeSkill.snd : petConfig.val.activeSkill.fst);
            this.initDesc(petConfig.val);
            this.initEnhanceAttr(petDetail, petConfig.val);
        }
    }

    initBase (petDetail: PetDetail, config: PetConfigItem) {
        this.nameLabel.string = petDetail.pet.petName;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getPetTipColorByColor(config.color))
        // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getPetTipColorByColor(config.color));
        this.colorSp.spriteFrame = this.atlas.getSpriteFrame('color_' + config.color);
        this.initMc(config.prefabId);
		//
		if (petDetail.pet.rank >= 10) {
			const action = cc.repeatForever(cc.rotateTo(10, 360))
			this.bgLighting.node.active = true;
			this.bgLighting.node.runAction(action)
		} else {
			this.bgLighting.node.active = false;
		}
    }

    async initActiveSkill (skillId: number) {
        let info = await PetData.getPetSkillInfoById(skillId);
        if (info.valid) {
            this.activeSkillLabel.string = info.val.name;
            this.activeSkillSp.spriteFrame = this.activeSkillIconAtlas.getSpriteFrame(info.val.icon + '_1');
        } 
    }

    async initMc (prefabId: number) {
        let sample = prefabId == 4100014 ? 10 : 16;
        let animationClip = await MovieclipUtils.getMovieclip(prefabId, 'idle_ld', sample);
        let animation = this.mcSp.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId + '_idle_ld');
        this.mcSp.node.anchorX = offset.x;
        this.mcSp.node.anchorY = offset.y;
    }

    initStar (petDetail: PetDetail) {
        let enhanceLevel = petDetail.pet.rank;
        let maxLevel = petDetail.pet.maxRank;
        this.enhanceStarLayout.node.children.forEach((ele, index) => {
            let starSrc = enhanceLevel > index ? 'icon_xingxing' : 'icon_kongxingxing';
            ele.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(starSrc);
            ele.active = index < maxLevel;
        });
    }

    async initAttrs(petDetail: PetDetail, config: PetConfigItem) {
        let petAttrs = await PetData.getAttributes(petDetail);
        this.lifeLabel.string = `气血  ${petAttrs.hp}`;
        this.atkLabel.string = (config.isMagic ? '内伤' : '外伤') + '  ' + petAttrs.atk;
        this.pDefLabel.string = `外防  ${petAttrs.pDef}`;
        this.mDefLabel.string = `内防  ${petAttrs.mDef}`;
        this.spdLabel.string = `速度  ${petAttrs.spd}`;
        this.fcLabel.string = '' + petAttrs.fc;
    }
	
	async initSoul(petDetail: PetDetail, config: PetConfigItem) {
		let petSoulLevel = await ConfigUtils.getConfigJson('PetSoulLevel');
		let petSoulName = await ConfigUtils.getConfigJson('PetSoulName');
		if (config.color == PetQuality.Green || config.color == PetQuality.Blue) {
			this.soulLabel.node.active = false;
			this.soulLayout.node.active = false;
		} else {
			let soulLevel = petDetail.pet.soulLevel;
			this.soulLabel.node.active = true;
			this.soulLayout.node.active = true;
			this.soulLabel.string = '附魂属性 ' + soulLevel + '级';
			let soulName_1 = petDetail.pet.soulName_1;
			if (soulName_1 != null) {
				let soulNameId_1 = petDetail.pet.soulNameId_1;
				this.soulAttr1Label.string = soulName_1 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_1, petSoulName[soulNameId_1].factor);
				this.soulAttr1Label.node.color = cc.Color.fromHEX(this.soulAttr1Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_1].color));
			} else {
				this.soulAttr1Label.string = '无';
				this.soulAttr1Label.node.color = cc.Color.fromHEX(this.soulAttr1Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_2 = petDetail.pet.soulName_2;
			if (soulName_2 != null) {
				let soulNameId_2 = petDetail.pet.soulNameId_2;
				this.soulAttr2Label.string = soulName_2 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_2, petSoulName[soulNameId_2].factor);
				this.soulAttr2Label.node.color = cc.Color.fromHEX(this.soulAttr2Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_2].color));
			} else {
				this.soulAttr2Label.string = '无';
				this.soulAttr2Label.node.color = cc.Color.fromHEX(this.soulAttr2Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_3 = petDetail.pet.soulName_3;
			if (soulName_3 != null) {
				let soulNameId_3 = petDetail.pet.soulNameId_3;
				this.soulAttr3Label.string = soulName_3 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_3, petSoulName[soulNameId_3].factor);
				this.soulAttr3Label.node.color = cc.Color.fromHEX(this.soulAttr3Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_3].color));
			} else {
				this.soulAttr3Label.string = '无';
				this.soulAttr3Label.node.color = cc.Color.fromHEX(this.soulAttr3Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_4 = petDetail.pet.soulName_4;
			if (soulName_4 != null) {
				let soulNameId_4 = petDetail.pet.soulNameId_4;
				this.soulAttr4Label.string = soulName_4 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_4, petSoulName[soulNameId_4].factor);
				this.soulAttr4Label.node.color = cc.Color.fromHEX(this.soulAttr4Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_4].color));
			} else {
				this.soulAttr4Label.string = '无';
				this.soulAttr4Label.node.color = cc.Color.fromHEX(this.soulAttr4Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_5 = petDetail.pet.soulName_5;
			if (soulName_5 != null) {
				let soulNameId_5 = petDetail.pet.soulNameId_5;
				this.soulAttr5Label.string = soulName_5 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_5, petSoulName[soulNameId_5].factor);
				this.soulAttr5Label.node.color = cc.Color.fromHEX(this.soulAttr5Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_5].color));
			} else {
				this.soulAttr5Label.string = '无';
				this.soulAttr5Label.node.color = cc.Color.fromHEX(this.soulAttr5Label.node.color, CommonUtils.getTipColorByQuality());
			}
			let soulName_6 = petDetail.pet.soulName_6;
			if (soulName_6 != null) {
				let soulNameId_6 = petDetail.pet.soulNameId_6;
				this.soulAttr6Label.string = soulName_6 + ' +' + this.getSoulAttr(petSoulLevel[soulLevel], soulName_6, petSoulName[soulNameId_6].factor);
				this.soulAttr6Label.node.color = cc.Color.fromHEX(this.soulAttr6Label.node.color, CommonUtils.getTipColorByQuality(petSoulName[soulNameId_6].color));
			} else {
				this.soulAttr6Label.string = '无';
				this.soulAttr6Label.node.color = cc.Color.fromHEX(this.soulAttr6Label.node.color, CommonUtils.getTipColorByQuality());
			}
		}
	}

    initSkills(petDetail: PetDetail, config: PetConfigItem) {
        let ownNum = petDetail.pet.abilities.length;
        let maxNum = config.maxSkillNum;
        this.skillTitleLabel.string = `宠物技能 (${ownNum}/${maxNum})`;
        this.skillLayout.node.removeAllChildren();
        CommonUtils.asyncForEach(petDetail.pet.abilities, async id => {
            let config = await PetData.getPetSkillInfoById(id);            
            if (config.valid) {
                let skillItem = cc.instantiate(this.skillItemPrefab).getComponent(PetTipsSkillItem);
                skillItem.init(config.val);
                skillItem.node.parent = this.skillLayout.node;
            }
        });
    }

    initDesc(config: PetConfigItem) {
        this.descriptionLabel.string = config.description;
    }

    initEnhanceAttr (petDetail: PetDetail, config: PetConfigItem) {
        let rank = petDetail.pet.rank;
        this.enhance4Flag.node.active = rank >= 4;
        this.enhance4Label.string = '冲星4激活技能 ' + (rank >= 4 ? '已激活' : '未激活');
        this.enhance7Flag.node.active = rank >= 7;
        this.enhance7Label.string = '冲星7炼妖系统 ' + (rank >= 7 ? '已激活' : '未激活');
        this.enhance10Flag.node.active = rank >= 10;
        this.enhance10Label.string = '冲星10主动技能 ' + (rank >= 10 ? '已激活' : '未激活');
        
        this.enhance4Label.node.color = cc.Color.fromHEX(this.enhance4Label.node.color, rank >= 4 ? "#FFBB19" : "#D1D1D1")
        this.enhance7Label.node.color = cc.Color.fromHEX(this.enhance7Label.node.color, rank >= 7 ? "#FFBB19" : "#D1D1D1")
        this.enhance10Label.node.color = cc.Color.fromHEX(this.enhance10Label.node.color, rank >= 10 ? "#FFBB19" : "#D1D1D1")

        // this.enhance4Label.node.color = rank >= 4 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 
        // this.enhance7Label.node.color = rank >= 7 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 
        // this.enhance10Label.node.color = rank >= 10 ? cc.hexToColor('#FFBB19') : cc.hexToColor('#D1D1D1'); 

        this.enhance10Label.node.active = config.color >= 5;
        this.enhance7Label.node.active = config.color >= 4;
        this.enhance4Label.node.active = config.color >= 3;
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
	
}