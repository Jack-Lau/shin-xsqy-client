import SelectGodBeastItem from "./SelectGodBeastItem";
import { PetDetail } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import { PetData } from "../PetData";
import { NetUtils } from "../../../net/NetUtils";

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
export default class SelectGodBeastPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(SelectGodBeastItem)
    mainPetItem: SelectGodBeastItem = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Node)
    empty: cc.Node = null;

    petMaterials: PetDetail[] = [];

    selected = 0;

    showNumber = 0;
    readonly Show_Size = 5;

    callback = (any) => { };

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        this.scrollView.node.on('scroll-to-bottom', CommonUtils.aloneFunction(this.updateMaterials.bind(this)));
    }

    async init(mainPet: PetDetail, callback) {
        this.callback = callback;
        if (mainPet != null) {
            this.mainPetItem.init(mainPet);
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/view/legendaryOfMine/id', []);
        if (response.status === 0) {
            let ids = response.content;
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/viewDetail', [ids.join(',')]);
            if (response2.status === 0) {
                let data = response2.content as PetDetail[];
                this.petMaterials = [];
                for (let item of data) {
                    if (item.pet.definitionId != 300022 && item.pet.definitionId != 300027) {
                        this.petMaterials.push(item);
                    } else {
                        continue;
                    }
                }
                let byID = (itemA: PetDetail, itemB: PetDetail) => {
                    let a = itemA.pet.sortingIndex;
                    let b = itemB.pet.sortingIndex;
                    return b - a;
                };
                let byIDData = R.sort(byID, this.petMaterials) as Array<PetDetail>;
                this.petMaterials = byIDData;
                this.updateMaterials();
            }
        }
    }

    async updateMaterials() {
        let from = this.showNumber;
        let show = this.showNumber + this.Show_Size;
        let datas = R.slice(this.showNumber, show, this.petMaterials);
        datas.forEach((element, index) => {
            this.empty.active = false;
            let node = cc.instantiate(this.itemPrefab);
            node.parent = this.scrollView.content;
            node.getComponent(SelectGodBeastItem).init(element);
            node.on(cc.Node.EventType.TOUCH_END, this.onSelected.bind(this, from + index));
        });
        this.showNumber = show;
    }

    onSelected(index: number) {
        this.selected = index;
    }

    onConfirmBtn() {
        if (this.petMaterials.length > 0) {
            this.callback(this.petMaterials[this.selected]);
        }
        this.closePanel();
        // TipsManager.showMessage('没有可选择宠物！');
    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
