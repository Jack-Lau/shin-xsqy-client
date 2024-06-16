import { ConfigUtils } from "../utils/ConfigUtil";
import { Npc } from "./Npc";
import NpcSelection from "./NpcSelection";
import { QuestProxy } from "../quest/QuestProxy";

type NpcSelectionConfig = { [key: string]: NpcSelection };
type NpcText = { [key: string]: string };
type Npcs = { [key: string]: Npc };

export default class NpcConfig {
    public static _instance: NpcConfig;
    public npcSelections: NpcSelectionConfig = {};
    public npcTexts: NpcText = {};
    public npcs: Npcs = {};
    public questToNpcs = {};
    public normalNpcs = {};

    public static getInstance(): NpcConfig {
        if (!this._instance) {
            this._instance = new NpcConfig();
        }
        return this._instance;
    }

    constructor() {

    }

    async init() {
        let npcsJson = await ConfigUtils.getConfigJson("NpcInformations");
        let npcSelectionsJson = await ConfigUtils.getConfigJson("NpcSelections");
        let npcTextsJson = await ConfigUtils.getConfigJson("NpcTexts");

        // load npc text
        for (var key in npcTextsJson) {
            try {
                let value = npcTextsJson[key];
                this.npcTexts[key] = value["content"];
            } catch (e) {
                console.error(e)
                console.log(key)
            }
        }

        // load npc selection
        for (key in npcSelectionsJson) {
            let value = npcSelectionsJson[key];
            let npcSelection = new NpcSelection();
            npcSelection.id = value.id;
            npcSelection.npcId = value.npcId;
            npcSelection.textId = value.selection;
            npcSelection.closeNpcPanel = (value.subSelectionId == undefined && value.skip == undefined);
            npcSelection.text = this.npcTexts[value.selectionTextId];

            if (value.selectionArts) {
                npcSelection.selectionArts = value.selectionArts;
            }
            if (value.npcTextId == undefined || value.npcTextId == "") {
                npcSelection.npcTextIdArray = [];
            } else {
                npcSelection.npcTextIdArray = (value.npcTextId + "").split(",").map(function (item) {
                    return parseInt(item);
                });
            }
            if (value.subSelectionId == undefined) {
                npcSelection.subSelectionIdArray = [];
            } else {
                value.subSelectionId += "";
                npcSelection.subSelectionIdArray = value.subSelectionId.split(",").map(function (item) {
                    return parseInt(item);
                });
            }
            npcSelection.goto = value.skip;
            npcSelection.needSort = value.sortCorrection != 1;
            if (value.bubble) {
                npcSelection.bubbleId = value.bubble;
            }
            if (value.clickEventType) {
                npcSelection.clickEventType = value.clickEventType;
            }
            if (value.clickEventParam) {
                npcSelection.clickEventParam = value.clickEventParam;
            }
            npcSelection.autoClick = value.autoClick ? 1 : 0;
            this.npcSelections[key] = npcSelection;
        }

        // load Npc Information
        for (var key in npcsJson) {
            let value = npcsJson[key];
            let npc = new Npc();
            npc.id = value.id;
            npc.selectionId = parseInt(value.selectionId);

            if (npc.selectionId) {
                // if (! this.npcSelections[value.selectionId]) {
                //     console.log(value.selectionId);
                // }
                // npc.chatIdArray = this.npcSelections[value.selectionId].npcTextIdArray;
                if (this.npcSelections[value.selectionId]) {
                    npc.selectionIdArray = this.npcSelections[value.selectionId].subSelectionIdArray;
                } else {
                }
            }
            npc.name = value.name;
            npc.locationMapName = value.locationMapName;
            npc.prefabId = value.prefabId;
            if (value.titleType != null) {
                npc.titleType = value.titleType;
            } else {
                npc.titleType = 0;
            }
            npc.title = value.title;
            if (npc.title == undefined) {
                npc.title = "";
            }

            npc.location.x = value.xPos; 
            npc.location.y = value.yPos;
            npc.direction = value.caterTo;
            npc.locationMapId = value.locationMapId;
            if (!this.normalNpcs[value.locationMapId]) {
                this.normalNpcs[value.locationMapId] = [];
            }
            if (!value.needQuestId && !value.needActivityId) {
                this.normalNpcs[value.locationMapId].push(npc.id);
            }

            npc.canNavigation = value.navigation == 0 ? false : true;
            npc.needQuestId = value.needQuestId;

            let questIdArray = (value.needQuestId + "").split(",");
            for (let i = 0; i < questIdArray.length; ++i) {
                let questCondition = questIdArray[i].split("_");
                let questId = questCondition[0];
                let behaviourId = questCondition[1];
                if (!questId) {
                    continue;
                }
                if (undefined == this.questToNpcs[questId]) {
                    this.questToNpcs[questId] = {npcs: []};
                }
                if (behaviourId) {
                    if (undefined == this.questToNpcs[questId][behaviourId]) {
                        this.questToNpcs[questId][behaviourId] = [];
                    }
                    this.questToNpcs[questId][behaviourId].push(npc.id)
                } else {
                    this.questToNpcs[questId]["npcs"].push(npc.id);
                }
            }


            if (value.autoBubbleTextId) {
                npc.autoBubbleTextId = (value.autoBubbleTextId + "").split(",").map(function (item) {
                    return parseInt(item);
                });
                if (value.autoBubbleInterval) {
                    npc.autoBubbleInterval = value.autoBubbleInterval >= 5 ? value.autoBubbleInterval : 5;
                }
            }
            npc.pathfindXPos = value.pathfindXPos;
            npc.pathfindYPos = value.pathfindYPos;
            npc.campId = value.affiliatedCamp;
            this.npcs[key] = npc;
        }
    }

    getNpcsByQuest(questId, behaviourId: number) {
        if (undefined == this.questToNpcs[questId]) {
            return [];
        }
        let result = this.questToNpcs[questId]['npcs'] as Array<any>;
        if (behaviourId) {
            if (this.questToNpcs[questId][behaviourId]) {
                return result.concat(this.questToNpcs[questId][behaviourId])
            }
        }
        return result;
    }

    getNpcsByMapId(mapId: number) {
        let quests = QuestProxy.getAllQuests();
        let result = {
            "normal": [],
            "quest": []
        };
        for (let key in quests) {
            let quest = quests[key];
            let behaviourId = quest.randomBacId;
            result['quest'] = result['quest'].concat(this.getNpcsByQuest(key, behaviourId).filter(npcId => {
                return NpcConfig.getInstance().npcs[npcId].locationMapId == mapId;
            }));
        }
        let temp = this.normalNpcs[mapId];
        result['normal'] = temp ? temp : [];
        return result;
    }

    public getNpcFindPathPointById(id: number): cc.Vec2 {
        let npc = this.npcs[id];
        if (!npc || !npc["pathfindXPos"] || !npc["pathfindYPos"]) {
            return null;
        }
        return new cc.Vec2(npc["pathfindXPos"], npc["pathfindYPos"]);
    }
}