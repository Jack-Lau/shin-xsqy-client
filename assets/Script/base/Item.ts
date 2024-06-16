import { ResUtils } from "../utils/ResUtils";
import { TipsManager } from "./TipsManager";
import { CommonUtils } from "../utils/CommonUtils";
import ItemConfig from "../bag/ItemConfig";
import PlayerData from "../data/PlayerData";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Item extends cc.Component {
    @property(cc.Label)
    amountLabel: cc.Label = null;

    @property(cc.Sprite)
    bgImage: cc.Sprite = null;

    @property(cc.Sprite)
    iconImage: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    iconAltas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    frameAltas: cc.SpriteAtlas = null;
    
    currencyId = 150;
    amount = 0;

    start () {

    }

    async init (currencyId: number, amount: number) {
        this.amountLabel.string = CommonUtils.formatCurrencyAmount(amount);
        this.currencyId = currencyId;
        this.amount = amount;
		//
		let display = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId);
        display.fold(async () => console.error(`Unkown currencyId:　${currencyId}`), async d => {
            this.iconImage.spriteFrame = await ResUtils.getCurrencyIconbyId(d.iconId)
        })
        this.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    showTips () {
        if (this.currencyId == 151) {
            TipsManager.showMessage("仙石<img src='currency_icon_151'/> 有钱男子汉, 没钱汉子难!");
        } else if (this.currencyId == 150) {
            TipsManager.showMessage("元宝<img src='currency_icon_150'/> 好汉, 就是好浪费钱的汉!");
        } else if (this.currencyId == 155) {
            TipsManager.showMessage("活跃点<img src='currency_icon_155'/> 完成任务或活动获得的点数");
        }
    }
    // update (dt) {}
}
