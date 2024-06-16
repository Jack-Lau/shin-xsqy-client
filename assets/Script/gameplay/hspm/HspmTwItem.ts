import ItemWithEffect from "../../base/ItemWithEffect";
import { PetUtils } from "../pet/PetUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import { TitleConfig } from "../../player/title/TitleConfig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HspmTwItem extends cc.Component {
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    @property(cc.Sprite)
    lockSp: cc.Sprite = null;

    data: any = null;

    start () {
        let _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, async (e) => {
            if (_this.data.type == "pet") {
                PetUtils.showPetTips({pet: _this.data, parameters: null})
            } else if (_this.data.type == "currency") {
                let amount = _this.data.auctionId == 151 ? CommonUtils.toCKb(_this.data.amount) : _this.data.amount;
                CommonUtils.showCurrencyTips({currencyId: _this.data.auctionId, amount: amount})(e);
            } else if (_this.data.type == "equipment") {
                EquipUtils.showEquipmentTips(_this.data)()
            } else if (_this.data.type == "title") {
                let titleInfo = await TitleConfig.getConfigById(_this.data.auctionId)
                CommonUtils.showTitleTips(titleInfo.id, _this.data.serialNum + '');
            }
        });
    }

    init (data) {
        this.data = data;    
    }

    
}