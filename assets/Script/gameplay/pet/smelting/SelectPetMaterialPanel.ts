import SelectPetMaterialItem from "./SelectPetMaterialItem";
import { PetDetail } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import { PetData } from "../PetData";
import Optional from "../../../cocosExtend/Optional";
import { TipsManager } from "../../../base/TipsManager";
import { ItemCategory, ItemQuality, PetQuality } from "../../../bag/ItemConfig";

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
export default class SelectPetMaterialPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(SelectPetMaterialItem)
    mainPetItem: SelectPetMaterialItem = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    petMaterials: Optional<PetDetail>[] = [];

    selected = 0;

    showNumber = 0;
    readonly Show_Size = 5;

    callback = (any) => { };

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        this.scrollView.node.on('scroll-to-bottom', CommonUtils.aloneFunction(this.updateMaterials.bind(this)));
    }

    async init(mainPet: PetDetail, battlePets: Array<number>, callback) {
        this.callback = callback;
        if (mainPet != null) {
            this.mainPetItem.init(mainPet);

            let data = await PetData.getAllPets();
            this.petMaterials = [];
            for (let item of data) {
                if (item.fmap(x => x.pet).isValid()) {
                    let config = await PetData.getConfigById(item.getValue().pet.definitionId);
                    if (config.fmap(x => x.color).getOrElse(PetQuality.Green) == PetQuality.Green) {
                        continue;
                    } else if (config.fmap(x => x.color).getOrElse(PetQuality.Orange) >= PetQuality.Orange) {
                        continue;
                    } else if (item.getValue().pet.id == mainPet.pet.id) {
                        continue;
                    } else if (battlePets.indexOf(item.getValue().pet.id) > -1) {
                        continue;
                    } else if (R.without(mainPet.pet.abilities, item.getValue().pet.abilities).length <= 0) {
                        continue;
                    }
                    this.petMaterials.push(item);
                } else {
                    continue;
                }
            }
            this.updateMaterials();
        }
    }

    async updateMaterials() {
        let from = this.showNumber;
        let show = this.showNumber + this.Show_Size;
        let datas = R.slice(this.showNumber, show, this.petMaterials);
        datas.forEach((element, index) => {
            let node = cc.instantiate(this.itemPrefab);
            node.parent = this.scrollView.content;
            node.getComponent(SelectPetMaterialItem).init(element.getValue());
            node.on(cc.Node.EventType.TOUCH_END, this.onSelected.bind(this, from + index));
        });
        this.showNumber = show;
    }

    onSelected(index: number) {
        this.selected = index;
    }

    onConfirmBtn() {
        if (this.petMaterials.length > 0) {
            this.callback(this.petMaterials[this.selected].getValue());

        }
        this.closePanel();
        // TipsManager.showMessage('没有可选择宠物！');
    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
