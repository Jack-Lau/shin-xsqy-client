import ItemWithEffect from "../../base/ItemWithEffect";
import { CurrencyStack } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MysteryStoreItem extends cc.Component {
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Node)
    selectedNode: cc.Node = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Node)
    limitNode: cc.Node = null;
    @property(cc.Label)
    remainLabel: cc.Label = null;

    stack: CurrencyStack = null;
    limit: Optional<number> = Optional.Nothing();

    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    init (stack: CurrencyStack, name: string, limit: Optional<number>) {
        this.stack = stack;
        this.limit = limit;
        this.nameLabel.string = name;
        this.item.initWithCurrency(stack);

        if (limit.valid && this.emptyNode && this.limitNode) {
            this.emptyNode.active = limit.val == 0;
            this.limitNode.active = limit.val > 0;
            this.remainLabel.string = `仅剩${limit.val}件`;

            this.limitNode.stopAllActions();
            if (limit.val > 0) {
                this.limitNode.runAction(cc.repeatForever(cc.sequence([
                    cc.moveTo(1, 5, 96),
                    cc.moveTo(1, 5, 106),
                ])));
            }
        }
    }

    onClick (e) {
        if (!this.stack) {
            return;
        }
        CommonUtils.showCurrencyTips(this.stack)(e);
    }

    get selected (): boolean {
        return this.selectedNode.active;
    }

    set selected (value: boolean) {
        this.selectedNode.active = value;
    }

    onDestroy() {
        this.limitNode.stopAllActions();
    }
}
