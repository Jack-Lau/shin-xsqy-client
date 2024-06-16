import { TipsManager } from "../../base/TipsManager";
import { Web3Utils } from "../../net/Web3Utils";
import ItemWithEffect from "../../base/ItemWithEffect";
import { ResUtils } from "../../utils/ResUtils";
import ItemConfig, { ItemQuality, Currency } from "../../bag/ItemConfig";
import { Equipment, PetDetail, CurrencyStack } from "../../net/Protocol";
import { EquipUtils } from "../../gameplay/equipment/utils/EquipmentUtils";
import BagItem from "../../bag/BagItem";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import { ItemType, SelectInfo, WalletState, WalletItemState } from "./WalletPanelDataStructure";
import { PetData, PetAttributes } from "../../gameplay/pet/PetData";
import { PetUtils } from "../../gameplay/pet/PetUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WalletChainItem extends cc.Component {
    @property([cc.Sprite])
    bgArray: Array<cc.Sprite> = [];
    @property([cc.Label])
    nameArray: Array<cc.Label> = [];
    @property([cc.Label])
    amountArray: Array<cc.Label> = [];
    @property([ItemWithEffect])
    itemArray: Array<ItemWithEffect> = [];

    @property(cc.SpriteAtlas)
    altas: cc.SpriteAtlas = null;

    states: Array<WalletItemState> = [
        WalletItemState.Normal,
        WalletItemState.Normal,
        WalletItemState.Normal,
        WalletItemState.Normal,
    ]
    @property(cc.Sprite)
    operating: cc.Sprite = null;

    type: ItemType = ItemType.Currency;
    data: Array<Equipment | PetDetail | CurrencyStack> = [];
    tokenId: number = null;

    start () {
        this.bgArray[0].node.on(cc.Node.EventType.TOUCH_END, this.onClick(0).bind(this));
        this.bgArray[1].node.on(cc.Node.EventType.TOUCH_END, this.onClick(1).bind(this));
        this.bgArray[2].node.on(cc.Node.EventType.TOUCH_END, this.onClick(2).bind(this));
        this.bgArray[3].node.on(cc.Node.EventType.TOUCH_END, this.onClick(3).bind(this));

        this.itemArray[0].node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(0).bind(this));
        this.itemArray[1].node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(1).bind(this));
        this.itemArray[2].node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(2).bind(this));
        this.itemArray[3].node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(3).bind(this));
    }

    initByEquipments(data: Array<Equipment>) {
        this.data = data;
        let len = data.length;
        this.type = ItemType.Equipment;
        for (let i = 0; i < 4; ++i) {
            this.bgArray[i].node.active = i <= len - 1;
            if (i <= len - 1) {
                let e = data[i];
                let proto = EquipUtils.getDisplay(e);
                if (proto.val) {
                    this.nameArray[i].string = proto.val.name;
                    this.amountArray[i].string = '战力: ' + Math.floor(e.baseFc * (1 + EquipUtils.getScale(e.enhanceLevel)));
                    this.itemArray[i].initWithEquipment(e);
                    // this.initItemAsEquipment(this.itemArray[i], e);
                    this.tokenId = R.prop('tokenId', e);

                    if (R.prop('isPending', e) == true) {
                        this.states[i] = WalletItemState.Operating;
                    }
                }
            }
        }
        this.refresh();
    }

    async initByPets (data: Array<PetDetail>) {
        this.data = data;
        let len = data.length;
        let petAttrs = await Promise.all<PetAttributes>(R.map(PetData.getAttributes, data));
        this.type = ItemType.Pet;
        for (let i = 0; i < 4; ++i) {
            this.bgArray[i].node.active = i <= len - 1;
            if (i <= len - 1) {
                let petDetail = data[i];
                this.nameArray[i].string = petDetail.pet.petName;
                this.amountArray[i].string =`战力: ${petAttrs[i].fc}`;
                this.itemArray[i].initWithPet(petDetail.pet);
                // this.tokenId = R.prop('tokenId', e);
                if (R.prop('isPending', petDetail) == true) {
                    this.states[i] = WalletItemState.Operating;
                }
            }
        }
        this.refresh();
    }

    initByCurrency (data: Array<CurrencyStack>) {
        this.data = data;
        let len = data.length;
        this.type = ItemType.Currency;
        for (let i = 0; i < 4; ++i) {
            this.bgArray[i].node.active = i <= len - 1;
            if (i <= len - 1) {
                let stack = data[i];
                let currencyInfo = ItemConfig.getInstance().getCurrencyInfo(stack.currencyId);
                this.nameArray[i].string = currencyInfo.fmap(x => x.name).getOrElse('');
                this.amountArray[i].string = String(stack.amount);
                // this.initItemAsCurrency(this.itemArray[i], stack.currencyId);
                // 描述处不显示amount
                this.itemArray[i].initWithCurrency({currencyId: stack.currencyId, amount: 0 });
            }
        }
        this.refresh();
    }

    async initItemAsCurrency(item: ItemWithEffect, currencyId: number) {
        let iconSf = await ResUtils.getCurrencyIconbyId(currencyId);
        let quality: ItemQuality = ItemQuality.Blue;
        item.init({
            iconSf: iconSf,
            desc: '',
            color: quality,
            showEffect: false,
            cb: () => {}
        })
    }

    async initItemAsEquipment (item: ItemWithEffect, equipment: Equipment) {
        let display = EquipUtils.getDisplay(equipment);
        let proto = EquipUtils.getProto(equipment);
        if (display.valid && proto.valid) {
            let iconSf = await ResUtils.getEquipmentIconById(display.val.iconId);
            let quality: ItemQuality = proto.val.quality;
            let lv = equipment.enhanceLevel;
            item.init({
                iconSf: iconSf,
                desc: lv > 0 ? `+${lv}` : '',
                color: quality,
                showEffect: quality == ItemQuality.Orange,
                cb: () => {}
            })
        }
    }

    async updateAmount() {
        let balance = await Web3Utils.getBlance() as number;
        this.amountArray[0].string = '数量：' + balance;
    }

    onClick(index: number) {
        let _this = this;
        return () => {
            let state = _this.states[index];
            if (state != WalletItemState.Operating) {
                let info: SelectInfo = {
                    'data': state == WalletItemState.Normal ? _this.data[index] : null,
                    'from': WalletState.Charge,
                    'type': _this.type,
                    'tokenId': _this.tokenId,
                }
                EventDispatcher.dispatch(Notify.WALLET_ITEM_ON_CLICK, {info: info});
            }

            if (state == WalletItemState.Normal) {
                _this.states[index] = WalletItemState.Selected;
            } else if (state == WalletItemState.Selected) {
                _this.states[index] = WalletItemState.Normal;
            } else {
                TipsManager.showMessage('操作中..., 请稍后');
            }
            _this.refresh();
        }
    }

    refresh() {
        this.states.forEach((state, index) => {
            switch (state) {
                case WalletItemState.Normal: {
                    this.bgArray[index].spriteFrame = this.altas.getSpriteFrame('bg_lianshangzichandi1');
                    this.nameArray[index].node.color = cc.Color.fromHEX(this.nameArray[index].node.color, '#5B2009');
                    this.amountArray[index].node.color = cc.Color.fromHEX(this.amountArray[index].node.color, '#623F03');
                    this.operating.node.active = false;
                    break;
                }
                case WalletItemState.Selected: {
                    this.bgArray[index].spriteFrame = this.altas.getSpriteFrame('bg_lianshangzichandi2');
                    this.nameArray[index].node.color = cc.Color.fromHEX(this.nameArray[index].node.color, '#5B2009');
                    this.amountArray[index].node.color = cc.Color.fromHEX(this.amountArray[index].node.color, '#623F03');
                    this.operating.node.active = false;
                    break;
                }
                case WalletItemState.Operating: {
                    this.bgArray[index].spriteFrame = this.altas.getSpriteFrame('bg_lianshangzichandicaozuozhong');
                    this.nameArray[index].node.color = cc.Color.fromHEX(this.nameArray[index].node.color, '#ffffff');
                    this.amountArray[index].node.color = cc.Color.fromHEX(this.amountArray[index].node.color, '#ffffff');
                    this.operating.node.active = true;
                    break;
                }
            }
        });
    }

    itemOnClick (index) {
        let _this = this;
        return (event) => {
            if (_this.states[index] != WalletItemState.Normal) {
                event.stopPropagation();
            }
            switch (this.type) {
                case ItemType.Currency: {
                    CommonUtils.showCurrencyTips(_this.data[index] as CurrencyStack)(event);
                    break;
                }
                case ItemType.Equipment: {
                    let item = _this.data[index] as Equipment;
                    if (!item) return;
                    EquipUtils.showEquipmentTips(item)();
                    break;
                }
                case ItemType.Pet: {
                    PetUtils.showPetTips(_this.data[index] as PetDetail);
                    break;
                }
            }
        }
    }
    // update (dt) {}
}
