// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillTips extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    skillName: cc.Label = null;

    @property(cc.Label)
    category: cc.Label = null;

    @property(cc.RichText)
    description: cc.RichText = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.description.maxWidth = 330;
    }

    start () {

    }

    // update (dt) {}
}
