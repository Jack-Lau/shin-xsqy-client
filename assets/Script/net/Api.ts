export namespace API {
	export const params={
		"/account/register/createTest":["username","password"],
		"/account/register/createByPhone":["username","password","activationCode"],
		"/account/register/requestPhoneActivation":["phoneNumber","ticket","randStr"],
		"/account/register/verifyPhoneActivation":["phoneNumber","activationCode"],
		"/account/register/resetPassword":["username","password","activationCode"],
		"/account/register/createTronToken":[],
		"/account/view/myself":[],
		"/account/login":["username","password"],
		"/account/login-weixin":["code","from"],
		"/account/login-taptap":["accessToken","macKey"],
		"/account/login-apple":["code"],
		"/account/logout":[],
		"/account/addPassword":["username","password","activationCode"],
		"/account/login-kexingqiu":["ticketId"],
		"/account/login-tron":["address","token","sign"],
		"/account/login-qubi":["openid","openkey","nackname"],
		"/activity/overall":[],
		"/activity/triggerDailyReset":[],
		"/award/redeem":["currencyId"],
		"/battle/start":["battleDescriptorId","oneshot"],
		"/battle/view/{id}":["id"],
		"/battle/action/{id}/nextTurn":["id","turnCount","skillId","targetId"],
		"/battle/clean":[],
		"/chat/sendMessage":[],
		"/chat/public/view":[],
		"/chat/private/incomingInfo":[],
		"/chat/private/conversation":["anotherAccountId","page","size"],
		"/chat/private/markAlreadyRead":["senderAccountId"],
		"/chat/latestInterestingMessage/{id}":["id"],
		"/debug/setTimeOffset":["offset"],
		"/debug/resetToSystemTime":[],
		"/currency/view/{accountId}":["accountId"],
		"/currency/view/{accountId}/{currencyId}":["accountId","currencyId"],
		"/currency/logs":[],
		"/currency/giveMeMoney":["currencyId","amount"],
		"/currency/lastDayKuaibiDailiRecord":[],
		"/currency/todayKuaibiDailyRecord":[],
		"/equipment/view/{id}":["id"],
		"/equipment/view/{id}/detail":["id"],
		"/equipment/view/{id}/parameters":["id"],
		"/equipment/viewMine":[],
		"/equipment/createForTest":["definitionId"],
		"/equipment/action/{id}/arm":["id"],
		"/equipment/action/{id}/enhance":["id","useInsurance"],
		"/equipment/action/{id}/fusion":["id","subEquipmentId"],
		"/equipment/action/{id}/soul":["id"],
		"/equipment/action/{id}/wash":["id"],
		"/equipment/disarm":["partType"],
		"/equipment/forgePrice":[],
		"/equipment/forge":["expectedPrice"],
		"/equipment/recycle":["ids"],
		"/equipment/lastestInterestingForgings":[],
		"/equipment/prototype/{id}":["id"],
		"/equipment/redeem":["currencyId"],
		"/antique/get":[],
		"/antique/buy":[],
		"/antique/sell":[],
		"/antique/repair":["part"],
		"/antique/take":[],
		"/goldTower/getGoldTowerStatus":[],
		"/goldTower/getGoldTowerChallenge":[],
		"/goldTower/getGoldTowerRoom":["roomId"],
		"/goldTower/startOrReturnGoldTowerChallenge":[],
		"/goldTower/startGoldTowerBattle":[],
		"/goldTower/tryFinishGoldTowerChallenge":["param"],
		"/goldTower/openTreasure":[],
		"/goldTower/gotoNextRoom":["waypoint"],
		"/goldTower/getRanking":[],
		"/goldTower/getGoldTowerRecord":[],
		"/goldTower/startWipeOutBattle":[],
		"/goldTower/tryFinishWipeOutBattle":[],
		"/goldTower/upToTargetFloor":[],
		"/goldTower/takeWipeOutAward":[],
		"/idleMine/get":[],
		"/idleMine/price":[],
		"/idleMine/hire":["teamId","mapId","activePointsToUse","expectedPrice"],
		"/idleMine/balance":[],
		"/idleMine/shutdown":["index"],
		"/idleMine/take":[],
		"/idleMine/expand":[],
		"/kbdzp/view/myself":[],
		"/kbdzp/view/fever":[],
		"/kbdzp/recoverEnergy":[],
		"/kbdzp/enableBooster1":["activationCode"],
		"/kbdzp/enableBooster2":["activationCode"],
		"/kbdzp/makeTurn":[],
		"/kbdzp/obtainAward":[],
		"/kbdzp/latestInterestingAwards":[],
		"/kbdzp/obtainInviteeBonus":[],
		"/arena/view/myself":[],
		"/arena/viewRanking":["page","size"],
		"/arena/randomCandidates":[],
		"/arena/createRecord":[],
		"/arena/currentReward":[],
		"/arena/startChallenge":["targetPosition","kuaibiToUse"],
		"/arena/resolveReward":[],
		"/arena/obtainReward":[],
		"/arena/logs":[],
		"/secretShop/get":[],
		"/secretShop/getGrantingStats":[],
		"/secretShop/price":[],
		"/secretShop/draw":["expectedPrice","batchDraw"],
		"/secretShop/take":[],
		"/secretShop/exchange":[],
		"/treasure/obtainTreasure":[],
		"/yibenwanli/overrall":[],
		"/yibenwanli/view/myself":[],
		"/yibenwanli/purchase":["activePointsToUse","expectedPrice"],
		"/yibenwanli/tryPublishLastChangeBroadcast":[],
		"/gift/redeem":["code"],
		"/invitation/view/myself":[],
		"/invitation/create":["invitationCode"],
		"/invitation/verify":["invitationCode"],
		"/invitation/resolveInvitationReward":[],
		"/invitation/obtainInvitationReward":[],
		"/invitation/todayInvitationRewardLogs":[],
		"/invitation/groupedKbdzpReward":[],
		"/invitation/groupedKuaibiRewardLogs":[],
		"/invitation/extendInvitationLimit":[],
		"/mail/view/mine":["page","size"],
		"/mail/existsUnread":[],
		"/mail/action/{mailId}/markAlreadyRead":["mailId"],
		"/mail/action/{mailId}/obtainAttachment":["mailId"],
		"/mail/action/{mailId}/delete":["mailId"],
		"/mail/deleteNeedless":[],
		"/party/view/myself":[],
		"/party/requestCandidates":["highLevel"],
		"/party/requestCandidatesInFriends":["highLevel"],
		"/party/invite":["targetAccountId"],
		"/party/release":["targetAccountId"],
		"/party/resolveSupportReward":[],
		"/party/obtainSupportReward":[],
		"/party/latestSupportLogs":[],
		"/party/todaySupportReward":[],
		"/pet/view/mine/id":[],
		"/pet/view/legendaryOfMine/id":[],
		"/pet/view/{id}/parameters":["id"],
		"/pet/viewMineHasCandidateAbilitiesIds":[],
		"/pet/action/{id}/rename":["id","newName"],
		"/pet/action/{id}/gachaAbility":["id"],
		"/pet/action/{id}/aquireAbility":["id","abilityid"],
		"/pet/action/{id}/enhance":["id"],
		"/pet/action/{id}/fusion":["id","subPetId"],
		"/pet/action/{id}/soul":["id"],
		"/pet/action/{id}/wash":["id"],
		"/pet/viewDetail":["petIds"],
		"/pet/modifyBattleList":["petIds"],
		"/pet/createForTest":["definitionId"],
		"/pet/gachaPrice":[],
		"/pet/gacha":["expectedPrice"],
		"/pet/latestInterestingGachas":[],
		"/pet/triggerDailyReset":[],
		"/pet/gachaRanking":[],
		"/pet/gachaRankingAward":[],
		"/pet/gachaRankingShared":[],
		"/pet/obtainRankingAward":[],
		"/pet/recycle":["petIds"],
		"/pet/prototype/{id}":["id"],
		"/pet/redeem":["currencyId"],
		"/player/view/myself":[],
		"/player/view/{id}":["id"],
		"/player/view/myself/detail":[],
		"/player/viewNameUsed/{id}":["id"],
		"/player/action/myself/rename":["playerName"],
		"/player/view/{id}/detail":["id"],
		"/player/view":["accountIds"],
		"/player/viewName":["accountIds"],
		"/player/viewBaseInfo":["accountIds"],
		"/player/viewBaseInfoByName":["playerName"],
		"/player/viewDetail":["accountIds"],
		"/player/ghosts":["limit"],
		"/player/create":["playerName","prefabId"],
		"/player/createWithInvitation":["playerName","prefabId","invitationCode"],
		"/player/count":[],
		"/player/updateFc":[],
		"/player/getOnlineStatus":[],
		"/player/refreshOnlineStatus":["mapId","xPos","yPos","direction","status"],
		"/player/getOnlineStatusByIdList":["accountIds"],
		"/player/getOnlineStatusByMapId":["mapId","amount","excludeIds"],
		"/player/isThisPlayerOnline/{id}":["id"],
		"/quest/view/myself":[],
		"/quest/view/myself/{questId}":["questId"],
		"/quest/action/myself/{questId}/start":["questId"],
		"/quest/action/myself/{questId}/achieveObjective":["questId","objectiveIndex","args"],
		"/quest/triggerDailyReset":[],
		"/ranking/view/{id}":["id","topRecordSize"],
		"/ranking/view/{rankingId}/{accountId}/":["rankingId","accountId"],
		"/ranking/triggerDailyReset":[],
		"/school/view/myself":[],
		"/school/create":["schoolId"],
		"/school/levelup":["abilityIndex"],
		"/school/levelupAMAP":[],
		"/school/redeemExtraAbilityLevelLimit":["currencyId"],
		"/school/redeemChangeSchool":["currencyId","schoolId"],
		"/title/view/{id}":["id"],
		"/title/viewMine":[],
		"/title/action/{id}/primary":["id"],
		"/title/untitle":[],
		"/title/grantForTest":["definitionId"],
		"/title/redeem":["currencyId"],
		"/track/reportMessage":["message"],
		"/auction/commodity/{id}/bid":["id","price"],
		"/auction/createRecord":[],
		"/auction/commodity/deliverable":[],
		"/auction/withdrawAll":[],
		"/auction/commodity/{id}/like":["id"],
		"/auction/overall":[],
		"/multiplayerBattle/{id}":["id"],
		"/multiplayerBattle/{id}/viewSync":["id"],
		"/multiplayerBattle/attendingSessionIds":[],
		"/multiplayerBattle/startBattle":["redPartyAccountIds","bluePartyAccountIds"],
		"/multiplayerBattle/clean":[],
		"/multiplayerBattle/{id}/sync":["id"],
		"/cultivation/get":[],
		"/cultivation/make":["cultivationIndex","amountToConsume"],
		"/drug/take":["currencyId"],
		"/drug/get":[],
		"/fashion/getFashion":["fashionId"],
		"/fashion/getDye":["dyeId"],
		"/fashion/redeem":["currencyId"],
		"/fashion/getByAccountId":[],
		"/fashion/getDyeByAccountIdAndDefinitionId":["definitionId"],
		"/fashion/putOn":["fashionId"],
		"/fashion/putOff":[],
		"/fashion/addDye/{fashionId}":["fashionId"],
		"/fashion/chooseDye":["fashionId","dyeId"],
		"/fashion/putOffDye":["fashionId"],
		"/friend/getApply":[],
		"/friend/recommend":[],
		"/friend/batchHandle":["pass"],
		"/friend/get":[],
		"/friend/apply":["targetId"],
		"/friend/find":["accountIdOrName"],
		"/friend/delete":["targetId"],
		"/friend/handle":["actorId","pass"],
		"/baccarat/unBet":["betIndex"],
		"/baccarat/bet":["betIndex","amount"],
		"/baccarat/overall":[],
		"/baccarat/record":[],
		"/brawl/award":[],
		"/brawl/team":[],
		"/brawl/finish":[],
		"/brawl/get":[],
		"/brawl/start":[],
		"/brawl/reset":[],
		"/changlefang/exchange_kc":["amount"],
		"/changlefang/buy":["amount"],
		"/changlefang/get":[],
		"/changlefang/log":[],
		"/fishing/fish":[],
		"/fishing/buy":[],
		"/fishing/finish":["fishingOnceRecordId"],
		"/fishing/get":[],
		"/fxjl/startQuest":["index"],
		"/fxjl/resetQuest":["index"],
		"/fxjl/obtainAward":[],
		"/fxjl/createRecord":[],
		"/fxjl/overall":[],
		"/mineExploration/award":[],
		"/mineExploration/coupon":["couponSendId"],
		"/mineExploration/dig":["row","column"],
		"/mineExploration/add":[],
		"/mineExploration/get":[],
		"/mineExploration/start":[],
		"/mjdh/season/current":[],
		"/mjdh/season/current/detail":[],
		"/mjdh/player/myself":[],
		"/mjdh/player/{accountId}":["accountId"],
		"/mjdh/player/create":[],
		"/mjdh/winner/":[],
		"/mjdh/winner/{seasonId}/{ranking}":["seasonId","ranking"],
		"/mjdh/startMatch":[],
		"/mjdh/cancelMatch":[],
		"/mjdh/player/myself/obtainDailyFirstWinAward":[],
		"/mjdh/player/myself/obtainDailyConsecutiveWinAward":[],
		"/mjdh/player/myself/obtainDailyTenBattleAward":[],
		"/mjdh/battleLog/mine/":[],
		"/mjdh/triggerDailyReset":[],
		"/pk/send":["receiverId"],
		"/pk/async":["receiverId"],
		"/pk/receive":["senderId","isOK"],
		"/redPacket/today":[],
		"/redPacket/take":[],
		"/redPacket/get":[],
		"/redPacket/open":["redPacketId"],
		"/slots/getLike":[],
		"/slots/getFriendBigPrize":[],
		"/slots/pull":[],
		"/slots/takeLike":[],
		"/slots/like":["bigPrizeId"],
		"/slots/take":[],
		"/slots/lock":["slotIndex","lock"],
		"/slots/get":[],
		"/treasureBowl/attend":[],
		"/treasureBowl/today":[],
		"/treasureBowl/take":[],
		"/treasureBowl/get":[],
		"/work/update":[],
		"/work/end":[],
		"/work/start":[],
		"/yuanxiaojiayao/obtainAward":[],
		"/yuanxiaojiayao/attend":["targetAccountId"],
		"/yuanxiaojiayao/publishInvitation":[],
		"/yuanxiaojiayao/createRecord":[],
		"/yuanxiaojiayao/triggerDailyReset":[],
		"/yuanxiaojiayao/viewMyself":[],
		"/zxjl/obtainAward":["index"],
		"/zxjl/myself":[],
		"/impartation/disciple/meAsDisciple":[],
		"/impartation/disciple/myDisciples":[],
		"/impartation/disciple/countByMasterAccountId":["masterAccountId"],
		"/impartation/createOrChangeRole":["role"],
		"/impartation/disciplineRequest/fromMe/":[],
		"/impartation/disciplineRequest/toMe/":[],
		"/impartation/disciplineRequest/toMe/{discipleAccountId}/accept":["discipleAccountId"],
		"/impartation/disciplineRequest/toMe/clean":[],
		"/impartation/dailyPractice/mine/":[],
		"/impartation/dailyPractice/{accountId}/":["accountId"],
		"/impartation/dailyPractice/mine/generate":[],
		"/impartation/dailyPractice/mine/{id}/complete":["id"],
		"/impartation/dailyPractice/mine/complete":["ids"],
		"/impartation/dailyPractice/mine/{id}/obtainAward":["id"],
		"/impartation/disciple/meAsDisciple/confirm":[],
		"/impartation/disciple/myDisciples/{id}/confirm":["id"],
		"/impartation/disciple/meAsDisciple/obtainKuaibiPoolAward":[],
		"/impartation/disciple/myDisciples/{id}/obtainKuaibiPoolAward":["id"],
		"/impartation/disciple/meAsDisciple/obtainYuanbaoExpPoolAward":[],
		"/impartation/viewRandomMasterAccountId":[],
		"/impartation/disciple/{id}/currentKuaibiPool":["id"],
		"/impartation/disciple/meAsDisciple/delete":[],
		"/impartation/disciple/myDisciples/{id}/delete":["id"],
		"/impartation/triggerDailyReset":[],
		"/impartation/view/myself":[],
		"/impartation/disciplineRequest/fromMe/{masterAccountId}/create":["masterAccountId"],
		"/legendaryPet/redeem":["definitionId"],
		"/legendaryPet/generation/":[],
		"/legendaryPet/ascend":["petId"],
		"/legendaryPet/redeemSpecial":["currencyId"],
		"/market/consignment/{id}/purchase":["id"],
		"/market/consignment/mine":[],
		"/market/consignment/marked":[],
		"/market/consignment/":["page","size"],
		"/market/consignment/equipments":["part","color","maxEnhanceLevel","paramMatch","patk","matk","fc","effectMatch","effectIds","skillEnhancementEffectIds","page","size"],
		"/market/consignment/pets":["petDefinitionId","petRank","maxPetRank","aptitudeHp","aptitudeAtk","aptitudePdef","aptitudeMdef","aptitudeSpd","abilitiyMatch","abilityIds","page","size"],
		"/market/consignment/titles":["page","size"],
		"/market/consignment/create":["goodsType","goodsObjectId","price"],
		"/market/consignment/{id}/suspend":["id"],
		"/market/consignment/{id}/resume":["id","price"],
		"/market/consignment/{id}/cancel":["id"],
		"/market/marker/mine":[],
		"/market/consignment/{id}/mark":["id"],
		"/market/consignment/{id}/unmark":["id"],
		"/market/consignment/{id}/obtainPayment":["id"],
		"/market/consignment/{id}/obtainGoods":["id"],
		"/perk/ring/create":[],
		"/perk/ring/myself/makeSelection":["index","selection"],
		"/perk/ring/myself/switchSelection":["index","selection"],
		"/perk/ring/myself/makeProgress":["amountToConsume"],
		"/perk/ring/myself":[],
		"/shop/getCommodity":["commodityId"],
		"/shop/buy":["shopId","commodityId","amount","expectedPrice"],
		"/shop/getShop":["shopId"],
}}