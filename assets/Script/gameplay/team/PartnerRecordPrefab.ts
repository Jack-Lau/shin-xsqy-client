import { CommonUtils } from "../../utils/CommonUtils";

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
export default class PartnerRecordPrefab extends cc.Component {
    @property(cc.RichText)
    content: cc.RichText = null;
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.SpriteFrame)
    sf1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sf2: cc.SpriteFrame = null;

    start () {

    }

    init(isStart: boolean, time: number, name: string, fee?: number) {
        let timeInfo = CommonUtils.getTimeInfo(time);
        if (isStart) {
            this.iconSprite.spriteFrame = this.sf1;
            this.content.string = `${timeInfo.month}月${timeInfo.day}日${timeInfo.hour}时${timeInfo.minute}分，<color=#F66C4A>${name}</color>邀请你为其助战（获得${fee}元宝佣金）`;
        } else {
            this.iconSprite.spriteFrame = this.sf2;
            this.content.string = `${timeInfo.month}月${timeInfo.day}日${timeInfo.hour}时${timeInfo.minute}分，你结束了对<color=#F66C4A>${name}</color>的助战`;
        }
    }

}
