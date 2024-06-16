import { CommonUtils } from "../utils/CommonUtils";
import { QuestProxy } from "../quest/QuestProxy";
import { QuestManager } from "../quest/QuestManager";

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
export default class GuidePanel extends cc.Component {
    @property(cc.Button)
    startBtn: cc.Button = null;
    @property(cc.Node)
    welcomeNode: cc.Node = null
    @property(cc.Node)
    down: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;

    isOn = true;
    startY: number = 0;
    maxY: number = 0;
    start() {
        if (cc.winSize.height / cc.winSize.width < 16 / 9) {
            this.node.scale = cc.winSize.height / 1366;
            this.welcomeNode.scale = cc.winSize.height / 1366;
        }
        this.startY = this.tips.y;
        this.maxY = 20;
        this.down.parent.active = false;
        this.initEvents();
    }

    initEvents() {
        this.startBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.welcomeNode.active = false;
            this.down.parent.active = true;
        });
        this.down.on(cc.Node.EventType.TOUCH_END, () => {
            let data = QuestProxy.currentQuest;
            if (data.getValue()) {
                let questId = data.getValue().questId;
                QuestManager.gotoNpcByQuestId(questId);
            }
            this.closePanel();
        });
    }
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    update(dt) {
        if (this.isOn) {
            this.tips.y += dt * this.maxY;
            if (this.tips.y >= this.startY + this.maxY) {
                this.isOn = false;
            }
        } else {
            this.tips.y -= dt * this.maxY;
            if (this.tips.y <= this.startY) {
                this.isOn = true;
            }
        }
    }
}
