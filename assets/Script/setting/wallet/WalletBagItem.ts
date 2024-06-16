import { TipsManager } from "../../base/TipsManager";
import ItemWithEffect from "../../base/ItemWithEffect";
import { Equipment, CurrencyStack, PetDetail } from "../../net/Protocol";
import { EquipUtils } from "../../gameplay/equipment/utils/EquipmentUtils";
import { ResUtils } from "../../utils/ResUtils";
import { ItemQuality } from "../../bag/ItemConfig";
import { PetData } from "../../gameplay/pet/PetData";
import { CommonUtils } from "../../utils/CommonUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ItemType, WalletState, SelectInfo, WalletItemState } from "./WalletPanelDataStructure";
import { PetUtils } from "../../gameplay/pet/PetUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WalletBagItem extends cc.Component {
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    amountLabel: cc.Label = null;

    @property(cc.SpriteAtlas)
    altas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    operating: cc.Sprite = null;

    @property(cc.Label)
    fcLabel: cc.Label = null;
    
    @property(cc.Node)
    fcNode: cc.Node = null;

    type: ItemType = ItemType.Currency;
    data: CurrencyStack | Equipment | PetDetail = null;

    state: WalletItemState = WalletItemState.Normal;
    
    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
        this.item.node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick.bind(this));
    }

    // 货币初始化
    initByCurrency (data: CurrencyStack) {
        this.nameLabel.string = '仙石';
        this.amountLabel.string = '数量：' + data.amount;
        this.fcNode.active = false;
        this.amountLabel.node.active = true;
        this.item.initWithCurrency(data);
        this.type = ItemType.Currency;
        this.data = data;
        this.refresh();
    }

    // 装备初始化
    initByEquipment (equipment: Equipment, state = WalletItemState.Normal) {
        let display = EquipUtils.getDisplay(equipment);
        this.nameLabel.string = display.fmap(x => x.name).getOrElse('');
        this.state = state;
        this.fcNode.active = true;
        this.amountLabel.node.active = false;
        this.fcLabel.string =  Math.floor(equipment.baseFc * (1 + EquipUtils.getScale(equipment.enhanceLevel))) + '';
        this.item.initWithEquipment(equipment);
        this.type = ItemType.Equipment;
        this.data = equipment;
        this.refresh();
    }

    // 宠物初始化
    async initByPet (petDetail: PetDetail, state = WalletItemState.Normal) {
        this.fcNode.active = true;
        this.amountLabel.node.active = false;
        this.state = state;
        this.nameLabel.string = petDetail.pet.petName;
        this.type = ItemType.Pet;
        this.data = petDetail;
        this.item.initWithPet(petDetail.pet);
        let attr = await PetData.getAttributes(petDetail);
        this.fcLabel.string = String(attr.fc);
        this.refresh();
    }

    setAmount(amount) {
        this.amountLabel.string = '数量：' + amount;
    }

    onClick() {
        if (this.state != WalletItemState.Operating) {
            let info: SelectInfo = {
                'data': this.state == WalletItemState.Normal ? this.data : null,
                'from': WalletState.Withdraw,
                'type': this.type
            }
            EventDispatcher.dispatch(Notify.WALLET_ITEM_ON_CLICK, {info: info});
        }

        if (this.state == WalletItemState.Normal) {
            this.state = WalletItemState.Selected;
        } else if (this.state == WalletItemState.Selected) {
            this.state = WalletItemState.Normal;
        } else {
            TipsManager.showMessage('操作中..., 请稍后');
        }
        this.refresh();
    }

    itemOnClick (event) {
        if (this.state != WalletItemState.Normal) {
            event.stopPropagation();
        }
        switch (this.type) {
            case ItemType.Currency: {
                CommonUtils.showCurrencyTips(this.data as CurrencyStack)(event);
                break;
            }
            case ItemType.Equipment: {
                EquipUtils.showEquipmentTips(this.data as Equipment)();
                break;
            }
            case ItemType.Pet: {
                PetUtils.showPetTips(this.data as PetDetail);
                break;
            }
        }
    }

    refresh() {
        switch (this.state) {
            case WalletItemState.Normal: {
                this.bg.spriteFrame = this.altas.getSpriteFrame('bg_beibaowupindi');
                this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, '#ffffff');
                this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, '#FFF2B8');
                this.fcLabel.node.color = cc.Color.fromHEX(this.fcLabel.node.color, '#FFF2B8')
                this.operating.node.active = false;
                break;
            }
            case WalletItemState.Selected: {
                this.bg.spriteFrame = this.altas.getSpriteFrame('bg_beibaowupindixuanzhong');
                this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, '#623f03');
                this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, '#9f3c21');
                this.fcLabel.node.color = cc.Color.fromHEX(this.fcLabel.node.color, '#9f3c21');
                this.operating.node.active = false;
                break;
            }
            case WalletItemState.Operating: {
                this.bg.spriteFrame = this.altas.getSpriteFrame('bg_caozuozhongdi');
                this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, '#ffffff');
                this.amountLabel.node.color = cc.Color.fromHEX(this.amountLabel.node.color, '#ffffff');
                this.operating.node.active = true;
                break;
            }
        }
    }

    // update (dt) {}
}
