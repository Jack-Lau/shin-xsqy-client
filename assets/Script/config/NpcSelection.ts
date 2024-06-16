/**
 * NPC 选项类
 * 作为一个NPC选项，其有被点击事件，有自己的文字
 * 当选项被点击时候，告诉任务管理器 *需要提交任务行为*
 * note: 文字是富文本
 *
 * NpcSelection 触发的事件
 * 1. 结束对话，完成 findNpc 行为  ［任务绑定］
 * 2. 结束对话
 * 3. 跳转下一句对话
 * 4. 跳转战斗 ［任务绑定］
 * 5. 跳转提交物品界面　[任务绑定]
 * 6. 触发一个可以带参数的点击事件
 */


export default class NpcSelection {
    public id: number;
    public textId: number;
    public subSelectionIdArray: Array<number>;
    public npcTextIdArray: Array<number>;

    public closeNpcPanel: boolean;
    public goto: number;
    public battleId : number = -1;
    public questBattle: boolean = false;
    public findNpcActionIsEnd: boolean = false;   // findNpc
    public progressId: number = 0;
    public toBattle: boolean = false;
    public toSumbitItem: boolean = false;
    public smtCurrencyId: number = 0;
    public smtCurrencyAmount: number = 0;
    public toFinishQuestChain: boolean = false;
    public result: string = "";
    public questId: number = -1;

    public itemObjectiveIndex: number = 0;
    public battleObjectiveIndex: number = 0;
    public npcObjectiveIndex: number = 0;
    public chainObjectiveIndex: number = 0;

    public npcId: number = -1;
    public isPickUpQuest: boolean = false;

    public clickEventType: string | number;
    public clickEventParam: string;

    public bubbleId: number = -1;
    public text: string = "";

    public selectionArts: number = 0;
    public autoClick: number = 0;

    public needSort: boolean = true;

    public constructor() {
    }
}

