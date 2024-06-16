import { CommonUtils } from "../utils/CommonUtils";
import { TipsManager } from "../base/TipsManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GuideBind extends cc.Component {
    @property(cc.Sprite)
    backSp: cc.Sprite = null;

    @property(cc.Button)
    copyBtn: cc.Button = null;

    from: cc.Node = null;

    start () {
        this.copyBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            CommonUtils.copyToClipBoard('http://www.kxiyou.com/kxy/');
            TipsManager.showMessage('复制成功！');
        });
        this.backSp.node.on(cc.Node.EventType.TOUCH_END, this.back.bind(this));
    }

    back() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }
}
