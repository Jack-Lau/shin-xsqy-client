import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";

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
export default class ExchangePanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.EditBox)
    input: cc.EditBox = null;

    @property(cc.Sprite)
    blockImage: cc.Sprite = null;

    from: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmCode.bind(this));
        this.blockImage.node.on(cc.Node.EventType.TOUCH_END, () => {});
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
        if (this.from) {
            this.from.active = true;
        }
    }

    async confirmCode() {
        if (PlayerData.getInstance().playerLevel < 30) {
            TipsManager.showMessage('少侠等级不足30，赶紧去完成主线任务升级吧')
            return;
        }
        let code = this.input.string;
        code = code.trim();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/gift/redeem', [code]) as any;
        if (response.status == 0) {
            this.input.string = '';
            TipsManager.showMessage("兑换成功！请查收邮件~");
        }
        // 
    }

    // update (dt) {}
}
