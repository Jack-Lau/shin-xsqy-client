import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import Item from "../../base/Item";
import BagItem from "../../bag/BagItem";
import ArticleItem from "./ArticleItem";
import BagData from "../../bag/BagData";
import { ItemQuality, ItemCategory } from "../../bag/ItemConfig";
import { NetUtils } from "../../net/NetUtils";
import SelectEquipmentPanel from "./SelectEquipmentPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { RecyclingResult, Equipment } from "../../net/Protocol";
import { TipsManager } from "../../base/TipsManager";
import EarningBox from "./effects/EarningBox";
import ItemTips from "./ItemTips";
import PlayerData from "../../data/PlayerData";
import SecondConfirmBox from "../../base/SecondConfirmBox";

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
export default class BagToTreasurePanel extends CommonPanel {

    //*按钮事件
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    addBtn: cc.Button = null;
    @property(cc.Button)
    refiningBtn: cc.Button = null;

    //收益显示
    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;
    @property(cc.Label)
    qianLabel: cc.Label = null;
    @property(cc.Label)
    baiLabel: cc.Label = null;
    @property(cc.Label)
    siLabel: cc.Label = null;
    @property(cc.Label)
    geLabel: cc.Label = null;
    //选择数量
    @property(cc.Label)
    numberLabel: cc.Label = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    listLayout: cc.Node = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Node)
    earningBoxOut: cc.Node = null;
    @property(cc.Prefab)
    earningBoxPrefab: cc.Prefab = null;

    @property(cc.Button)
    helpButton: cc.Button = null;

    readonly MAX_SIZE: number = 50;

    /**选择的装备  数据列表 */
    itemDates: Array<BagItem> = [];
    itemNodes: Array<cc.Node> = [];

    earning: number = 0;
    earningList: Array<RecyclingResult> = [];
    from: cc.Node = null;
    earningBoxPool: cc.NodePool;

    isRunning: boolean = false;
    onLoad() {

        this.earningBoxPool = new cc.NodePool();
        for (let i = 0; i < 5; ++i) {
            let enemy = cc.instantiate(this.earningBoxPrefab); // 创建节点
            this.earningBoxPool.put(enemy); // 通过 putInPool 接口放入对象池
        }
    }

    async start() {
        await this.init();
        this.initEvents();
    }

    async init() {
        let itemDatas = BagData.getInstance().getAllEquipments();

        let filter = (item: BagItem) => {
            let quality = item.getPrototype().fmap(x => x.quality).getOrElse(ItemQuality.Purple);
            return (quality === ItemQuality.Green && (item.data as Equipment).enhanceLevel == 0)
        }
        this.itemDates = R.filter(filter, itemDatas)

        this.qianLabel.string = '0';
        this.baiLabel.string = '0';
        this.siLabel.string = '0';
        this.geLabel.string = '0';

        this.setData(this.itemDates);
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.addBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openSelectPanel.bind(this)));
        this.refiningBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.confirmRefining.bind(this)));
        this.iconSprite.node.on(cc.Node.EventType.TOUCH_END, this.show195Tips.bind(this));
        this.helpButton.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 3));
    }

    async confirmRefining() {
        if (this.isRunning || this.itemDates.length <= 0) {
            return;
        }
        let isEnhance = enhanceLevel => (enhanceLevel > 0);
        let enhances = R.filter(isEnhance, R.map(R.path(['data', 'enhanceLevel']), this.itemDates));
        let isNotGreen = (bagItem: BagItem) => {
            let prototype = bagItem.getPrototype();
            if (prototype.isValid()) {
                return prototype.getValue().quality != ItemQuality.Green;
            }
            return true;
        }
        let prioritys = R.filter(isNotGreen, this.itemDates);
        if (enhances.length > 0 || prioritys.length > 0) {
            let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
            let confirmBox = cc.instantiate(prefab).getComponent(SecondConfirmBox);
			[confirmBox.node.x, confirmBox.node.y] = [0, 0];
            confirmBox.node.height = CommonUtils.getViewHeight();
            confirmBox.init('选择炼化的物品中包含<color=#2c5e07>已经强化过</color>的或<color=#900404>较高品质</color>的装备，确认炼化吗？', this.onRefiningEnt.bind(this));
			confirmBox.from = this.node;
            confirmBox.node.parent = this.node.parent;
        } else {
            await this.onRefiningEnt();
        }
    }

    /**申请炼化 */
    async onRefiningEnt() {
        this.isRunning = true;
        await this.equipmentToFly();
        let params = R.map(R.path(['data', 'id']), this.itemDates).join();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/recycle', [params]) as any;
        if (response.status === 0) {
            BagData.getInstance().removeBagItems(this.itemDates);
            this.itemDates.splice(0, this.itemDates.length);
            this.earningList = response.content;
            await this.toEarning();
            this.setData(this.itemDates);
        }
        this.isRunning = false;
    }

    async equipmentToFly() {
        let duration = 0.5;
        let ationTime = 0;
        if (this.itemNodes.length > 9) {
            ationTime = duration / 4 / (this.itemNodes.length / 10);
        } else {
            ationTime = duration / 4;
        }
        this.scrollView.scrollToLeft();
        this.scrollView.enabled = false;
        for (let i = 0; i < this.itemNodes.length; i++) {
            let moveto = cc.moveTo(duration, cc.v2(-66, 386));
            let scaleTo = cc.scaleTo(duration, 0.3);
            let worldPos = this.itemNodes[i].parent.convertToWorldSpaceAR(this.itemNodes[i].position);
            this.itemNodes[i].parent = this.itemNodes[i].parent.parent.parent;
            this.itemNodes[i].position = this.itemNodes[i].parent.convertToNodeSpaceAR(worldPos);
            this.itemNodes[i].runAction(moveto);
            this.itemNodes[i].runAction(scaleTo);
            this.opacityEquipment(duration, this.itemNodes[i]);
            await CommonUtils.wait(ationTime);
        }
        await CommonUtils.wait(duration);
    }

    async opacityEquipment(duration, equipment: cc.Node) {
        await CommonUtils.wait(duration);
        equipment.opacity = 0;
    }

    setData(data: Array<BagItem>) {
        this.initData(data);

    }
    refreshData() {
        this.itemDates = this._data.value;
        super.refreshData();
    }
    refreshState() {
        this.scrollView.enabled = true;

        //清除
        this.itemNodes.forEach((item, index) => {
            item.removeFromParent();
        });
        this.itemNodes = [];
        this.itemDates.forEach((item, index) => {
            if (index < this.MAX_SIZE) {
                let enemy = this.createEquipment(this.listLayout, this.itemPrefab);
                let article = enemy.getComponent(ArticleItem);
                article.init(item);
                article.showStrengthening(item);
                this.itemNodes.push(enemy);
            }
        });
        this.numberLabel.string = this.itemDates.length.toString();
        this.scrollView.scrollToLeft();
        super.refreshState();
    }

    async toEarning() {
        let earningMax = 0;
        for (let i = 0; i < this.earningList.length; i++) {
            if (i < this.MAX_SIZE) {
                await this.startEarningBox(this.earningList[i]);
            } else {
                earningMax += this.earningList[i].currencyStack.amount;
            }
            this.earning += this.earningList[i].currencyStack.amount;
        }
        //数字太多，不播放动画
        if (earningMax > 0) {
            this.setMaxEarning(earningMax);
        }
    }

    setMaxEarning(amount: number) {
        let enemy = this.createEnemy(this.earningBoxOut, this.earningBoxPool, this.earningBoxPrefab);
        enemy.getComponent(EarningBox).init(0.2, amount, false);
        this.closeEarningBox(enemy);
        this.geLabel.string = parseInt((this.earning % 10).toString()).toString();
        this.siLabel.string = parseInt((this.earning / 10 % 10).toString()).toString();
        this.baiLabel.string = parseInt((this.earning / 100 % 10).toString()).toString();
        this.qianLabel.string = parseInt((this.earning / 1000 % 10).toString()).toString();
    }
    async startEarningBox(item: RecyclingResult) {
        let enemy = this.createEnemy(this.earningBoxOut, this.earningBoxPool, this.earningBoxPrefab);
        enemy.getComponent(EarningBox).init(0.2, item.currencyStack.amount, item.bingo);
        this.closeEarningBox(enemy);
        await this.earningBeating(item.currencyStack.amount);
        //  await CommonUtils.wait(0.2);
    }

    async closeEarningBox(box: cc.Node) {
        await CommonUtils.wait(1.2);
        this.onEnemyKilled(box, this.earningBoxPool);
    }

    async earningBeating(timing: number) {
        let qian, bai, shi, ge = 0;
        for (let i = 0; i < timing; i++) {
            qian = parseInt(this.qianLabel.string);
            bai = parseInt(this.baiLabel.string);
            shi = parseInt(this.siLabel.string);
            ge = parseInt(this.geLabel.string);
            ge += 1;

            if (ge == 10) { ge = 0; shi += 1; }
            if (shi == 10) { shi = 0; bai += 1; }
            if (bai == 10) { bai = 0; qian += 1; }
            this.geLabel.string = ge.toString();
            this.siLabel.string = shi.toString();
            this.baiLabel.string = bai.toString();
            this.qianLabel.string = qian.toString();
            await CommonUtils.wait(0.01 / (timing / 10));
        }
    }

    createEnemy(parentNode, enemyPool, itemPrefab) {
        let enemy = null;
        if (enemyPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            enemy = enemyPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            enemy = cc.instantiate(itemPrefab);
        }
        enemy.parent = parentNode; // 将生成的装备加入节点树
        return enemy;
    }
    createEquipment(parentNode, itemPrefab) {
        let enemy = null;
        enemy = cc.instantiate(itemPrefab);
        enemy.parent = parentNode; // 将生成的装备加入节点树
        return enemy;
    }
    onEnemyKilled(enemy, enemyPool) {
        // enemy 应该是一个 cc.Node
        enemyPool.put(enemy); // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
    }

    closePanel(event) {
        if (this.from != null) {
            this.from.active = true;
        }
        this.earningBoxPool.clear();
        CommonUtils.safeRemove(this.node);
    }

    async openSelectPanel() {
        if (this.isRunning) {
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/bag/selectEquipmentPanel', SelectEquipmentPanel) as SelectEquipmentPanel;
        panel.fromPanel = this;
        panel.init(this._data.value);
        this.node.active = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async show195Tips(event: cc.Event.EventTouch) {
        let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
        let bagItem = new BagItem();
        bagItem.data = { currencyId: 195, amount: 1, accountId: PlayerData.getInstance().accountId };
        bagItem.category = ItemCategory.Currency;
        panel.init(bagItem.getItemDisplay(), R.prop('amount', bagItem.data), true);
        let location = event.getLocationInView();
        let func = R.compose(
            R.min(768 / 2 - panel.tipNode.width / 2),
            R.max(panel.tipNode.width / 2 - 768 / 2)
        );
        panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
        panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
}
