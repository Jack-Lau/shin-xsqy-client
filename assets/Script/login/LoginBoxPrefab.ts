import { CommonUtils } from "../utils/CommonUtils";
import RegisterBoxPrefab from "./RegisterBoxPrefab";
import { NetUtils } from "../net/NetUtils";
import { Notify } from "../config/Notify";
import ResetPasswordPrefab from "./ResetPasswordPrefab";
import PlayerData from "../data/PlayerData";
import { GameConfig } from "../config/GameConfig";
import { TipsManager } from "../base/TipsManager";

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
export default class LoginBoxPrefab extends cc.Component {

    @property(cc.EditBox)
    phoneNumberEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    passwordEditBox: cc.EditBox = null;

    @property(cc.Label)
    forgetPasswordLabel: cc.Label = null;

    @property(cc.Button)
    loginButton: cc.Button = null;

    @property(cc.Button)
    registerButton: cc.Button = null;

    @property(cc.Sprite)
    wxLoginSprite: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.loginButton.node.on(cc.Node.EventType.TOUCH_END, this.login.bind(this));
        this.registerButton.node.on(cc.Node.EventType.TOUCH_END, this.register.bind(this));
        this.forgetPasswordLabel.node.on(cc.Node.EventType.TOUCH_END, this.resetPassword.bind(this));
        this.wxLoginSprite.node.on(cc.Node.EventType.TOUCH_END, this.wxLogin.bind(this));
    }

    async login() {
        if (GameConfig.is138) {
            let playerName = this.phoneNumberEditBox.string;
            let password = this.passwordEditBox.string;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/register/createTest', [playerName, password]) as any;
            if (response.status == 0) {
                console.log('注册成功');
            }
        }
        let playerName = this.phoneNumberEditBox.string;
        let password = this.passwordEditBox.string;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login', [playerName, password]) as any;
        if (response.status == 0) {
            let event = new cc.Event.EventCustom(Notify.LOGIN, true);
            this.node.dispatchEvent(event);
            this.close();
        } else if (response.status === 109) {
            let accountId = R.path(['error', 'accountId'], response);
            if (accountId) {
                TipsManager.showMessage('账号已被封禁, 请联系客服, 账号ID为' + accountId);
            } else {
                TipsManager.showMessage('账号已被封禁, 请联系客服');
            }
        }

        // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login', 'phoneNumber=' + this.phoneNumberEditBox.string);
    }

    async register() {
        this.node.active = false;
        let registerBoxPrefab = await CommonUtils.getPanelPrefab('login/registerBox') as cc.Prefab;
        let registerBox = cc.instantiate(registerBoxPrefab).getComponent(RegisterBoxPrefab);
        registerBox.initFrom(this.node);
        [registerBox.node.x, registerBox.node.y] = [0, 0];
        registerBox.node.parent = this.node.parent;
    }

    async resetPassword() {
        this.node.active = false;
        let resetPasswordPrefab = await CommonUtils.getPanelPrefab('login/resetPassword') as cc.Prefab;
        let resetPassword = cc.instantiate(resetPasswordPrefab).getComponent(ResetPasswordPrefab);
        resetPassword.initFrom(this.node);
        [resetPassword.node.x, resetPassword.node.y] = [0, 0];
        resetPassword.node.parent = this.node.parent;
    }

    isOkPassword() {

    }

    wxLogin() {
        let isWeixin = false;
        var ua = window.navigator.userAgent.toLowerCase();
        let match = ua.match(/MicroMessenger/i);
        if (match && match[0] == 'micromessenger') {
            isWeixin = true;
        } else {
            isWeixin = false;
        }

        if (isWeixin) {
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?' +
                'appid=wxc8044952fc683615&redirect_uri=http://www.kxiyou.com/kxy&response_type=code&scope=snsapi_userinfo&state=' + PlayerData.getInstance().inviteCode + '#wechat_redirect'
        } else {
            window.location.href = 'https://open.weixin.qq.com/connect/qrconnect?appid=wx398b673e8af78b60&redirect_uri=http://www.kxiyou.com/kxy&response_type=code&scope=snsapi_login&state=' + PlayerData.getInstance().inviteCode + '#wechat_redirect'
        }
    }

    close() {
        this.node.parent.removeChild(this.node);
    }


    // update (dt) {}
}
