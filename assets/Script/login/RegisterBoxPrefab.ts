import { NetUtils } from "../net/NetUtils";
import { Notify } from "../config/Notify";
import { TipsManager } from "../base/TipsManager";
import Login from "./Login";
import PlayerData from "../data/PlayerData";
import { TimerUtils } from "../utils/TimerUtils";
import { CommonUtils } from "../utils/CommonUtils";

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
export default class RegisterBoxPrefab extends cc.Component {
    @property(cc.EditBox)
    phoneNumber: cc.EditBox = null;

    @property(cc.EditBox)
    msgCode: cc.EditBox = null;

    @property(cc.EditBox)
    password: cc.EditBox = null;

    @property(cc.EditBox)
    passwordConfirm: cc.EditBox = null;

    @property(cc.Button)
    resendMsg: cc.Button = null;

    @property(cc.Button)
    submit: cc.Button = null;

    @property(cc.RichText)
    protocol: cc.RichText = null;

    @property(cc.RichText)
    go2Login: cc.RichText = null;

    @property(cc.Sprite)
    msgCodeOk: cc.Sprite = null;

    @property(cc.Sprite)
    passwordOk: cc.Sprite = null;

    @property(cc.Sprite)
    passwordConfirmOk: cc.Sprite = null;

    @property(cc.Sprite)
    back: cc.Sprite = null;

    @property(cc.SpriteFrame)
    grayBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    yellowBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rightFlag: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    wrongFlag: cc.SpriteFrame = null;

    from: cc.Node = null;
    timeRange: number = 90;
    // LIFE-CYCLE CALLBACKS:

    interval = null;


    waiting: boolean = false;

    onLoad() {

    }

    start() {
        this.countDownOnOpen();
        this.resendMsg.node.on(cc.Node.EventType.TOUCH_END, this.sendMsg.bind(this));
        this.back.node.on(cc.Node.EventType.TOUCH_END, this.backToLogin.bind(this));
        this.go2Login.node.on(cc.Node.EventType.TOUCH_END, this.backToLogin.bind(this));
        this.submit.node.on(cc.Node.EventType.TOUCH_END, this.submitOnClick.bind(this));
        this.protocol.node.on(cc.Node.EventType.TOUCH_END, this.openUserProtocol.bind(this));
    }


    initFrom(from: cc.Node) {
        this.from = from;
    }

    backToLogin() {
        this.onClose();
    }

    async openCaptcha() {
        let response = await CommonUtils.getCaptchaResponse() as any;
    }

    async sendMsg() {
        let phone = this.phoneNumber.string;
        if (this.waiting) {
            return;
        }
        if (!(/^1\d{10}$/.test(phone))) {
            TipsManager.showMsgFromConfig(1507);
            return;
        }
        
        try {
            let response = await CommonUtils.getCaptchaResponse() as any;
            this.waiting = true;
            let res = await NetUtils.sendHttpRequest(
                NetUtils.RequestType.POST, 
                '/account/register/requestPhoneActivation', 
                [this.phoneNumber.string, response.ticket, response.randstr]
            ) as any;
            if (res.status == 0) {
                this.msgCode.string = res.content
                this.countDownOnClick();
            } else if (res.status == -1) {
                TipsManager.showMsgFromConfig(1511);
            }
        } catch (err) {
            this.waiting = false;
            console.log(err);
        }
    }

    timerCb (remain) {
        this.resendMsg.node.getComponentInChildren(cc.Label).string = remain.toString() + '秒后重发';
    }

    completeCb () {
        this.waiting = false;
        this.resendMsg.getComponent(cc.Sprite).spriteFrame = this.yellowBg;
        this.resendMsg.node.getComponentInChildren(cc.Label).string = '发送验证码';
    }

    countDownOnOpen() {
        let result = TimerUtils.countDownOnOpen('RegisterBoxPrefab', 90, 1000, this.timerCb.bind(this), this.completeCb.bind(this));
        if (result) {
            this.resendMsg.getComponent(cc.Sprite).spriteFrame = this.grayBg;
            this.waiting = true;
            this.interval = result;
        }
    }

    countDownOnClick() {
        this.resendMsg.getComponent(cc.Sprite).spriteFrame = this.grayBg;
        this.waiting = true;
        this.resendMsg.node.getComponentInChildren(cc.Label).string = '90秒后重发'
        this.interval = TimerUtils.countDownOnClick('RegisterBoxPrefab', 90, 1000, this.timerCb.bind(this), this.completeCb.bind(this));
    }


    async checkMsgCode() {
        let code = this.msgCode.string;
        if (code.length < 6) {
            this.msgCodeOk.spriteFrame = this.wrongFlag;
            return;
        }
        let phoneNumber = this.phoneNumber.string;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/register/verifyPhoneActivation', [phoneNumber, code]) as any;
        if (response.status == 0) {
            this.msgCodeOk.spriteFrame = this.rightFlag;
        }
    }

    checkPassword() {
        if (this.password.string.length >= 6) {
            this.passwordOk.spriteFrame = this.rightFlag;
        } else {
            this.passwordOk.spriteFrame = this.wrongFlag;
        }

        this.checkConfirmPassword();
    }

    checkConfirmPassword() {
        if (this.passwordConfirm.string == this.password.string) {
            this.passwordConfirmOk.spriteFrame = this.rightFlag;
        } else {
            this.passwordConfirmOk.spriteFrame = this.wrongFlag;
        }
    }

    onClose() {
        if (this.from) {
            this.from.active = true;
            this.from = null;
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.node.parent.removeChild(this.node);
    }

    async submitOnClick() {
        let phone = this.phoneNumber.string;
        if (!(/^1\d{10}$/.test(phone))) {
            TipsManager.showMsgFromConfig(1507);
            return;
        }
        if (this.password.string != this.passwordConfirm.string) {
            TipsManager.showMessage('密码不一致')
            return;
        }
        if (this.password.string.length < 6) {
            TipsManager.showMessage('密码太短')
            return;
        }
        let username = this.phoneNumber.string;
        let password = this.password.string;
        let res = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/register/createByPhone', [username, password, this.msgCode.string]) as any;
        if (res.status == 0) {
            TipsManager.showMessage('注册成功，正在登陆游戏');
            window['TDGA'] && TDGA.onEvent("注册", {"from": "phone"});
            let result = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login', [username, password]) as any;
            if (result.status == 0) {
                let event = new cc.Event.EventCustom(Notify.LOGIN, true);
                this.node.dispatchEvent(event);
                this.node.parent.removeChild(this.node);
            }
        }
    }

    openUserProtocol() {
        let event = new cc.Event.EventCustom(Notify.OPEN_PROTOCOL, true);
        this.node.dispatchEvent(event);
    }

    // update (dt) {}
}
