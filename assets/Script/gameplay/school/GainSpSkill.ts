import { CommonUtils } from "../../utils/CommonUtils";
import { BattleConfig } from "../../battle/BattleConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GainSpSkill extends cc.Component {
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    @property(cc.Sprite)
    cardSp: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    start () {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }
    
    init(skillId) {
        let skillInfo = BattleConfig.getInstance().skillDisplay[skillId + 1];
        if (skillInfo) {
            this.nameLabel.string = R.prop('name', skillInfo);
            this.descriptionLabel.string = R.prop('description', skillInfo);
            this.cardSp.spriteFrame = this.atlas.getSpriteFrame(String(skillId + 1))
            this.costLabel.string = '70';
        }
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}