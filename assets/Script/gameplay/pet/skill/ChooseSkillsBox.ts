import PetIconItem from "../PetIconItem";
import { PetDetail } from "../../../net/Protocol";
import { CommonUtils } from "../../../utils/CommonUtils";
import { PetData } from "../PetData";
import { ResUtils } from "../../../utils/ResUtils";
import { NetUtils } from "../../../net/NetUtils";
import { TipsManager } from "../../../base/TipsManager";
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

@ccclass
export default class ChooseSkillsBox extends cc.Component {
    @property(PetIconItem)
    petItem: PetIconItem = null;
    @property(cc.Sprite)
    iconItems: Array<cc.Sprite> = [];
    @property(cc.Label)
    skillNames: Array<cc.Label> = [];
    @property(cc.Label)
    skillLevels: Array<cc.Label> = [];
    @property(cc.Button)
    btn: cc.Button = null;
    @property(cc.Button)
    blackBg: cc.Button = null;
    currSelected = 0;
    petId: number = 0;
    skillIds: Array<number> = [];
    
    start() {
        this.btn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.determine.bind(this)));
        this.blackBg.node.on(cc.Node.EventType.TOUCH_END,()=>{});
        this.iconItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this, index));
        });
    }

    init(pet: PetDetail) {
        this.petItem.init(pet);
        this.petId = pet.pet.id;
        let data = pet.pet.candidateAbilities;
        data.forEach(async (skillId, index) => {
            this.skillIds.push(skillId);
            let info = await PetData.getPetSkillInfoById(skillId);
            if (info.valid) {
                this.skillNames[index].string = info.val.name;
                this.skillLevels[index].string = info.val.showType;
                this.iconItems[index].spriteFrame = await ResUtils.getPetSkillIconById(info.val.icon);
            }
        });
    }

    selected(toggle, select: string) {
        this.currSelected = parseInt(select);
    }

    async determine() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/action/{id}/aquireAbility', [this.petId, this.skillIds[this.currSelected]]) as any;
        if (response.status === 0) {
            TipsManager.showMessage(`宠物习得${this.skillNames[this.currSelected].string}技能`);
            PetData.updatePetInfo({ pet: response.content });
            PlayerData.getInstance().updateFc();
            this.closePanel();
        } else {
            this.closePanel();
        }
    }

    showTips(index: number, event: cc.Event.EventTouch) {
        CommonUtils.showPetSkillTips(this.skillIds[index])(event);
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
