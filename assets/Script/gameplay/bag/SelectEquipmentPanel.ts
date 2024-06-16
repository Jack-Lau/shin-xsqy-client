import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import SelectEquipmentItem from "./SelectEquipmentItem";
import BagData from "../../bag/BagData";
import BagToTreasurePanel from "./BagToTreasurePanel";
import BagItem from "../../bag/BagItem";
import { ItemQuality } from "../../bag/ItemConfig";
import PagingControl from "../../base/PagingControl";
import { Equipment } from "../../net/Protocol";

const { ccclass, property } = cc._decorator;

enum SelectState { None, Part, All }

@ccclass
export default class SelectEquipmentPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Sprite)
    greenBg: cc.Sprite = null;
    @property(cc.Sprite)
    blueBg: cc.Sprite = null;
    @property(cc.Sprite)
    purpleBg: cc.Sprite = null;

    greenSelectState: SelectState = SelectState.All;
    blueSelectState: SelectState = SelectState.None;
    purpleSelectState: SelectState = SelectState.None;

    @property(cc.Sprite)
    greenFlag: cc.Sprite = null;
    @property(cc.Sprite)
    blueFlag: cc.Sprite = null;
    @property(cc.Sprite)
    purpleFlag: cc.Sprite = null;

    @property(cc.Node)
    group: cc.Node = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(PagingControl)
    page: PagingControl = null;

    @property([SelectEquipmentItem])
    itemArr: Array<SelectEquipmentItem> = [];

    @property(cc.SpriteFrame)
    rightSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    circleSf: cc.SpriteFrame = null;

    @property(cc.Sprite)
    emptySprite: cc.Sprite = null;

    readonly PAGE_SIZE = 10;

    fromPanel: BagToTreasurePanel = null;

    start() {
        this.initEvents();
    }

    init(arr: Array<BagItem>) {
        let equipments = R.clone(R.reverse(BagData.getInstance().getAllEquipments()));
        let isInArray = (id) => {
            for (let ele of arr) {
                if (R.path(['data', 'id'], ele) == id) {
                    return true;
                }
            }
            return false;
        }
        equipments = equipments.filter(x => (x.data as Equipment).nftId == null).map(ele => R.assoc('selected', isInArray(R.path(['data', 'id'], ele)), ele));
        this._data.value = equipments;
        this.page.init(this.getPageNum(), this.setPage.bind(this));
        this.checkState();
        this.emptySprite.node.active = equipments.length === 0;
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));

        this.itemArr.forEach((ele, index) => {
            ele.node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(index).bind(this));
        });
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmBtnOnClick.bind(this));
        this.greenBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('greenSelectState', ItemQuality.Green).bind(this));
        this.blueBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('blueSelectState', ItemQuality.Blue).bind(this));
        this.purpleBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('purpleSelectState', ItemQuality.Purple).bind(this));
    }

    refreshData() {
        super.refreshData();
    }

    // state = page num
    refreshState() {
        let page = this._state.value;
        let data = R.take(this.PAGE_SIZE, R.drop(page * this.PAGE_SIZE, this._data.value));
        this.itemArr.forEach(ele => {
            ele.node.active = false;
        })
        data.forEach((ele, index) => {
            this.itemArr[index].init(ele);
            this.itemArr[index].node.active = true;
        });
        this.showByState(this.greenFlag, this.greenSelectState);
        this.showByState(this.blueFlag, this.blueSelectState);
        this.showByState(this.purpleFlag, this.purpleSelectState);
        this.page.setPage(page+1);
        super.refreshState();
    }

    showByState(sprite: cc.Sprite, state: SelectState) {
        switch (state) {
            case SelectState.All: {
                sprite.node.active = true;
                sprite.spriteFrame = this.rightSf;
                break;
            }
            case SelectState.Part: {
                sprite.node.active = true;
                sprite.spriteFrame = this.circleSf;
                break;
            }
            case SelectState.None: {
                sprite.node.active = false;
                break;
            }
        }
    }

    getPageNum() {
        return Math.ceil(R.path(['value', 'length'], this._data) / this.PAGE_SIZE);
    }

    closePanel() {
        if (this.fromPanel != null) {
            this.fromPanel.node.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }

    confirmBtnOnClick() {
        if (this.fromPanel) {
            this.fromPanel.setData(R.reverse(R.filter(x => x.selected, this._data.value)));
        }
        this.closePanel();
    }

    itemOnClick(index: number) {
        return function () {
            let node = this.itemArr[index].flag.node;
            node.active = !node.active;
            let tempIndex = this._state.value * this.PAGE_SIZE + index;
            this._data.value[tempIndex]['selected'] = node.active;
            this.checkState.bind(this)();
            this._state.value = this._state.value;
        }.bind(this);
    }

    setPage(page: number) {
        let maxPage = this.getPageNum() - 1;
        let targetPage = page - 1;
        if (targetPage < 0) {
            targetPage = maxPage;
        } else if (targetPage > maxPage) {
            targetPage = 0;
        }
        this._state.value = targetPage;
    }

    bgOnClick(stateStr: string, quality: ItemQuality) {
        return function () {
            if (this[stateStr] === SelectState.None || this[stateStr] === SelectState.Part) {
                this[stateStr] = SelectState.All;
            } else {
                this[stateStr] = SelectState.None;
            }
            this._data.value = this._data.value.map((ele: BagItem) => {
                if (ele.getPrototype().getValue().quality === quality) {
                    ele['selected'] = this[stateStr] === SelectState.All && (ele.data as Equipment).enhanceLevel == 0;
                }
                return ele;
            });
            this.checkState();
        }.bind(this);
    }

    checkState() {
        let allGreen = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Green, this._data.value).length;
        let selectedGreen = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Green && item.selected, this._data.value).length;
        if (allGreen == 0 || selectedGreen == 0) {
            this.greenSelectState = SelectState.None;
        } else if (selectedGreen < allGreen) {
            this.greenSelectState = SelectState.Part;
        } else {
            this.greenSelectState = SelectState.All;
        }

        let allBlue = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Blue, this._data.value).length;
        let selectedBlue = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Blue && item.selected, this._data.value).length;
        if (allBlue == 0 || selectedBlue == 0) {
            this.blueSelectState = SelectState.None;
        } else if (selectedBlue < allBlue) {
            this.blueSelectState = SelectState.Part;
        } else {
            this.blueSelectState = SelectState.All;
        }

        let allPurple = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Purple, this._data.value).length;
        let selectedPurple = R.filter(item => item.getPrototype().getValue().quality === ItemQuality.Purple && item.selected, this._data.value).length;
        if (allPurple == 0 || selectedPurple == 0) {
            this.purpleSelectState = SelectState.None;
        } else if (selectedPurple < allPurple) {
            this.purpleSelectState = SelectState.Part;
        } else {
            this.purpleSelectState = SelectState.All;
        }

    }

}