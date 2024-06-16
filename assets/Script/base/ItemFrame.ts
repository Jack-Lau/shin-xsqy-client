import { ItemQuality } from "../bag/ItemConfig";
import { ResUtils } from "../utils/ResUtils";
import { MovieclipUtils } from "../utils/MovieclipUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemFrame extends cc.Component {
    @property(cc.Sprite)
    itemFrame: cc.Sprite = null;
    @property(cc.Sprite)
    effectSprite: cc.Sprite = null;

    async init(quality: ItemQuality, showEffect: boolean) {
        if (quality != null) {
            this.itemFrame.spriteFrame = await ResUtils.getItemFrameByQuality(quality);
        } else {
            this.itemFrame.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/basic/base_panel', 'bg_zhuangbeige');
        }
        this.effectSprite.node.active = showEffect === true;
        if (showEffect) {
            let animation = this.effectSprite.getComponent(cc.Animation);
            let clip = await MovieclipUtils.getEffectClipData('ui/effect/item_board_effect', 16);
            animation.addClip(clip, 'default');
            animation.play('default');
        }
    }
}