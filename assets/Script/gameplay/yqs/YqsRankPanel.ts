import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { PitDetail, PlayerBaseInfo } from "../../net/Protocol";
import YqsRankItem from "./YqsRankItem";
import { YqsData } from "./YqsData";
import PlayerData from "../../data/PlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YqsRankPanel extends cc.Component {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(YqsRankItem)
    item: YqsRankItem = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.init();
    }

    async init () {
        // init myself
        let info = {
            player: {
                playerLevel: PlayerData.getInstance().playerLevel,
                playerName: PlayerData.getInstance().playerName,
                prefabId: PlayerData.getInstance().prefabId
            },
            schoolId: PlayerData.getInstance().schoolId
        } as PlayerBaseInfo;
        this.item.init(YqsData.myInfo.pit, info);
		//
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/viewRanking', [0, 100]);
        if (response.status === 0) {
            let data = response.content as Array<PitDetail>;
            let ids = data.map(x => x.pit.accountId).join(',');
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [ids]);
            if (response2.status === 0) {
                data.forEach((ele, index) => {
                    let item = cc.instantiate(this.itemPrefab).getComponent(YqsRankItem);
                    item.init(ele, response2.content[index]);
                    item.node.parent = this.scroll.content;
                })
            }
        }
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

}