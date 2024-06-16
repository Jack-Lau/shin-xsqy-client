import { CommonUtils } from "../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonTips extends cc.Component {
    @property(cc.RichText)
    content: cc.RichText = null;

    start() {

    }

    init(contentStr: string) {
        // 识别并替换文字为图片
        // v1 不实现相关功能
        this.content.string = CommonUtils.textToRichText(contentStr);
        setTimeout(this.close.bind(this), 1500);
    }

    close() {
        CommonUtils.safeRemove(this.node);
    }
}