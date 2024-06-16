import ItemWithEffect from "../../base/ItemWithEffect";
import { CommonUtils } from "../../utils/CommonUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KBWheelAwardItemNew extends cc.Component {
  @property(cc.Sprite)
  bg: cc.Sprite = null;

  @property(ItemWithEffect)
  item: ItemWithEffect = null;

  @property(cc.Label)
  nameLabel: cc.Label = null;

  currencyId: number = 150;

  stack = {
    currencyId: 150,
    amount: 0
  }

  start() {
    this.node.on(cc.Node.EventType.TOUCH_END, (e) => {
      CommonUtils.showCurrencyTips(this.stack)(e);
    });
  }

  init(data: { currencyId: number, amount: number }) {
    this.item.initWithCurrency(data)
    this.stack = data
  }
}
