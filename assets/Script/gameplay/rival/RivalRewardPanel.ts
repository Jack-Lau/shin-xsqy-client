import { CommonUtils } from "../../utils/CommonUtils";
import ArticleItem from "../bag/ArticleItem";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import BagItem from "../../bag/BagItem";
import { CurrencyRecord } from "../../net/Protocol";

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
export default class RivalRewardPanel extends cc.Component {

    @property(cc.Node)
    close: cc.Node = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Node)
    boxText: cc.Node = null;
    @property(cc.Node)
    closeText: cc.Node = null;
    @property(cc.Sprite)
    box: cc.Sprite = null;
    @property(cc.SpriteFrame)
    boxSps: cc.SpriteFrame[] = [];

    @property(cc.Toggle)
    listToggle: cc.Toggle[] = [];

    @property(ArticleItem)
    items: ArticleItem[] = [];

    @property(cc.Label)
    labels: cc.Label[] = [];

    @property(cc.Animation)
    boxAnim: cc.Animation = null;

    @property(cc.Animation)
    listAnim: cc.Animation[] = [];

    awardPartition = 0;

    listVec2: cc.Vec2[][] = [
        [cc.v2(0, 0)],
        [cc.v2(-140, 0), cc.v2(140, 0)],
        [cc.v2(-230, 0), cc.v2(0, 0), cc.v2(230, 0)],
        [cc.v2(-230, 0), cc.v2(0, 160), cc.v2(230, 0), cc.v2(0, -160)]
    ];

    // onLoad () {}

    start() {
        this.showBox();
        this.box.node.active = true;
        this.content.active = false;
        this.boxText.active = true;
        this.closeText.active = false;

    }

    async init(awardPartition: number, rewardId: number, max: number) {
        this.awardPartition = awardPartition;
        this.box.spriteFrame = this.boxSps[awardPartition - 2];
        let amounts: number[] = [];
        // amounts.length = awardPartition;
        // let number = max / awardPartition - max / awardPartition / 2;
        // let num = 0;
        // for (let i = 0; i < amounts.length - 1; i++) {
        //     amounts[i] = Math.floor(Math.random() * number + max / awardPartition / 2);
        //     num += amounts[i];
        // }
        let randomArr = [Math.random()];
        for (let i = 0; i < awardPartition - 1; ++i) {
            let rand = Math.random() * (1 - R.sum(randomArr));
            randomArr.push(rand);
        }
        randomArr = randomArr.map(x => x * 0.5 + 0.5 / awardPartition);
        amounts = randomArr.map(x => Math.floor(x * max));
        while (R.sum(amounts) < max) {
            amounts[amounts.length - 1] += 1;
        }

        this.listToggle.forEach(async (toggle, index) => {
            if (index < awardPartition) {
                toggle.node.active = true;
                toggle.node.position = this.listVec2[awardPartition - 1][index];

                let display = await ItemConfig.getInstance().getItemDisplayById(rewardId, PlayerData.getInstance().prefabId);
                this.labels[index].string = display.fmap(x => x.name).getOrElse('元宝') + ' ' + amounts[index] + '个';
                let bagItem = new BagItem();
                let date = {} as CurrencyRecord;
                date.currencyId = rewardId;
                date.amount = amounts[index];
                date.accountId = PlayerData.getInstance().accountId;

                bagItem.category = ItemCategory.Currency;
                bagItem.data = date;
                this.items[index].init(bagItem, false);

            } else {
                toggle.node.active = false;
            }
        });

    }

    async onToggle(tgl, index) {
        this.listToggle[index].enabled = false;
        this.listToggle[index].isChecked = false;
        //动画
        await CommonUtils.wait(this.listAnim[index].play().duration / 2);
        this.listToggle[index].isChecked = true;
        let isClose = false;
        let m = 0;
        this.listToggle.forEach((toggle) => {
            if (toggle.isChecked) {
                m += 1;
            }
        });
        if (m == this.awardPartition) {
            isClose = true;
        }
        this.boxText.active = !isClose;
        this.closeText.active = isClose;
        if (isClose) {
            this.close.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        }
    }

    async showBox() {
        this.boxAnim.play();
        await CommonUtils.wait(1.5);
        this.boxAnim.stop();
        this.box.node.active = false;
        this.content.active = true;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
