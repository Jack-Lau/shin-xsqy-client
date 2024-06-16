import PagingControl from "../../../base/PagingControl";
import SelectPetItem from "./SelectPetItem";
import PetRefiningPanel from "../PetRefiningPanel";
import { PetDetail } from "../../../net/Protocol";
import { PetData, PetConfigItem } from "../PetData";
import CommonPanel from "../../../base/CommonPanel";
import { CommonUtils } from "../../../utils/CommonUtils";
import { ItemQuality, PetQuality } from "../../../bag/ItemConfig";
import PlayerData from "../../../data/PlayerData";

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
enum SelectState { None, Part, All, Rank }
@ccclass
export default class SelectPetPanel extends CommonPanel {

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

    @property([SelectPetItem])
    itemArr: Array<SelectPetItem> = [];

    @property(cc.SpriteFrame)
    rightSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    circleSf: cc.SpriteFrame = null;

    @property(cc.Sprite)
    emptySprite: cc.Sprite = null;

    readonly PAGE_SIZE = 10;

    fromPanel: PetRefiningPanel = null;

    petConigs: Array<PetConfigItem> = [];

    start() {
        this.initEvents();
    }

    async init(arr: Array<PetDetail>) {
        let opts = await PetData.getAllPets();
        let optValue = [];
        opts.forEach((item) => {
            if (!this.isBattle(item.getValue().pet.id) && item.fmap(d => d.pet.nftId == null)) {
                optValue.push(item.getValue());
            }
        });
        let pets = R.clone(R.reverse(optValue));
        let isInArray = (id) => {
            for (let ele of arr) {
                if (R.path(['pet', 'id'], ele) == id) {
                    return true;
                }
            }
            return false;
        }
        pets = pets.map(ele => R.assoc('selected', isInArray(R.path(['pet', 'id'], ele)), ele));
        this._data.value = pets;
        this.page.init(this.getPageNum(), this.setPage.bind(this));
        this.emptySprite.node.active = pets.length === 0;
        for (let item of this._data.value) {
            let config = await PetData.getConfigById(item.pet.definitionId);
            if (config.isValid()) {
                let petConfigItem = config.getValue();
                this.petConigs.push(petConfigItem);
            }
        }
    }

    isBattle(ID: number) {
        let battlePets = [PlayerData.getInstance().battlePetId1.getValue(), PlayerData.getInstance().battlePetId2.getValue(), PlayerData.getInstance().battlePetId3.getValue()];
        return battlePets.indexOf(ID) != -1;
    }


    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));

        this.itemArr.forEach((ele, index) => {
            ele.node.on(cc.Node.EventType.TOUCH_END, this.itemOnClick(index).bind(this));
        });
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmBtnOnClick.bind(this));
        this.greenBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('greenSelectState', PetQuality.Green).bind(this));
        this.blueBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('blueSelectState', PetQuality.Blue).bind(this));
        this.purpleBg.node.on(cc.Node.EventType.TOUCH_END, this.bgOnClick('purpleSelectState', PetQuality.Purple).bind(this));
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
        data.forEach((ele: PetDetail, index) => {
            this.itemArr[index].init(ele);
            this.itemArr[index].node.active = true;
        });
        this.showByState(this.greenFlag, this.greenSelectState);
        this.showByState(this.blueFlag, this.blueSelectState);
        this.showByState(this.purpleFlag, this.purpleSelectState);
        this.page.setPage(page + 1);
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

    bgOnClick(stateStr: string, quality: number) {
        return function () {
            let isRank = false;
            this._data.value.forEach((element: PetDetail, index) => {
                let petConfigItem = this.petConigs[index];
                if (petConfigItem.color === quality && element.pet.rank > 0) {
                    isRank = true;
                    return;
                }
            });

            if (this[stateStr] === SelectState.None || this[stateStr] === SelectState.Part) {
                if (isRank) {
                    if (this[stateStr] === SelectState.Part) {
                        this[stateStr] = SelectState.None;
                    } else {
                        this[stateStr] = SelectState.Part;
                    }
                } else {
                    this[stateStr] = SelectState.All;
                }
            } else {
                this[stateStr] = SelectState.None;
            }
            this._data.value = this._data.value.map((ele: PetDetail, index) => {
                let petConfigItem = this.petConigs[index];
                if (petConfigItem.color === quality) {
                    if (ele.pet.rank > 0) {
                        ele['selected'] = false;
                    } else {
                        if (this[stateStr] === SelectState.None){
                            ele['selected'] = false;
                        }else{
                            ele['selected'] = true;
                        }
                       
                    }
                }
                return ele;
            });

        }.bind(this);
    }

    async checkState() {

        let allGreen = [];
        let selectedGreen = [];
        this._data.value.forEach((item, index) => {
            let petConfigItem = this.petConigs[index];
            if (petConfigItem != null && petConfigItem.color == PetQuality.Green) {
                allGreen.push(petConfigItem.color);
            }
            if (petConfigItem != null && petConfigItem.color == PetQuality.Green && item.selected) {
                selectedGreen.push(petConfigItem.color);
            }
        });


        if (allGreen.length == 0 || selectedGreen.length == 0) {
            this.greenSelectState = SelectState.None;
        } else if (selectedGreen.length < allGreen.length) {
            this.greenSelectState = SelectState.Part;
        } else {
            this.greenSelectState = SelectState.All;
        }

        let allBlue = [];
        let selectedBlue = [];
        this._data.value.forEach((item, index) => {
            let petConfigItem = this.petConigs[index];
            if (petConfigItem != null && petConfigItem.color == PetQuality.Blue) {
                allBlue.push(petConfigItem.color);
            }
            if (petConfigItem != null && petConfigItem.color == PetQuality.Blue && item.selected) {
                selectedBlue.push(petConfigItem.color);
            }
        });

        if (allBlue.length == 0 || selectedBlue.length == 0) {
            this.blueSelectState = SelectState.None;
        } else if (selectedBlue.length < allBlue.length) {
            this.blueSelectState = SelectState.Part;
        } else {
            this.blueSelectState = SelectState.All;
        }

        let allPurple = [];
        let selectedPurple = [];
        this._data.value.forEach((item, index) => {
            let petConfigItem = this.petConigs[index];
            if (petConfigItem != null && petConfigItem.color == PetQuality.Purple) {
                allPurple.push(petConfigItem.color);
            }
            if (petConfigItem != null && petConfigItem.color == PetQuality.Purple && item.selected) {
                selectedPurple.push(petConfigItem.color);
            }
        });

        if (allPurple.length == 0 || selectedPurple.length == 0) {
            this.purpleSelectState = SelectState.None;
        } else if (selectedPurple.length < allPurple.length) {
            this.purpleSelectState = SelectState.Part;
        } else {
            this.purpleSelectState = SelectState.All;
        }

    }

}
