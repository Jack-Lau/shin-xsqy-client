import { CommonUtils } from "../../utils/CommonUtils";
import PaiHangBJGTItem from "./PaiHangBJGTItem";
import { NetUtils } from "../../net/NetUtils";
import { RankingInfo, RankingElement, PlayerBaseInfo, Player } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";

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
export default class PaiHangBJGTPanel extends cc.Component {
    from: cc.Node = null;
    //*按钮事件
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(PaiHangBJGTItem)
    oneselfItem: PaiHangBJGTItem = null;

    @property(cc.Node)
    empty: cc.Node = null;

    itemDatas: Array<RankingElement> = [];
    readonly MAX_NUMBER = 100;
    loadNumber: number = 0;

    // onLoad () {}

    async start() {
        await this.init();
        this.initEvents()
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/goldTower/getRanking', []) as any;
        if (response.status == 0) {
            let data = response.content;

            if (data.selfRanking == null) {

                let player = {} as RankingElement;
                player.playerBaseInfo = {} as PlayerBaseInfo;
                player.currentRank = 10000;
                player.rankValue = -1;
                player.playerBaseInfo.player = {} as Player;
                player.playerBaseInfo.schoolId = PlayerData.getInstance().schoolId;
                player.playerBaseInfo.player.playerName = PlayerData.getInstance().playerName;
                player.playerBaseInfo.player.playerLevel = PlayerData.getInstance().playerLevel;
                player.playerBaseInfo.player.prefabId = PlayerData.getInstance().prefabId;
                this.oneselfItem.init(player);
            } else {
                //设置个人排名
                this.oneselfItem.init(data.selfRanking);
            }
            this.itemDatas = data.rankings;
            if (this.itemDatas.length > 0) {
                //初始化
                this.empty.active = false;
                this.addItem(20);
            }
        }
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.scrollView.node.on('scroll-to-bottom', CommonUtils.aloneFunction(this.scrollToBottom.bind(this)));
    }

    addItem(howMany: number) {
        let filterFunc = (element: RankingElement) => {
            let indexOf = this.itemDatas.indexOf(element);
            if ((indexOf >= this.loadNumber) && (indexOf < howMany)) {
                return true;
            }
            return false;
        };
        let items = R.filter(filterFunc, this.itemDatas)

        items.forEach((element) => {
            let itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.scrollView.content;
            let item = itemNode.getComponent(PaiHangBJGTItem);
            item.init(element);
        });
        this.loadNumber += items.length;
    }

    async scrollToBottom() {
        if (this.loadNumber >= this.MAX_NUMBER) {
            return;
        }
        //获取数据
        this.addItem(this.loadNumber + 10);
    }

    // update (dt) {}

    closePanel() {
        if (this.from != null) {
            this.from.active = true;
        }
        CommonUtils.safeRemove(this.node);
    }
}
