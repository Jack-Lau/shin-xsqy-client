import { CommonUtils } from "../utils/CommonUtils";
import { ConfigUtils } from "../utils/ConfigUtil";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonInfoPanel extends cc.Component {
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    bgFrame: cc.Sprite = null;

    @property(cc.RichText)
    contentRT: cc.RichText = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Sprite)
    title: cc.Sprite = null;

    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    init(titleSf: cc.SpriteFrame, content: string) {
        this.contentRT.string = content;
        if (titleSf) {
            this.title.spriteFrame = titleSf;
        }
    }

    update() {
        this.bgFrame.node.height = this.contentRT.node.height + 180;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}