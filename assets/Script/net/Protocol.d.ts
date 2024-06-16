/* tslint:disable */
// Generated using typescript-generator version 2.5.423 on 2019-03-01 12:23:16.

export interface ActivityComplex {
    activityPlayerRecord: ActivityPlayerRecord;
    activityRecords: ActivityRecord[];
}

export interface AuctionOverall {
    auctionRecord: AuctionRecord;
    onSaleCommodities: CommodityDetail[];
    commodityPlayerRecords: CommodityPlayerRecord[];
}

export interface AuctionRecord extends Serializable {
    accountId: number;
    likedToday: number;
    likedTodayLimit: number;
    stockKuaibi: number;
    lockedKuaibi: number;
}

export interface Commodity extends Serializable {
    id: number;
    definitionId: number;
    queueNumber: number;
    commodityStatus: CommodityStatus;
    lastBid: number;
    lastBidderAccountId: number;
    deadline: Date;
    broadcastPublished: boolean;
    delivered: boolean;
}

export interface CommodityDetail {
    commodity: Commodity;
    likeCount: number;
    bidderCount: number;
}

export interface CommodityPlayerRecord extends Serializable {
    commodityId: number;
    accountId: number;
    likeCount: number;
    bidded: boolean;
}

export interface CommodityWithdrawResult {
    equipments: Equipment[];
    pets: Pet[];
    titles: Title[];
}

export interface AntiqueOverall {
    antiqueSharedRecord: AntiqueSharedRecord;
    antiqueRecord: AntiqueRecord;
    awardResult: AwardResult;
}

export interface BaccaratBet extends Serializable {
    id: number;
    accountId: number;
    gameId: number;
    bet_0: number;
    bet_1: number;
    bet_2: number;
    bet_3: number;
    bet_4: number;
    bet_5: number;
    totalGain: number;
    createTime: Date;
    betsSum: number;
    bets: number[];
}

export interface BaccaratGame extends Serializable {
    id: number;
    redPoint_1: number;
    redPoint_2: number;
    bluePoint_1: number;
    bluePoint_2: number;
    lotteryTime: Date;
}

export interface BaccaratOverall {
    status: BaccaratConstants_Status;
    currentGameId: number;
    currentBet: number[];
    baccaratBet: BaccaratBet;
    baccaratGame: BaccaratGame;
    available: boolean;
}

export interface BrawlOverall {
    brawlRecord: BrawlRecord;
    teamMembers: PlayerBaseInfo[];
    enemies: PlayerBaseInfo[];
    battleResponse: BattleResponse;
    awardAmount: number;
    battleWin: boolean;
}

export interface ChanglefangLog extends Serializable {
    id: number;
    accountId: number;
    type: string;
    costValue: number;
    gainValue: number;
    createTime: Date;
}

export interface ChanglefangOverall {
    changlefangSharedRecord: ChanglefangSharedRecord;
    changlefangRecord: ChanglefangRecord;
}

export interface ChanglefangRecord extends Serializable {
    accountId: number;
    totalShare: number;
    dayShare: number;
}

export interface ChanglefangSharedRecord extends Serializable, LongId {
    totalShare: number;
    dayShare: number;
    dayEnergy: number;
}

export interface FxjlOverall {
    fxjlSharedRecord: FxjlSharedRecord;
    fxjlRecord: FxjlRecord;
}

export interface FxjlRecord extends Serializable {
    accountId: number;
    awardDelivered: boolean;
}

export interface FxjlSharedRecord extends Serializable, LongId {
    questIds: number[];
}

export interface GoldTowerChallengeEntity extends Serializable, Comparable<GoldTowerChallengeEntity> {
    accountId: number;
    availableChallengeCount: number;
    totalFragment: number;
    totalContribution: number;
    lastFloorCount: number;
    finishLastFloorTime: Date;
    currentRoomId: number;
    currentBattleSessionId: number;
    availableTreasureCount: number;
    inChallenge: boolean;
    currentRoomChallengeSuccess: boolean;
}

export interface GoldTowerLog extends Serializable {
    id: number;
    statusId: number;
    accountId: number;
    finishFloor: number;
    remainChallengeCount: number;
    gainMilliKC: number;
}

export interface GoldTowerRecord extends Serializable {
    accountId: number;
    maxFinishFloor: number;
    wipeOutBattleSessionId: number;
    wipeOutBattleWin: boolean;
    upToTargetFloor: boolean;
    takenWipeOutAward: boolean;
}

export interface GoldTowerRoomEntity extends Serializable {
    id: number;
    prototypeId: number;
    floorId: number;
    treasureCount: number;
    challengeParam_1: string;
    challengeParam_2: string;
    challengeParam_3: string;
    waypoint_1: number;
    waypointColor_1: number;
    waypoint_2: number;
    waypointColor_2: number;
    waypoint_3: number;
    waypointColor_3: number;
    waypoint_4: number;
    waypointColor_4: number;
}

export interface GoldTowerStatusEntity extends Serializable {
    id: number;
    totalFragment: number;
    totalContribution: number;
    challengePlayerCount: number;
    startTime: Date;
}

export interface GoldTowerWipeOut {
    goldTowerChallengeEntity: GoldTowerChallengeEntity;
    wipeOutAwards: CurrencyStack[];
}

export interface IdleMineRecord extends Serializable {
    accountId: number;
    availableMineQueueCount: number;
    mineQueueTeamId_1: number;
    mineQueueMapId_1: number;
    mineQueueFinishTime_1: Date;
    mineQueueLastBalanceTime_1: Date;
    mineQueueTeamId_2: number;
    mineQueueMapId_2: number;
    mineQueueFinishTime_2: Date;
    mineQueueLastBalanceTime_2: Date;
    mineQueueTeamId_3: number;
    mineQueueMapId_3: number;
    mineQueueFinishTime_3: Date;
    mineQueueLastBalanceTime_3: Date;
    idleMineReward: string;
    idleMineQueueList: IdleMineQueue[];
    idleMineRewardList: IdleMineReward[];
}

export interface MineExplorationCouponSend extends Serializable {
    id: number;
    senderId: number;
    receiverId: number;
    createTime: Date;
    taken: boolean;
}

export interface MineExplorationGrid {
    type: number;
    currencyId: number;
    amount: number;
    isOpen: boolean;
    open: boolean;
}

export interface MineExplorationOverall {
    inGame: boolean;
    availableDig: number;
    map: MineExplorationGrid[][];
    bigAwardA: MineExplorationGrid;
    bigAwardB: MineExplorationGrid;
    coupons: MineExplorationCouponSend[];
}

export interface MineArenaComplex {
    mineArenaRecord: MineArenaRecord;
    pit: PitDetail;
}

export interface MineArenaLogComplex {
    pitPositionChangeLogs: PitPositionChangeLog[];
    mineArenaRewardObtainLogs: MineArenaRewardObtainLog[];
    mineArenaChallengeLogs: MineArenaChallengeLog[];
}

export interface MineArenaRecord extends Serializable {
    accountId: number;
    challengePoint: number;
    lastRewardResolveTime: Date;
    resolvedRewardDelivered: boolean;
    resolvedRewardStacks: CurrencyStack[];
}

export interface Pit extends Serializable {
    position: number;
    accountId: number;
    challengedCount: number;
}

export interface PitDetail {
    pit: Pit;
    locked: boolean;
    currencyId: number;
    efficiency: number;
}

export interface StartChallengeResult {
    battleSessionId: number;
}

export interface MjdhBattleLog extends Serializable {
    id: number;
    eventTime: Date;
    winnerAccountId: number;
    loserAccountId: number;
    winnerBeforeGrade: number;
    winnertAftereGrade: number;
    loserBeforeGrade: number;
    loserAfterGrade: number;
}

export interface MjdhPlayerRecord extends Serializable {
    seasonId: number;
    accountId: number;
    grade: number;
    consecutiveWinCount: number;
    dailyFirstWin: boolean;
    dailyBattleCount: number;
    dailyConsecutiveWinCount: number;
    dailyFirstWinAwardDelivered: boolean;
    dailyTenBattleAwardDelivered: boolean;
    dailyConsecutiveWinAwardAvailable: boolean;
    dailyConsecutiveWinAwardDelivered: boolean;
    cappedGrade: number;
}

export interface MjdhSeason extends Serializable {
    id: number;
    startTime: Date;
    endTime: Date;
}

export interface MjdhSeasonDetail {
    mjdhSeason: MjdhSeason;
    playerCount: number;
}

export interface MjdhWinnerRecord extends Serializable {
    seasonId: number;
    ranking: number;
    accountId: number;
}

export interface SecretShopOverall {
    secretShopSharedRecord: SecretShopSharedRecord;
    secretShopRecord: SecretShopRecord;
    prices: number[];
    drawPrizes: Prize[];
}

export interface SecretShopPrizeGrantingStats extends Serializable {
    id: number;
    grantedCount: number;
}

export interface SlotsBigPrize extends Serializable {
    id: number;
    accountId: number;
    awardId: number;
    createTime: Date;
}

export interface SlotsLike extends Serializable {
    id: number;
    bigPrizeId: number;
    senderId: number;
    receiverId: number;
    createTime: Date;
}

export interface SlotsOverall {
    slotsRecord: SlotsRecord;
    prizeId: number;
    awardResults: AwardResult[];
}

export interface SlotsRecord extends Serializable {
    accountId: number;
    slots: number[];
    locks: number[];
    likeBigPrizeIds: number[];
    takenPrize: boolean;
    likeSend: number;
    likeReceive: number;
    slotsList: number[];
    locksList: number[];
    likeBigPrizeIdList: number[];
    lockCount: number;
}

export interface YibenwanliOverrall {
    pool: number;
    ticketCount: number;
    lastPurchaserPlayerName: string;
    timeToEnd: number;
    kcPrice: number;
    yushiPrice: number;
    closed: boolean;
    timeToNextSeason: number;
}

export interface YibenwanliRecord extends Serializable {
    accountId: number;
    ticketCount: number;
    lastPurchaseTime: Date;
}

export interface YxjyRecord extends Serializable {
    accountId: number;
    awardSatatus: YxjyAwardSatatus;
    lastInvitationTime: Date;
    todayAttendedCount: number;
    invitedAccountIds: number[];
    attendedAccountIds: number[];
}

export interface ZxjlRecord extends Serializable {
    accountId: number;
    awardsDelivered: boolean[];
}

export interface CandidateMaster {
    accountId: number;
    discipleCount: number;
}

export interface CompleteDailyPracticeResult {
    dailyPracticeRecord: DailyPracticeRecord;
    completed: boolean;
}

export interface DiscipleRecord extends Serializable {
    accountId: number;
    masterAccountId: number;
    phase: DisciplinePhase;
    createDate: Date;
    deadline: Date;
    dailyPracticeGenerated: boolean;
    discipleConfirmed: boolean;
    masterConfirmed: boolean;
    confirmationDate: Date;
    kuaibiPool: number;
    discipleLastKuaibiDelivery: Date;
    masterLastKuabiDelivery: Date;
    playerLevelAtMidnight: number;
    yesterdayYuanbaoPool: number;
    todayYuanbaoPool: number;
    yesterdayExpPool: number;
    todayExpPool: number;
    lastYuanbaoExpDelivery: Date;
}

export interface DisciplineRequest extends Serializable {
    accountId: number;
    masterAccountId: number;
}

export interface ImpartationRecord extends Serializable {
    accountId: number;
    role: ImpartationRole;
}

export interface ObtainDailyPracticeRewardResult {
    dailyPracticeRecord: DailyPracticeRecord;
    awardResult: AwardResult;
}

export interface LegendaryPetGenerationRecord extends Serializable {
    definitionId: number;
    availableCount: number;
    redeemedCount: number;
    serialNumber: number;
}

export interface Consignment extends Serializable {
    id: number;
    sellerAccountId: number;
    goodsType: GoodsType;
    goodsObjectId: number;
    goodsDefinitionId: number;
    price: number;
    previousPrice: number;
    createTime: Date;
    deadline: Date;
    sold: boolean;
    dealTime: Date;
    buyerAccountId: number;
    goodsDelivered: boolean;
    paymentDelivered: boolean;
}

export interface ConsignmentDetail {
    consignment: Consignment;
    markerCount: number;
}

export interface ConsignmentMarker extends Serializable {
    accountId: number;
    consignmentId: number;
}

export interface MyConsignmentsComplex {
    onSaleConsignments: ConsignmentDetail[];
    suspendedConsignments: ConsignmentDetail[];
    goodsObtainableConsignments: ConsignmentDetail[];
    paymentObtainableConsignments: ConsignmentDetail[];
    archiveConsignments: ConsignmentDetail[];
}

export interface PagedConsignmentList {
    consignments: ConsignmentDetail[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

export interface PerkRingDetail {
    perkRing: PerkRing;
    perks: Perk[];
}

export interface CreateOrderResult {
    order: QubiOrder;
    response: DeductionReponse;
}

export interface QubiOrder extends Serializable {
    id: number;
    accountId: number;
    orderNumber: string;
    amount: number;
    createTime: Date;
    orderStatus: QubiOrderStatus;
}

export interface TronChargeRequest extends Serializable {
    id: number;
    txId: string;
    accountId: number;
    chargedValue: number;
    createTime: Date;
    requestStatus: TronChargeRequestStatus;
}

export interface KexingqiuLoginTicket {
    ticketId: string;
    registered: boolean;
}

export interface AccountInfo {
    id: number;
    username: string;
    displayName: string;
    passcodeTypes: AccountPasscodeType[];
}

export interface WeixinLoginResult {
    newAccount: boolean;
}

export interface PetDepositRequest extends NftDepositRequest {
    petId: number;
}

export interface PetWithdrawRequest extends NftWithdrawRequest {
    petId: number;
}

export interface EquipmentDepositRequest extends NftDepositRequest {
    equipmentId: number;
}

export interface EquipmentWithdrawRequest extends NftWithdrawRequest {
    equipmentId: number;
}

export interface WithdrawRequest extends Serializable {
    id: number;
    accountId: number;
    transactionHash: string;
    amount: number;
    fee: number;
    requestStatus: WithdrawRequestStatus;
    createTime: Date;
}

export interface DepositRequest extends Serializable {
    id: number;
    accountId: number;
    transactionHash: string;
    amount: number;
    requestStatus: DepositRequestStatus;
    createTime: Date;
}

export interface Friend {
    playerBaseInfo: PlayerBaseInfo;
    lastChatMessage: ChatMessage;
    alreadyRead: boolean;
    online: boolean;
}

export interface FriendRecommend {
    rankingList: Friend[];
    fcList: Friend[];
    lvList: Friend[];
}

export interface Equipment extends Serializable, EquipmentInfo {
    id: number;
    accountId: number;
    baseFc: number;
    effectsText: string;
    enhanceLevel: number;
    highestEnhanceLevelEver: number;
    nftId: number;
    nextWithdrawTime: Date;
	//
	soulLevel: number;
	soulExp: number;
	soulName_1: string;
	soulNameId_1: number;
	soulName_2: string;
	soulNameId_2: number;
	soulName_3: string;
	soulNameId_3: number;
}

export interface EquipmentForgingLog {
    playerName: string;
    playerPrefabId: number;
    equipmentDefinitionId: number;
    eventTime: number;
}

export interface EnhancingResult {
    equipmentDetail: EquipmentDetail;
    newEquipmentEffects: number[];
    status: EquipmentStrengtheningStatus;
}

export interface FusionResult {
    equipmentDetail: EquipmentDetail;
    success: boolean;
    newEffectIds: number[];
    droppedEffectIds: number[];
}

export interface EquipmentDetail {
    equipment: Equipment;
    parameters: Parameter[];
}

export interface PlayerRelation extends Serializable {
    accountId: number;
    titleId: number;
    fashionId: number;
    handEquipmentId: number;
    bodyEquipmentId: number;
    waistEquipmentId: number;
    footEquipmentId: number;
    headEquipmentId: number;
    neckEquipmentId: number;
    battlePetId1: number;
    battlePetId2: number;
    battlePetId3: number;
}

export interface Player extends Serializable {
    accountId: number;
    playerName: string;
    prefabId: number;
    genesis: boolean;
    playerLevel: number;
    samsaraCount: number;
    serialNumber: number;
    fc: number;
    createTime: Date;
    lastLoginTime: Date;
    lastOnlineTime: Date;
    onlineTimeCount: number;
}

export interface PlayerOnlineStatus {
    playerLocation: PlayerLocation;
    status: PlayerOnlineStatus_Status;
}

export interface PlayerLocation extends Serializable {
    accountId: number;
    mapId: number;
    direction: DIRECTION;
    xpos: number;
    ypos: number;
}

export interface PlayerBaseInfo {
    player: Player;
    schoolId: number;
    weaponId: number;
    titleDefinitionId: number;
    fashionDefinitionId: number;
    fashionDye: FashionDye;
    shenxing: boolean;
}

export interface PlayerDetail {
    player: Player;
    title: Title;
    fashion: Fashion;
    fashionDye: FashionDye;
    schoolId: number;
    playerRelation: PlayerRelation;
    equipments: Equipment[];
    parameters: Parameter[];
}

export interface PlayerNameUsed extends Serializable {
    id: number;
    accountId: number;
    usedName: string;
}

export interface PlayerLevelupEvent extends KxyWebEvent {
    accountId: number;
    beforeLevel: number;
    afterLevel: number;
}

export interface SchoolRecord extends Serializable {
    accountId: number;
    schoolId: number;
    ablitiesLevelList: number[];
}

export interface KuaibiRecord extends Serializable, LongId {
    maintenanceMilliKuaibi: number;
    destroyMilliKuaibi: number;
    rebateMilliKuaibiFromPlayerInteractive: number;
    rebateMilliKuaibiFromOther: number;
    airdropMilliKuaibi: number;
}

export interface KuaibiDailyRecord extends Serializable, LongId {
    createTime: Date;
    maintenanceMilliKuaibi: number;
    destroyMilliKuaibi: number;
    rebateMilliKuaibiFromPlayerInteractive: number;
    rebateMilliKuaibiFromOther: number;
    airdropMilliKuaibi: number;
}

export interface CurrencyRecord extends Serializable {
    accountId: number;
    currencyId: number;
    amount: number;
}

export interface CurrencyChangedEvent extends KxyWebEvent {
    accountId: number;
    currencyId: number;
    beforeAmount: number;
    afterAmount: number;
    purpose: number;
}

export interface ChatMessage {
    id: string;
    broadcastId: number;
    eventTime: Date;
    systemMessage: boolean;
    senderId: number;
    broadcast: boolean;
    receiverId: number;
    elements: ChatElement<any>[];
}

export interface ChatElement<T> {
    type: ChatElementType;
    content: T;
}

export interface EmoticonElement extends ChatElement<number> {
}

export interface TextElement extends ChatElement<string> {
}

export interface TemplateElement extends ChatElement<TemplateDescription> {
}

export interface TemplateDescription {
    id: number;
    args: { [index: string]: string };
}

export interface ChatMessageComplex {
    chatMessage: ChatMessage;
    senderPlayer: PlayerBaseInfo;
}

export interface RecyclingResult {
    sourceId: number;
    currencyStack: CurrencyStack;
    bingo: boolean;
}

export interface RankingRecord extends Serializable {
    rankingId: number;
    accountId: number;
    objectId: number;
    rankingValue_1: number;
    rankingValue_2: number;
    rankingValue_3: number;
    rankingValue_4: number;
    rankingValue_5: number;
    lastModified: Date;
}

export interface SimpleRankingRecord {
    accountId: number;
    objectId: number;
    currentRank: number;
    rankValue: number;
}

export interface SimpleRanking {
    topRecords: SimpleRankingRecord[];
    selfRecords: SimpleRankingRecord[];
}

export interface RankingElement {
    playerBaseInfo: PlayerBaseInfo;
    currentRank: number;
    rankValue: number;
}

export interface RankingInfo {
    rankings: RankingElement[];
    selfRanking: RankingElement;
}

export interface Title extends Serializable {
    id: number;
    accountId: number;
    definitionId: number;
    number: number;
    tradeLockTime: Date;
}

export interface TitleRedeemResult {
    title: Title;
    awardResult: AwardResult;
}

export interface InviterRecord extends Serializable {
    accountId: number;
    invitationCode: string;
    invitationLimit: number;
    lastRewardResolveTime: Date;
    todayKbdzpEnergyReward: number;
    todayKuaibiReward: number;
    todayRewardDelivered: boolean;
}

export interface InvitationRewardLog extends Serializable {
    id: number;
    accountId: number;
    inviteeId: number;
    kbdzpEnergyReward: number;
    kuaibiReward: number;
    eventTime: Date;
}

export interface InvitationInfo {
    inviterRecord: InviterRecord;
    invitationCount: number;
}

export interface GroupedInvitationReward {
    accountId: number;
    playerName: string;
    value: number;
    children: GroupedInvitationReward[];
    sum: number;
}

export interface Fashion extends Serializable {
    id: number;
    accountId: number;
    definitionId: number;
    dyeId: number;
    number: number;
    nftId: number;
    nextWithdrawTime: Date;
}

export interface FashionDye extends Serializable {
    id: number;
    accountId: number;
    definitionId: number;
    dyeName: string;
    part_1_color: number;
    part_1_saturation: number;
    part_1_brightness: number;
    part_2_color: number;
    part_2_saturation: number;
    part_2_brightness: number;
    part_3_color: number;
    part_3_saturation: number;
    part_3_brightness: number;
}

export interface Mail extends Serializable {
    id: number;
    accountId: number;
    title: string;
    content: string;
    createTime: Date;
    alreadyRead: boolean;
    attachmentDelivered: boolean;
    attachmentSource: number;
    attachmentAsCurrencyStacks: CurrencyStack[];
}

export interface QuestRecord extends Serializable {
    accountId: number;
    questId: number;
    questStatus: QuestStatus;
    results: string;
    objectiveStatus: string;
    randomBacId: number;
    startedCount: number;
}

export interface Pet extends Serializable, PetInfo {
    id: number;
    accountId: number;
    petName: string;
    rank: number;
    rankProgress: number;
    maxAbilityCapacity: number;
    sortingIndex: number;
    nftId: number;
    nextWithdrawTime: Date;
    legendary: boolean;
    abilities: number[];
    candidateAbilities: number[];
}

export interface PetGachaLog {
    playerName: string;
    playerPrefabId: number;
    petDefinitionId: number;
    eventTime: number;
}

export interface PetDetail {
    pet: Pet;
    parameters: Parameter[];
}

export interface PetFusionResult {
    petDetail: PetDetail;
    newAbility: number;
    droppedAbility: number;
}

export interface PetGachaAbilityResult {
    pet: Pet;
    success: boolean;
}

export interface PetEnhanceResult {
    pet: Pet;
    success: boolean;
    newAbilityId: number;
}

export interface PetGachaRankingRecord extends Serializable {
    accountId: number;
    point: number;
    lastModified: Date;
}

export interface PetGachaRankingAwardRecord extends Serializable {
    ranking: number;
    accountId: number;
    finalPoint: number;
    award: string;
    delivered: boolean;
}

export interface PetGachaRankingSharedRecord extends Serializable, LongId {
    remainingYingting: number;
    nextYingtingNumber: number;
}

export interface PetGachaRankingAwardResult {
    pet: Pet;
    currencyStack: CurrencyStack;
}

export interface AwardResult {
    currencyStacks: CurrencyStack[];
    equipments: Equipment[];
    pets: Pet[];
}

export interface KbdzpAwardLog {
    playerName: string;
    kbdzpAwardId: number;
    eventTime: number;
}

export interface KbdzpRecord extends Serializable {
    accountId: number;
    booster1: boolean;
    booster2: boolean;
    recoverRefTime: Date;
    inviteeBonusAvailable: boolean;
    inviteeBonusDelivered: boolean;
    pendingAward: number;
    kuaibiPool: number;
    kuaibiPoolLastReset: Date;
    totalGainMilliKC: number;
}

export interface KbdzpRecoverResult {
    record: KbdzpRecord;
    currencyRecord: CurrencyRecord;
    timeToNextEnergy: number;
}

export interface SupportRelation extends Serializable {
    inviterAccountId: number;
    supporterAccountId: number;
    deadline: Date;
    released: boolean;
    releaseCooldown: Date;
}

export interface PartyRecord extends Serializable {
    accountId: number;
    candidateSupporters: string;
    highLevelCandidate: boolean;
    lastRewardResolveTime: Date;
    supportReward: number;
    todayRewardDelivered: boolean;
}

export interface SupportLog extends Serializable {
    id: number;
    inviterAccountId: number;
    supporterAccountId: number;
    eventTime: Date;
    fee: number;
    type: SupportLogType;
}

export interface PartyComplex {
    partyRecord: PartyRecord;
    supportRelations: SupportRelation[];
    supporterForOthersCount: number;
}

export interface BattleResponse {
    battleSessionId: number;
    result: BattleResult;
}

export interface SyncMessage extends Syncable {
    extra: any;
}

export interface ActivityPlayerRecord extends Serializable {
    accountId: number;
    incomingActivePoints: number;
}

export interface ActivityRecord extends Serializable {
    accountId: number;
    activityId: number;
    progress: number;
    completed: boolean;
}

export interface Serializable {
}

export interface AntiqueSharedRecord extends Serializable, LongId {
    publicAwardAccountId: number;
    publicAwardRemainCount: number;
    lastPublicAwardCreateTime: Date;
}

export interface AntiqueRecord extends Serializable {
    accountId: number;
    started: boolean;
    repairCount: number;
    progress: number;
    part: string;
    lastPublicAwardObtainTime: Date;
    publicAwardObtainCount: number;
}

export interface BrawlRecord extends Serializable {
    accountId: number;
    resetCount: number;
    brawlCount: number;
    currentStage: number;
    currentBattleSessionId: number;
    status: BrawlStatus;
    teamMember_1: number;
    teamMember_2: number;
    teamMaxFc: number;
}

export interface LongId {
    id: number;
}

export interface CurrencyStack {
    currencyId: number;
    amount: number;
}

export interface IdleMineQueue {
    teamId: number;
    mapId: number;
    finishTime: Date;
    lastBalanceTime: Date;
}

export interface IdleMineReward {
    id: number;
    currencyId: number;
    currencyAmount: number;
}

export interface PitPositionChangeLog extends Serializable {
    id: number;
    accountId: number;
    beforePosition: number;
    afterPosition: number;
    eventTime: Date;
}

export interface MineArenaRewardObtainLog extends Serializable {
    id: number;
    accountId: number;
    eventTime: Date;
    rewardStacks: CurrencyStack[];
}

export interface MineArenaChallengeLog extends Serializable {
    id: number;
    challengerAccountId: number;
    defenderAccountId: number;
    cost: number;
    challengerPosition: number;
    defenderPosition: number;
    success: boolean;
    eventTime: Date;
}

export interface SecretShopSharedRecord extends Serializable, LongId {
    kcPackRemainCount: number;
    kcPackPrice: number;
}

export interface SecretShopRecord extends Serializable {
    accountId: number;
    notTakePrizes: Prize[];
    notTakePrizeList: Prize[];
}

export interface Prize {
    jackpotId: number;
    currencyId: number;
    currencyAmount: number;
}

export interface DailyPracticeRecord extends Serializable {
    accountId: number;
    definitionId: number;
    status: DailyPracticeStatus;
    progress: number;
}

export interface PerkRing extends Serializable {
    accountId: number;
    progress: number;
    perkSelection_1: PerkSelection;
    perkSelection_2: PerkSelection;
    perkSelection_3: PerkSelection;
    perkSelection_4: PerkSelection;
    perkSelection_5: PerkSelection;
    perkSelection_6: PerkSelection;
    perkSelection_7: PerkSelection;
    perkSelection_8: PerkSelection;
    perkSelection_9: PerkSelection;
}

export interface Perk {
    rank: number;
    selection: PerkSelection;
    parameters: Parameter[];
}

export interface DeductionReponse {
    tradeid: string;
    url: string;
}

export interface NftDepositRequest extends Serializable {
    id: number;
    accountId: number;
    transactionHash: string;
    requestStatus: NftDepositRequestStatus;
    createTime: Date;
}

export interface NftWithdrawRequest extends Serializable {
    id: number;
    accountId: number;
    transactionHash: string;
    fee: number;
    requestStatus: NftWithdrawRequestStatus;
    createTime: Date;
}

export interface Parameter extends Comparable<Parameter>, Serializable {
    name: string;
    value: number;
}

export interface EquipmentInfo {
    definitionId: number;
    maxEnhanceLevel: number;
    baseParameters: Parameter[];
    creatorName: string;
    number: number;
}

export interface KxyWebEvent extends ApplicationEvent {
}

export interface PetInfo {
    definitionId: number;
    aptitudeHp: number;
    aptitudeAtk: number;
    aptitudePdef: number;
    aptitudeMdef: number;
    aptitudeSpd: number;
    maxRank: number;
    number: number;
}

export interface BattleResult {
    unitInitInfo: UnitInitInfo[];
    battleStartAction: ActionRecord[];
    turnInfo: TurnInfo[];
    statistics: BattleStatistics;
}

export interface Syncable {
    syncStatus: MultiplayerBattleStatus;
    syncNumber: number;
}

export interface Comparable<T> {
}

export interface ApplicationEvent extends EventObject {
    timestamp: number;
}

export interface UnitInitInfo {
    id: number;
    sourceId: number;
    unitDescriptorId: number;
    schoolId: number;
    type: UnitType;
    stance: Stance;
    position: number;
    hpVisible: boolean;
    name: string;
    prefabId: number;
    weaponPrefabId: number;
    titleId: number;
    fashionId: number;
    fashionDye: Unit_FashionDye;
    modelScale: number;
    maxHp: number;
    maxSp: number;
    hp: number;
    sp: number;
    怒气消耗率: number;
    skillIds: number[];
}

export interface ActionRecord {
    type: ActionRecordType;
    cost: Cost;
    executeResult: ExecuteResult;
    processCount: number;
    affectRecordPack: AffectRecord[][];
    actionId: number;
    actorId: number;
    buffActor: Buff;
}

export interface TurnInfo {
    turnCount: number;
    battleEnd: boolean;
    unitStatus: UnitStatus[];
    endOfTurnUnitStatus: UnitStatus[];
    actionRecord: ActionRecord[];
}

export interface BattleStatistics {
    turnCount: number;
    winStance: Stance;
    redParty: Party;
    blueParty: Party;
}

export interface EventObject extends Serializable {
    source: any;
}

export interface Unit_FashionDye {
    part_1_color: number;
    part_1_saturation: number;
    part_1_brightness: number;
    part_2_color: number;
    part_2_saturation: number;
    part_2_brightness: number;
    part_3_color: number;
    part_3_saturation: number;
    part_3_brightness: number;
}

export interface Cost {
    sp: number;
}

export interface AffectRecord {
    type: AffectRecordType;
    damageType: DamageType;
    value: Value;
    actor: Actor;
    buffs: Buff[];
    target: Unit;
    summonee: UnitInitInfo;
    sourceId: number;
    isHit: boolean;
    isCritical: boolean;
    isBlock: boolean;
    isAbsorb: boolean;
    isBless: boolean;
    isOverKill: boolean;
    isMainTarget: boolean;
}

export interface Buff extends Serializable, JsonSerializable {
}

export interface UnitStatus {
    id: number;
    currHp: number;
    currSp: number;
    怒火补正率: number;
    怒气消耗率: number;
}

export interface Party extends Serializable {
    unitMap: { [index: string]: Unit };
    anyoneAlive: boolean;
}

export interface Value {
    hp: number;
    sp: number;
}

export interface Actor {
    name: string;
    id: number;
}

export interface Unit extends Serializable, JsonSerializable, Actor {
}

export interface JsonSerializable {
}

export type ChatElementType = "TEXT" | "LINK" | "EMOTICON" | "TEMPLATE";

export type CommodityStatus = "QUEUING" | "ON_SALE" | "SOLD";

export type BaccaratConstants_Status = "BET" | "WAIT";

export type YxjyAwardSatatus = "NOT_AVAILABLE" | "AVAILABLE" | "DELIVERED";

export type DisciplinePhase = "PRACTISING" | "TO_BE_CONFIRMED" | "END";

export type ImpartationRole = "DISCIPLE" | "MASTER";

export type GoodsType = "EQUIPMENT" | "PET" | "TITLE";

export type QubiOrderStatus = "PENDING" | "COMPLETED";

export type TronChargeRequestStatus = "PENDING" | "DONE" | "TIMEOUT";

export type AccountPasscodeType = "PASSWORD" | "WX_UNIONID" | "KXQ_UNIONID" | "TRON_ADDRESS" | "QUBI_OPEN_ID";

export type NftDepositRequestStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "TIMEOUT" | "ERROR_OBJECT_MISSING";

export type NftWithdrawRequestStatus = "CREATION" | "PENDING" | "SUCCEEDED" | "FAILED" | "TIMEOUT";

export type WithdrawRequestStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "TIMEOUT";

export type DepositRequestStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "TIMEOUT";

export type EquipmentStrengtheningStatus = "SUCCESSFUL" | "UNCHANGED" | "FAILED";

export type PlayerOnlineStatus_Status = "OFFLINE" | "IDLE" | "BATTLE" | "MINIGAME";

export type DIRECTION = "U" | "D" | "L" | "R" | "LU" | "LD" | "RU" | "RD";

export type QuestStatus = "NOT_STARTED_YET" | "IN_PROGRESS" | "COMPLETED";

export type SupportLogType = "START" | "END";

export type MultiplayerBattleStatus = "INIT" | "BEFORE_BATTLE" | "PREPARED" | "BEFORE_TURN" | "IN_TURN" | "AFTER_TURN" | "AFTER_BATTLE" | "CLEAN" | "END";

export type BrawlStatus = "NOT_START" | "CREATE_TEAM" | "IN_CHALLENGE" | "END";

export type DailyPracticeStatus = "NOT_STARTED_YET" | "IN_PROGRESS" | "COMPLETED" | "REWARDED";

export type PerkSelection = "NONE" | "YIN" | "YANG";

export type UnitType = "TYPE_PLAYER" | "TYPE_PET" | "TYPE_MONSTER";

export type Stance = "STANCE_RED" | "STANCE_BLUE";

export type ActionRecordType = "USE_SKILL" | "BUFF_AFFECT" | "BUFF_DECAY" | "SUMMON";

export type ExecuteResult = "SUCCESS" | "FAIL_TARGETLOST" | "FAIL_NOTENOUGHCOST";

export type AffectRecordType = "DAMAGE" | "RECOVER" | "BUFF_ATTACH" | "BUFF_DETACH" | "DIE" | "FLY_OUT" | "REVIVE" | "SUMMONEE";

export type DamageType = "PHYSICS" | "MAGIC" | "ABSOLUTE";
