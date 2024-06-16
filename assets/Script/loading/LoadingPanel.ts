import { CommonUtils } from "../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingPanel extends cc.Component {
    @property(cc.ProgressBar)
    process: cc.ProgressBar = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    @property(cc.Label)
    tipsLabel: cc.Label = null;

    tips: Array<String> = [
    "在战斗中释放的怒气技能是扭转战局的关键",
    "体型比一般怪物大的敌方会免疫封印效果",
    "首次加载战斗所需时间较长，请耐心等候~",
    "战斗中点击右下角“技”字即可切换自动和手动",
    "了解不同门派的特性才能在战斗中运筹帷幄",
    "若对游戏有好的建议欢迎加入官方社群反馈~",
    "速度属性的高低关系到您出手先后的顺序",
    "回复技能回复的气血值也是可以暴击的哦",
    "神佑可使您在受到致命一击之后概率满血复活",
    "通过装备重铸，可以使装备拥有多个特效"]


    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.showTips();
        this.fadeIn()
    }

    onEnable() {
        this.fadeIn()
    }

    fadeIn () {
        this.node.opacity = 0;
		let action = cc.fadeTo(0.5, 255);
		this.node.runAction(action);
    }

    fadeOut() {
		let action = cc.fadeTo(0.5, 0);
		this.node.runAction(action);
        return CommonUtils.wait(0.5)
    }

    async showTips () {
        if (!this.node || !this.node.parent) {
            return;
        }
        let tip = CommonUtils.randomOne(this.tips);
        this.tipsLabel.string = tip;
        await CommonUtils.wait(1);
        await this.showTips();
    }

    load (resArray: string[]) {
        let _this = this;
        return new Promise(function(resolve) {
            let progressCallback = (completeCount, totalCount, item) => {
                _this.descriptionLabel.string = '正在加载资源... ' + Math.floor(completeCount * 100 / totalCount) + '%';
                _this.process.progress = completeCount / totalCount;
            }
            let completeCallback = (err: Error, res: any[]) => {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                resolve(res);
            }
            cc.resources.load(resArray, cc.SpriteAtlas, progressCallback,  completeCallback);
        });
    }

    loadScene(scene: string) {
        const _this = this;
        return new Promise<void>(function(resolve) {
           cc.director.preloadScene(scene, (completeCount, totalCount) => {
                _this.descriptionLabel.string = '正在加载资源... ' + Math.floor(completeCount * 100 / totalCount) + '%';
                _this.process.progress = completeCount / totalCount;
            }, (err) => {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                resolve();
            })
        })
    }
    // update (dt) {}
}
