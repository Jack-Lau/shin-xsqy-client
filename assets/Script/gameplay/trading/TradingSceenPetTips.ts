import TradSceenPetIconItem from "./TradSceenPetIconItem";
import TradeLinePanel from "./TradeLinePanel";
import { PetDetail } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";
import { PetData } from "../pet/PetData";
import { NetUtils } from "../../net/NetUtils";
import TradingSceenPetTypeTips from "./TradingSceenPetTypeTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import TradingSceenPetSkillTips from "./TradingSceenPetSkillTips";
import { TipsManager } from "../../base/TipsManager";

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
export default class TradingSceenPetTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    moreBtn: cc.Button = null;
    @property(cc.Button)
    skillBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(TradSceenPetIconItem)
    petTypeItems: TradSceenPetIconItem[] = [];

    @property(cc.EditBox)
    rankEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    maxRankEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    atkEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    pdefEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    mdefEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    hpEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    spdEditBox: cc.EditBox = null;

    @property(cc.Label)
    skillLabels: cc.Label[] = [];

    @property(cc.Node)
    empty: cc.Node = null;

    skillIds: number[] = [];

    from: TradeLinePanel = null;
    petDetails: number[] = [300017, 300016, 300015, 300014, 300013, 300012, 300011, 300010, 300009, 300008, 300007, 300006, 300005];

    showPets: number[] = [];

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }


    start() {
        this.initEvents();
        this.showPets = R.slice(0, 5, this.petDetails);
        this.updateShowPet(this.from.screenPet.petDefinitionId);
        if (this.from.screenPet.abilityIds != (NetUtils.NONE_VALUE as any)) {
            let list = this.from.screenPet.abilityIds.split(',');
            for (let id of list) {
                this.skillIds.push(parseInt(id));
            }
        }
        this.showSkillList(this.skillIds, this.from.screenPet.abilitiyMatch);
        if (this.from.screenPet.petRank != (NetUtils.NONE_VALUE as any)) {
            this.rankEditBox.string = this.from.screenPet.petRank.toString();
        }
        if (this.from.screenPet.maxPetRank != (NetUtils.NONE_VALUE as any)) {
            this.maxRankEditBox.string = this.from.screenPet.maxPetRank.toString();
        }
        if (this.from.screenPet.aptitudeAtk != (NetUtils.NONE_VALUE as any)) {
            this.atkEditBox.string = this.from.screenPet.aptitudeAtk.toString();
        }
        if (this.from.screenPet.aptitudePdef != (NetUtils.NONE_VALUE as any)) {
            this.pdefEditBox.string = this.from.screenPet.aptitudePdef.toString();
        }
        if (this.from.screenPet.aptitudeMdef != (NetUtils.NONE_VALUE as any)) {
            this.mdefEditBox.string = this.from.screenPet.aptitudeMdef.toString();
        }
        if (this.from.screenPet.aptitudeHp != (NetUtils.NONE_VALUE as any)) {
            this.hpEditBox.string = this.from.screenPet.aptitudeHp.toString();
        }
        if (this.from.screenPet.aptitudeSpd != (NetUtils.NONE_VALUE as any)) {
            this.spdEditBox.string = this.from.screenPet.aptitudeSpd.toString();
        }

    }

    initEvents() {
        this.moreBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onMoreBtn.bind(this)));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        this.skillBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSkillBtn.bind(this)));
    }

    updateShowPet(petDefinitionId) {
        this.from.screenPet.petDefinitionId = petDefinitionId;

        if (this.from.screenPet.petDefinitionId != (NetUtils.NONE_VALUE as any) && this.showPets.indexOf(this.from.screenPet.petDefinitionId) == -1) {
            this.showPets.unshift(this.from.screenPet.petDefinitionId);
            this.showPets.splice(this.showPets.length - 1, 1);
        }
        this.petTypeItems.forEach((item, index) => {
            item.init(this.showPets[index]);
            if (this.from.screenPet.petDefinitionId != (NetUtils.NONE_VALUE as any)) {
                if (this.showPets[index] == this.from.screenPet.petDefinitionId) {
                    item.isChecked();
                } else {
                    item.notChecked();
                }
            }
        });
    }

    showSkillList(skillIds: number[], isCompletely) {
        if (skillIds.length <= 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
        this.skillIds = skillIds;
        this.skillLabels.forEach(async (label, index) => {
            if (index < this.skillIds.length) {
                label.node.parent.active = true;
                let name = (await PetData.getPetSkillInfoById(this.skillIds[index])).fmap(x => x.name).getOrElse('');
                label.string = name;
            } else {
                label.node.parent.active = false;
            }
        });
        if (this.skillIds.length > 0) {
            this.from.screenPet.abilitiyMatch = isCompletely;
        }

    }

    async onMoreBtn() {
        let panel = await CommonUtils.getPanel('gameplay/trading/TradingSceenPetTypeTips', TradingSceenPetTypeTips) as TradingSceenPetTypeTips;
        panel.init(this, this.petDetails);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    onConfirmBtn() {
        for (let i = 0; i < this.petTypeItems.length; i++) {
            let pet = this.petTypeItems[i];
            if (pet.getChecked()) {
                this.from.screenPet.petDefinitionId = pet.definitionId;
                break;
            }
        }
        if (this.from.screenPet.petDefinitionId != (NetUtils.NONE_VALUE as any)) {
            if (this.rankEditBox.string != '') {
                this.from.screenPet.petRank = parseInt(this.rankEditBox.string);
            }
            if (this.maxRankEditBox.string != '') {
                this.from.screenPet.maxPetRank = parseInt(this.maxRankEditBox.string);
            }
            if (this.atkEditBox.string != '') {
                this.from.screenPet.aptitudeAtk = parseInt(this.atkEditBox.string);
            }
            if (this.pdefEditBox.string != '') {
                this.from.screenPet.aptitudePdef = parseInt(this.pdefEditBox.string);
            }
            if (this.mdefEditBox.string != '') {
                this.from.screenPet.aptitudeMdef = parseInt(this.mdefEditBox.string);
            }
            if (this.hpEditBox.string != '') {
                this.from.screenPet.aptitudeHp = parseInt(this.hpEditBox.string);
            }
            if (this.spdEditBox.string != '') {
                this.from.screenPet.aptitudeSpd = parseInt(this.spdEditBox.string);
            }
            let ids = this.skillIds.join(',');
            if (ids.length <= 0) {
                this.from.screenPet.skillEmpty();
            } else {
                this.from.screenPet.abilityIds = ids;
            }
            if (this.from != null) {
                this.from.pageNumber = 1;
                this.from.adjustPage();
            }
            TipsManager.showMsgFromConfig(1176);
        }
        this.closePanel();
    }

    async onSkillBtn() {
        let panel = await CommonUtils.getPanel('gameplay/trading/TradingSceenPetSkillTips', TradingSceenPetSkillTips) as TradingSceenPetSkillTips;
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }


    middleEditBox(box: cc.EditBox) {
        CommonUtils.editBoxCenter(box);
    }


    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    // update (dt) {}
}
