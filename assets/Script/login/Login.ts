import { CommonUtils } from "../utils/CommonUtils";
import LoginBoxPrefab from "./LoginBoxPrefab";
import { NetUtils } from "../net/NetUtils";
import SelectPlayer from "./SelectPlayer";
import { Notify } from "../config/Notify";
import PlayerData from "../data/PlayerData";
import { GameConfig } from "../config/GameConfig";
import { TipsManager } from "../base/TipsManager";
import UpdateNewsPanel from "./UpdateNewsPanel";
import GuideBind from "./GuideBind";
import { OpenApp } from "../utils/OpenApp";
import { Web3Utils } from "../net/Web3Utils";
import KxqLogin from "./KxqLogin";
import { GameInit } from "../map/GameInit";
import TaptapLogin from "./TaptapLogin";
import { onCaptcha, onSigninWithAppleSuccess, onTapLoginSuccess } from "../utils/NativeUtils";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import AppleLogin from "./AppleLogin";
import UpdateNotify from "./UpdateNotify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {
    @property(cc.Sprite)
    bgSp: cc.Sprite = null;

    @property(cc.Button)
    startGameButton: cc.Button = null;

    @property(cc.Sprite)
    confirmBgSprite: cc.Sprite = null;

    @property(cc.Sprite)
    confirmSprite: cc.Sprite = null;

    @property(cc.Layout)
    welcome: cc.Layout = null;

    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Button)
    logoutBtn: cc.Button = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Layout)
    tipsLayer: cc.Layout = null;

    @property(cc.Layout)
    panelLayer: cc.Layout = null;

    @property(cc.Layout)
    userProtocol: cc.Layout = null;

    @property(cc.Sprite)
    openProtocol: cc.Sprite = null;

    @property(cc.Button)
    closeProtocolBtn: cc.Button = null;

    @property(cc.Button)
    updateNewsBtn: cc.Button = null;

    @property(cc.Sprite)
    newsReddot: cc.Sprite = null;

    @property(cc.Label)
    versionLabel: cc.Label = null;

    @property(cc.Button)
    backKxqBtn: cc.Button = null;

    @property(cc.Sprite)
    updatingSp: cc.Sprite = null;

    @property(cc.Node)
    updatingNode: cc.Node = null;

    @property(TaptapLogin)
    taptapLogin: TaptapLogin = null;

    @property(AppleLogin)
    appleLogin: AppleLogin = null;

    index = 0;

    @property([cc.SpriteFrame])
    testSF: Array<cc.SpriteFrame> = [];

    // LIFE-CYCLE CALLBACKS:

    _x: number = 0;

    get x() {
        return this._x;
    }

    set x(value) {
        // eve
        this._x = value;
    }


    // onLoad () {}

    async start() {
        console.log("on login =====> ")
		this.node.opacity = 0;
        window['onTapLoginSuccess'] = onTapLoginSuccess;
        window['onSigninWithAppleSuccess'] = onSigninWithAppleSuccess;
        window['onCaptcha'] = onCaptcha;
        EventDispatcher.on(Notify.ON_TAP_LOGIN_SUCCESS, (data: {detail: {accessToken: string, macKey: string}}) => {
            let { accessToken, macKey } = data.detail
            this.loginWithTap(accessToken, macKey);
        })
        EventDispatcher.on(Notify.ON_APPLE_SIGNIN_SUCCESS, (data: {detail: {code: string; token: string}}) => {
            let {code, token} = data.detail
            this.signinWithApple(code, token)
        })


        EventDispatcher.on(Notify.OPEN_PANEL, this.openPanel.bind(this));

        this.startGameButton.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.startGame.bind(this)))
        this.confirmBgSprite.node.on(cc.Node.EventType.TOUCH_END, this.confirm.bind(this));
        this.node.on(Notify.LOGIN, this.checkMyself.bind(this));
        this.logoutBtn.node.on(cc.Node.EventType.TOUCH_END, this.logout.bind(this));
        this.closeProtocolBtn.node.on(cc.Node.EventType.TOUCH_END, this.closeProtocol.bind(this));
        // this.openProtocol.node.on(cc.Node.EventType.TOUCH_END, this.openUserProtocol.bind(this));
        this.node.on(Notify.OPEN_PROTOCOL, this.openUserProtocol.bind(this));
		this.openProtocol.node.on(cc.Node.EventType.TOUCH_END, this.openUpdateNews.bind(this));
        this.updateNewsBtn.node.on(cc.Node.EventType.TOUCH_END, this.openUpdateNews.bind(this));
        this.backKxqBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            window['kr'] && window['kr'].close();
        });

        let viewHeight = CommonUtils.getViewHeight();
        if (viewHeight > 1366) {
            [this.bgSp.node.width, this.bgSp.node.height] = [viewHeight / 1366 * 768, viewHeight];
        }
        this.versionLabel.string = GameConfig.VERSION + '\n' + GameConfig.DATE;

        await GameInit.syncTime();
        this.x = 10;
        if ((GameConfig.serverIsOff || GameConfig.whiteListIsOn) && !GameConfig.is138) {
            this.showServerUpdating();
        }
        let search = CommonUtils.getWindowSearch();
        if (search) {
            let kxq_token = CommonUtils.getUrlParams(search, 'kxq_token');
            if (kxq_token) {    // 尝试氪星球登录
                GameConfig.isFromKXQ = true;
                this.backKxqBtn.node.active = true;
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/register/createTicket', [kxq_token]) as any;
                if (response.status == 0) {
                    let ticket = response.content.ticketId;
                    if (response.content.registered) { // 已有账号，直接登录
                        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login-kexingqiu', [ticket]) as any;
                        if (response2.status == 0) {
                            this.checkMyself();
                        } else if (response2.status === 109) {
                            let accountId = R.path(['error', 'accountId'], response2);
                            if (accountId) {
                                TipsManager.showMessage('账号已被封禁, 请联系客服, 账号ID为 ' + accountId);
                            } else {
                                TipsManager.showMessage('账号已被封禁, 请联系客服');
                            }
                        }
                    } else {
                        this.blockBg.node.off(cc.Node.EventType.TOUCH_END, this.block);
                        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.block);
                        let kxqLoginPrefab = await CommonUtils.getPanelPrefab('login/kxqLogin') as cc.Prefab;
                        let loginBox = cc.instantiate(kxqLoginPrefab).getComponent(KxqLogin);
                        [loginBox.node.x, loginBox.node.y] = [0, 0];
                        loginBox.init(ticket, this.checkMyself.bind(this));
                        loginBox.node.parent = this.panelLayer.node;
                    }
                }
            }
        }

        if (!GameConfig.isFromKXQ) {
            await this.checkMyself();
        }

        if (window && window.location) {
            let search = window.location.search;
            let invite_code = CommonUtils.getUrlParams(search, 'invite_code');
            if (invite_code) {
                PlayerData.getInstance().inviteCode = invite_code;
            }
        }
		//
		let action = cc.fadeTo(0.5, 255);
		this.node.runAction(action);
    }

    loaded = false

    async startGame() {
        if (this.loaded) {
            return;
        }
        if (this.checkUpdate()) {
            return;
        }
        if (!this.confirmSprite.node.active) {
            TipsManager.showMsgFromConfig(1506);
            return;
        }
        if (!GameConfig.isInGame) {
            TipsManager.showMessage('登录失败，请重新登录');
            return;
        }
		//
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/', []) as any;
        if (response.status == 0) {
			let serialNumber = response.content.serialNumber;
			if (serialNumber != null && GameConfig.SERIAL_NUMBER < serialNumber) {
				this.startGameButton.node.active = false;
				let prefab = await CommonUtils.getPanelPrefab('login/UpdateNotify') as cc.Prefab;
				let updateNotify = cc.instantiate(prefab).getComponent(UpdateNotify);
				updateNotify.init(response.content.clientVersion);
				[updateNotify.node.x, updateNotify.node.y] = [0, 0];
				updateNotify.node.parent = this.panelLayer.node;
				return;
			}
        } else {
            TipsManager.showMessage('获取最新版本号失败，请重试');
            return;
		}
		//
        let playerInfo = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/view/{id}', [PlayerData.getInstance().accountId]) as any;
        if (playerInfo.status == 0) {
            PlayerData.getInstance().prefabId = playerInfo.content.prefabId;
            PlayerData.getInstance().playerName = playerInfo.content.playerName;
            PlayerData.getInstance().genesis = playerInfo.content.genesis;
            PlayerData.getInstance().serialNumber = playerInfo.content.serialNumber;
            PlayerData.getInstance().playerLevel = playerInfo.content.playerLevel;

            // cc.director.loadScene('mapscene');
            if (window['TDGA']) {
                TDGA.Account({
                    accountId: PlayerData.getInstance().accountId,
                    level: playerInfo.content.playerLevel,
                    gameServer: 'Server 1',
                    accountType: GameConfig.getAccountType(),
                    age: 24,
                    accountName: playerInfo.content.playerName,
                    gender: 1,
                });
            }
            this.loaded = true
            CommonUtils.loadSceneWithProgress('mapscene');
        } else {
            // 未创建角色
            let selectPlayerPrefab = await CommonUtils.getPanelPrefab('login/selectPlayer') as cc.Prefab;
            let selectPlayer = cc.instantiate(selectPlayerPrefab).getComponent(SelectPlayer);
            [selectPlayer.node.x, selectPlayer.node.y] = [0, 0];
            selectPlayer.node.parent = this.panelLayer.node;
        }
    }

    block() {
        // nothing
    }

    openPanel(event) {
        if (!this.panelLayer) {
            return;
        }
        let panel = event.detail.panel as cc.Component;
        for (let child of this.panelLayer.node.children) {
            if (child.name == panel.node.name) {
                return;
            }
        }
        panel.node.parent = this.panelLayer.node;
    }

    async loginWithTap(accessToken: string, macKey: string) {
        const response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, "/account/login-taptap", [accessToken, macKey])
        if (response.status === 0) {
            this.checkMyself()
        } else {
            console.error(response)
        }
    }

    async signinWithApple(code: string, token: string) {
        const response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, "/account/login-apple", [code])
        if (response.status === 0) {
            this.checkMyself()
        } else {
            console.error(response)
        }
    }

    async checkMyself() {
        let myself = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/account/view/myself', []) as any;
        if (myself.status == 0) { // 登录
            if (cc.sys.isNative) {
                this.taptapLogin.node.active = false
                this.appleLogin.node.active = false
            }
            this.username.string = myself.content.displayName;
            let action1 = cc.moveTo(0.5, 384, CommonUtils.getViewHeight() - 100);
            let wait = cc.fadeTo(1, 255);
            let action2 = cc.fadeTo(0.5, 0);
            this.welcome.node.runAction(cc.sequence([action1, wait, action2]));
            PlayerData.getInstance().accountId = myself.content.id;

            await GameInit.initCurrency();
            await GameInit.initSchool();
            if (myself.content.passcodeTypes.indexOf('PASSWORD') != -1) {
                PlayerData.getInstance().phoneNumber = myself.content.username;
            }
            GameConfig.isInGame = true;
            this.blockBg.node.off(cc.Node.EventType.TOUCH_END, this.block);
        } else {
            GameConfig.isWxLogin = false;
            GameConfig.isInGame = false;
            // 跳转到登录界面
            if (cc.sys.isNative && !NetUtils.IsDebug) {
                const isIOS = cc.sys.os === cc.sys.OS_IOS
                this.taptapLogin.node.active = !isIOS
                this.appleLogin.node.active = isIOS
            } else {
                let loginBoxPrefab = await CommonUtils.getPanelPrefab('login/loginBox') as cc.Prefab;
                let loginBox = cc.instantiate(loginBoxPrefab).getComponent(LoginBoxPrefab);
                [loginBox.node.x, loginBox.node.y] = [0, 0];
                loginBox.node.parent = this.panelLayer.node;
                
            }
            this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.block);
        }
    }

    confirm() {
        this.confirmSprite.node.active = !this.confirmSprite.node.active;
    }

    async logout() {
        if (this.checkUpdate()) {
            return;
        }
        if (GameConfig.isFromKXQ) {
            TipsManager.showMessage('该环境中不允许切换账号');
            return; // kxq 账号不允许退出
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/logout', []) as any;
        if (response.status == 0) {
            // logout successfully.
            if (GameConfig.isWxLogin) {
                GameConfig.wxLogout = true;
            }
            GameConfig.isInGame = false;
            this.checkMyself();
        }
    }

    async openUpdateNews() {
        this.newsReddot.node.active = false;
        let updateNewsPrefab = await CommonUtils.getPanelPrefab('login/updateNews') as cc.Prefab;
        let updateNews = cc.instantiate(updateNewsPrefab).getComponent(UpdateNewsPanel);
        [updateNews.node.x, updateNews.node.y] = [0, 0];
        updateNews.node.height = CommonUtils.getViewHeight();
        updateNews.node.parent = this.panelLayer.node;
        // Web3Utils.testTransfer();
    }

    showServerUpdating() {
        this.updatingNode.active = true;
        this.showUpdatingTween();
    }

    async showUpdatingTween() {
        this.updatingSp.node.width = 302;
        await CommonUtils.wait(0.5);
        if (!this.updatingSp.node) return;
        this.updatingSp.node.width = 323;
        await CommonUtils.wait(0.5);
        if (!this.updatingSp.node) return;
        this.updatingSp.node.width = 344;
        await CommonUtils.wait(0.5);
        if (!this.updatingSp.node) return;
        this.updatingSp.node.width = 365;
        await CommonUtils.wait(0.5);
        if (!this.updatingSp.node) return;
        this.updatingSp.node.width = 386;
        await CommonUtils.wait(0.5);
        if (!this.updatingSp.node) return;
        await this.showUpdatingTween();
    }

    checkUpdate() {
        if ((GameConfig.serverIsOff || GameConfig.whiteListIsOn) && !GameConfig.isInGame) {
            this.showUpdatingTips();
            return true;
        } else {
            return false;
        }
    }

    showUpdatingTips() {
        TipsManager.showMessage('游戏维护中，开服时间请留意官方社群消息');
    }

    closeProtocol() {
        this.userProtocol.node.active = false;
    }

    openUserProtocol() {
        this.userProtocol.node.active = true;
    }

    // update (dt) {}
}
