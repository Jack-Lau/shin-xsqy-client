import { CommonUtils } from "../../utils/CommonUtils";
import { PlayerBaseInfo, DisciplineRequest, CandidateMaster } from "../../net/Protocol";
import SearchMentorItem from "./SearchMentorItem";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class SearchMentorPanel extends cc.Component {
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    searchBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    refreshBtn: cc.Button = null;
    @property(cc.Button)
    onekeyBtn: cc.Button = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Node)
    itemGroup: cc.Node = null;

    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    data: Array<CandidateMaster> = [];
    currentIds: Array<CandidateMaster> = [];
    cache: {[key: string]: PlayerBaseInfo} = {};
    requested: Array<number> = [];

    start () {
        this.init();
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 18));
        this.searchBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.search.bind(this)));
        this.refreshBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.refresh.bind(this)));
        this.onekeyBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onekeySend.bind(this)));
        EventDispatcher.on(Notify.MENTOR_SEND_NEW_REQUEST, this.onSendNewRequest);
    }

    async init () {
        await this.initData();
        await this.refresh();
    }

    async initData () {
        let result = await NetUtils.get<Array<CandidateMaster>>('/impartation/viewRandomMasterAccountId', []);
        this.data = result.getOrElse([]);
        let result2 = await NetUtils.get<Array<DisciplineRequest>>('/impartation/disciplineRequest/fromMe/', []);
        this.requested = result2.fmap(x => x.map(y => y.masterAccountId)).getOrElse([]);
    }

    async refresh () {
        let arr = CommonUtils.sample(5, this.data);
        this.currentIds = arr;
        await this.initByArr(arr);
    }

    async initByArr(arr: Array<CandidateMaster>) {
        let accountIds = arr.filter(x => undefined == R.prop(x.accountId, this.cache)).map(x => x.accountId);
        if (accountIds.length > 0) {
            let infoArray = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [accountIds.join(',')]);
            if (infoArray.isRight) {
                infoArray.right.forEach(info => {
                    this.cache[info.player.accountId] = info;
                })
            }
        }
        this.itemGroup.removeAllChildren();
        arr.forEach(master => {
            let item = cc.instantiate(this.itemPrefab).getComponent(SearchMentorItem);
            item.init(this.cache[master.accountId], this.requested.indexOf(master.accountId) != -1, master.discipleCount);
            item.node.parent = this.itemGroup;
        });
    }

    async search () {
        if ('' == this.editBox.string) {
            TipsManager.showMessage('查询内容不可为空');
            return;
        }
        if (isNaN(parseInt(this.editBox.string))) {
            let result = await NetUtils.get<PlayerBaseInfo>('/player/viewBaseInfoByName', [this.editBox.string]);
            if (result.isRight) {
                this.itemGroup.removeAllChildren();
                let item = cc.instantiate(this.itemPrefab).getComponent(SearchMentorItem);
                let count = await NetUtils.get<number>('/impartation/disciple/countByMasterAccountId', [result.right.player.accountId])
                item.init(result.right, this.requested.indexOf(result.right.player.accountId) != -1, count.getOrElse(0));
                item.node.parent = this.itemGroup;
            } else {
                TipsManager.showMessage('查询不到该玩家，请检查输入');
            }
        } else {
            let result = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [this.editBox.string]);
            if (result.isRight && result.right.length > 0) {
                this.itemGroup.removeAllChildren();
                let item = cc.instantiate(this.itemPrefab).getComponent(SearchMentorItem);
                let count = await NetUtils.get<number>('/impartation/disciple/countByMasterAccountId', [result.right[0].player.accountId])
                item.init(result.right[0], this.requested.indexOf(result.right[0].player.accountId) != -1, count.getOrElse(0));
                item.node.parent = this.itemGroup;
            } else {
                TipsManager.showMessage('查询不到该玩家，请检查输入');
            }
        }
    }

    async onekeySend() {
        let accountIds = this.currentIds.filter(x => this.requested.indexOf(x.accountId) == -1);
        let results = await Promise.all(accountIds.map(id => NetUtils.post<DisciplineRequest>('/impartation/disciplineRequest/fromMe/{masterAccountId}/create', [id.accountId])))
        results.forEach(result => {
            if (result.isRight) {
                this.requested.push(result.right.masterAccountId);
            }
        })
        await this.initByArr(this.currentIds);
    }

    onSendNewRequest = function (event) {
        let request = event.detail.request;
        this.requested.push(request.masterAccountId);
    }.bind(this);

    closePanel () {
        EventDispatcher.off(Notify.MENTOR_SEND_NEW_REQUEST, this.onSendNewRequest);
        CommonUtils.safeRemove(this.node)
    }
}
