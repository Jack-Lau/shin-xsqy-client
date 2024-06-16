import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import ShareDetailItem from "../share/ShareDetailItem";
import { DiscipleRecord } from "../../net/Protocol";
import { MentorUtils } from "./MentorUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MentorDetailPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;

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

    @property(cc.Label)
    dailyBenefitLabel: cc.Label = null;

    @property(cc.Node)
    detailContentNode: cc.Node = null;

    @property(cc.Node)
    myAsDiscipleNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    from: cc.Node = null;

    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });
    }

    async init(records: Array<DiscipleRecord>) {
        this.initMyAsDisciple();
        let ratioConfig = await MentorUtils.getRatioConfig();
        let func = day => R.path([day + 1, 'masterProportion'], ratioConfig);
        let sumIdSort = R.sortWith([
            R.descend(R.prop('kbAmount')),
            R.ascend(R.prop('accountId'))
        ]);

        let data = [];
        await CommonUtils.asyncForEach(records, async (record) => {
            let pool = await MentorUtils.getPool(record.accountId);
            let deltaDay = CommonUtils.getDeltaDay(R.prop('confirmationDate', record))
            data.push(
                {
                    'kbAmount': CommonUtils.toCKb(func(deltaDay) * pool),
                    'accountId': record.accountId,
                    'record': record
                }
            )
        })
        let sum = data.reduce((sum, x) => sum + x.kbAmount, 0);
        this.sumLabel.string = String(sum);

        let content = sumIdSort(data);
        let accountIds = content.map(x => x.accountId);
        let nameArray = await NetUtils.get<Array<string>>('/player/viewName', [accountIds.join(',')])
        const num = 10;
        while (content.length < num) {
            content.push(null);
        }
        this.scrollView.content.removeAllChildren();
        let len = content.length;
        for (let i = 0; i < len; ++i) {
            let recordNode = cc.instantiate(this.recordPrefab);
            let item = recordNode.getComponent(ShareDetailItem);
            if (undefined == content[i]) {
                item.init(i + 1, null, true);
            } else {
                item.init(i + 1, { playerName: nameArray.right[i], sum: content[i].kbAmount }, true);
            }
            item.node.parent = this.scrollView.content;
        }
    }

    async initMyAsDisciple() {
        let result = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        if (result.isRight
            && result.right.masterConfirmed
            && result.right.discipleConfirmed
            && CommonUtils.getDeltaDay(R.prop('confirmationDate', result.right)) < 7
        ) {
            let day = CommonUtils.getDeltaDay(R.prop('confirmationDate', result.right));
            let ratio = await MentorUtils.getKbRatio(day + 1, true);
            let pool = await MentorUtils.getPool(result.right.accountId);
            this.dailyBenefitLabel.string = String(CommonUtils.toCKb(ratio * pool));
            this.detailContentNode.y = 0;
            this.bgNode.height = 890;
            this.myAsDiscipleNode.active = true;
        } else {
            this.bgNode.height = 840;
            this.detailContentNode.y = 35;
            this.myAsDiscipleNode.active = false;
        }
    }

    closePanel() {
        if (this.from) {
            this.from.active = true;
        }
        this.node.parent.removeChild(this.node);
    }
}
