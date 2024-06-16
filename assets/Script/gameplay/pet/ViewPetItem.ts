import { PetData } from "./PetData";
import Optional from "../../cocosExtend/Optional";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import PetPrototypeTips from "./PetPrototypeTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ViewPetItem extends cc.Component {
    @property(cc.Sprite)
    colorSp: cc.Sprite = null;
    @property(cc.Sprite)
    mcSp: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    rateLabel: cc.Label = null;

    definitionId: Optional<number> = new Optional<number>();
    
    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showPrototypeTips.bind(this));
    }
    
    async init (definitionId: number, rate: string) {
        this.definitionId = new Optional<number>(definitionId);
        let config = await PetData.getConfigById(definitionId);
        this.initMc(config.fmap(x => x.prefabId));
        this.nameLabel.string = config.valid ? config.val.name : '';
        this.rateLabel.string = '获得率  ' + rate;
        if (config.valid) {
            this.colorSp.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/pet/pet_tips', 'color_' + config.val.color);
        }
    }
    
    async initMc (prefabId: Optional<number>) {
        if (!prefabId.valid) {
            return;
        }
        let animationClip = await MovieclipUtils.getMovieclip(prefabId.val, 'idle_ld', 16);
        let animation = this.mcSp.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId.val + '_idle_ld');
        this.mcSp.node.anchorX = offset.x;
        this.mcSp.node.anchorY = offset.y;
    }
    
    async showPrototypeTips () {
        if (this.definitionId.valid) {
            let panel = await CommonUtils.getPanel('gameplay/pet/petPrototypeTips', PetPrototypeTips) as PetPrototypeTips;
            panel.init(this.definitionId.val);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }
    }
}