import CommonTips from "../base/CommonTips";
import { CommonUtils } from "../utils/CommonUtils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class UpdateNewsPanel extends cc.Component {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.RichText)
    content: cc.RichText = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    from: cc.Node = null;

    updateNews = {
        "newsDate" : "2022年1月14日 更新公告",
        "update" : [
            {  
                title: "<b>【新增内容】</b>",
                content: "1、新增装备附魂系统，能进一步提高装备的能力了。\n\n"
					   + "2、新增宠物附魂系统，能进一步提高宠物的能力了。\n\n"
					   + "3、调整一本万利的游戏规则：\n"
					   + "   壹：调整本票的价格曲线\n"
					   + "   贰：购买一张本票倒计时增加1分钟->10分钟\n"
					   + "   叁：新增绝杀率（购买本票时一定几率直接终结游戏，倒计时越少绝杀率越高）\n"
					   + "   肆：从购买第1001张本票开始无需人机验证\n"
					   + "   伍：开启新一轮游戏的等待时间从10分钟->60分钟\n\n"
					   + "4、调整欢乐筒筒的单局竞猜上限：5000仙石->10000仙石。\n\n"
					   + "5、调整红包六六六的报名费用和红包奖励：均放大为原来的10倍。\n\n"
					   + "6、调整宠物界面，去除“扭蛋”页签，现在扭蛋功能位于建邺城汝阳处。\n\n"
					   + "7、调整藏宝图奖励：仙石*10000（0.1%）->长乐贡牌*1（9%）。\n\n"
					   + "8、调整三界经商的数值设计（仙石兑换材料的比例不变）：\n"
					   + "   壹：调整所有级别商人的经商时间为24小时\n"
					   + "   贰：调整经商每次产出奖励的间隔：10分钟->60分钟\n"
					   + "   叁：调整各级别商人的经商消耗（50000元宝/1000仙石/3000仙石/10000仙石/20000仙石/50000仙石）\n"
					   + "   肆：新增魂晶的经商地点（地府，需要角色等级达到90级）\n\n"
					   + "9、调整分解装备宠物的奖励：\n"
					   + "   壹：分解装备宠物不再产出强化石和冲星灵丹，改为产出魂晶\n"
					   + "   贰：分解1个绿色装备宠物产出浮动数量的魂晶\n"
					   + "   叁：分解1个蓝色装备宠物产出300魂晶\n"
					   + "   肆：分解1个紫色装备宠物产出900魂晶\n\n"
					   + "10、调整乱斗大会和王者决战兑换商店的奖励：新增魂晶礼盒。\n\n"
					   + "11、调整黑市拍卖的拍品：新增魂晶礼包。\n\n"
					   + "12、调整矿山探宝的大奖：强化石->魂晶。\n\n"
            }, 
            {  
                title: "<b>【问题修复】</b>",
                content: "1、修复欢乐大转盘转出长乐贡牌的世界公告文案不正确的问题。\n\n"
            }, 
            {  
                title: "<b>【特别提醒壹】</b>",
                content: "我司不会以任何形式出售或回购本游戏内所有货币、装备、宠物及其他一切物品，本游戏也不存在任何的充值内购和广告变现，因此引发的所有法律风险与我司无关！"
            }, 
            {  
                title: "<b>【特别提醒贰】</b>",
                content: "仙石奇缘是我司前几年两个不成功（不成功到血本无归、几个月就停服的程度）的氪金游戏的精神续作，我们复活它只是为了给自己前几年的工作有始有终，让它存活于世。"
            }, 
            {  
                title: "<b>【特别提醒叁】</b>",
                content: "好好享受游戏本身就可以了，我们正在努力达到不靠游戏赚钱也能有收入来源，可以快乐做自己想做的游戏的阶段（本来是打算靠做氪金游戏达到这个阶段的，但没成功）。"
            }, 
        ]
    }

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});

        this.content.maxWidth = 560;

        this.titleLabel.string = this.updateNews.newsDate;

        let contentString = "";
        for (let update of this.updateNews.update) {
            contentString += update.title + '\n' + CommonUtils.textToRichText(update.content) + '\n\n'
        }

        this.content.string = contentString;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
        if (this.from) {
            this.from.active = true;
        }
    }

    // update (dt) {}
}
