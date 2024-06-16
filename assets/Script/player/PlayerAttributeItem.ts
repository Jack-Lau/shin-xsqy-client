import { ConfigUtils } from "../utils/ConfigUtil";
import { TipsManager } from "../base/TipsManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerAttributeItem extends cc.Component {
    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;
    
    @property(cc.Label)
    attrLabel: cc.Label = null;

    @property(cc.Label)
    valueLabel: cc.Label = null;

    start () {
        
    }

    async init (id) {
        let config = await ConfigUtils.getConfigJson('AttributesShow');
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage(config[id].description);
        });
    }

    // update (dt) {}
}
