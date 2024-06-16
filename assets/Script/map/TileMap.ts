import { CommonUtils } from "../utils/CommonUtils";
import { ResUtils } from "../utils/ResUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileMap extends cc.Component {

    @property
    mapResource: string = 'hello';

    @property(cc.Sprite)
    mapImage: cc.Sprite = null;


    onLoad () {
        
    }

    start () {

    }

    async init (resource: string) {
        this.mapImage.spriteFrame = await ResUtils.loadSprite(resource) as cc.SpriteFrame;
    }

    // update (dt) {}
}
