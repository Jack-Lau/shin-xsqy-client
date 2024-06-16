import { CommonUtils } from "../../../utils/CommonUtils";
import { GoldTowerWipeOut, CurrencyStack, GoldTowerChallengeEntity } from "../../../net/Protocol";
import SweepJGTTips from "./SweepJGTTips";
import { NetUtils } from "../../../net/NetUtils";

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
export default class SweepJGTPanel extends cc.Component {

    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Label)
    experienceLabel: cc.Label = null;

    @property(cc.Node)
    effNode: cc.Node = null;
    @property(cc.Prefab)
    effPrefab: cc.Prefab = null;

    earningBoxPool: cc.NodePool;

    callback = () => {};

    initPool () {
        this.earningBoxPool = new cc.NodePool();
        for (let i = 0; i < 5; ++i) {
            let enemy = cc.instantiate(this.effPrefab); // 创建节点
            this.earningBoxPool.put(enemy); // 通过 putInPool 接口放入对象池
        }
    }

    createEnemy(parentNode, enemyPool, itemPrefab) {
        let enemy = null;
        if (enemyPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            enemy = enemyPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            enemy = cc.instantiate(itemPrefab);
        }
        enemy.parent = parentNode;
        return enemy;
    }

    async closeEarningBox(box: cc.Node, time = 0) {
        await CommonUtils.wait(time);
        // enemy 应该是一个 cc.Node
        this.earningBoxPool.put(box); // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
    }

    start() {
        this.confirmBtn.node.parent.active = false;
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    init (callback) {
        this.initPool();
        this.callback = callback;
    }

    async playTween(data: CurrencyStack[], experience) {
        let contents = data;
        let time = 2;
        for (let currencyStack of contents) {
            let enemy = this.createEnemy(this.effNode, this.earningBoxPool, this.effPrefab);
            let tips = enemy.getComponent(SweepJGTTips) as SweepJGTTips;
            tips.startanimation(currencyStack);
            this.closeEarningBox(enemy, time);
            await CommonUtils.wait(0.05);
        }
        this.experienceLabel.string = experience.toString();
        await CommonUtils.wait(time - 0.5);
        this.confirmBtn.node.parent.active = true;
        this.confirmBtn.node.parent.scale = 5;
        let action = cc.scaleTo(0.2, 1, 1);
        this.confirmBtn.node.parent.runAction(action);
    }

    // update (dt) {}
    closePanel() {
        // this.callback();
        NetUtils.post<GoldTowerChallengeEntity>('/goldTower/takeWipeOutAward', [])
        CommonUtils.safeRemove(this.node);
    }
}
