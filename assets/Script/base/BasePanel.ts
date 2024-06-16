import { CommonUtils } from "../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BasePanel extends cc.Component {
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }
}