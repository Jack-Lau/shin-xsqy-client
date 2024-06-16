import { ItemCategory, PetQuality } from "../../bag/ItemConfig";
import TradingShelvesItem from "./TradingShelvesItem";
import PagingControl from "../../base/PagingControl";
import { CommonUtils } from "../../utils/CommonUtils";
import BagItem from "../../bag/BagItem";
import BagData from "../../bag/BagData";
import { PetData } from "../pet/PetData";
import PlayerData from "../../data/PlayerData";
import TradingShelvesTips from "./TradingShelvesTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

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
export default class TradingShelvesPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(TradingShelvesItem)
    shelvesItems: TradingShelvesItem[] = [];
    @property(PagingControl)
    page: PagingControl = null;

    @property(cc.Node)
    empty: cc.Node = null;


    type = ItemCategory.Equipment;
    data = [];

    selected = -1;

    battlePets: Array<number> = [0, 0, 0];

    readonly PAGE_SIZE = 10;
    // onLoad () {}
    from = null;
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.onConfirmBtn.bind(this));
        this.battlePets[0] = PlayerData.getInstance().battlePetId1.getValue();
        this.battlePets[1] = PlayerData.getInstance().battlePetId2.getValue();
        this.battlePets[2] = PlayerData.getInstance().battlePetId3.getValue();
        this.page.init(1, this.updatePage.bind(this));

        this.shelvesItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.onSelected.bind(this, index));
        });
    }

    async updatePage(index = 1) {
        this.onSelected(-1);
        switch (this.type) {
            case ItemCategory.Equipment:
                this.page.setMax(Math.ceil(BagData.getInstance().getAllTradEquipments().length / this.PAGE_SIZE));
                this.data = await BagData.getInstance().getTradEquipmentByPage(index - 1, this.PAGE_SIZE) as BagItem[];
                break;
            case ItemCategory.Title:
                this.page.setMax(Math.ceil((await BagData.getInstance().getAllTitles()).length / this.PAGE_SIZE));
                this.data = (await BagData.getInstance().getTitleByPage(index - 1, this.PAGE_SIZE)) as BagItem[];
                break;
            case 2:
                //pet
                let allPet = await PetData.getAllPets();
                let showPets = [];
                this.data = [];
                for (let item of allPet) {
                    let config = await PetData.getConfigById(item.getValue().pet.definitionId);
                    if (item.fmap(x => x.pet).isValid() && config.isValid()) {
                        let serverTime = CommonUtils.getServerTime();
                        let time = (item.fmap(x => x.pet).fmap(x => x.nextWithdrawTime).getOrElse(0 as any)) as any;
                        if (this.battlePets.indexOf(item.getValue().pet.id) > -1) {
                            continue;
                        } else if (config.fmap(x => x.color).getOrElse(PetQuality.Green) == PetQuality.Green) {
                            continue;
                        } else if (serverTime <= time) {
                            continue;
                        }
                        showPets.push(item.getValue());
                    } else {
                        continue;
                    }
                }
                this.page.setMax(Math.ceil(showPets.length / this.PAGE_SIZE));
                this.data = R.slice(this.PAGE_SIZE * (index - 1), this.PAGE_SIZE * index, showPets);
                break;
        }
        if (this.data.length == 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
        this.shelvesItems.forEach((item, index) => {
            if (index < this.data.length) {
                item.node.active = true;
                item.init(this.data[index]);
            } else {
                item.node.active = false;
            }
        });

        this.page.setPage(index);
    }

    onToggle(tle, index) {
        this.type = parseInt(index);
        this.updatePage();
    }

    async onConfirmBtn() {
        if (this.selected == -1) {
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/trading/TradingShelvesTips', TradingShelvesTips) as TradingShelvesTips;
        if (this.type == 2) {
            panel.init(null, this.data[this.selected], this.type);
        } else {
            panel.init(null, this.data[this.selected].data, this.type);
        }
        panel.from = this.from;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.closePanel();
    }

    onSelected(index) {
        this.selected = index;
        this.shelvesItems.forEach((item, index) => {
            if (index == this.selected) {
                item.showSelected();
            } else {
                item.cancelSelected();
            }
        });

    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
