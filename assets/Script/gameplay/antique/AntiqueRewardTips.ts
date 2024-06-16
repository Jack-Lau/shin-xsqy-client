import { ShowAward } from "../activity/ActivityData";
import { AntiqueOverall } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import RewardItem from "./RewardItem";

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
export default class AntiqueRewardTips extends cc.Component {

    @property(cc.Node)
    successBg: cc.Node = null;
    @property(cc.Node)
    failureBg: cc.Node = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Prefab)
    prefab: cc.Node = null;

    @property(cc.Label)
    textLabel: cc.Label = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    private datas: AntiqueOverall = null;

    // onLoad () {}

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
		//
		const action = cc.repeatForever(cc.rotateTo(0.5, 360))
		this.bgLighting.node.runAction(action)
    }

    init(datas: AntiqueOverall, isFailure: boolean, textString: string) {
        this.datas = datas;
        if (isFailure) {
            this.failureBg.active = true;
            this.successBg.active = false;
        } else {
            this.failureBg.active = false;
            this.successBg.active = true;
        }
        this.textLabel.string = textString;
        if (this.datas.awardResult != null) {
            let rewardAll = this.datas.awardResult.currencyStacks;
            rewardAll.forEach((item, index) => {
                if (item.amount > 0) {
                    let panel = cc.instantiate(this.prefab);
                    panel.parent = this.content;
                    panel.getComponent(RewardItem).init(item);
                }
            });
        }
    }
    // update (dt) {}
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
