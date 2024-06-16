import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PaiHangBJGTPanel from "./PaiHangBJGTPanel";
import JgtManager from "./JgtManager";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";

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
export default class JinGuangTaPanel extends CommonPanel {

    //*按钮事件
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    listBtn: cc.Button = null;
    @property(cc.Button)
    introduceBtn: cc.Button = null;
    @property(cc.Button)
    startBtn: cc.Button = null;
    @property(cc.Button)
    progressBtn: cc.Button = null;

    @property(cc.Label)
    progressLab: cc.Label = null;

    @property(cc.Node)
    challengePoints: Array<cc.Node> = [];
    @property(cc.Color)
    showCPcolor: cc.Color = null;
    @property(cc.Color)
    stCPcolor: cc.Color = null;

    // onLoad () {}

    start() {
        this.init();
        this.initEvents();
    }
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.introduceBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 5));
        this.startBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.startChallenge.bind(this)));
        this.listBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toPaiHangBJGTPanel.bind(this)));
        this.progressBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage("目前正在挑战的金光塔层数");
        });
    }

    async init() {
        //网络请求数据
        let challenge = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/goldTower/getGoldTowerChallenge', []) as any;
        if (challenge.status === 0) {
            this.progressLab.string = `${challenge.content.lastFloorCount + 1}层`;
            let availableChallengeCount = challenge.content.availableChallengeCount;
            this.challengePoints.forEach((point, index) => {
                point.color = this.showCPcolor;
                if (index >= availableChallengeCount)
                    point.color = this.stCPcolor;
            })

        }
    }

    // update (dt) {}

    async toPaiHangBJGTPanel() {
        let panel = await CommonUtils.getPanel('gameplay/jinguangta/PaiHangBangJGTPanel', PaiHangBJGTPanel) as PaiHangBJGTPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.node.active = false;
        panel.from = this.node;
        return panel;
    }

    async startChallenge() {
        await JgtManager.getInstance().enterJgt(true);
        this.closePanel();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
