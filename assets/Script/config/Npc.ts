import NpcConfig from "./NpcConfig";
import NpcSelection from "./NpcSelection";
import { runInThisContext } from "vm";

type selections = { [id: number]: NpcSelection; };
export class Npc {
    public id: number;
    public selections: selections;
    public name: string;
    public titleType: number;
    public title: string;
    public prefabId: number;
    public selectionId: number;
    public location: cc.Vec2 = new cc.Vec2(0, 0);
    public locationMapName: string;
    public canNavigation: boolean = true;
    public selectionIdArray: Array<number>;
    public extraSelectionIdArray: Array<number> = [];
    public locationMapId: number;
    public direction: string;
    public autoBubbleTextId: number[];
    public autoBubbleInterval: number = 5;
    public needQuestId: string;
    public needActivityId: string;
    private isAutoBubble = false;
    public pathfindXPos: number;
    public pathfindYPos: number;
    public campId: number;

    public tempNpcId?: number;
    public timeToDisappear?: number;

    public constructor() {
        this.selections = {};
    }

    public addSelectionById(selectionId: number): void {
        if (this.selectionIdArray.indexOf(selectionId) == -1) {
            if (this.extraSelectionIdArray.indexOf(selectionId) == -1) {
                this.extraSelectionIdArray.unshift(selectionId);
                let selection = NpcConfig.getInstance().npcSelections[this.selectionId];
                if (!selection.needSort) {
                    return;
                }
                this.extraSelectionIdArray.sort((a: number, b: number): number => {
                    let selectionA = NpcConfig.getInstance().npcSelections[a];
                    let selectionB = NpcConfig.getInstance().npcSelections[b];
                    if (selectionA.questId == -1 && selectionB.questId == -1) {
                        if (selectionA.id < selectionB.id) {
                            return 1;
                        } else {
                            return -1;
                        }
                    } else if (selectionA.questId == -1) {
                        return 1;
                    } else if (selectionB.questId == -1) {
                        return -1;
                    } else {
                        return -1;
                    }
                });
            }
        }
    }

    public removeSeletionbyId(selectionId: number, questId: number): void {
        let index = -1;
        for (let i = 0; i < this.extraSelectionIdArray.length; ++i) {
            if (this.extraSelectionIdArray[i] == selectionId 
                && NpcConfig.getInstance().npcSelections[this.extraSelectionIdArray[i]].questId == questId) {
                index = i;
                break;
            }
        }
        if (index != -1 && this.extraSelectionIdArray.length > 1) {
            this.extraSelectionIdArray.splice(index, 1);
        } else if (index != -1 && this.extraSelectionIdArray.length == 1) {
            this.extraSelectionIdArray = [];
        }
    }

    public getChatId(): number {
        // 随机获取闲话
        let chatIdArray = NpcConfig.getInstance().npcSelections[this.selectionId].npcTextIdArray
        let length = chatIdArray.length;
        let index = Math.floor(Math.random() * length);

        if (length == 0) {
            return -1;
        }
        return chatIdArray[index];
    }

    public startAutoBubble() {
        if (!this.isAutoBubble && this.autoBubbleTextId && this.autoBubbleTextId.length > 0) {
            this.isAutoBubble = true;
            this.autoBubble(this);
        }
    }

    public stopAutoBubble() {
        if (this.isAutoBubble) {
            this.isAutoBubble = false;
        }
    }

    public autoBubble(local: Npc) {
        // if (local.isAutoBubble) {
        //     if (!local.npcUI) {
        //         local.isAutoBubble = false;
        //         return;
        //     }
        //     local.npcUI.bubble(CommonUtils.textToTextFlow(NpcConfig.getInstance().
        //         npcTexts[local.autoBubbleTextId[Math.floor(Math.random() * local.autoBubbleTextId.length)]]));
        //     setTimeout(function (local: Npc) {
        //         local.autoBubble(local);
        //     }, local.autoBubbleInterval * 1000 * (1.2 - Math.random() * 0.4), local);
        // }
    }

}