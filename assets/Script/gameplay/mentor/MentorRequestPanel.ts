import { CommonUtils } from "../../utils/CommonUtils";
import PagingControl from "../../base/PagingControl";
import CommonPanel from "../../base/CommonPanel";
import { NetUtils } from "../../net/NetUtils";
import { PlayerBaseInfo, DisciplineRequest } from "../../net/Protocol";
import MentorRequestItem from "./mentorRequestItem";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { TipsManager } from "../../base/TipsManager";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorRequestPanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    @property(cc.Label)
    infoLabel: cc.Label = null;
    @property(PagingControl)
    pageControl: PagingControl = null;

    @property(cc.Button)
    acceptAllBtn: cc.Button = null;
    @property(cc.Button)
    rejectAllBtn: cc.Button = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Layout)
    itemGroup: cc.Layout = null;

    @property([MentorRequestItem])
    items: Array<MentorRequestItem> = [];

    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;

    // data
    discipleNum = 0;
    readonly PAGE_SIZE = 5;
    requests : Array<any> = [];
    baseInfoArray: Array<PlayerBaseInfo> = [];
    
    start () {
        this.initEvents();
    }

    async init (discipleNum: number) {
        if (undefined == discipleNum) {
            discipleNum = 0;
        }
        this.setDiscipleNum(discipleNum);
        await this.initContent();
    }

    setDiscipleNum (discipleNum: number) {
        this.discipleNum = discipleNum;
        this.infoLabel.string = `当前拥有徒弟数 ${discipleNum}/6`;
    }

    async initContent () {
        let result = await NetUtils.get<Array<any>>('/impartation/disciplineRequest/toMe/', []);
        let accountIdArray = result.fmap(x => x.map(y => y.accountId)).getOrElse([])
        this._data.value = [];
        if (accountIdArray.length > 0) {
	        let result2 = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [accountIdArray.join(',')]);
            if (result2.isRight) {
                this._data.value = result2.right;
                this.pageControl.init(Math.max(Math.ceil(result2.right.length / this.PAGE_SIZE), 1), this.onPageChange.bind(this))
            }
        } else {
            this.pageControl.init(1, this.onPageChange.bind(this))
        }
        this.emptyNode.active = accountIdArray.length == 0;
    }

    refreshState() {
        let page = this._state.value;
        let data = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this._data.value);
        let length = data.length;
        this.items.forEach((item, index) => {
            item.node.active = index < length;
            if (index < length) {
                item.init(data[index]);
            }
        });
        super.refreshState();
    }

    onPageChange(page: number) {
        this._state.value = page;
        this.pageControl.setPage(page);
    }

    onAddDisciple = async function () {
        this.setDiscipleNum(this.discipleNum + 1);
        await this.initContent();
    }.bind(this);

    initEvents () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 18));
        this.rejectAllBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.rejectAll.bind(this)));
        this.acceptAllBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.acceptAll.bind(this)));
        EventDispatcher.on(Notify.MENTOR_UPDATE_DISCIPLE, this.onAddDisciple);
    }

    async rejectAll() {
        let accountIds = R.take(6 - this.discipleNum, this._data.value).map(x => x.player.accountId);
        if (accountIds.length == 0) {
            return;
        }
        await NetUtils.post<any>('/impartation/disciplineRequest/toMe/clean', []);
        this.initContent();
    }

    async acceptAll() {
        if (this.discipleNum >= 6) {
            TipsManager.showMessage('当前拥有的徒弟已达上限');
            return;
        }
        let accountIds = R.take(6 - this.discipleNum, this._data.value).map(x => x.player.accountId);
        if (accountIds.length == 0) {
            return;
        }
        await CommonUtils.asyncForEach(accountIds, async (id) => {
            await NetUtils.post<any>('/impartation/disciplineRequest/toMe/{discipleAccountId}/accept', [id]);
        })
        TipsManager.showMessage('恭喜您收得一批好徒儿~要好好指导TA哦！');
        EventDispatcher.dispatch(Notify.MENTOR_UPDATE_DISCIPLE, {});
    }

    closePanel () {
        EventDispatcher.off(Notify.MENTOR_UPDATE_DISCIPLE, this.onAddDisciple);
        CommonUtils.safeRemove(this.node)
    }
}
