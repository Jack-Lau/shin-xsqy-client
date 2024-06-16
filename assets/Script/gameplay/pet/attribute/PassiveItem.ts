import { PetDetail } from "../../../net/Protocol";
import { ResUtils } from "../../../utils/ResUtils";
import { SkillItemState } from "../PetSkillItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import { TipsManager } from "../../../base/TipsManager";

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
enum SkillState {Inactive, Locked,Empty, Skill}
@ccclass
export default class PassiveItem extends cc.Component {

    @property(cc.Node)
    lock: cc.Node = null;
    @property(cc.Node)
    unknown: cc.Node = null;
    @property(cc.Sprite)
    skill: cc.Sprite = null;
    @property(cc.Animation)
    anim: cc.Animation = null;
    state: SkillState;
    skillID:number;
    isLearn:boolean;
    onLoad () {
        this.isLearn = false;
        this.node.on(cc.Node.EventType.TOUCH_END, this.showStateTips.bind(this));
    }

    toLearn(){
        this.isLearn = true;
    }

    toNull() {
        this.state = SkillState.Empty;
        this.lock.active = false;
        this.skill.node.active = false;
        this.unknown.active = false;
    }

    tolock() {
        this.state = SkillState.Locked;
        this.lock.active = true;
        this.skill.node.active = false;
        this.unknown.active = false;
    }

    toUnknown() {
        this.state = SkillState.Inactive;
        this.skill.node.active = false;
        this.lock.active = false;
        this.unknown.active = true;
    }

    async toSkill(skillID: number) {
        this.skillID = skillID;
        this.state = SkillState.Skill;
        this.skill.node.active = true;
        this.skill.spriteFrame = await ResUtils.getPetSkillIconById(skillID);
        this.lock.active = false;
        this.unknown.active = false;
    }

    showStateTips(event) {
        if(this.isLearn){
            if (this.state === SkillState.Locked) {
                TipsManager.showMessage('该宠物不可激活该技能位');
            } else if (this.state === SkillState.Inactive) {
                TipsManager.showMessage('该技能在冲星等级为4时激活');
            } else if (this.state === SkillState.Skill) {
                CommonUtils.showPetSkillTips(this.skillID)(event);          
            }else{
                TipsManager.showMessage('可在“技能”页签中习得新的宠物技能');
            }
        }else{
            if (this.state === SkillState.Locked) {
                TipsManager.showMessage('该宠物不可激活该技能位');
            } else if (this.state === SkillState.Inactive) {
                TipsManager.showMessage('宠物冲星到4级时可激活该绝世技能');
            } else if (this.state === SkillState.Skill) {
                CommonUtils.showPetSkillTips(this.skillID)(event);          
            }else{
                TipsManager.showMessage('可在“技能”页签中习得新的宠物技能');
            }
        }
       
    }

    showAnim(){
        let state = this.anim.play('pet_skill_learn');
        state.speed = 0.5
        return state.duration;
    }

}
