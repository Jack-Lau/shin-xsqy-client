import { ConfigUtils } from "../../../utils/ConfigUtil";
import PlayerData from "../../../data/PlayerData";
import { NetUtils } from "../../../net/NetUtils";

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
export default class GodBeastPuzzle extends cc.Component {

    @property(cc.Sprite)
    debrisItems: cc.Sprite[] = [];
    @property(cc.Label)
    labelItems: cc.Label[] = [];

    config = null;
    start() {
        this.debrisItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.onItem.bind(this, index));
        });

    }

    async init(pefId: number) {
        this.config = await ConfigUtils.getConfigJson('GoodPetAdvanced');
        let index = 0;
        for (let item of this.debrisItems) {
            let itemConfig = R.prop('cost', this.config[pefId]);
            let id = R.prop('currencyId', itemConfig[index]);
            let amount = R.prop('amount', itemConfig[index]);
            let myAmount = 0;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${id}`, []) as any;
            if (response.status === 0) {
                myAmount = R.prop('amount', response.content);
            }
            this.labelItems[index].string = myAmount + '/' + amount;
            this.labelItems[index].node.active = false;
            if (myAmount < amount) {
                item.node.opacity = 255;
            } else {
                item.node.opacity = 0;
            }
            index += 1;
        }

    }

    onItem(select: number) {
        this.labelItems.forEach((item, index) => {
            if (select == index) {
                item.node.active = true;
            } else {
                item.node.active = false;
            }
        });
    }

    // update (dt) {}
}
