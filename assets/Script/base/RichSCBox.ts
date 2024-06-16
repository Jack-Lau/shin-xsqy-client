import { CommonUtils } from "../utils/CommonUtils";
import Optional from "../cocosExtend/Optional";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RichSecondConfirmBox extends cc.Component {
    @property(cc.RichText)
    content: cc.RichText = null;
    @property(cc.RichText)
    description1: cc.RichText = null;
    @property(cc.Label)
    description2: cc.Label = null;
    @property(cc.Node)
    description2Node: cc.Node = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Button)
    cancelBtn: cc.Button = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    from: cc.Node = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.cancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    init(content: string, description1: Optional<string>, description2: Optional<string>, callback) {
        this.content.string = content;
        this.description1.node.active = description1.valid;
        this.description2Node.active = description2.valid;
        this.description1.string = description1.getOrElse("");
        this.description2.string = description2.getOrElse("");
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            this.closePanel();
            callback();
        }.bind(this));
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }
}
