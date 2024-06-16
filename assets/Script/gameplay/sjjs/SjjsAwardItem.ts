import ItemWithEffect from "../../base/ItemWithEffect";
import { ResUtils } from "../../utils/ResUtils";
import { ItemQuality } from "../../bag/ItemConfig";
import { CurrencyStack } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";

const {ccclass, property} = cc._decorator; 

@ccclass
export default class SjjsAwardItem extends cc.Component {
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    @property(cc.Sprite)
    bgSp: cc.Sprite = null;
    stack : CurrencyStack = {currencyId: 150, amount: 0};

    start () {
        this.item.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
    }

    init (stack: Optional<CurrencyStack>) {
        if (stack.valid) {
            this.initItemAsCurrency(stack.val)
            this.stack = stack.val;
        }
        this.item.node.active = stack.valid;
    }

    async initItemAsCurrency(stack: CurrencyStack) {
        this.item.initWithCurrency(stack);
    }

    showTips (e) {
        CommonUtils.showCurrencyTips(this.stack)(e);
    }
}