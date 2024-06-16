import { CommonUtils } from "../../utils/CommonUtils";
import QuickUseBox from "./QuickUseBox";
import { EventDispatcher } from "../../utils/event/EventDispatcher";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

export type RDName = "JGT" | "TRASURE" | "QUICK_USE";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RightDownComponent extends cc.Component {
    @property(QuickUseBox)
    quickUseBox: QuickUseBox = null;

    currentPanel: RDName = null;
    panels = {};
    start () {
        this.init();
    }

    init () {
        this._addPanel(this.quickUseBox, "QUICK_USE");
    }

    addPanel(event: EventDispatcher.NotifyEvent) {
        let panel = event.detail.panel;
        let panelName = event.detail.panelName;
        this._addPanel(panel, panelName);
    } 

    _addPanel(component: cc.Component, panelName: RDName) {
        if (this.currentPanel == panelName) {
            return;
        } else {
            this.panels[panelName] = component;
        }

        console.log(component.node.x, component.node.y);
        this.tryShowPanel();
    }

    removeByName(event: EventDispatcher.NotifyEvent) {
        let panelName = event.detail.panelName;
        this._removeByName(panelName);
    }

    _removeByName(panelName: RDName) {
        let panel = R.prop(panelName, this.panels);
        if (this.currentPanel == panelName) {
            CommonUtils.safeRemove(panel.node)
        }
        panel = null;
        delete this.panels[panelName];
        this.tryShowPanel();
    }

    tryShowPanel () {
        let panelNames = R.keys(this.panels);
        let panelName = R.head(R.sortBy(this.getPriority, panelNames));
        if (panelName && panelName != this.currentPanel) {
            if (panelName == "QUICK_USE") {
                this.quickUseBox.node.active = true;
            } else {
                this.panels[panelName].node.parent = this.node;
                this.quickUseBox.node.active = false;
            }
        }
        this.currentPanel = panelName;
    }

    getPriority (panel: RDName) {
        switch (panel) {
            case "JGT": return 1;
            case "TRASURE": return 2;
            case "QUICK_USE": return 100;
            default: return 100;
        }
    }

}
