import { ResUtils } from "../../utils/ResUtils";
import Either from "../../cocosExtend/Either";
import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";

const { ccclass, property } = cc._decorator;

export enum SkillItemState {Inactive, Locked, Empty}

@ccclass
export default class PetSKillItem extends cc.Component {
    @property(cc.Sprite)
    skillIcon: cc.Sprite = null;
    @property(cc.Node)
    lockedNode: cc.Node = null;
    @property(cc.Node)
    inactiveNode: cc.Node = null;
    @property(cc.Node)
    circleNode: cc.Node = null;

    currentInfo: Either<SkillItemState, number> = Either.Left(SkillItemState.Locked);

    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    init (info: Either<SkillItemState, number>) {
        this.currentInfo = info;
        if (info.isLeft) {
            this.initByState(info.val);
        } else if (info.isRight) {
            this.initBySkillId(info.val);
        }
    }

    initByState (state: SkillItemState) {
        this.skillIcon.node.active = false;
        this.inactiveNode.active = state === SkillItemState.Inactive;
        this.lockedNode.active = state === SkillItemState.Locked;
    }

    async initBySkillId (id: number) {
        this.skillIcon.node.active = true;
        this.skillIcon.spriteFrame = await ResUtils.getPetSkillIconById(id);
    }

    showTips(event) {
        if (this.currentInfo.isLeft) {
            this.showStateTips(this.currentInfo.val)
        } else {
            CommonUtils.showPetSkillTips(this.currentInfo.val)(event);
        }
    }

    showStateTips(state: SkillItemState) {
        if (state === SkillItemState.Locked) {
            TipsManager.showMessage('该宠物不可激活该技能位');
        } else if (state === SkillItemState.Inactive) {
            TipsManager.showMessage('宠物冲星到4级时可激活该绝世技能');
        } else {
            TipsManager.showMessage('可以学习宠物技能的技能位');
        }
    }
}