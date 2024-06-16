import ItemFrame from "../../../base/ItemFrame";
import PagingControl from "../../../base/PagingControl";
import PetAttributeModelling from "../attribute/PetAttributeModelling";
import PassiveItem from "../attribute/PassiveItem";
import Optional from "../../../cocosExtend/Optional";
import { PetDetail, PetFusionResult } from "../../../net/Protocol";
import { PetAbilityStudy, PetData } from "../PetData";
import PetPanel from "../PetPanel";
import { TipsManager } from "../../../base/TipsManager";
import { CommonUtils } from "../../../utils/CommonUtils";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { ResUtils } from "../../../utils/ResUtils";
import PlayerData from "../../../data/PlayerData";
import ItemConfig, { PetQuality, ItemQuality } from "../../../bag/ItemConfig";
import { NetUtils } from "../../../net/NetUtils";
import PetXTips from "../skill/PetXTips";
import ChooseSkillsBox from "../skill/ChooseSkillsBox";
import SelectPetMaterialPanel from "./SelectPetMaterialPanel";

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
export default class PetSmeltingPanel extends cc.Component {
    @property(cc.Sprite)
    icons: Array<cc.Sprite> = [];
    @property(ItemFrame)
    pinziIcons: Array<ItemFrame> = [];
    @property(cc.Toggle)
    toggles: Array<cc.Toggle> = [];
    @property(cc.Node)
    toPlayIcons: Array<cc.Node> = [];
    @property(cc.Label)
    showRankLabels: Array<cc.Label> = [];

    @property(PagingControl)
    page: PagingControl = null;
    @property(PetAttributeModelling)
    petModelling: PetAttributeModelling = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    smeltingBtn: cc.Button = null;

    @property(cc.Node)
    disableMask: cc.Node = null;

    @property(cc.Node)
    passiveGroupLayout: cc.Node = null;
    @property(cc.ScrollView)
    passiveGroupScrollView: cc.ScrollView = null;
    passiveGroup: Array<PassiveItem> = [];

    pageData: Array<Optional<PetDetail>> = [];
    currencyPetDetail: PetDetail = null;
    selected: number = 0;

    battlePets: Array<number> = [0, 0, 0];
    isRuning = false;

    from: PetPanel = null;

    //材料宠物
    @property(cc.SpriteFrame)
    addIcon: cc.SpriteFrame = null;
    @property(cc.Sprite)
    materialIcon: cc.Sprite = null;
    @property(ItemFrame)
    materialBox: ItemFrame = null;
    @property(cc.Label)
    materialNameLabel: cc.Label = null;
    @property(cc.Label)
    materialLabel: cc.Label = null;
    @property(cc.Node)
    materialMask: cc.Node = null;
    @property(cc.Node)
    materialPassiveLayout: cc.Node = null;
    @property(cc.ScrollView)
    materialPassiveScrollView: cc.ScrollView = null;
    materialPassiveGroup: Array<PassiveItem> = [];
    materialPetDetail: PetDetail = null;

    @property(cc.Animation)
    anim: cc.Animation = null;
	
    onLoad() {
        this.passiveGroup = this.passiveGroupLayout.getComponentsInChildren(PassiveItem);
        this.materialPassiveGroup = this.materialPassiveLayout.getComponentsInChildren(PassiveItem);
    }


    init(currentPage = 1, selected = 0) {
        if (PetData.getPetMaxPage() == 0) {
            TipsManager.showMessage('没有获得宠物');
            return;
        }
        this.selected = selected;
        this.page.init(PetData.getPetMaxPage(), this.updatePage.bind(this), currentPage);
        this.updatePage(currentPage, false);
        this.initEvents();
    }
    initEvents() {
        this.toggles.forEach((toggle, index) => {
            toggle.node.on(cc.Node.EventType.TOUCH_END, this.updateSelected.bind(this, index));
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 26));
        this.smeltingBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSmeltingBtn.bind(this)));
        this.materialIcon.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openSelectMaterial.bind(this)));

    }

    async updatePage(page: number, isInit = true, isSikll = false) {
        this.disableMask.active = false;
        let data = await PetData.getPetsByPage(page - 1);
        if (data == null || data.length == 0) {
            return;
        }
        this.pageData = data;
        this.icons.forEach((icon, index) => {
            icon.spriteFrame = null;
            this.pinziIcons[index].node.active = false;
            this.toggles[index].node.active = false;
        });
        data.forEach(async (item, index) => {
            this.toggles[index].node.active = true;
            if (item.isValid()) {
				let rank = item.getValue().pet.rank;
                if (rank > 0) {
                    this.showRankLabels[index].string = '+' + rank.toString();
                } else {
                    this.showRankLabels[index].string = '';
                }
				//
                let config = await PetData.getConfigById(item.getValue().pet.definitionId);
                if (config.isValid()) {
                    let iconID = config.getValue().prefabId;
                    this.icons[index].spriteFrame = await ResUtils.getPetHeadIconById(iconID);
                    await this.toColor(this.pinziIcons[index], config.getValue().color, rank);
                }
            }
        });

        this.battlePets[0] = PlayerData.getInstance().battlePetId1.getValue();
        this.battlePets[1] = PlayerData.getInstance().battlePetId2.getValue();
        this.battlePets[2] = PlayerData.getInstance().battlePetId3.getValue();
        this.toPlayIcons.forEach((icon, index) => {

            if (page == 1 && index < this.pageData.length && this.isBattle(this.pageData[index].fmap(x => x.pet).fmap(x => x.id).getOrElse(0))) {
                icon.active = true;
            } else {
                icon.active = false;
            }
        });
        this.from.currentPage = page;
        this.page.setPage(page);
        this.page.setMax(PetData.getPetMaxPage());
        if (isSikll) {
            return;
        }
        if (isInit) {
            await this.updateSelected(0);
        } else {
            await this.updateSelected(this.selected);
        }

    }

    async toColor(effect, color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                effect.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                effect.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                effect.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                effect.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                effect.node.active = false;
                return;
        }
        effect.node.active = true;
    }
    isBattle(ID: number) {
        return this.battlePets.indexOf(ID) != -1;
    }

    async updateSelected(select: number) {
        this.selected = select;
        if (this.pageData.length <= select) {
            this.selected = 0;
        }

        this.from.selected = this.selected;
        this.toggles[this.selected].check();
        if (!this.pageData[this.selected].isValid()) {
            console.error('error');
            return;
        }
        let petDetail = this.pageData[this.selected].getValue();
        this.currencyPetDetail = petDetail;
        this.petModelling.setData(petDetail, this);
        this.setPassiveGroup(this.currencyPetDetail, this.passiveGroup);
        this.passiveGroupScrollView.scrollToTop(0.1);

        this.initMaterial();
    }

    async setPassiveGroup(petDetail: PetDetail, passives: PassiveItem[]) {

        let petconfig = (await PetData.getConfigById(petDetail.pet.definitionId));
        let maxSkillNum = petconfig.isValid() ? petconfig.getValue().maxSkillNum : 0;

        let abilities = petDetail.pet.abilities;

        passives.forEach((passive, index) => {
            passive.toNull();
            if (index < maxSkillNum) {
                if (petDetail.pet.maxRank >= 4 && index == maxSkillNum - 1 && petDetail.pet.rank < 4) {
                    passive.toUnknown();
                }
                if (index < abilities.length) {
                    passive.toSkill(abilities[index]);
                }
            } else {
                passive.tolock();
            }
        });

    }

    async onSmeltingBtn() {
        if (this.materialPetDetail == null) {
            TipsManager.showMessage('请添加材料宠物！');
            return;
        } else if (this.currencyPetDetail != null && this.currencyPetDetail.pet.rank < 7) {
            TipsManager.showMsgFromConfig(1148);
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/fusion', [this.currencyPetDetail.pet.id, this.materialPetDetail.pet.id]) as any;
        if (response.status === 0) {
            let data = response.content as PetFusionResult;
            await PetData.updatePetIds();
            await PetData.updatePetInfo(data.petDetail);

            await CommonUtils.wait(this.anim.play().duration);
            let petIds = PetData.getAllPetIds();
            let index = petIds.indexOf(this.currencyPetDetail.pet.id);
            let page = 1;
            this.selected = 0;
            if (index != -1) {
                this.selected = index % 4;
                index += 1;
                page = Math.ceil(index / 4);
            }
            await this.updatePage(page, false, true);
            let petDetail = this.pageData[this.selected].getValue();
            this.currencyPetDetail = petDetail;

            let indexSkill = this.currencyPetDetail.pet.abilities.indexOf(data.newAbility);

            let math = (Math.floor(indexSkill / 2)) / 8;

            this.passiveGroupScrollView.scrollToPercentVertical(1 - math);
            await CommonUtils.wait(0.3);
            await CommonUtils.wait(this.passiveGroup[indexSkill].showAnim());
            this.petModelling.setData(petDetail, this);
            this.setPassiveGroup(this.currencyPetDetail, this.passiveGroup);
            let config1 = await PetData.getPetSkillInfoById(data.droppedAbility);
            let config2 = await PetData.getPetSkillInfoById(data.newAbility);
            if (config1.isValid() && config2.isValid()) {

                TipsManager.showMessage(`炼妖成功！ <color=#FF1A00>${config1.getValue().name}</color> 已被替换为 <color=#00FF00>${config2.getValue().name}</color>！`);
            }
            this.initMaterial();
            PlayerData.getInstance().updateFc();
        }
    }

    initMaterial() {

        this.materialPetDetail = null;
        this.materialMask.active = true;
        this.materialIcon.spriteFrame = this.addIcon;
        this.toColor(this.materialBox, 1);
        this.materialLabel.string = '';
        this.materialNameLabel.string = '点击添加';
        this.materialPassiveGroup.forEach((passive, index) => {
            passive.toNull();
        });
        this.materialPassiveScrollView.scrollToTop(0.1);
    }

    async updateMaterial(petDetail: PetDetail) {
        if (cc.isValid(petDetail)) {
            this.materialMask.active = false;
            this.materialPetDetail = petDetail;
            let config = await PetData.getConfigById(this.materialPetDetail.pet.definitionId);
            if (config.isValid()) {
                let iconID = config.getValue().prefabId;
                this.materialIcon.spriteFrame = await ResUtils.getPetHeadIconById(iconID);

                await this.toColor(this.materialBox, config.getValue().color);
            }
            this.materialNameLabel.string = petDetail.pet.petName;
            let rank = this.materialPetDetail.pet.rank;
            if (rank > 0) {
                this.materialLabel.string = '+' + rank.toString();
            } else {
                this.materialLabel.string = '';
            }
        }
        this.setPassiveGroup(this.materialPetDetail, this.materialPassiveGroup);
        this.materialPassiveScrollView.scrollToTop(0.1);
    }

    async openSelectMaterial() {
        let panel = await CommonUtils.getPanel('gameplay/pet/SelectPetMaterialPanel', SelectPetMaterialPanel) as SelectPetMaterialPanel;
        let parentJ = panel.getComponent(SelectPetMaterialPanel);
        parentJ.init(this.currencyPetDetail, this.battlePets, this.updateMaterial.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

}
