import PetTipsBaseInfo from "./PetTipsBaseInfo";
import PetTipsMoreInfo from "./PetTipsMoreInfo";
import { CommonUtils } from "../../utils/CommonUtils";
import CommonPanel from "../../base/CommonPanel";
import { PetDetail } from "../../net/Protocol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetTips extends CommonPanel {
    @property(PetTipsBaseInfo)
    baseInfo: PetTipsBaseInfo = null;
    @property(PetTipsMoreInfo)
    moreInfo: PetTipsMoreInfo = null;
    
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
	
    readonly MORE_LEFT_X = -171;
    readonly MORE_RIGHT_X = 194;

    start () {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.baseInfo.moreInfoBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchState.bind(this));
        this.baseInfo.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.moreInfo.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    init (petDetail: PetDetail) {
        this.baseInfo.init(petDetail);
        this.moreInfo.init(petDetail);

        let _this = this;
        setTimeout( () => {
            _this.moreInfo.getComponent(cc.Widget).top = (CommonUtils.getViewHeight() - _this.baseInfo.node.height) / 2;
        }, 300);
        this._state.value = false;
    }

    refreshState() {
        let state = this._state.value;
        if (state) {
            this.moreInfo.node.active = true;
            this.moreInfo.node.x = this.MORE_RIGHT_X;
            this.baseInfo.node.x = this.MORE_LEFT_X;
        } else {
            this.moreInfo.node.active = false;
            this.baseInfo.node.x = 0;
        }
        super.refreshState();
    }

    switchState () {
        this._state.value = !this._state.value;
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }
}