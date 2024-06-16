import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import NetManager from "../../net/NetManager";
import { OpenApp } from "../../utils/OpenApp";
import { TimerUtils } from "../../utils/TimerUtils";

const {ccclass, property} = cc._decorator;

enum PageLevel {LEVEL_1, LEVEL_2}
export enum Page {
    WALLET_1,           // 钱包1
    USER_CENTER_1,      // 用户中心1， 按钮组
    USER_CENTER_2_BIND_PHONE, // 用户中心2， 绑定手机
}

@ccclass
export default class SettingPage extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    bindBtn: cc.Button = null;
    @property(cc.Button)
    personalBtn: cc.Button = null;
    @property(cc.Button)
    secureBtn: cc.Button = null;
    @property(cc.Button)
    passwordBtn: cc.Button = null;
    @property(cc.Button)
    languageBtn: cc.Button = null;

    // titleIcon
    @property(cc.Sprite)
    titleIcon: cc.Sprite = null;
    
    // level1
    @property(cc.Node)
    userCenter1: cc.Node = null;
    @property(cc.Node)
    wallet1: cc.Node = null;

    // level2
    @property(cc.Node)
    bindPhone: cc.Node = null;
    @property(cc.Node)
    binded: cc.Node = null;
    @property(cc.Label)
    bindedPhoneNumLabel: cc.Label = null;

    @property(cc.Node)
    unbind: cc.Node = null;
    @property(cc.EditBox)
    phoneNumber: cc.EditBox = null;
    @property(cc.EditBox)
    msgCode: cc.EditBox = null;
    @property(cc.EditBox)
    password: cc.EditBox = null;
    @property(cc.EditBox)
    passwordConfirm: cc.EditBox = null;
    @property(cc.Button)
    sendMsgBtn: cc.Button = null;
    @property(cc.Sprite)
    greySendMsg: cc.Sprite = null;
    @property(cc.Sprite)
    msgCodeOk: cc.Sprite = null;
    @property(cc.Sprite)
    passwordOk: cc.Sprite = null;
    @property(cc.Sprite)
    passwordConfirmOk: cc.Sprite = null;
    @property(cc.Button)
    submit: cc.Button = null;
    @property(cc.Label)
    countDownLabel: cc.Label = null;
    

    // 返回上一层的按钮
    @property(cc.Button)
    backBtn: cc.Button = null;

    // 我的钱包
    @property(cc.Sprite)
    gotoBindPhone: cc.Sprite = null;
    @property(cc.Label)
    bindFlagLabel: cc.Label = null;
    @property(cc.Button)
    gotoKxq: cc.Button = null;

    // 纹理集
    @property(cc.SpriteAtlas)
    settingAtlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    level1Node: cc.Node = null;
    level2Node: cc.Node = null;
    pageLevel: PageLevel = PageLevel.LEVEL_1;
    level1NodeArray: Array<cc.Node> = [];
    level2NodeArray: Array<cc.Node> = [];

    from: cc.Node = null;
    interval = null;

    start () {
        this.countDownOnOpen();
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.personalBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo.bind(this));
        this.secureBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo.bind(this));
        this.passwordBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo.bind(this));
        this.languageBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo.bind(this));

        this.bindBtn.node.on(cc.Node.EventType.TOUCH_END, this.gotoLevel2.bind(this));
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, this.backBtnOnClick.bind(this));
        this.gotoBindPhone.node.on(cc.Node.EventType.TOUCH_END, this.gotoLevel2.bind(this));
        this.gotoKxq.node.on(cc.Node.EventType.TOUCH_END, () => {
            OpenApp.openApp('krypton://', 'http://t.cn/RdU7fXo');
        });

        // 绑定手机
        this.sendMsgBtn.node.on(cc.Node.EventType.TOUCH_END, this.sendMsg.bind(this));
        this.submit.node.on(cc.Node.EventType.TOUCH_END, this.submitOnClick.bind(this));

        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});

        this.level2Node = this.bindPhone;
        if (PlayerData.getInstance().phoneNumber) {
            this.unbind.active = false;
            let arr = PlayerData.getInstance().phoneNumber.split('');
            this.bindedPhoneNumLabel.string = CommonUtils.take(3, arr).join('') + '****' + CommonUtils.takeFrom(7, 4, arr).join('');
            this.binded.active = true;

            this.bindFlagLabel.string = '已绑定>';
            this.bindFlagLabel.node.color = cc.Color.fromHEX(this.bindFlagLabel.node.color, '#00ff00')
            // this.bindFlagLabel.node.color = cc.hexToColor('#00ff00');
        }
    }

    initLevel() {
        this.level1NodeArray = [
            this.userCenter1,
            this.wallet1,
        ];
        this.level2NodeArray = [
            this.bindPhone
        ]
    }

    init(page: Page) {
        this.initLevel();
        switch (page) {
            case Page.WALLET_1: {
                this.level1Node = this.wallet1;
                this.level1NodeArray.forEach(node => {
                    node.active = false;
                })
                this.level1Node.active = true;
                this.titleIcon.spriteFrame = this.settingAtlas.getSpriteFrame('icon_wodeqianbao')
                break;
            }
            case Page.USER_CENTER_1: {
                this.level1Node = this.userCenter1;
                this.level1NodeArray.forEach(node => {
                    node.active = false;
                })
                this.level1Node.active = true;
                this.titleIcon.spriteFrame = this.settingAtlas.getSpriteFrame('icon_yonghuzhongxin')
                break;
            }
            default: {
                console.log('error');
            }
        }
    }

    closePanel() {
        if (this.from) {
            CommonUtils.safeRemove(this.from);
        }
        CommonUtils.safeRemove(this.node);
        this.settingAtlas = null;

        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    showToDo() {
        TipsManager.showMessage('敬请期待~');
    }

    gotoLevel2() {
        this.pageLevel = PageLevel.LEVEL_2;
        let action1 = cc.moveTo(0.3, -544, -8);
        let action2 = cc.moveTo(0.3, 0, -8)
        this.level1Node.runAction(action1);
        this.level2Node.runAction(action2);
    }

    gotoLevel1() {
        this.pageLevel = PageLevel.LEVEL_1;
        let action1 = cc.moveTo(0.3, 0, -8);
        let action2 = cc.moveTo(0.3, 544, -8)
        this.level1Node.runAction(action1);
        this.level2Node.runAction(action2);
    }

    gotoMainPanel() {
        if (this.from) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
        this.settingAtlas = null;
    }

    backBtnOnClick() {
        if (PageLevel.LEVEL_1 == this.pageLevel) {
            this.gotoMainPanel();
        } else {
            this.gotoLevel1();
        }
    }


    // 绑定手机
    initBindPhone() {
        this.sendMsgBtn.node.on(cc.Node.EventType.TOUCH_END, this.sendMsg.bind(this));
        this.submit.node.on(cc.Node.EventType.TOUCH_END, this.submitOnClick.bind(this));
    }

    waiting = false;
    async sendMsg() {
        let phone = this.phoneNumber.string;
        if (!(/^1\d{10}$/.test(phone))) {
            TipsManager.showMsgFromConfig(1507);
            return;
        }
        if (this.waiting) {
            return;
        }
        try {
            let response = await CommonUtils.getCaptchaResponse() as any;
            // if (!response.ticket) {
            //     TipsManager.showMessage('验证失败, 请再次验证');
            //     return;
            // }
            this.waiting = true;
            let res = await NetUtils.sendHttpRequest(
                NetUtils.RequestType.POST, 
                '/account/register/requestPhoneActivation', 
                [this.phoneNumber.string, response.ticket, response.randstr]
            ) as any;
            if (res.status == 0) {
                TipsManager.showMsgFromConfig(1018);
                this.countDownOnClick();
            } else if (res.status == -1) {
                TipsManager.showMsgFromConfig(1511);
            }
        } catch (err) {
            console.log(err);
            this.waiting = false;
        }
    }

    timerCb (remain) {
        this.countDownLabel.string = remain.toString();
    }

    completeCb () {
        this.waiting = false;
        this.sendMsgBtn.node.active = true;
        this.greySendMsg.node.active = false;    
    }

    countDownOnOpen() {
        let result = TimerUtils.countDownOnOpen('SettingPagePanel', 90, 1000, this.timerCb.bind(this), this.completeCb.bind(this));
        if (result) {
            this.sendMsgBtn.node.active = false;
            this.greySendMsg.node.active = true;
            this.waiting = true;
            this.interval = result;
        }
    }

    countDownOnClick() {
        this.waiting = true;
        this.sendMsgBtn.node.active = false;
        this.greySendMsg.node.active = true;
        this.countDownLabel.string = '90'
        this.interval = TimerUtils.countDownOnClick('SettingPagePanel', 90, 1000, this.timerCb.bind(this), this.completeCb.bind(this));
    }

    wrongFlag() {
        return this.settingAtlas.getSpriteFrame('icon_cha');
    }

    rightFlag() {
        return this.settingAtlas.getSpriteFrame('icon_gou');
    }

    async checkMsgCode() {
        let code = this.msgCode.string;
        if (code.length < 6) {
            this.msgCodeOk.spriteFrame = this.wrongFlag();
            return;
        }
        let phoneNumber = this.phoneNumber.string;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/register/verifyPhoneActivation', [phoneNumber, code]) as any;
        if (response.status == 0) {
            this.msgCodeOk.spriteFrame = this.rightFlag();
        }
    }

    checkPassword() {
        if (this.password.string.length >= 6) {
            this.passwordOk.spriteFrame = this.rightFlag();
        } else {
            this.passwordOk.spriteFrame = this.wrongFlag();
        }

        this.checkConfirmPassword();
    }

    checkConfirmPassword() {
        if (this.passwordConfirm.string == this.password.string) {
            this.passwordConfirmOk.spriteFrame = this.rightFlag();
        } else {
            this.passwordConfirmOk.spriteFrame = this.wrongFlag();
        }
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
        let res = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/addPassword', [username, password, this.msgCode.string]) as any;
        if (res.status == 0) {
            PlayerData.getInstance().phoneNumber = username;
            TipsManager.showMessage('手机号绑定成功~');
            this.unbind.active = false;
            let arr = username.split('');
            this.bindedPhoneNumLabel.string = CommonUtils.take(3, arr).join('') + '****' + CommonUtils.takeFrom(7, 4, arr).join('');
            this.binded.active = true;
            let result = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login', [username, password]) as any;
            if (result.status == 0) {
                NetManager.getInstance().reconnect();
            }
        }
    }

}
