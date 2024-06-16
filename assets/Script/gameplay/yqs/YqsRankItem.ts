import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import { PitDetail, PlayerBaseInfo } from "../../net/Protocol";
import { CommonUtils } from "../../utils/CommonUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YqsRankItem extends cc.Component {

    @property(cc.Label)
    rankLabel: cc.Label = null;
    @property(cc.Sprite)
    rankSp: cc.Sprite = null;
    @property(cc.Sprite)
    head: cc.Sprite = null;
    @property(cc.Sprite)
    bgItem: cc.Sprite = null;
    @property(cc.Sprite)
    infoBg: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    // data
    playerBaseInfo: Optional<PlayerBaseInfo> = new Optional<PlayerBaseInfo>();

    start() {
        let _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.playerBaseInfo.valid) {
                CommonUtils.showViewPlayerBox(_this.playerBaseInfo.val);
            }
        });
    }

    async init(element: PitDetail, info: PlayerBaseInfo) {
        this.playerBaseInfo = new Optional<PlayerBaseInfo>(info);
        this.setRankBg(element.pit.position);
        this.nameLabel.string = info.player.playerName;
        this.scoreLabel.string = R.take(6, String(element.factor).replace('.', '-')) + '%';
        this.levelLabel.string = `${info.player.playerLevel}级`;
        this.head.spriteFrame = await ResUtils.loadSpriteFromAltas('original/icon/icon_model', `icon_model-head_rect_${info.player.prefabId}`);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
    }

    setRankBg(rank: number) {
        let lessThan4 = rank < 4;
        this.bgItem.spriteFrame = this.getSf(lessThan4 ? `bg_paihangbangdi${rank}` : 'bg_paihangbangdi');
        this.infoBg.spriteFrame = this.getSf(lessThan4 ? `bg_paihangbangmingzidi${rank}` : 'bg_paihangbangmingzidi');
        this.rankSp.node.active = lessThan4;
        this.rankLabel.node.active = !lessThan4;
        if (lessThan4) {
            this.rankSp.spriteFrame = this.getSf(`icon_paihang${rank}`)
        } else {
            this.rankLabel.string = rank.toString();
        }
    }

    getSf (name: string): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(name);
    }
    // update (dt) {}
}
