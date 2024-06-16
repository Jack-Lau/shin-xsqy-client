import PagingControl from "../../base/PagingControl";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { DiscipleRecord, PlayerBaseInfo } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import PlayerData from "../../data/PlayerData";
import DiscipleRecordPrefab from "./DiscipleRecordPrefab";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorRecordPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    // master
    @property(cc.Sprite)
    mentorPlayerIcon: cc.Sprite = null;
    @property(cc.Sprite)
    mentorSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    mentorNameLabel: cc.Label = null;

    // myself
    @property(cc.Sprite)
    myPlayerIcon: cc.Sprite = null;
    @property(cc.Sprite)
    mySchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    myNameLabel: cc.Label = null;

    // my disciples
    @property(cc.Prefab)
    discipleRecordPrefab: cc.Prefab = null;
    @property(PagingControl)
    pageControl: PagingControl = null;
    @property(cc.Layout)
    group: cc.Layout = null;

    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;

    // data
    masterInfo: PlayerBaseInfo = null;
    discipleInfoArray: Array<PlayerBaseInfo> = [];
    readonly PAGE_SIZE = 9;

    start() {
        this.initEvents();
        this.init();

    }

    async init() {
        await this.initTop();
        await this.initDisciples();
        this.pageControl.init(Math.max(Math.ceil(this.discipleInfoArray.length / this.PAGE_SIZE), 1), this.initByPage.bind(this));
        this.emptyNode.active = this.discipleInfoArray.length == 0;
    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        let _this = this;
        this.mentorPlayerIcon.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (undefined == _this.masterInfo) {
                return;
            } else {
                CommonUtils.showViewPlayerBox(_this.masterInfo);
            }
        });
    }

    async initTop() {
        let result = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        this.mentorNameLabel.string = "";
        if (result.isRight) {
            let result2 = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [String(result.right.masterAccountId)]);
            if (result2.isRight) {
                this.masterInfo = result2.right[0]
                this.mentorNameLabel.string = this.masterInfo.player.playerName;
                this.mentorPlayerIcon.spriteFrame = await ResUtils.getPlayerCircleIconById(this.masterInfo.player.prefabId);
                this.mentorSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(this.masterInfo.schoolId));
            }
        } 
        this.myNameLabel.string = PlayerData.getInstance().playerName;
        this.mySchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(PlayerData.getInstance().schoolId));
        this.myPlayerIcon.spriteFrame = await ResUtils.getPlayerCircleIconById(PlayerData.getInstance().prefabId);
    }

    async initDisciples() {
        let result = await NetUtils.get<Array<DiscipleRecord>>('/impartation/disciple/myDisciples', []);
        if (result.right) {
            let accountIds = result.right.filter(x => x.phase == 'END' && x.discipleConfirmed && x.masterConfirmed).map(y => y.accountId);
            let result2 = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [accountIds.join(',')]);
            if (result2.isRight) {
                this.discipleInfoArray = result2.right;
            }
        }
    }

    initByPage(page: number) {
        this.pageControl.setPage(page);
        let data = R.slice((page - 1) * this.PAGE_SIZE, page * this.PAGE_SIZE, this.discipleInfoArray);
        this.group.node.removeAllChildren();
        data.forEach(info => {
            let item = cc.instantiate(this.discipleRecordPrefab).getComponent(DiscipleRecordPrefab);
            item.init(info);
            item.node.parent = this.group.node;
        })
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
