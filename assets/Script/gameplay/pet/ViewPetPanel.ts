import { CommonUtils } from "../../utils/CommonUtils";
import ViewPetItem from "./ViewPetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ViewPetPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    init () {
        let definitionIds = R.reverse([300001, 300002, 300003, 300004, 300005, 300006, 300007, 300008, 300009, 300010, 300011, 300012, 300013, 300014, 300015, 300016]);
        let rate = R.reverse(['17.5%','17.5%','17.5%','17.5%','7.2475%','7.2475%','7.2475%','7.2475%','0.25%','0.25%','0.25%','0.25%','0.0025%','0.0025%','0.0025%','0.0025%']);
        definitionIds.forEach((id, index) => {
            let viewPetItem = cc.instantiate(this.itemPrefab).getComponent(ViewPetItem);
            viewPetItem.init(id, rate[index]);
            viewPetItem.node.parent = this.scrollView.content;
        })
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

}