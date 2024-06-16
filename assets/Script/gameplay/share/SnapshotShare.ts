import * as MagicQRCode from "../../component/MagicQRCode";
import { TipsManager } from "../../base/TipsManager";
import { CommonUtils } from "../../utils/CommonUtils";
import { GameConfig } from "../../config/GameConfig";
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
export default class SnapshotShare extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    copyBtn: cc.Button = null;

    @property(MagicQRCode)
    qrcode = null;

    @property(cc.Label)
    codeLabel: cc.Label = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    from: cc.Node = null;
    url: string = 'http://www.kxiyou.com/kxy?invite_code='
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.copyBtn.node.on(cc.Node.EventType.TOUCH_END, this.copy.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
    }

    init (code) {
        this.codeLabel.string = code.toString();
        this.qrcode.string = this.url + this.codeLabel.string;
    }

    copy() {
        let content = "邀请你加入全球华人首款区块链MMORPG《块西游》！："
                        + this.url + this.codeLabel.string
                        + "，注册账号输入邀请码："
                        + this.codeLabel.string
                        + "，领取受邀奖励！加入官方Q群："
                        + GameConfig.currentQQGroup
                        + "、关注“块西游”微信公众号，享受能量回复速度翻倍特权！还有最新福利与赚币活动，等你参与！"

        function copyTextToClipboard(text) {
            var textArea = document.createElement("textarea")
            textArea.style.position = 'fixed'
            textArea.style.top = '0'
            textArea.style.left = '0'
            textArea.style.width = '2em'
            textArea.style.height = '2em'
            textArea.style.padding = '0'
            textArea.style.border = 'none'
            textArea.style.outline = 'none'
            textArea.style.boxShadow = 'none'
            textArea.style.background = 'transparent'
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            this.iosCopyToClipboard(textArea);
            TipsManager.showMessage('复制成功！快去发送给好友吧！');
            document.body.removeChild(textArea);
        }

        copyTextToClipboard.bind(this)(content);
    }

    iosCopyToClipboard(el) {
        var oldContentEditable = el.contentEditable,
            oldReadOnly = el.readOnly,
            range = document.createRange();
    
        el.contenteditable = true;
        el.readonly = false;
        range.selectNodeContents(el);
    
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);
    
        el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.
    
        el.contentEditable = oldContentEditable;
        el.readOnly = oldReadOnly
        document.execCommand('copy');
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }

    // update (dt) {}
}
