import { PetDetail } from "../../../net/Protocol";
import PlayerData from "../../../data/PlayerData";
import PetAttributePanel from "./PetAttributePanel";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { CommonUtils } from "../../../utils/CommonUtils";
import PetRefiningPanel from "../PetRefiningPanel";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { MovieclipUtils } from "../../../utils/MovieclipUtils";
import PetRenamePanel from "./PetRenamePanel";
import PetTips from "../PetTips";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetAttributeModelling extends cc.Component {

    @property(cc.Node)
    closeTip: cc.Node = null;
    @property(cc.Label)
    powerlabel: cc.Label = null;
    @property(cc.Label)
    namelabel: cc.Label = null;

    @property(cc.Button)
    setupBtn: cc.Button = null;
    @property(cc.Button)
    nameBtn: cc.Button = null;
    @property(cc.Button)
    refiningBtn: cc.Button = null;

    @property(cc.Sprite)
    skillIcon: cc.Sprite = null;
    @property(cc.Sprite)
    model: cc.Sprite = null;

    @property(cc.Sprite)
    starsIcons: Array<cc.Sprite> = [];

    @property(cc.SpriteFrame)
    brightStars: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    emptyStars: cc.SpriteFrame = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    toData = null;

    isTips: boolean = false;

    skillIconID:number;
    petId: number = null;
    petDetail: PetDetail = null;

    // onLoad () {}

    start() {
        this.initEvents();
    }
    initEvents() {
        this.setupBtn.node.on(cc.Node.EventType.TOUCH_END, this.toTips.bind(this));
        this.nameBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.renamePet.bind(this)));
        this.refiningBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openRefiningPanel.bind(this)));
        this.skillIcon.node.on(cc.Node.EventType.TOUCH_END,this.showSkillTips.bind(this));
        this.model.node.on(cc.Node.EventType.TOUCH_END,CommonUtils.aloneFunction(this.showTips.bind(this)));
        this.closeTip.on(cc.Node.EventType.TOUCH_END,CommonUtils.aloneFunction(this.toTips.bind(this)));

        this.toTips();
    }

    showSkillTips(event) {
        CommonUtils.showPetSkillTips(this.skillIconID)(event);
    }

    async setData(petDetail: PetDetail, toData =null) {
        this.petDetail = petDetail;
        this.petId = petDetail.pet.id;
        this.toData = toData;
        let pet = petDetail.pet;
        this.namelabel.string = `${pet.petName} ${PlayerData.getInstance().playerLevel}级`;
        let attributes = await PetData.getAttributes(petDetail);
        this.powerlabel.string = attributes.fc.toString();
        this.starsIcons.forEach((icon, index) => {
            if (index < pet.maxRank) {
                icon.node.active = true;
                icon.spriteFrame = this.emptyStars;
                if (index < pet.rank) {
                    icon.spriteFrame = this.brightStars;
                }
            } else {
                icon.node.active = false;
            }
        });
        
        let config = await PetData.getConfigById(pet.definitionId);
        if(config.isValid()){
            let activeSkill = config.getValue().activeSkill;
            let skillIconID;
            if (pet.rank >= 10) {
                skillIconID = activeSkill.snd;
            } else {
                skillIconID = activeSkill.fst;
            }
            this.skillIconID = skillIconID;
            this.skillIcon.spriteFrame = await ResUtils.getPetActSkillIconById(skillIconID);;
            this.model.spriteFrame = null;
    
            this.initMc(config.val.prefabId);
        }
		//
		if (pet.rank >= 10) {
			const action = cc.repeatForever(cc.rotateTo(10, 360))
			this.bgLighting.node.active = true;
			this.bgLighting.node.runAction(action)
		} else {
			this.bgLighting.node.active = false;
		}
    }

    async openRefiningPanel() {
        this.toTips();
        let panel = await CommonUtils.getPanel('gameplay/pet/petRefiningPanel', PetRefiningPanel) as PetRefiningPanel;
        let parentJ = this.node.parent.getComponent(PetAttributePanel);
        panel.from = parentJ;
        parentJ.node.parent.parent.active = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    toTips() {
        if (this.isTips) {
            this.refiningBtn.node.parent.active = true;
            this.isTips = false;
        } else {
            this.refiningBtn.node.parent.active = false;
            this.isTips = true;
        }
    }
    
    
    async initMc (prefabId: number) {
        let sample = prefabId == 4100014 ? 10 : 16;
        let animationClip = await MovieclipUtils.getMovieclip(prefabId, 'idle_ld', sample);
        let animation = this.model.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId + '_idle_ld');
        this.model.node.anchorX = offset.x;
        this.model.node.anchorY = offset.y;
    }

    async renamePet() {
        if (!this.petId) {
            return;
        }
        this.toTips();
        let panel = await CommonUtils.getPanel('gameplay/pet/petRenamePanel', PetRenamePanel) as PetRenamePanel;
        panel.init(this.petId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async showTips(){
        let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
        panel.init(this.petDetail);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
}
