import PagingControl from "../../base/PagingControl";
import SjjsItem from "./SjjsItem";
import { CommonUtils } from "../../utils/CommonUtils";
import CommonPanel from "../../base/CommonPanel";
import { CurrencyStack, IdleMineRecord } from "../../net/Protocol";
import SjjsAwardItem from "./SjjsAwardItem";
import Optional from "../../cocosExtend/Optional";
import { NetUtils } from "../../net/NetUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { TipsManager } from "../../base/TipsManager";
import { CurrencyId } from "../../config/CurrencyId";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SjjsPanel extends CommonPanel {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    // 三个位置
    @property([SjjsItem])
    items: Array<SjjsItem> = [];

    // 底部奖励
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Button)
    obtainBtn: cc.Button = null;
    @property(cc.Layout)
    awardLayout: cc.Layout = null;
    @property([SjjsAwardItem])
    awardItems: Array<SjjsAwardItem> = [];

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    awardList: Array<any> = [];

    readonly PAGE_SIZE = 10;

    start() {
        this.init();
    }

    async init() {
        this.initEvents();
        
        await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/idleMine/get', []);
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/balance', []);
        if (response.status === 0) {
            let data = response.content as IdleMineRecord;
            this.initWithRecord(data)
        }
        let _this = this;
        this.pageControl.init(Math.ceil(this._data.value.length / this.PAGE_SIZE), (page) => {
            _this._state.value = page;
        });
    }

    initWithRecord(data: IdleMineRecord) {
        let num = Math.min(data.availableMineQueueCount, 3);
        this.items.forEach((item, index) => {
                let trueIndex = index + 1;
                item.init(R.prop('mineQueueMapId_' + trueIndex, data) == null, trueIndex > num, {
                    "endTime": R.prop("mineQueueFinishTime_" + trueIndex, data),
                    "balanceTime": R.prop("mineQueueLastBalanceTime_" + trueIndex, data),
                    "mapId": R.prop("mineQueueMapId_" + trueIndex, data),
                    "teamId": R.prop("mineQueueTeamId_" + trueIndex, data),
                    "index": trueIndex
                })
            }
        )
        // console.log(data.idleMineRewardList, data.idleMineReward);
        this.awardList = data.idleMineRewardList;
        this.initData(data.idleMineRewardList)
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 11));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.obtainBtn.node.on(cc.Node.EventType.TOUCH_END, this.obtainBtnOnClick.bind(this));
        EventDispatcher.on(Notify.SJJS_PANEL_UPDATE, this.onUpdate);
    }

    initData(list) {
        let splitedAwards = []
        list.forEach(cs => {
            let amount = cs.currencyAmount;
            let max = cs.currencyId == CurrencyId.门贡 ? 1000 : (cs.currencyId == CurrencyId.经验 ? 1000000 : 10);
            if (amount > 10 * max) {
                max *= 10;
            }
            let arr = R.append(
                { currencyId: cs.currencyId, amount: amount % max },
                R.repeat(
                    { currencyId: cs.currencyId, amount: max },
                    Math.floor(amount / max)
                )
            )
            splitedAwards.push(arr);
        })
        this._data.value = this.flatten(splitedAwards);
    }

    // [[a]] -> [a]
    // 每次从最长的数组里面取出一个元素
    flatten(arr: Array<Array<CurrencyStack>>) {
        let result: Array<CurrencyStack> = [];
        let maxLength = this.getMaxLength(arr);
        while (maxLength > 0) {
            let index = R.findIndex(x => x.length == maxLength, arr);
            result.push(arr[index].shift());
            maxLength = this.getMaxLength(arr);
        }
        return result;
    }

    getMaxLength(arr: Array<Array<CurrencyStack>>) {
        return R.reduce((len, arr) => Math.max(len, arr.length), 0, arr);
    }

    refreshData() {
        super.refreshData()
    }

    refreshState() {
        let state = this._state.value;
        let arr = R.slice((state - 1) * this.PAGE_SIZE, state * this.PAGE_SIZE, this._data.value);
        this.pageControl.setPage(state);
        this.initAwards(arr);
        super.refreshState();
    }

    initAwards(arr: Array<CurrencyStack>) {
        this.awardItems.forEach((item, index) => {
            item.init(new Optional<CurrencyStack>(R.prop(index, arr)));
        });
    }

    closePanel() {
        EventDispatcher.off(Notify.SJJS_PANEL_UPDATE, this.onUpdate);
        CommonUtils.safeRemove(this.node);
    }

    async obtainBtnOnClick () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/take', []);
        if (response.status === 0) {
            this.awardList.forEach(ele => {
                TipsManager.showGainCurrency({currencyId: ele.currencyId, amount: ele.currencyAmount})
            });
            this.initWithRecord(response.content);
            let _this = this;
            this.pageControl.init(1, (page) => {
                _this._state.value = page;
            });
        }
    }

    onUpdate = function (event: EventDispatcher.NotifyEvent) {
        let data = event.detail.data;
        this.initWithRecord(data);
    }.bind(this);

}