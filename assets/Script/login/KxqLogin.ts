import { CommonUtils } from "../utils/CommonUtils";
import GuideBind from "./GuideBind";
import { NetUtils } from "../net/NetUtils";
import { GameConfig } from "../config/GameConfig";
import SecondConfirmBox from "../base/SecondConfirmBox";
import { TipsManager } from "../base/TipsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KxqLogin extends cc.Component {
    // 氪星球登录
    @property(cc.Button)
    registerNew: cc.Button = null;
    @property(cc.Button)
    bindOld: cc.Button = null;

    start() {

    }

    init(ticket, callback) {
        this.bindOld.node.on(cc.Node.EventType.TOUCH_END, this.openGuideBind.bind(this));
        let cb = this.registerNewKXQ(ticket, callback).bind(this);
        this.registerNew.node.on(cc.Node.EventType.TOUCH_END, this.openSecondConfirmBox(cb).bind(this));
    }

    async openGuideBind() {
        let prefab = await CommonUtils.getPanelPrefab('login/GuideBind') as cc.Prefab;
        let guideBind = cc.instantiate(prefab).getComponent(GuideBind);
        [guideBind.node.x, guideBind.node.y] = [0, 0];
        guideBind.node.height = CommonUtils.getViewHeight();
        guideBind.from = this.node;
        this.node.active = false;
        guideBind.node.parent = this.node.parent;
    }

    openSecondConfirmBox(cb) {
        return async function() {
            let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
            let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
            [scb.node.x, scb.node.y] = [0, 0];
            scb.node.height = CommonUtils.getViewHeight();
            scb.init('创建新账号后，不可使用该氪星球账号绑定其它块西游账号', cb);
            scb.from = this.node;
            scb.node.parent = this.node.parent;
        }.bind(this);
    }

    registerNewKXQ(ticket, callback) {
        return async function () {
            // 使用ticket登录
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/account/login-kexingqiu', [ticket]) as any;
            if (response.status == 0) {     
                GameConfig.isFromKXQ = true;               
                let newAccount = response.content.newAccount;
                if (newAccount) {
                    window['TDGA'] && TDGA.onEvent('氪星球新注册', { "from": "kxq" });
                    let statisticKXQ = function () {
                        window['TDGA'] && TDGA.onEvent('注册', { "from": "kxq" });
                    }
                    setTimeout(statisticKXQ, 1000);
                }
                CommonUtils.safeRemove(this.node);
                callback();
            } else if (response.status === 109) {
                let accountId = R.path(['error', 'accountId'], response);
                if (accountId) {
                    TipsManager.showMessage('账号已被封禁, 请联系客服, 账号ID为' + accountId);
                } else {
                    TipsManager.showMessage('账号已被封禁, 请联系客服');
                }
            }
        }.bind(this);
    }
    // update (dt) {}
}
