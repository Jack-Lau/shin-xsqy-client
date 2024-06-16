import { PetData, PetConfigItem } from "./PetData";
import { CommonUtils } from "../../utils/CommonUtils";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { PetQuality } from "../../bag/ItemConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetPrototypeTips extends cc.Component {
	
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    colorSp: cc.Sprite = null;
    @property(cc.Label)
    recommendLabel: cc.Label = null;
    @property(cc.Label)
    activeSkillLabel: cc.Label = null;
    @property(cc.Sprite)
    mcSp: cc.Sprite = null;
    @property(cc.Sprite)
    activeSkillSp: cc.Sprite = null;

    @property(cc.Label)
    cxRangeLabel: cc.Label = null;
    @property(cc.Label)
    atkNameLabel: cc.Label = null;

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

    @property(cc.Label)
    maxSkillNumLabel: cc.Label = null;
	
	// 附魂描述
    @property(cc.Label)
    soulLabel: cc.Label = null;
    @property(cc.Layout)
    soulLayout: cc.Layout = null;
    @property([cc.Label])
    soulGradeLabels: Array<cc.Label> = [];

    @property(cc.Label)
    activeSkillNameLabel: cc.Label = null;
    @property(cc.Label)
    activeSkillDescLabel: cc.Label = null;
    @property(cc.Label)
    descLabel: cc.Label = null;
    
    @property(cc.Node)
    enhance4Node: cc.Node = null;
    @property(cc.Node)
    enhance7Node: cc.Node = null;
    @property(cc.Node)
    enhance10Node: cc.Node = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    activeSkillIconAtlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    start () {
        this.bg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    async init (definitionId: number) {
        let config = await PetData.getConfigById(definitionId)
        if (config.valid) {
            this.initBase(config.val);
            this.initCxMax(config.val);
            this.initApt(config.val);
            this.initActiveSkill(config.val);
            this.initMaxSkillNum(config.val);
			this.initSoul(config.val);
            this.initDesc(config.val);
            this.initEnhance(config.val);
        }
    }

    initBase (config: PetConfigItem) {
        this.nameLabel.string = config.name;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getPetTipColorByColor(config.color))
        // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getPetTipColorByColor(config.color));
        this.colorSp.spriteFrame = this.atlas.getSpriteFrame('color_' + config.color);
        this.recommendLabel.string = '最高推荐度 ' + PetData.getRecommendValue(config);
        this.initMc(config.prefabId);
    }

    async initMc (prefabId: number) {
        let animationClip = await MovieclipUtils.getMovieclip(prefabId, 'idle_ld', 16);
        let animation = this.mcSp.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId + '_idle_ld');
        this.mcSp.node.anchorX = offset.x;
        this.mcSp.node.anchorY = offset.y;
    }

    initCxMax (config: PetConfigItem) {
        let min = config.star.min;
        let max = config.star.max;
        this.cxRangeLabel.string = `冲星上限 (${min}~${max})`;
    }

    initApt (config: PetConfigItem) {
        this.lifeLabel.string = this.getRange(config.lifeApt.min, config.lifeApt.max);
        this.atkLabel.string = this.getRange(config.atkApt.min, config.atkApt.max);
        this.pDefLabel.string = this.getRange(config.pDefApt.min, config.pDefApt.max);
        this.mDefLabel.string = this.getRange(config.mDefApt.min, config.mDefApt.max);
        this.spdLabel.string = this.getRange(config.spdApt.min, config.spdApt.max);

        this.atkNameLabel.string = (config.isMagic ? '内伤' : '外伤') + '资质';
    }

    getRange(min: number, max: number) {
        if (min == max) { 
            return String(min)
        } else {
            return `${min} ~ ${max}`
        }
    }

    initMaxSkillNum (config: PetConfigItem) {
        this.maxSkillNumLabel.string = '可习得技能数 ' + config.maxSkillNum;
    }
	
	initSoul(config: PetConfigItem) {
		// 附魂属性
		if (config.color == PetQuality.Green || config.color == PetQuality.Blue) {
			this.soulLabel.string = '不可附魂';
			this.soulLayout.node.active = false;
		} else {
			this.soulLabel.string = '可附魂';
			this.soulLayout.node.active = true;
			if (config.color == PetQuality.Purple) {
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
		}
	}

    async initActiveSkill(config: PetConfigItem) {
        let skillId = config.activeSkill.fst;
        let skillInfo = await PetData.getPetSkillInfoById(skillId);
        if (skillInfo.valid) {
            this.activeSkillNameLabel.string = skillInfo.val.name + ' (主动技能)';
            this.activeSkillLabel.string = skillInfo.val.name;
            this.activeSkillDescLabel.string = skillInfo.val.description;
        }
        let info = await PetData.getPetSkillInfoById(skillId);
        if (info.valid) {
            this.activeSkillLabel.string = info.val.name;
            this.activeSkillSp.spriteFrame = this.activeSkillIconAtlas.getSpriteFrame(info.val.icon + '_1');
        } 
    }

    initDesc (config: PetConfigItem) {
        this.descLabel.string = config.description;
    }

    initEnhance (config: PetConfigItem) {
        this.enhance4Node.active = config.star.max >= 4;
        this.enhance7Node.active = config.star.max >= 7;
        this.enhance10Node.active = config.star.max >= 10;
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

}