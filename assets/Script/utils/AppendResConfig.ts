// (id, {small, big})
export const currencyIds = {
  191: { small: "ui/revive/fishing/icon_diaoyudian", big: "ui/revive/fishing/钓鱼点"},
  192: { small: "ui/revive/fishing/icon_diaoyudian", big: "ui/revive/fishing/初级钓竿"},
  193: { small: "ui/revive/fishing/icon_diaoyudian", big: "ui/revive/fishing/高级钓竿"},
  195: { small: "ui/revive/soul/魂晶-小", big: "ui/revive/soul/魂晶"}
}

// 新增宠物技能图标
// (id, path)
export const petSkillIds = {
  310129: "ui/icon/icon_batiji"
}

// 新增或覆盖的活动资源

/** 
 * 活动的字体资源
 * - "{activityId}_[12]": "{url}"
 * - _1: 活动开启状态
 * - _2: 活动未开启状态
 */
export const activityFonts: {[key: string]: string} = {
  "157004_1": "ui/gameplay/activityEntry/font_huanlezhuanpan",
  "157004_2": "ui/gameplay/activityEntry/font_huanlezhuanpan01",
  "157009_1": "ui/revive/fishing/font_huanlediaoyu1",
  "157009_2": "ui/revive/fishing/font_huanlediaoyu2",
  "158005_1": "ui/gameplay/activityEntry/font_zhoumojiayao",
  "158005_2": "ui/gameplay/activityEntry/font_zhoumojiayao0",
  "158007_1": "ui/gameplay/activityEntry/font_fuxingjianglin1",
  "158007_2": "ui/gameplay/activityEntry/font_fuxingjianglin2",
  "158006_1": "ui/gameplay/activityEntry/font_zaixianyouli01",
  "158006_2": "ui/gameplay/activityEntry/font_zaixianyouli02",
  "159014": "ui/gameplay/activityEntry/font_yingtingzhuanshang"
}

/** 
 * 活动的图片预览资源
 * - "{activityId}_[12]": "{url}"
 * - _1: 活动开启状态
 * - _2: 活动未开启状态
 */
export const activityPictures: {[key: string]: string} = {
  "157004_1": "ui/gameplay/activityEntry/bg_huanledazhuanpan_1",
  "157004_2": "ui/gameplay/activityEntry/bg_huanledazhuanpan_2",
  "157005_1": "ui/gameplay/activityEntry/bg_share_1",
  "157005_2": 'ui/gameplay/activityEntry/bg_share_2',
  "157009_1": "ui/revive/fishing/bg_diaoyu",
  "157009_2": "ui/revive/fishing/bg_diaoyu2",
  "158005_1": "ui/gameplay/activityEntry/bg_zhoumojiayao_1",
  "158005_2": "ui/gameplay/activityEntry/bg_zhoumojiayao_2",
  "158007_1": "ui/gameplay/activityEntry/bg_fuxingjianglin01",
  "158007_2": "ui/gameplay/activityEntry/bg_fuxingjianglin02",
  "158006_1": "ui/gameplay/activityEntry/bg_zaixianyouli01",
  "158006_2": "ui/gameplay/activityEntry/bg_zaixianyouli02",
}