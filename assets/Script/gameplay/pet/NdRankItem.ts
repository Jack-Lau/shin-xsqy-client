import { ResUtils } from "../../utils/ResUtils";
import { PetGachaRankingAwardRecord, PlayerBaseInfo } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NdRankItem extends cc.Component {
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

    // onLoad () {}

    start() {

    }

    async init(data: PetGachaRankingAwardRecord, player: PlayerBaseInfo) {
        if (!data) return;
        this.setRankBg(data.ranking);
        this.nameLabel.string = player.player.playerName;
        this.scoreLabel.string = data.finalPoint.toString();
        this.levelLabel.string = player.player.playerLevel + '级';
        this.head.spriteFrame = await ResUtils.getPlayerRectIconById(player.player.prefabId);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(player.schoolId));
    }

    async setRankBg(rank: number) {
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
