import ItemWithEffect from "../../base/ItemWithEffect";
import { Fashion } from "../../net/Protocol";
import { FashionConfig } from "./FashionConfig";
import PlayerData from "../../data/PlayerData";
import ItemConfig from "../../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionItem extends cc.Component {
    @property(cc.Node)
    selectedNode: cc.Node = null;
    @property(cc.Node)
    unselectedNode: cc.Node = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(ItemWithEffect)
    item: ItemWithEffect = null;

    set selected(value: boolean)  {
        this.selectedNode.active = value;
        this.unselectedNode.active = !value;
        this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, value ? '#931818' : '#ffffff')
        // if (value) {
        //     this.nameLabel.node.color = cc.hexToColor('#931818');
        // } else {
        //     this.nameLabel.node.color = cc.hexToColor('#ffffff');
        // }
    }

    get selected(): boolean {
        return !this.unselectedNode.active;
    }

    async init (fashion: Fashion) {
        let display = ItemConfig.getInstance().getItemDisplayById(fashion.definitionId, PlayerData.getInstance().prefabId);
        if (display.valid) {
            this.nameLabel.string = display.val.name;
            this.item.initWithFashion(fashion.definitionId);
            this.selected = false;
        }
    }

    set visible (value: boolean) {
        if (value == false) {
            this.selectedNode.active = false;
            this.nameLabel.node.active = false;
            this.item.node.active = false;
            this.unselectedNode.active = true;
        } else {
            this.nameLabel.node.active = true;
            this.item.node.active = true;
            this.selected = false;
        }
    }
}