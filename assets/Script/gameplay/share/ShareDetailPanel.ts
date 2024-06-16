import { NetUtils } from "../../net/NetUtils";
import ShareDetailItem from "./ShareDetailItem";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShareDetailPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.ToggleContainer)
    toggleContainer: cc.ToggleContainer = null;

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Label)
    sumLabel: cc.Label = null;

    @property(cc.Prefab)
    recordPrefab: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    
    @property(cc.Sprite)
    kbSprite: cc.Sprite = null;

    @property(cc.Sprite)
    energySprite: cc.Sprite = null;

    @property(cc.Sprite)
    maxFlagImage: cc.Sprite = null;

    from: cc.Node = null;
    currentState = '';
    MAX_ENERGY = 2880;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.toggleContainer.toggleItems[0].node.on('toggle', this.initEnergy.bind(this));
        this.toggleContainer.toggleItems[1].node.on('toggle', this.initKb.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.initEnergy();
    }

    async initEnergy() {
        if (this.currentState == 'energy') {
            return;
        }
        this.currentState = 'energy';
        this.kbSprite.node.active = false;
        this.energySprite.node.active = true;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/invitation/groupedKbdzpReward', []) as any;
        if (response.status == 0 && response.content) {
            let sum = response.content.sum;
            if (sum >= this.MAX_ENERGY) sum = this.MAX_ENERGY;
            this.sumLabel.string = sum + '';
            this.maxFlagImage.node.active = sum >= this.MAX_ENERGY;
            let sumIdSort = R.sortWith([
                R.descend(R.prop('sum')),
                R.ascend(R.prop('accountId'))
            ]);

            let content = sumIdSort(response.content.children);

            let num = PlayerData.getInstance().genesis ? 30 : 10;
            while (content.length < num) {
                content.push(null);
            }
            this.scrollView.content.removeAllChildren();
            let len = content.length;
            for (let i = 0; i < len; ++i) {
                let recordNode = cc.instantiate(this.recordPrefab);
                let item = recordNode.getComponent(ShareDetailItem);
                item.init(i + 1, content[i]);
                item.node.parent = this.scrollView.content;
            }
        }
    }

    async initKb() {
        if (this.currentState == 'kb') {
            return;
        }
        this.currentState = 'kb';
        this.kbSprite.node.active = true;
        this.energySprite.node.active = false;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/invitation/groupedKuaibiRewardLogs', []) as any;
        if (response.status == 0 && response.content) {
            this.sumLabel.string = CommonUtils.toCKb(response.content.sum) + '';
            this.maxFlagImage.node.active = false;
            let sumIdSort = R.sortWith([
                R.descend(R.prop('sum')),
                R.ascend(R.prop('accountId'))
            ]);

            let formatKC = (obj) => {
                return R.set(
                    R.lensProp('sum'), 
                    CommonUtils.toCKb(R.prop('sum', obj)),
                    obj
                );
            };
            
            let content = sumIdSort(R.map(formatKC, response.content.children));
            let num = PlayerData.getInstance().genesis ? 30 : 10;
            while (content.length < num) {
                content.push(null);
            }
            this.scrollView.content.removeAllChildren();
            let len = content.length;
            for (let i = 0; i < len; ++i) {
                let recordNode = cc.instantiate(this.recordPrefab);
                let item = recordNode.getComponent(ShareDetailItem);
                item.init(i + 1, content[i], true);
                item.node.parent = this.scrollView.content;
            }
        }
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        this.node.parent.removeChild(this.node);
    }
}
