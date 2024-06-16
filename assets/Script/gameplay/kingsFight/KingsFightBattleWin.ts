import { CommonUtils } from "../../utils/CommonUtils";
import KingsFightRank from "./KingsFightRank";
import { KingsFightConfig } from "./KingsFightConfig";
import PlayerData from "../../data/PlayerData";
import KingsFightPanel from "./KingsFightPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

const {ccclass, property} = cc._decorator;

@ccclass
export default class KingsFightBattleWin extends cc.Component {
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(KingsFightRank)
    rank: KingsFightRank = null;
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Sprite)
    bgEffect: cc.Sprite = null;
    @property(cc.Sprite)
    starEffect: cc.Sprite = null;
    @property(cc.Label)
    expAmountLabel: cc.Label = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    async start () {
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        let _this = this;
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
		//
		const action = cc.repeatForever(cc.rotateTo(0.5, 360))
		this.bgLighting.node.runAction(action)
    }

    async playTween (fromGrade: number, toGrade: number) {
        await KingsFightConfig.initConfig();
        this.expAmountLabel.string = '+' + (270 * PlayerData.getInstance().playerLevel + 2550).toLocaleString();
        if (toGrade >= KingsFightConfig.MAX_GRADE) {
            this.rank.init(toGrade, true);
            this.bgEffect.node.active = true;
            this.bgEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1);
            this.bgEffect.node.active = false;
        } else if (toGrade - fromGrade == 2) {
            this.rank.init(toGrade, true);
            let toConfig = KingsFightConfig.getSeasonConfig(toGrade);
            let fromConfig = KingsFightConfig.getSeasonConfig(fromGrade);
            let toRankArr = toConfig.cRank.split('_').map(x => parseInt(x));
            let fromRankArr = fromConfig.cRank.split('_').map(x => parseInt(x));
            if (toRankArr[2] < fromRankArr[2]) {
                let node  = this.rank.getCurrentStar();
                node.active = false;
                this.bgEffect.node.active = true;
                this.bgEffect.getComponent(cc.Animation).play();
                await CommonUtils.wait(1);
                this.bgEffect.node.active = false;
                this.starEffect.node.parent = node.parent;
                this.starEffect.node.active = true;
                this.starEffect.node.x = node.x;
                this.starEffect.node.y = node.y;
                this.starEffect.getComponent(cc.Animation).play();
                await CommonUtils.wait(1);
                node.active = true;
                this.starEffect.node.active = false;
            } else {
                let nodes = [];
                if (toRankArr[2] == fromRankArr[2]) { // 连胜获得两个星
                    if (toRankArr[2] >= 2) {
                        nodes = [
                            this.rank[`rank${toRankArr[0]}`].stars[toRankArr[2] - 2].node,
                            this.rank[`rank${toRankArr[0]}`].stars[toRankArr[2] - 1].node
                        ];
                    } else {   
                        nodes = [
                            this.rank[`rank${toRankArr[0]}`].stars[toRankArr[2] - 1].node
                        ];
                    }
                    nodes.forEach(node => node.active = false)
                    this.bgEffect.node.active = true;
                    this.bgEffect.getComponent(cc.Animation).play();
                    await CommonUtils.wait(1);
                    this.bgEffect.node.active = false;
                   
                } else {
                    nodes = [
                        this.rank[`rank${toRankArr[0]}`].stars[toRankArr[2] - 2].node,
                        this.rank[`rank${toRankArr[0]}`].stars[toRankArr[2] - 1].node
                    ];
                    nodes.forEach(node => node.active = false)
                }
                await CommonUtils.asyncForEach(nodes, async node => {
                    this.starEffect.node.parent = node.parent;
                    this.starEffect.node.active = true;
                    this.starEffect.node.x = node.x;
                    this.starEffect.node.y = node.y;
                    this.starEffect.getComponent(cc.Animation).play();
                    await CommonUtils.wait(1);
                    node.active = true;
                });
                this.starEffect.node.active = false;
            }
        } else {
            this.rank.init(toGrade, true);
            let node  = this.rank.getCurrentStar();
            node.active = false;
            this.starEffect.node.parent = node.parent;
            this.starEffect.node.active = true;
            this.starEffect.node.x = node.x;
            this.starEffect.node.y = node.y;
            this.starEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1);
            node.active = true;
            this.starEffect.node.active = false;
        }
    }

    async closePanel() {
        let panel = await CommonUtils.getPanel('gameplay/kingsFight/kingsFightPanel', KingsFightPanel) as KingsFightPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        CommonUtils.safeRemove(this.node);
    }
}
