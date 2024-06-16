import ArticleItem from "../bag/ArticleItem";
import { CommonUtils } from "../../utils/CommonUtils";
import { PlayerBaseInfo, CurrencyRecord } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { ResUtils } from "../../utils/ResUtils";
import DigOreFriendPanel from "./DigOreFriendPanel";
import Optional from "../../cocosExtend/Optional";
import BagItem from "../../bag/BagItem";
import PlayerData from "../../data/PlayerData";
import { ItemCategory } from "../../bag/ItemConfig";

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
export default class DigOreFListItem extends cc.Component {

    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Sprite)
    shoolIcon: cc.Sprite = null;

    @property(ArticleItem)
    articleItem: ArticleItem = null;

    @property(cc.Button)
    pickBtn: cc.Button = null;
    @property(cc.Node)
    already: cc.Node = null;

    id = 0;
    from: DigOreFriendPanel = null;
    start() {
        this.pickBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onBtn.bind(this)));
    }

    async init(id: number, playerId: number, isPick: boolean) {
        this.id = id;
        let data: PlayerBaseInfo = null;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [playerId]) as any;
        if (response.status === 0) {
            data = response.content[0];
        }
        if (data != null) {
            this.playerIcon.spriteFrame = await ResUtils.getPlayerRectIconById(data.player.prefabId);
            this.shoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional(data.schoolId));
            this.nameLabel.string = data.player.playerName;
            this.levelLabel.string = data.player.playerLevel + '级';
            this.pickBtn.node.active = isPick;
            this.already.active = !isPick;

            let bagItemA = new BagItem();
            let date = {} as CurrencyRecord;
            date.currencyId = 169;
            date.amount = 10;
            date.accountId = PlayerData.getInstance().accountId;
            bagItemA.category = ItemCategory.Currency;
            bagItemA.data = date;

            await this.articleItem.init(bagItemA, false);
            this.articleItem.setIsUse(false);
        }
    }

    async onBtn() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mineExploration/coupon', [this.id]) as any;
        if (response.status === 0) {
            if (this.from != null) {
                this.from.from.overall = response.content;
                this.from.init(this.from.from.overall.coupons);
            }
        }
    }

    // update (dt) {}
}
