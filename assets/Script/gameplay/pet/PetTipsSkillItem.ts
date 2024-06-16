import { PetSkillConfigItem } from "./PetData";
import { ResUtils } from "../../utils/ResUtils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PetTipsSkillItem extends cc.Component {
    @property(cc.Sprite)
    skillIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    
    start () {

    }

    async init (config: PetSkillConfigItem) {
        this.nameLabel.string = config.name;
        this.skillIcon.spriteFrame = await ResUtils.getPetSkillIconById(config.icon);
    }
}