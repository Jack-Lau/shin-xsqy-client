import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FcUpEffect extends cc.Component {
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    start () {
        this.fcLabel.string = PlayerData.getInstance().fc + '';
		this.fcLabel.node.opacity = 0;
    }

    play() {
        let ani = this.bg.getComponent(cc.Animation);
        ani.on('finished', function() {
            CommonUtils.safeRemove(this.node);
        }.bind(this));
        ani.play();
		//
		this.fcLabel.node.runAction(cc.fadeIn(1));
    }

}
