import { TitleConfig } from "./TitleConfig";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class TitlePanelItem extends cc.Component {
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    @property(cc.Sprite)
    picTitleSp: cc.Sprite = null;
    @property(cc.Label)
    textTitleLabel: cc.Label = null;
    @property(cc.Sprite)
    bgSp: cc.Sprite = null;
    @property(cc.Sprite)
    armFlagSp: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    titlePanelAtlas: cc.SpriteAtlas = null;
    
    titleId = null;

    start () {

    }

    async init (titleId, definitionId: number, selected) {
        let config = await TitleConfig.getConfigById(definitionId);
        this.titleId = definitionId;
        this.descriptionLabel.string = config.description;
        this.initBg(config.color, selected);
        if (config.type == 1) {
            await this.initPicTitle(config.picId);
        } else {
            this.initTextTitle(config.name);
        }
        let isArmed = PlayerData.getInstance().title.fmap(t => t.id == titleId).getOrElse(false);
        this.armFlagSp.node.active = isArmed;
    }

    async initPicTitle (picId: number) {
        this.picTitleSp.node.active = true;
        this.textTitleLabel.node.active = false;
        this.picTitleSp.spriteFrame = await ResUtils.getTitleIconById(picId);
    }

    initTextTitle (title: string) {
        this.picTitleSp.node.active = false;
        this.textTitleLabel.node.active = true;
        this.textTitleLabel.string = title;
    }

    initBg (color, selected) {
        this.bgSp.spriteFrame = this.getBgSfByColor(color, selected)
    }

    async setSelected(selected: boolean) {
        if (!this.titleId) {
            return;
        }
        let config = await TitleConfig.getConfigById(this.titleId);
        this.initBg(config.color, selected);
    }

    getBgSfByColor (color: number, selected: boolean) {
        let endStr = selected ? "xuanzhong" : "";
        switch (color) {
            case 1: return this.titlePanelAtlas.getSpriteFrame(`bg_baisepinzhi${endStr}`);
            case 2: return this.titlePanelAtlas.getSpriteFrame(`bg_lvsejibie${endStr}`);
            case 3: return this.titlePanelAtlas.getSpriteFrame(`bg_lansepinzhi${endStr}`);
            case 4: return this.titlePanelAtlas.getSpriteFrame(`bg_zisejibie${endStr}`);
            case 5: return this.titlePanelAtlas.getSpriteFrame(`bg_chengsejibie${endStr}`);
            case 6: return this.titlePanelAtlas.getSpriteFrame(`bg_wushuangjibie${endStr}`);
        }
        return this.titlePanelAtlas.getSpriteFrame(`bg_baisepinzhi${endStr}`);
    }
}
