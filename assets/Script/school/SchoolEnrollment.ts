import Item from "../base/Item";
import { CommonUtils } from "../utils/CommonUtils";
import SkillTips from "../base/SkillTips";
import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import { QuestManager } from "../quest/QuestManager";
import PlayerData from "../data/PlayerData";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SchoolEnrollment extends cc.Component {
    @property(Item)
    skill1: Item = null;
    @property(Item)
    skill2: Item = null;
    @property(Item)
    skill3: Item = null;
    @property(Item)
    skill4: Item = null;

    @property(cc.Sprite)
    skillName1: cc.Sprite = null;
    @property(cc.Sprite)
    skillName2: cc.Sprite = null;
    @property(cc.Sprite)
    skillName3: cc.Sprite = null;
    @property(cc.Sprite)
    skillName4: cc.Sprite = null;

    @property(cc.Sprite)
    masterBg: cc.Sprite = null;
    @property(cc.Sprite)
    schoolName: cc.Sprite = null;

    @property(cc.Sprite)
    schoolIcon1: cc.Sprite = null;
    @property(cc.Sprite)
    schoolName1: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon2: cc.Sprite = null;
    @property(cc.Sprite)
    schoolName2: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon3: cc.Sprite = null;
    @property(cc.Sprite)
    schoolName3: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon4: cc.Sprite = null;
    @property(cc.Sprite)
    schoolName4: cc.Sprite = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.SpriteAtlas)
    schoolAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    skillAtlas: cc.SpriteAtlas = null;

    @property([cc.SpriteFrame])
    masterSFs: Array<cc.SpriteFrame> = [];

    @property(cc.Sprite)
    tipsBlock: cc.Sprite = null;

    @property(SkillTips)
    skillTips: SkillTips = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Sprite)
    eff1: cc.Sprite = null;

    @property(cc.Sprite)
    eff2: cc.Sprite = null;

    @property(cc.Sprite)
    eff3: cc.Sprite = null;

    @property(cc.Sprite)
    eff4: cc.Sprite = null;

    @property(cc.Sprite)
    skillBg1: cc.Sprite = null;
    @property(cc.Sprite)
    skillBg2: cc.Sprite = null;
    @property(cc.Sprite)
    skillBg3: cc.Sprite = null;
    @property(cc.Sprite)
    skillBg4: cc.Sprite = null;

    resources = {
        1: {
            "schoolNameV": "font_wuzhuangguang",
            "schoolNameH1": "font_wuzhuangguang2",
            "schoolNameH2": "font_wuzhuangguang3",
            "skillIcon1": "104100",
            "skillIcon2": "104200",
            "skillIcon3": "104400",
            "skillIcon4": "104700",
            "schoolIcon1": "icon_xiaoyaopai1",
            "schoolIcon2": "icon_xiaoyaopai",
            "skillName1": "font_wanhuaguiyijue",
            "skillName2": "font_jianyucangfeng",
            "skillName3": "font_shangshanruoshui",
            "skillName4": "font_bafangyanmie",
            "skillBg1": "bg_wuzhuangkuang1",
            "skillBg2": "bg_wuzhuangkuang2",
        },
        2: {
            "schoolNameV": "font_putuoshan",
            "schoolNameH1": "font_putuoshan2",
            "schoolNameH2": "font_putuoshan3",
            "skillIcon1": "102700",
            "skillIcon2": "102300",
            "skillIcon3": "102500",
            "skillIcon4": "102200",
            "schoolIcon1": "icon_jinghuagong1",
            "schoolIcon2": "icon_jinghuagong",
            "skillName1": "font_dacixinguangdu",
            "skillName2": "font_huifengyinlu",
            "skillName3": "font_fanpuguizhen",
            "skillName4": "font_lianhuamiaofa",
            "skillBg1": "bg_putuokuang1",
            "skillBg2": "bg_putuokuang2",
        },
        3: {
            "schoolNameV": "font_lingxiaodian",
            "schoolNameH1": "font_lingxiaodiian2",
            "schoolNameH2": "font_lingxiaodian3",
            "skillIcon1": "101100",
            "skillIcon2": "101500",
            "skillIcon3": "101700",
            "skillIcon4": "101400",
            "schoolIcon1": "icon_jiuxiaocheng1",
            "schoolIcon2": "icon_jiuxiaocheng",
            "skillName1": "font_sibianjjing",
            "skillName2": "font_qianjunji",
            "skillName3": "font_canglongjianqi",
            "skillName4": "font_guishenqi",
            "skillBg1": "bg_lingxiaokuang1",
            "skillBg2": "bg_lingxiaokuang2",
        },
        4: {
            "schoolNameV": "font_pansidong",
            "schoolNameH1": "font_pansidong2",
            "schoolNameH2": "font_pansidong3",
            "skillIcon1": "103500",
            "skillIcon2": "103300",
            "skillIcon3": "103400",
            "skillIcon4": "103100",
            "schoolIcon1": "icon_tiandumen1",
            "schoolIcon2": "icon_tiandumen",
            "skillName1": "font_qishajue",
            "skillName2": "font_fenghunzhou",
            "skillName3": "font_gouhunsi",
            "skillName4": "font_wangushixin",
            "skillBg1": "bg_pansikuang1",
            "skillBg2": "bg_pansikuang2",
        }
    }

    currentIndex = -1;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    start() {
        this.schoolIcon1.node.on(cc.Node.EventType.TOUCH_END, this.schoolIconOnClick(1).bind(this));
        this.schoolIcon2.node.on(cc.Node.EventType.TOUCH_END, this.schoolIconOnClick(2).bind(this));
        this.schoolIcon3.node.on(cc.Node.EventType.TOUCH_END, this.schoolIconOnClick(3).bind(this));
        this.schoolIcon4.node.on(cc.Node.EventType.TOUCH_END, this.schoolIconOnClick(4).bind(this));

        this.tipsBlock.node.on(cc.Node.EventType.TOUCH_END, function() {
            this.tipsBlock.node.active = this.skillTips.node.active = false;
        }.bind(this));

        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});

        this.skill1.node.on(cc.Node.EventType.TOUCH_END, this.showSkillTips(1).bind(this));
        this.skill2.node.on(cc.Node.EventType.TOUCH_END, this.showSkillTips(2).bind(this));
        this.skill3.node.on(cc.Node.EventType.TOUCH_END, this.showSkillTips(3).bind(this));
        this.skill4.node.on(cc.Node.EventType.TOUCH_END, this.showSkillTips(4).bind(this));

        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.enrollSchool.bind(this)));

        let rand = CommonUtils.randomInt(1, 4);
        this.schoolIconOnClick(rand)();
    }

    schoolIconOnClick(index) {
        return function () {
            if (this.currentIndex == index) {
                return;
            }
            this.schoolName.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['schoolNameV']);
            this.skill1.iconImage.spriteFrame = this.skillAtlas.getSpriteFrame(this.resources[index]['skillIcon1']);
            this.skill2.iconImage.spriteFrame = this.skillAtlas.getSpriteFrame(this.resources[index]['skillIcon2']);
            this.skill3.iconImage.spriteFrame = this.skillAtlas.getSpriteFrame(this.resources[index]['skillIcon3']);
            this.skill4.iconImage.spriteFrame = this.skillAtlas.getSpriteFrame(this.resources[index]['skillIcon4']);

            this.skillName1.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['skillName1']);
            this.skillName2.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['skillName2']);
            this.skillName3.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['skillName3']);
            this.skillName4.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['skillName4']);

            this.masterBg.spriteFrame = this.masterSFs[index - 1];

            this.schoolIcon1.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[1]['schoolIcon1']);
            this.schoolIcon2.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[2]['schoolIcon1']);
            this.schoolIcon3.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[3]['schoolIcon1']);
            this.schoolIcon4.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[4]['schoolIcon1']);

            this.schoolName1.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[1]['schoolNameH1']);
            this.schoolName2.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[2]['schoolNameH1']);
            this.schoolName3.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[3]['schoolNameH1']);
            this.schoolName4.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[4]['schoolNameH1']);
            this.skillBg4.spriteFrame = this.skillBg1.spriteFrame = this.skillBg2.spriteFrame = this.skillBg3.spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['skillBg1']);

            this['schoolIcon' + index].spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['schoolIcon2']);
            this['schoolName' + index].spriteFrame = this.schoolAtlas.getSpriteFrame(this.resources[index]['schoolNameH2']);
            
            this.eff1.node.active = this.eff2.node.active = this.eff3.node.active = this.eff4.node.active = false;
            this['eff' + index].node.active = true;

            this.currentIndex = index;
        }.bind(this);
    }

    showSkillTips(skillIndex) {
        return function() {
            this.tipsBlock.node.active = this.skillTips.node.active = true;
            this.skillTips.icon.spriteFrame = this.skillAtlas.getSpriteFrame(this.resources[this.currentIndex]['skillIcon' + skillIndex]);
            let config = this.skillConfig[this.currentIndex][skillIndex];
            this.skillTips.skillName.string = config["ability"];
            this.skillTips.category.string = config["type"];
            this.skillTips.description.string = CommonUtils.textToRichText(config["description"]);
        }.bind(this);
    }

    getSchoolId() {
        if (this.currentIndex === 1) {
            return 104;
        } else if (this.currentIndex === 2) {
            return 102;
        } else if (this.currentIndex === 3) {
            return 101;
        } else {
            return 103;
        }
    }

    async enrollSchool() {
        let schoolId = this.getSchoolId();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/school/create', [schoolId]) as any;
        if (response.status == 0) {
            TipsManager.showMessage('门派拜入成功！');
            PlayerData.getInstance().schoolId = schoolId;
            // 尝试完成引导任务
            await QuestManager.finishQuest(700011, schoolId - 101);
            EventDispatcher.dispatch(Notify.REFRESH_PLAYER_INFO, {});
        }
        CommonUtils.safeRemove(this.node);
    }

    skillConfig = {
        "1": {
            "1": {
                "description": "连续[26df21]4次[ffffff]随机选择敌方单个目标造成高额内功伤害",
                "type": "怒气技能",
                "id": 13,
                "ability": "万化归一诀"
            },
            "2": {
                "description": "对敌方最多[26df21]4个目标[ffffff]造成内功伤害",
                "type": "普通技能",
                "id": 14,
                "ability": "剑雨藏锋"
            },
            "3": {
                "description": "五庄观门派特色，提升[26df21]自身连击率[ffffff]",
                "type": "被动技能",
                "id": 15,
                "ability": "上善若水"
            },
            "4": {
                "description": "驱动八方之灵，对[26df21]敌方全体[ffffff]造成大量内功伤害！",
                "type": "终极技能",
                "id": 16,
                "ability": "八方湮灭"
            }
        },
        "2": {
            "1": {
                "description": "[26df21]复活[ffffff]友方单体，或对敌方单体造成大量[26df21]内功伤害[ffffff]",
                "type": "怒气技能",
                "id": 5,
                "ability": "大慈心光渡"
            },
            "2": {
                "description": "为友方[26df21]3个目标[ffffff]回复气血",
                "type": "普通技能",
                "id": 6,
                "ability": "回风饮露"
            },
            "3": {
                "description": "普陀山门派特色，回合结束时[26df21]回复自身[ffffff]气血",
                "type": "被动技能",
                "id": 7,
                "ability": "返璞归真"
            },
            "4": {
                "description": "慈悲莲华池上绽，妙法无上度众生，回复[26df21]友方全体[ffffff]大量气血！",
                "type": "终极技能",
                "id": 8,
                "ability": "莲华妙法"
            },
        },
        "3": {
            "1": {
                "description": "对[26df21]敌方4个[ffffff]目标造成强力外功伤害",
                "type": "怒气技能",
                "id": 1,
                "ability": "四边静"
            },
            "2": {
                "description": "对敌方单体造成[26df21]2次[ffffff]外功伤害",
                "type": "普通技能",
                "id": 2,
                "ability": "千钧击"
            },
            "3": {
                "description": "凌霄殿门派特色，提升[26df21]自身暴击率[ffffff]",
                "type": "被动技能",
                "id": 3,
                "ability": "藏龙剑气"
            },
            "4": {
                "description": "鬼来杀鬼，神来弑神！对敌方单体进行致命的[26df21]5段[ffffff]攻击！",
                "type": "终极技能",
                "id": 4,
                "ability": "鬼神泣"
            },
        },
        "4": {
            "1": {
                "description": "大幅提升友方全体的[26df21]攻击与防御[ffffff]，持续3回合",
                "type": "怒气技能",
                "id": 9,
                "ability": "七煞诀"
            },
            "2": {
                "description": "对敌方单体释放[26df21]封印[ffffff]并造成持续伤害，持续3回合",
                "type": "普通技能",
                "id": 10,
                "ability": "封魂咒"
            },
            "3": {
                "description": "盘丝洞门派特色，提升[26df21]自身吸血率[ffffff]",
                "type": "被动技能",
                "id": 11,
                "ability": "勾魂丝"
            },
            "4": {
                "description": "驱万千魔蛊，封印敌方[26df21]3个[ffffff]目标[26df21]并造成持续伤害[ffffff]，持续2回合！",
                "type": "终极技能",
                "id": 12,
                "ability": "万蛊噬心"
            },
        }
    }
    // update (dt) {}
}
