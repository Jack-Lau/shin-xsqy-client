import Optional from "../../../cocosExtend/Optional";
import { ItemDisplay, ItemQuality } from "../../../bag/ItemConfig";
import { ResUtils } from "../../../utils/ResUtils";
import { CommonUtils } from "../../../utils/CommonUtils";
import { PetData } from "../PetData";
import { TipsManager } from "../../../base/TipsManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PetXTips extends cc.Component {
    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Sprite)
    frame: cc.Sprite = null;
    
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    category: cc.Label = null;
    @property(cc.RichText)
    description: cc.RichText = null;
    
    @property(cc.Label)
    numberLabel: cc.Label = null;


    start() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }
    
    async init(display: Optional<ItemDisplay>, amount: number, number: string) {
        if (display.isValid()) {
            this.category.string = '数量 ' + amount;
            this.nameLabel.string = display.getValue().name;
            this.description.string = display.getValue().description;
            this.numberLabel.string = number;
            this.icon.spriteFrame = await ResUtils.getCurrencyIconbyId(display.getValue().iconId);
           // this.frame.spriteFrame = await ResUtils.getItemFrameByQuality(display.getValue().priority);
           this.frame.spriteFrame = await ResUtils.getItemFrameByQuality(ItemQuality.Blue);
        }
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
