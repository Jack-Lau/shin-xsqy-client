export namespace Notify {
	
    export const LOGIN = 'login';
    
    export const OPEN_PANEL = 'open_panel';
    export const ENTER_BATTLE = 'enter_battle';
    export const OPEN_PROTOCOL = 'open_protocol';

    // main scene
    export const HIDE_MAIN_UI = 'hide_main_ui';
    export const SHOW_MAIN_UI = 'show_main_ui';
    export const HIDE_FOR_BATTLE = 'hide_for_battle';
    export const SHOW_AFTER_BATTLE = 'show_after_battle';
    export const AUTO_FIND_NPC = 'auto_find_npc';
    export const SWITCH_TO_MAP_AND_FIND_NPC = "switch_to_map_and_find_npc";
    export const SWITCH_TO_MAP = 'switch_to_map';
    export const ADD_NPC_BY_ID = 'add_npc_by_id';
    export const REMOVE_NPC_BY_ID = 'remove_npc_by_id';
    export const REFRESH_QUEST_NPC = 'refresh_quest_npc';
    export const PLAYER_LEVEL_UP = 'player_level_up';
    export const PLAYER_UPDATE_EXP = 'player_update_exp';
    export const SHOW_BONUS_EFFECT = 'show_bonus_effect';
    export const REFRESH_PLAYER_INFO = 'refresh_player_info';
    export const REFRESH_TEAM_PARTNER = 'refresh_team_partner';
    export const ADD_COMPONENT_TO_MAP = 'add_component_to_map';         // 在地图上添加小物件
    export const REFRESH_ONLINE_STATUS_MYSELF = "refresh_online_status_myself";
    export const GET_SOME_PLAYER_IN_THIS_MAP = "get_some_player_in_this_map";
    export const SWITCH_MAP_EVENT = "switch_map_event"

    // main ui
    export const MAIN_UI_SET_REDDOT_VISIBLE = 'main_ui_set_reddot_visible';
    export const MAIN_UI_SHOW_NEW_MESSAGE = 'main_ui_show_new_message';
    export const MAIN_UI_FOLD_QUEST_CHASER = 'main_ui_fold_quest_chaser';
    export const MAIN_UI_ADD_RIGHT_DOWN_PANEL = 'main_ui_add_right_down_panel';
    export const MAIN_UI_REMOVE_RIGHT_DOWN_PANEL = 'main_ui_remove_right_down_panel';
    export const MAIN_UI_REMOVE_ALL_PANELS = 'main_ui_remove_all_panels';
	export const MAIN_UI_REFRESH_DRUG = 'main_ui_refresh_drug';

    // mail panel
    export const MAIL_PANEL_OPEN_DETAIL = 'mail_panel_open_detail';
    export const MAIL_PANEL_DELETE_MAIL = 'mail_panel_delete_mail';

    export const QUEST_MANAGER_UPDATE_QUEST = 'quest_manager_update_quest';
    export const QUEST_MANAGER_UPDATE_ALL_QUEST = 'quest_manager_update_all_quest';

    // chat msg
    export const CHAT_NEW_MSG = 'chat_new_msg';

    // quest
    export const QUEST_NEW_QUEST = 'quest_new_quest';
    export const QUEST_FINISH_QUEST = 'quest_finish_quest';

    // battle
    export const BATTLE_OPEN = 'battle_open';
    export const BATTLE_OPEN_WITH_PROMISE = 'battle_open_with_promise';
    export const BATTLE_START_OPERATION = 'battle_start_operation';

    // wallet
    export const WALLET_BAG_OPERATION_COMPLETE = 'wallet_bag_operation_complete';
    export const WALLET_CHAIN_OPERATION_COMPLETE = 'wallet_bag_operation_complete'
    export const WALLET_OPERATION_COMPLETE = 'wallet_operation_complete';
    export const WALLET_ITEM_ON_CLICK = 'wallet_item_on_click';

    // player panel
    export const PLYAER_WEAPON_CHANGE = 'player_weapon_change';
    export const PLAYER_REFRESH_NAME = 'player_refresh_name';

    // bag data
    export const BAG_ITEM_CHANGE = 'bag_item_change';
    export const BAG_ADD_NEW_EQUIPMENT = 'bag_add_new_equipment';
    export const BAG_REMOVE_EQUIPMENT = 'bag_remove_equipment';
    export const BAG_CURRENCY_NUM_CHANGE = 'bag_currency_number_change';

    // map
    export const MAP_CHANGED = 'map_changed';

    // team
    export const TEAMMATE_CHANGED = 'teammate_changed';

    // pet 
    export const PET_DATA_CHANGE = 'pet_data_change';
    export const PET_SELECT_MATERIAL = 'pet_select_material';
    export const PET_PANEL_CLOSE = 'pet_panel_close';

    // yqs
    export const YQS_BATTLE_END = 'yqs_battle_end';
    export const SHOW_BATTLE_ENTER_EFFECT = 'SHOW_BATTLE_ENTER_EFFECT';

    // 
    export const MUSIC_CHANGE = 'music_change';

    // 三界经商
    export const SJJS_PANEL_UPDATE = 'sjjs_panel_update';

	// wabao
    export const OPEN_DIG_TREASURE = 'open_dig_treasure';

    // quick use
    export const QUICK_USE_REFRESH = 'quick_use_refresh';

    // title
    export const PLAYER_TITLE_CHANGE = 'player_title_change';

    // friend
    export const UPDATA_MY_FRIENDS = 'updata_my_friends';
    export const UPDATA_APPLY_LIST = 'updata_apply_list';
    export const WEB_FRIEND_APPLY = 'web_friend_apply';
    export const WEB_FRIEND_PASS = 'web_friend_pass';
    export const FRIEND_CHAT_LIST = 'friend_chat_list';
    export const UPDATA_MY_FRIENDS_LASTMSG = 'updata_my_friends_lastmsg';
    export const FRIEND_CHAT_NEW_MSG = 'friend_chat_new_msg';
    export const UPDATA_FRIEND_CHAT_NEW_MSG = 'update_friend_chat_new_msg';
	
    // mentor
    export const MENTOR_UPDATE_DISCIPLE = 'mentor_update_disciple';
    export const MENTOR_SEND_NEW_REQUEST = 'mentor_send_new_quest';

    // kings fight
    export const KINGS_FIGHT_MATCH_END = "kings_fight_match_end";
    export const KINGS_FIGHT_SEARCH_FORCE_CLOSE = "kings_fight_search_force_close";

    // fashion
    export const FASHION_REFRESH_DYE = "fashion_refresh_dye";
    export const PLAYER_FASHION_REFRESH_DYE = "player_fashion_refresh_dye";
    export const FASHION_PUT_ON = 'fashion_put_on';
    export const FASHION_PUT_OFF = 'fashion_put_off';

    // localstorage
    export const SHOW_SSJP_DISPOSE_CONFIRM_BOX = "show_ssjp_dispose_confirm_box";
    export const SHOW_CASINO_GUIDE_PANEL = 'show_casino_guide_box';

    // hltt
    export const HLTT_OVERALL_UPDATE = "hltt_overall_update";

    // 广告观看成功
    export const ON_AD_SUCCESS = "on_ad_success"

    // Tap tap登录成功
    export const ON_TAP_LOGIN_SUCCESS = "on_tap_login_success"

    // Apple sign in
    export const ON_APPLE_SIGNIN_SUCCESS = "on_apple_signin_success"
	
	// 切磋
	export const PK_WAIT_RECEIVE_PANEL_CLOSE = "pk_wait_receive_panel_close"

}
