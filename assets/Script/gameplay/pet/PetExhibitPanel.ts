import { CommonUtils } from "../../utils/CommonUtils";
import { PetDetail } from "../../net/Protocol";
import { PetConfigItem, PetData } from "./PetData";
import PetSKillItem, { SkillItemState } from "./PetSkillItem";
import Either from "../../cocosExtend/Either";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import { NetUtils } from "../../net/NetUtils";
import Optional from "../../cocosExtend/Optional";
import { TipsManager } from "../../base/TipsManager";
import SecondConfirmBox from "../../base/SecondConfirmBox";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PetExhibitPanel extends cc.Component {
    // left
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    starNumLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    activeSkillIcon: cc.Sprite = null;
    @property(cc.Sprite)
    mcSp: cc.Sprite = null;
    @property(cc.Sprite)
    colorSp: cc.Sprite = null;

    // right
    // attributes
    @property(cc.Node)
    aptNode: cc.Node = null;
    @property(cc.Node)
    attrNode: cc.Node = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
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
    atkNameLabel: cc.Label = null;
    
    @property(cc.Button)
    switchBtn: cc.Button = null;
    
    // aptitude
    @property(cc.RichText)
    apAtkRichText: cc.RichText = null;
    @property(cc.RichText)
    apLifeRichText: cc.RichText = null;
    @property(cc.RichText)
    apPDefRichText: cc.RichText = null;
    @property(cc.RichText)
    apMDefRichText: cc.RichText = null;
    @property(cc.RichText)
    apSpdRichText: cc.RichText = null;
    
    @property(cc.Graphics)
    graphics: cc.Graphics = null;
    
    @property(cc.Layout)
    skillsLayout: cc.Layout = null;
    
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Button)
    giveupBtn: cc.Button = null;
    
    @property(cc.Prefab)
    skillPrefab: cc.Prefab = null;
    
    @property(cc.SpriteFrame)
    viewAttrSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    viewAptSf: cc.SpriteFrame = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    activeSkillIconAtlas: cc.SpriteAtlas = null;
    
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    
    private currnetPetId: Optional<number> = new Optional<number>();
    private petDetail: PetDetail = null;
    private showAttrs: boolean = false;
    /** 
     *      1 
     *    2   3
     *     4 5
     */
    startPoints = [];
    
    endPoints = [
        new cc.Vec2(-0.2, 76.8),
        new cc.Vec2(-81.2, 16.8),
        new cc.Vec2(-47.8, -76.3),
        new cc.Vec2(49.8, -76.5),
        new cc.Vec2(80.7, 16.9),
    ]
    
    start () {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.switchBtn.node.on(cc.Node.EventType.TOUCH_END, this.switch.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmOnClick.bind(this));
        this.giveupBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.giveUpScb.bind(this)));
    
        this.apAtkRichText.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(51));
        this.apLifeRichText.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(53));
        this.apMDefRichText.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(55));
        this.apSpdRichText.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(54));
        this.apPDefRichText.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(52));
    
        this.levelLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(50));
    
        this.lifeLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(1));
        this.pDefLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(4));
        this.mDefLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(6));
        this.spdLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(7));
    }
    
    async init (petDetail: PetDetail) {
        this.petDetail = petDetail;
        this.currnetPetId = new Optional<number>(petDetail.pet.id);
        this.startPoints = R.repeat(new cc.Vec2(0.6, -2.7), 5)
        let con = await PetData.getConfigById(petDetail.pet.definitionId);
        if (con.valid) {
            let config = con.val;
            this.initBase(petDetail, config);
            this.initApt(petDetail, config);
            this.initAttributes(petDetail, config);
            this.initSkills(petDetail);
        }
    }
    
    async initAsAward (petDetail: PetDetail) {
        this.petDetail = petDetail;
        this.giveupBtn.node.active = false;
        this.confirmBtn.node.x = 0;
        this.currnetPetId = new Optional<number>(petDetail.pet.id);
        this.startPoints = R.repeat(new cc.Vec2(0.6, -2.7), 5)
        let con = await PetData.getConfigById(petDetail.pet.definitionId);
        if (con.valid) {
            let config = con.val;
            this.initBase(petDetail, config);
            this.initApt(petDetail, config);
            this.initAttributes(petDetail, config);
            this.initSkills(petDetail);
        }
    }
    
    initBase (petDetail: PetDetail, config: PetConfigItem) {
        this.colorSp.spriteFrame = this.atlas.getSpriteFrame('color_' + config.color);
        this.starNumLabel.string = ' x ' + petDetail.pet.maxRank;
        this.nameLabel.string = config.name;
		this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getPetTipColorByColor(config.color));
        this.initMc(config.prefabId);
        this.initActiveSkill(config.activeSkill.fst);
    }
    
    async initActiveSkill(skillId: number) {
        let info = await PetData.getPetSkillInfoById(skillId);
        if (info.valid) {
            this.activeSkillIcon.spriteFrame = this.activeSkillIconAtlas.getSpriteFrame(info.val.icon + '_1');
            this.activeSkillIcon.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showPetSkillTips(skillId));
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
    
    initSkills (petDetail: PetDetail) {
        let skillsMaxNum = petDetail.pet.maxAbilityCapacity;
        let skillIds = petDetail.pet.abilities;
        for (let i = 0; i < 15; ++i) {
            let skillItem = cc.instantiate(this.skillPrefab).getComponent(PetSKillItem);
            if (skillIds[i]) {
                let info = Either.Right<SkillItemState, number>(skillIds[i]);
                skillItem.init(info);
            } else if (i == skillIds.length && petDetail.pet.rank < 4) {
                skillItem.init(Either.Left<SkillItemState, number>(SkillItemState.Inactive));
            } else if (i < skillsMaxNum) {
                skillItem.init(Either.Left<SkillItemState, number>(SkillItemState.Empty));
            } else {
                skillItem.init(Either.Left<SkillItemState, number>(SkillItemState.Locked));
            }
            skillItem.node.parent = this.skillsLayout.node;
        }
    }
    
    initApt (petDetail: PetDetail, config: PetConfigItem) {
        this.apLifeRichText.string = '内防<br/><color=#4B0A08>' + petDetail.pet.aptitudeMdef + '</c>';
        this.apAtkRichText.string =  '攻击<color=#4B0A08> ' + petDetail.pet.aptitudeAtk + '</c>';
        this.apPDefRichText.string = '气血<br/><color=#4B0A08>' + petDetail.pet.aptitudeHp + '</c>';
        this.apMDefRichText.string = '外防<br/><color=#4B0A08>' + petDetail.pet.aptitudePdef + '</c>';
        this.apSpdRichText.string = '速度<br/><color=#4B0A08>' + petDetail.pet.aptitudeSpd + '</c>';
        this.drawRadar(petDetail, config);
    }
    
    async initAttributes (petDetail: PetDetail, config: PetConfigItem) {
        let petAttr = await PetData.getAttributes(petDetail);
        this.levelLabel.string = '推荐度  ' + petDetail.pet.sortingIndex;
        this.lifeLabel.string = '' + petAttr.hp;
        this.atkLabel.string = petAttr.atk + '';
        this.pDefLabel.string = '' + petAttr.pDef;
        this.mDefLabel.string = '' + petAttr.mDef;
        this.spdLabel.string = '' + petAttr.spd;
        this.atkNameLabel.string = config.isMagic ? '内 伤' : '外 伤';
        if (config.isMagic) {
            this.atkLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(5));
        } else {
            this.atkLabel.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showAttributeTips(3));
        }
        this.fcLabel.string = petAttr.fc + ''
    }
    
    drawRadar (petDetail: PetDetail, config: PetConfigItem) {
        let aptMax = [
            config.atkApt.max, 
            config.lifeApt.max,
            config.mDefApt.max,
            config.spdApt.max,
            config.pDefApt.max,
            
        ];  
        let aptMin = [
            config.atkApt.min, 
            config.lifeApt.min,
            config.mDefApt.min,
            config.spdApt.min,
            config.pDefApt.min,
            
        ]
        let apt = [
            petDetail.pet.aptitudeAtk,
            petDetail.pet.aptitudeHp,
            petDetail.pet.aptitudeMdef,
            petDetail.pet.aptitudeSpd,
            petDetail.pet.aptitudePdef,
            
        ]
        this.graphics.clear();
        this.graphics.fillColor = this.getColorByColor(config.color);
        let rates = R.zipWith((a, b) => R.concat(a, R.of(b)), R.zip(aptMin, aptMax), apt)
            .map(ele => this.getRate(ele[0], ele[1], ele[2]));
        let points = R.zip(this.startPoints, this.endPoints)
            .map((ele, index) => this.getPoint(ele[0], ele[1], rates[index]))
            // .map(p => CommonUtils.addVec(new cc.Vec2(86, 82), p));
        
        points.forEach((ele, index) => {
            if (index == 0) {
                this.graphics.moveTo(ele.x, ele.y);
            }
            this.graphics.lineTo(ele.x, ele.y);
        });
        this.graphics.close();
        this.graphics.stroke();
        this.graphics.fill();
    }


    getRate(min, max, value) {
        if (max == min) { return 1; }
        return (value - min) / (max - min);
    }
    
    getPoint(startPoint: cc.Vec2, endPoint: cc.Vec2, rate: number) {
        return CommonUtils.addVec(
                startPoint, 
                CommonUtils.scaleVec(
                    CommonUtils.addVec(
                        endPoint, 
                        CommonUtils.negateVec(startPoint)
                    ), 
                    rate
                )
            );
    }
    
    // events
    switch () {
        this.showAttrs = !this.showAttrs;
        this.aptNode.active = !this.showAttrs;
        this.attrNode.active = this.showAttrs;
        this.switchBtn.getComponentInChildren(cc.Sprite).spriteFrame = this.showAttrs ? this.viewAptSf : this.viewAttrSf; 
    }
    
    async confirmOnClick() {
        this.closePanel();
        if (this.petDetail) {
            let pid = this.petDetail.pet.id;
            let pid1 = PlayerData.getInstance().battlePetId1.getOrElse(null);
            let pid2 = PlayerData.getInstance().battlePetId2.getOrElse(null);
            let pid3 = PlayerData.getInstance().battlePetId3.getOrElse(null);
            let petIds = [pid1, pid2, pid3].filter(x => x != null);
            if (petIds.length < 3) {
                petIds.push(pid);
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/modifyBattleList', [petIds.join(',')]) as any;
                if (response.status === 0) {
                    TipsManager.showMessage('宠物已自动出战');
                    PlayerData.getInstance().updateFc();
                    PlayerData.getInstance().battlePetId1 = new Optional<number>(petIds[0]);
                    PlayerData.getInstance().battlePetId2 = new Optional<number>(petIds[1]);
                    PlayerData.getInstance().battlePetId3 = new Optional<number>(petIds[2]);
                    await PetData.updatePetIds();
                }
            }
        }
    }
    
    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
    
    async giveUpScb () {
        if (!this.petDetail) return;
        let pid = this.petDetail.pet.definitionId;
        let config = await PetData.getConfigById(pid);
        if (!config.valid) return;
        if (config.val.color < 3) {
            this.giveUp();
            return;
        }
        let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
        let confirmBox = cc.instantiate(prefab).getComponent(SecondConfirmBox);
        confirmBox.init('是否确定放生 ' + this.getQualityByColor(config.val.color) + ' ' + this.petDetail.pet.petName, this.giveUp.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: confirmBox});
    }
    
    async giveUp () {
        if (this.currnetPetId.valid) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/recycle', [this.currnetPetId.val + '']);
            if (response.status === 0) {
                this.closePanel();
                await PetData.updatePetIds();
                let stack = R.path(['content', 0, 'currencyStack'], response);
                if (stack) {
                    TipsManager.showGainCurrency(stack);
                }
            }
        }
    }
    
    getColorByColor (color: number) {
        const getHex = (color: number) => {
            switch (color) {
                case 2: return '#8bf457';
                case 3: return '#81e6ff';
                case 4: return '#df99ff';
                case 5: return '#ffc170';
                case 6: return '#fffd6d';
                default: return '#ffffff';
            }
        }
        let result = new cc.Color();
        result = cc.Color.fromHEX(result, getHex(color))
        return result
    }
    
    getQualityByColor (color: number) {
        switch (color) {
            case 2: return '优秀品质';
            case 3: return '精良品质';
            case 4: return '史诗品质';
            case 5: return '传说品质';
            case 6: return '无双品质';
            default: return '优秀品质';
        }
    }
}