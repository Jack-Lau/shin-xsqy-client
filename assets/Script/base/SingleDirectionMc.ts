import FashionModel from "../gameplay/fashion/FashionModel";
import { PlayerBaseInfo, FashionDye } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class SingleDirectionMc extends cc.Component {
    @property(cc.Sprite)
    player: cc.Sprite = null;
    @property(cc.Sprite)
    weapon: cc.Sprite = null;
    @property(FashionModel)
    model: FashionModel = null;

    start () {

    }


    init(info: PlayerBaseInfo, direction = "d") {
        let weaponId = CommonUtils.getWeaponId(info.player.prefabId, new Optional(info.weaponId));
        this.initAnimation(info.player.prefabId, weaponId, new Optional(info.weaponId), new Optional(info.fashionDefinitionId), new Optional(info.fashionDye), direction);
    }

    initMyself(direction = "d") {
        let prefabId = PlayerData.getInstance().prefabId;
        let weaponId = CommonUtils.getWeaponId(prefabId, PlayerData.getInstance().equipments["weapon"].fmap(x => x.definitionId));
        this.initAnimation(prefabId, weaponId, PlayerData.getInstance().equipments["weapon"].fmap(x => x.definitionId), PlayerData.getInstance().fashion.fmap(x => x.definitionId), PlayerData.getInstance().fashionDye, direction);
    }

    initAnimation(prefabId: number, weaponId: number, weaponOId: Optional<number>,  definitionId: Optional<number>, dye: Optional<FashionDye>, direction = "d") {
        if (definitionId.valid) {
            this.model.node.active = true;
            this.player.node.active = false;
            this.weapon.node.active = false;
            this.model.initByDirection(prefabId, weaponOId, definitionId.val, direction, dye);
        } else {
            this.player.node.active = true;
            this.weapon.node.active = true;
            this.model.node.active = false;
            this.initMc(prefabId, weaponId, direction);
        }
    }

    async initMc(prefabId: number, weaponId: number, direction) {
        let playerClip = await MovieclipUtils.getMovieclip(prefabId, 'stand_' + direction, 10) as cc.AnimationClip;
        let weaponClip = await MovieclipUtils.getMovieclip(weaponId, 'stand_' + direction, 10) as cc.AnimationClip;
        this.player.getComponent(cc.Animation).addClip(playerClip, 'stand_' + direction);
        this.weapon.getComponent(cc.Animation).addClip(weaponClip, 'stand_' + direction);
        let anchor = MovieclipUtils.getOffset(prefabId + "_stand_" + direction);
        this.player.node.anchorX = anchor.x;
        this.player.node.anchorY = anchor.y;
        this.weapon.node.anchorX = anchor.x;
        this.weapon.node.anchorY = anchor.y;
        this.player.getComponent(cc.Animation).play('stand_' + direction);
        this.weapon.getComponent(cc.Animation).play('stand_' + direction);
    }

}