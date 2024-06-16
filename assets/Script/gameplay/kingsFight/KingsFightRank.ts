import KingsFightRank1 from "./kingsFightRank/KingsFightRank1";
import KingsFightRank2 from "./kingsFightRank/KingsFightRank2";
import KingsFightRank3 from "./kingsFightRank/KingsFightRank3";
import KingsFightRank4 from "./kingsFightRank/KingsFightRank4";
import KingsFightRank5 from "./kingsFightRank/KingsFightRank5";
import { KingsFightConfig } from "./KingsFightConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class KingsFightRank extends cc.Component {
    // ranks 
    @property(KingsFightRank1)
    rank1: KingsFightRank1 = null;
    @property(KingsFightRank2)
    rank2: KingsFightRank2 = null;
    @property(KingsFightRank3)
    rank3: KingsFightRank3 = null;
    @property(KingsFightRank4)
    rank4: KingsFightRank4 = null;
    @property(KingsFightRank5)
    rank5: KingsFightRank5 = null;

    @property([cc.Node])
    starsNodes: Array<cc.Node> = [];

    grade = 1;

    init (grade: number, showStar = false) {
        this.grade = grade;
        if (grade < KingsFightConfig.MAX_GRADE) {
            let config = KingsFightConfig.getSeasonConfig(grade);
            if (config) {
                let rankArr = config.cRank.split('_').map(x => parseInt(x));
                R.range(1, 6).map(x => this[`rank${x}`]).forEach(y => y.node.active = false);
                this[`rank${rankArr[0]}`].init(rankArr[1], rankArr[2]);
                this[`rank${rankArr[0]}`].node.active = true;
            }
        } else {
            this.rank1.node.active = this.rank2.node.active = this.rank3.node.active = this.rank4.node.active = false;
            this.rank5.node.active =  true;
            this.rank5.init(0, grade - KingsFightConfig.MAX_GRADE);
        }
        this.starsNodes.forEach(starNode => starNode.active = showStar);
    }

    // 
    getCurrentStar(): cc.Node {
        let config = null;
        if (this.grade < KingsFightConfig.MAX_GRADE) {
            config = KingsFightConfig.getSeasonConfig(this.grade);
        } else {
           return null;
        }
        let rankArr = config.cRank.split('_').map(x => parseInt(x));
        return this[`rank${rankArr[0]}`].stars[rankArr[2] - 1].node;
    }
}