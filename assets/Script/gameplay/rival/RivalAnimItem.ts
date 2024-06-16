import Optional from "../../cocosExtend/Optional";
import { TitleConfig } from "../../player/title/TitleConfig";
import { ResUtils } from "../../utils/ResUtils";
import { MovieclipUtils } from "../../utils/MovieclipUtils";

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
export default class RivalAnimItem extends cc.Component {

    @property(cc.Node)
    unBg: cc.Node = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Sprite)
    schoolText: cc.Sprite = null;
    @property(cc.Sprite)
    schoolImage: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    bigHeadSps: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    schoolTextSps: cc.SpriteFrame[] = [];

    start() {

    }

    async init(data: Optional<{ accountId: number, schoolId: number, definitionId: number, prefabId: number, weaponId: number, name: string, level: number, fc: number }>) {
        if (data.isValid()) {
            this.unBg.active = false;
            this.nameLabel.node.parent.active = true;
            this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(data.fmap(x => x.schoolId));

            let indexImg = 0;
            let prefabId = data.fmap(x => x.prefabId).getOrElse(4000002);
            if (prefabId == 4000001) {
                indexImg = 0;
            } else if (prefabId == 4000002) {
                indexImg = 1;
            } else if (prefabId == 4000003) {
                indexImg = 2;
            } else if (prefabId == 4000004) {
                indexImg = 3;
            }
            this.schoolImage.spriteFrame = this.bigHeadSps[indexImg];

            let indexText = 4;
            let schoolId = data.fmap(x => x.schoolId).getOrElse(0);
            if (schoolId == 101) {
                indexText = 0;
            } else if (schoolId == 102) {
                indexText = 1;
            } else if (schoolId == 103) {
                indexText = 2;
            } else if (schoolId == 104) {
                indexText = 3;
            }
            if (indexText == 4) {
                this.schoolText.spriteFrame = await ResUtils.loadSpriteFromAltas('ui/gameplay/rival/rivalPanel', 'font_wupai');
            } else {
                this.schoolText.spriteFrame = this.schoolTextSps[indexText];
            }

            this.nameLabel.string = data.fmap(x => x.name).getOrElse('');
            this.fcLabel.string = data.fmap(x => x.fc).getOrElse(0).toString();

        } else {
            this.unBg.active = true;
            this.nameLabel.node.parent.active = false;
        }
    }

    // update (dt) {}
}
