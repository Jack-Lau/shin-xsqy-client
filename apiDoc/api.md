[TOC]
# root
> 

## 子模块
## activity
> /activity

### 子模块
### 接口

---
#### 查询活动总览信息
**路径**
> /activity/overall

**请求方法**
`GET`
**参数**
无
**返回值**
> ActivityComplex

**状态码**

---
#### 触发每日重置（测试用）
**路径**
> /activity/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## 西域商人
> /antique

### 子模块
### 接口

---
#### 查看古董记录
**路径**
> /antique/get

**请求方法**
`GET`
**参数**
无
**返回值**
> AntiqueOverall

**状态码**
 - `1800`: 活动未开启
 - `1801`: 角色等级不足

---
#### 购买一个古董
**路径**
> /antique/buy

**请求方法**
`POST`
**参数**
无
**返回值**
> AntiqueOverall

**状态码**
 - `1800`: 活动未开启
 - `1801`: 角色等级不足
 - `1802`: 拥有的货币不足
 - `1803`: 已经在修复一个古董

---
#### 出售一个古董
**路径**
> /antique/sell

**请求方法**
`POST`
**参数**
无
**返回值**
> AntiqueOverall

**状态码**
 - `1800`: 活动未开启
 - `1801`: 角色等级不足
 - `1804`: 当前没拥有古董

---
#### 修复一个古董
**路径**
> /antique/repair

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|part|string|假如这次修复成功的话，古董的部位状态记录|
**返回值**
> AntiqueOverall

**状态码**
 - `1800`: 活动未开启
 - `1801`: 角色等级不足
 - `1804`: 当前没拥有古董
 - `1805`: 古董已达最高修复等级
 - `1802`: 拥有的货币不足

---
#### 领取全服奖励
**路径**
> /antique/take

**请求方法**
`POST`
**参数**
无
**返回值**
> AntiqueOverall

**状态码**
 - `1800`: 活动未开启
 - `1801`: 角色等级不足
 - `1807`: 今日已达到领取次数上限
 - `1808`: 全服奖励的剩余数量不足
 - `1806`: 该全服奖励已经领过了
### 通知
## 西域商人管理
> /management/antique

### 子模块
### 接口

---
#### 每日结算
**路径**
> /management/antique/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> null

**状态码**

---
#### 活动结束时清理未售出的古董
**路径**
> /management/antique/end

**请求方法**
`GET`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## 金光塔
> /goldTower

### 子模块
### 接口

---
#### 查看当日的金光塔概况
**路径**
> /goldTower/getGoldTowerStatus

**请求方法**
`GET`
**参数**
无
**返回值**
> GoldTowerStatusEntity

**状态码**

---
#### 查看角色的金光塔挑战记录
**路径**
> /goldTower/getGoldTowerChallenge

**请求方法**
`GET`
**参数**
无
**返回值**
> GoldTowerChallengeEntity

**状态码**

---
#### 查看金光塔的一个指定房间
**路径**
> /goldTower/getGoldTowerRoom

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|roomId|long|房间id|
**返回值**
> GoldTowerRoomEntity

**状态码**

---
#### 开始/返回一个金光塔挑战
**路径**
> /goldTower/startOrReturnGoldTowerChallenge

**请求方法**
`POST`
**参数**
无
**返回值**
> GoldTowerChallengeEntity

**状态码**
 - `1200`: 角色等级不足
 - `1201`: 挑战次数不足
 - `1203`: 金光塔已重置

---
#### 开启一场金光塔战斗
**路径**
> /goldTower/startGoldTowerBattle

**请求方法**
`POST`
**参数**
无
**返回值**
> BattleResponse

**状态码**
 - `1203`: 金光塔已重置

---
#### 尝试完成当前房间的挑战
**路径**
> /goldTower/tryFinishGoldTowerChallenge

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|param|string|挑战参数|
**返回值**
> GoldTowerChallengeEntity

**状态码**
 - `1202`: 需要的货币不足
 - `1203`: 金光塔已重置

---
#### 领取宝箱奖励
**路径**
> /goldTower/openTreasure

**请求方法**
`POST`
**参数**
无
**返回值**
> GoldTowerChallengeEntity

**状态码**
 - `1203`: 金光塔已重置

---
#### 通过传送点前往下一个房间
**路径**
> /goldTower/gotoNextRoom

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|waypoint|int|传送点序号|
**返回值**
> GoldTowerChallengeEntity

**状态码**
 - `1203`: 金光塔已重置

---
#### 查看金光塔排行榜
**路径**
> /goldTower/getRanking

**请求方法**
`POST`
**参数**
无
**返回值**
> RankingInfo

**状态码**

---
#### 查看角色的金光塔历史和扫荡记录
**路径**
> /goldTower/getGoldTowerRecord

**请求方法**
`GET`
**参数**
无
**返回值**
> GoldTowerRecord

**状态码**

---
#### 开启一场扫荡战斗
**路径**
> /goldTower/startWipeOutBattle

**请求方法**
`POST`
**参数**
无
**返回值**
> BattleResponse

**状态码**
 - `1203`: 金光塔已重置
 - `1205`: 当前不在第0层
 - `1201`: 挑战次数不足
 - `1206`: 历史最高通过层数不足

---
#### 尝试结算一场扫荡战斗
**路径**
> /goldTower/tryFinishWipeOutBattle

**请求方法**
`POST`
**参数**
无
**返回值**
> Boolean

**状态码**
 - `1203`: 金光塔已重置
 - `1206`: 历史最高通过层数不足

---
#### 前往扫荡目标楼层
**路径**
> /goldTower/upToTargetFloor

**请求方法**
`POST`
**参数**
无
**返回值**
> GoldTowerWipeOut

**状态码**
 - `1203`: 金光塔已重置
 - `1206`: 历史最高通过层数不足
 - `1207`: 不满足快速传送的条件

---
#### 领取扫荡奖励
**路径**
> /goldTower/takeWipeOutAward

**请求方法**
`POST`
**参数**
无
**返回值**
> GoldTowerChallengeEntity

**状态码**
 - `1203`: 金光塔已重置
 - `1206`: 历史最高通过层数不足
 - `1208`: 不满足领取扫荡奖励的条件
### 通知
## 金光塔管理
> /management/goldTower

### 子模块
### 接口

---
#### 每日结算
**路径**
> /management/goldTower/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## 三界经商
> /idleMine

### 子模块
### 接口

---
#### 查看角色的记录
**路径**
> /idleMine/get

**请求方法**
`GET`
**参数**
无
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足

---
#### 查看所有地图的雇佣价格
**路径**
> /idleMine/price

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
 - `1700`: 角色等级不足

---
#### 雇佣一支商队
**路径**
> /idleMine/hire

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|teamId|long|商队id|
|mapId|long|地图id|
|activePointsToUse|long|要使用的活跃点|
|expectedPrice|long|当前的货币消耗价|
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足
 - `1701`: 拥有的货币不足
 - `1702`: 空闲的经商位不足

---
#### 结算所有商队的挂机奖励
**路径**
> /idleMine/balance

**请求方法**
`POST`
**参数**
无
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足

---
#### 遣散一支商队
**路径**
> /idleMine/shutdown

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|int|商队所在的经商位的编号，1~3|
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足
 - `1703`: 该经商位上没有商队

---
#### 领取储物箱的奖励
**路径**
> /idleMine/take

**请求方法**
`POST`
**参数**
无
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足
 - `1704`: 储物箱为空

---
#### 扩充经商位
**路径**
> /idleMine/expand

**请求方法**
`POST`
**参数**
无
**返回值**
> IdleMineRecord

**状态码**
 - `1700`: 角色等级不足
 - `1701`: 拥有的货币不足
 - `1705`: 经商位已达上限
### 通知
## 竞技场
> /arena

### 子模块
### 接口

---
#### 查询自己的竞技场记录
**路径**
> /arena/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> MineArenaComplex

**状态码**

---
#### 查询竞技场排名记录
**路径**
> /arena/viewRanking

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> array

**状态码**

---
#### 获取一些备选挑战位置
**路径**
> /arena/randomCandidates

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 创建竞技场记录
**路径**
> /arena/createRecord

**请求方法**
`POST`
**参数**
无
**返回值**
> MineArenaComplex

**状态码**

---
#### 获取今天到目前为止的奖励
**路径**
> /arena/currentReward

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 开始挑战
**路径**
> /arena/startChallenge

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetPosition|number|要挑战的位置|
|kuaibiToUse|number|要使用的块币|
**返回值**
> StartChallengeResult

**状态码**

---
#### 结算前一天的奖励
**路径**
> /arena/resolveReward

**请求方法**
`POST`
**参数**
无
**返回值**
> MineArenaRecord

**状态码**

---
#### 领取前一天的奖励
**路径**
> /arena/obtainReward

**请求方法**
`POST`
**参数**
无
**返回值**
> MineArenaRecord

**状态码**

---
#### 获取最近关于自己的事件的日志
**路径**
> /arena/logs

**请求方法**
`GET`
**参数**
无
**返回值**
> MineArenaLogComplex

**状态码**
### 通知
## 神秘商店
> /secretShop

### 子模块
### 接口

---
#### 记录
**路径**
> /secretShop/get

**请求方法**
`GET`
**参数**
无
**返回值**
> SecretShopOverall

**状态码**

---
#### 大奖产出记录
**路径**
> /secretShop/getGrantingStats

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 价格
**路径**
> /secretShop/price

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 抽奖
**路径**
> /secretShop/draw

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|expectedPrice|long|当前的货币消耗价|
|batchDraw|boolean|是否批量抽奖|
**返回值**
> SecretShopOverall

**状态码**
 - `2001`: 有尚未领取的抽奖奖励

---
#### 领奖
**路径**
> /secretShop/take

**请求方法**
`GET`
**参数**
无
**返回值**
> SecretShopOverall

**状态码**
 - `2002`: 没有尚未领取的抽奖奖励

---
#### 兑换
**路径**
> /secretShop/exchange

**请求方法**
`POST`
**参数**
无
**返回值**
> SecretShopOverall

**状态码**
 - `2003`: 没有可兑换的块币补给包
### 通知
## treasure
> /treasure

### 子模块
### 接口

---
#### 消耗藏宝图获得奖励
**路径**
> /treasure/obtainTreasure

**请求方法**
`POST`
**参数**
无
**返回值**
> CurrencyStack

**状态码**
### 通知
## 一本万利
> /yibenwanli

### 子模块
### 接口

---
#### 获得总览信息
**路径**
> /yibenwanli/overrall

**请求方法**
`GET`
**参数**
无
**返回值**
> YibenwanliOverrall

**状态码**

---
#### 获得自己的信息
**路径**
> /yibenwanli/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> YibenwanliRecord

**状态码**

---
#### 购买本票
**路径**
> /yibenwanli/purchase

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|activePointsToUse|integer|要使用的活跃点|
|expectedPrice|integer|期望的购买价格|
**返回值**
> YibenwanliRecord

**状态码**

---
#### 尝试发送最后时间广播（测试用）
**路径**
> /yibenwanli/tryPublishLastChangeBroadcast

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## gift
> /gift

### 子模块
### 接口

---
#### 使用兑换码兑换礼包
**路径**
> /gift/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|code|string|兑换码|
**返回值**
> null

**状态码**
 - `600`: 兑换码对应的礼包不存在
 - `601`: 礼包已被兑换
 - `602`: 礼包尚不可用
 - `605`: 礼包兑换超过次数限制
### 通知
## 礼包管理
> /management/gift

### 子模块
### 接口

---
#### 初始化礼包生成
**路径**
> /management/gift/action/{giftDefinitionId}/init

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|giftDefinitionId|integer|礼包定义的id|
|prototypeCode|string|礼包原型码|
|serialCodeBegin|integer|礼包序列码的开始|
**返回值**
> GiftGeneratingRecord

**状态码**

---
#### 生成礼包
**路径**
> /management/gift/action/{giftDefinitionId}/generate

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|giftDefinitionId|integer|礼包定义的id|
|count|integer|礼包序列码的开始|
**返回值**
> string

**状态码**

---
#### 查看礼包生成记录
**路径**
> /management/gift/view/{giftDefinitionId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|giftDefinitionId|integer|礼包定义的id|
**返回值**
> GiftGeneratingRecord

**状态码**

---
#### 查看礼包兑换码
**路径**
> /management/gift/view/{giftDefinitionId}/codes

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|giftDefinitionId|integer|礼包定义的id|
**返回值**
> string

**状态码**
### 通知
## track
> /track

### 子模块
### 接口

---
#### 提交一个错误信息以记录
**路径**
> /track/reportMessage

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|message|string|需要记录的消息|
**返回值**
> null

**状态码**
### 通知
## account
> /account

### 子模块
### register
> /account/register

#### 子模块
#### 接口

---
##### 注册一个测试用账号
**路径**
> /account/register/createTest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|username|string|用户名|
|password|string|密码|
**返回值**
> AccountInfo

**状态码**
 - `100`: 用户名已存在

---
##### 用手机验证码注册账号
**路径**
> /account/register/createByPhone

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|username|string|用户名，在此处需要是手机号|
|password|string|密码|
|activationCode|string|手机验证码|
**返回值**
> AccountInfo

**状态码**
 - `100`: 用户名已存在
 - `102`: 验证码不存在
 - `103`: 验证码已过期
 - `104`: 验证码与手机号不匹配

---
##### 生成一个手机验证码
**路径**
> /account/register/requestPhoneActivation

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|phoneNumber|string|用于获取验证码的手机号|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> null

**状态码**
 - `101`: 申请验证码太快

---
##### 校验手机验证码是否有效
**路径**
> /account/register/verifyPhoneActivation

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|phoneNumber|string|用于获取验证码的手机号|
|activationCode|string|手机验证码|
**返回值**
> null

**状态码**
 - `102`: 验证码不存在
 - `103`: 验证码已过期
 - `104`: 验证码与手机号不匹配

---
##### 通过手机验证码重设密码
**路径**
> /account/register/resetPassword

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|username|string|用户名，在此处需要是手机号|
|password|string|密码|
|activationCode|string|手机验证码|
**返回值**
> AccountInfo

**状态码**
 - `102`: 验证码不存在
 - `103`: 验证码已过期
 - `104`: 验证码与手机号不匹配
 - `105`: 用户名不存在
 - `106`: 指定的账号不可修改密码

---
##### 用氪星球 token 创建一个用于登录的 ticket
**路径**
> /account/register/createTicket

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|token|string|氪星球 token|
**返回值**
> KexingqiuLoginTicket

**状态码**

---
##### 创建一个用于以 Tron 签名登录的随机令牌
**路径**
> /account/register/createTronToken

**请求方法**
`POST`
**参数**
无
**返回值**
> string

**状态码**
#### 通知
### 接口

---
#### 查看自己的账号信息
**路径**
> /account/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> AccountInfo

**状态码**

---
#### 用账号名和密码登录一个账号
**路径**
> /account/login

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|username|string|用户名|
|password|string|密码|
**返回值**
> null

**状态码**

---
#### 通过微信认证来登录，如果没有账号会自动注册
**路径**
> /account/login-weixin

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|code|string|微信认证凭据|
|from|string|表示来源，从普通浏览器为 `web`，从微信浏览器为 `weixin`|
**返回值**
> WeixinLoginResult

**状态码**

---
#### 登出当前已登录的账号
**路径**
> /account/logout

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**

---
#### 为当前账号添加账号名和密码的登录方式
**路径**
> /account/addPassword

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|username|string|用户名，在此处需要是手机号|
|password|string|密码|
|activationCode|string|手机验证码|
**返回值**
> AccountInfo

**状态码**
 - `102`: 验证码不存在
 - `103`: 验证码已过期
 - `104`: 验证码与手机号不匹配
 - `100`: 用户名已存在

---
#### 使用氪星球的身份登录
**路径**
> /account/login-kexingqiu

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|ticketId|string|用 `createTicket` 创建的 ticket id|
**返回值**
> WeixinLoginResult

**状态码**

---
#### 使用 Tron 签名登录
**路径**
> /account/login-tron

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|address|string|Tron 地址|
|token|string|用于签名的令牌|
|sign|string|签名|
**返回值**
> WeixinLoginResult

**状态码**

---
#### 使用趣币身份登录
**路径**
> /account/login-qubi

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|openid|string|openid|
|openkey|string|openkey|
|nackname|string|nackname（可选）|
**返回值**
> WeixinLoginResult

**状态码**
### 通知
## 白名单管理
> /management/whiteList

### 子模块
### 接口

---
#### 获得当前白名单启用状态
**路径**
> /management/whiteList/status

**请求方法**
`GET`
**参数**
无
**返回值**
> boolean

**状态码**

---
#### 设置当前白名单启用状态
**路径**
> /management/whiteList/status

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|value|boolean|白名单启用状态|
**返回值**
> boolean

**状态码**
### 通知
## debug
> /debug

### 子模块
### 接口

---
#### 设置时间偏移，用于调试
**路径**
> /debug/setTimeOffset

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|offset|integer|时间的偏移量|
**返回值**
> null

**状态码**

---
#### 重设时间为系统时间
**路径**
> /debug/resetToSystemTime

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## pet token
> /kxyPet

### 子模块
### 接口

---
#### 解析 KxyPet Token 上的数据
**路径**
> /kxyPet/decodePetInfo

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|data|string|要解析的数据，16进制编码的文本格式|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格式（可选，默认 `raw`）|
**返回值**
> PetInfo

**状态码**

---
#### 获取 KxyPet Token 的元数据
**路径**
> /kxyPet/token/{nftId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|string|KxyPet Token 的 id|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格��（可选，默认 `raw`）|
**返回值**
> ERC721Metadata

**状态码**

---
#### 获取 KxyPet Token 对应的装备的详细数据
**路径**
> /kxyPet/detail/{nftId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|string|KxyPet Token 的 id|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格式（可选，默认 `raw`）|
**返回值**
> PetDetail

**状态码**
### 通知
## equipment token
> /kxyEquipment

### 子模块
### 接口

---
#### 解析 KxyEquipment Token 上的数据
**路径**
> /kxyEquipment/decodeEquipmentInfo

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|data|string|要解析的数据，16进制编码的文本格式|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格式（可选，默认 `raw`）|
**返回值**
> EquipmentInfo

**状态码**

---
#### 获取 KxyEquipment Token 的元数据
**路径**
> /kxyEquipment/token/{nftId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|string|KxyEquipment Token 的 id|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格式（可选，默认 `raw`）|
**返回值**
> ERC721Metadata

**状态码**

---
#### 获取 KxyEquipment Token 对应的装备的详细数据
**路径**
> /kxyEquipment/detail/{nftId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|string|KxyEquipment Token 的 id|
|format|string|返回数据格式，`raw` 为原始格式，`wrapped` 为包装过后的格式（可选，默认 `raw`）|
**返回值**
> EquipmentDetail

**状态码**
### 通知
## ethereum exchange
> /ethereumExchange

### 子模块
### 接口

---
#### 将块币提取到指定的钱包地址
**路径**
> /ethereumExchange/withdrawKuaibi

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|amount|integer|要提取的块币的数量（不包含手续费）|
|toAddress|string|要提取到的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> WithdrawRequest

**状态码**

---
#### 从指定的钱包地址存入块币
**路径**
> /ethereumExchange/depositKuaibi

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|amount|integer|要存入的块币的数量|
|fromAddress|string|块币来源的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> DepositRequest

**状态码**

---
#### 将装备提取到指定的钱包地址
**路径**
> /ethereumExchange/withdrawEquipment

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|equipmentId|integer|装备 id|
|toAddress|string|要提取到的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> EquipmentWithdrawRequest

**状态码**

---
#### 从指定的钱包地址存入装备
**路径**
> /ethereumExchange/depositEquipment

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|integer|代币的 id|
|fromAddress|string|来源的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> EquipmentDepositRequest

**状态码**

---
#### 将宠物提取到指定的钱包地址
**路径**
> /ethereumExchange/withdrawPet

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petId|integer|宠物 id|
|toAddress|string|要提取到的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> PetWithdrawRequest

**状态码**

---
#### 从指定的钱包地址存入宠物
**路径**
> /ethereumExchange/depositPet

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|nftId|integer|代币的 id|
|fromAddress|string|来源的钱包地址|
|ticket|string|验证码 ticket|
|randStr|string|验证码 randStr|
**返回值**
> PetDepositRequest

**状态码**

---
#### 查询自己的当前暂挂中的存入请求
**路径**
> /ethereumExchange/viewPendingDepositRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己的当前暂挂中的提现请求
**路径**
> /ethereumExchange/viewPendingWithDrawRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己的��前暂挂中的装备提取请求
**路径**
> /ethereumExchange/viewPendingEquipmentWithdrawRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己的当前暂挂中的装备存入请求
**路径**
> /ethereumExchange/viewPendingEquipmentDepositRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己的当前暂挂中的宠物提取请求
**路径**
> /ethereumExchange/viewPendingPetWithdrawRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己的当前暂挂中的装备存入请求
**路径**
> /ethereumExchange/viewPendingPetDepositRequests

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
### 通知
**路径**
> /user/queue/ethereumExchange/withdrawCompleted

**描述**
> 提现请求完成的通知

**路径**
> /user/queue/ethereumExchange/depositCompleted

**描述**
> 存入请求完成的通知

**路径**
> /user/queue/ethereumExchange/equipmentWithdrawCompleted

**描述**
> 装备提取请求完成的通知

**路径**
> /user/queue/ethereumExchange/equipmentDepositCompleted

**描述**
> 装备存入请求完成的通知

**路径**
> /user/queue/ethereumExchange/petWithdrawCompleted

**描述**
> 宠物提取请求完成的通知

**路径**
> /user/queue/ethereumExchange/petDepositCompleted

**描述**
> 宠物存入请求完成的通知

## equipment
> /equipment

### 子模块
### 接口

---
#### 查询一个装备装备
**路径**
> /equipment/view/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|装备的id|
**返回值**
> Equipment

**状态码**

---
#### 查询一个装备的详细信息
**路径**
> /equipment/view/{id}/detail

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|装备的id|
**返回值**
> EquipmentDetail

**状态码**

---
#### 查询一个装备的能力参数
**路径**
> /equipment/view/{id}/parameters

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|装备的id|
**返回值**
> array

**状态码**

---
#### 查询自己的装备
**路径**
> /equipment/viewMine

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 生成一个装备（测试用）
**路径**
> /equipment/createForTest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|definitionId|integer|装备定义的id|
**返回值**
> Equipment

**状态码**

---
#### 穿上一个装备
**路径**
> /equipment/action/{id}/arm

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|装备id|
**返回值**
> null

**状态码**

---
#### 强化一个装备
**路径**
> /equipment/action/{id}/enhance

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|装备id|
|useInsurance|bool|是否使用强化保护卡|
**返回值**
> EnhancingResult

**状态码**

---
#### 装备重铸
**路径**
> /equipment/action/{id}/fusion

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|需要重铸的装备id|
|subEquipmentId|number|作为材料的装备id|
**返回值**
> FusionResult

**状态码**

---
#### 卸下一个装备
**路径**
> /equipment/disarm

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|partType|integer|装备部位的编号|
**返回值**
> null

**状态码**

---
#### 获得当前打造价格
**路径**
> /equipment/forgePrice

**请求方法**
`GET`
**参数**
无
**返回值**
> number

**状态码**

---
#### 打造装备
**路径**
> /equipment/forge

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|expectedPrice|integer|期望的价格|
**返回值**
> Equipment

**状态码**

---
#### 回收装备
**路径**
> /equipment/recycle

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|ids|sring|逗号分隔的装备 id 列表|
**返回值**
> array

**状态码**

---
#### 获得最近的优质打造记录
**路径**
> /equipment/lastestInterestingForgings

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 取得从一个原型能够生成的装备的视图
**路径**
> /equipment/prototype/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|神装的定义 id|
**返回值**
> EquipmentDetail

**状态码**

---
#### 兑换一件装备
**路径**
> /equipment/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|用来兑换的货币 id|
**返回值**
> Equipment

**状态码**
### 通知
## player
> /player

### 子模块
### 接口

---
#### 查询自己的角色的信息
**路径**
> /player/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> Player

**状态码**

---
#### 查询一个角色的信息
**路径**
> /player/view/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|角色的id|
**返回值**
> Player

**状态码**

---
#### 查询自己的角色的详细信息
**路径**
> /player/view/myself/detail

**请求方法**
`GET`
**参数**
无
**返回值**
> PlayerDetail

**状态码**

---
#### 查询一个角色的曾用名
**路径**
> /player/viewNameUsed/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|角色的id|
**返回值**
> array

**状态码**

---
#### 角色改名
**路径**
> /player/action/myself/rename

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|playerName|string|角色名|
**返回值**
> Player

**状态码**

---
#### 查询一个角色的详细信息
**路径**
> /player/view/{id}/detail

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|角色的id|
**返回值**
> PlayerDetail

**状态码**

---
#### 查询一些玩家的角色信息
**路径**
> /player/view

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIds|string|逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 查询一些玩家的角色名
**路径**
> /player/viewName

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIds|string|逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 查询一些玩家的基本角色信息
**路径**
> /player/viewBaseInfo

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIds|string|逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 用角色名查询一个玩家
**路径**
> /player/viewBaseInfoByName

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|playerName|string|角色名|
**返回值**
> PlayerBaseInfo

**状态码**

---
#### 查询一些玩家的详细角色信息
**路径**
> /player/viewDetail

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIds|string|逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 查询一些可以当作玩家镜像的账号的id
**路径**
> /player/ghosts

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|limit|integer|查询的数量限制|
**返回值**
> array

**状态码**

---
#### 创建角色（保留作测试用）
**路径**
> /player/create

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|playerName|string|角色名|
|prefabId|integer|角色的造型id|
**返回值**
> Player

**状态码**
 - `200`: 此账号已经创建过角色
 - `201`: 指定的角色名已经存在
 - `202`: 指定的角色名非法
 - `203`: 指定的造型id非法

---
#### 创建角色，并创建邀请关系
**路径**
> /player/createWithInvitation

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|playerName|string|角色名|
|prefabId|integer|角色的造型id|
|invitationCode|string|上游邀请者的邀请码（可选）|
**返回值**
> Player

**状态码**
 - `200`: 此账号已经创建过角色
 - `201`: 指定的角色名已经存在
 - `202`: 指定的角色名非法
 - `400`: 邀请者记录已存在

---
#### 获得当前的角色总数
**路径**
> /player/count

**请求方法**
`GET`
**参数**
无
**返回值**
> integer

**状态码**

---
#### 更新并获得当前角色的战斗力
**路径**
> /player/updateFc

**请求方法**
`POST`
**参数**
无
**返回值**
> integer

**状态码**

---
#### 获取自己的在线状态
**路径**
> /player/getOnlineStatus

**请求方法**
`GET`
**参数**
无
**返回值**
> PlayerOnlineStatus

**状态码**

---
#### 刷新自己的在线状态
**路径**
> /player/refreshOnlineStatus

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|mapId|int|地图id|
|xPos|int|x坐标|
|yPos|int|y坐标|
|direction|DIRECTION|面向|
|status|int|0:OFFLINE 1:IDLE 2:BATTLE 3:MINIGAME|
**返回值**
> Boolean

**状态码**

---
#### 获取一堆角色的在线状态
**路径**
> /player/getOnlineStatusByIdList

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIds|string|逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 获取指定地图角色的在线状态
**路径**
> /player/getOnlineStatusByMapId

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|mapId|int|地图id|
|amount|int|角色数量|
|excludeIds|string|需要过滤的角色，逗号分隔的账号id列表|
**返回值**
> array

**状态码**

---
#### 查询该角色是否在线
**路径**
> /player/isThisPlayerOnline/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|角色的id|
**返回值**
> Boolean

**状态码**
### 通知
**路径**
> /user/queue/player/levelup

**描述**
> 角色等级提升时的通知

## school
> /school

### 子模块
### 接口

---
#### 查询自己的门派记录
**路径**
> /school/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> SchoolRecord

**状态码**

---
#### 创建门派记录（拜入门派）
**路径**
> /school/create

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|schoolId|integer|要加入的门派的 id|
**返回值**
> SchoolRecord

**状态码**

---
#### 升级门派技能
**路径**
> /school/levelup

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|abilityIndex|integer|要升级的门派技能的索引|
**返回值**
> SchoolRecord

**状态码**

---
#### 一键升级门派技能
**路径**
> /school/levelupAMAP

**请求方法**
`POST`
**参数**
无
**返回值**
> SchoolRecord

**状态码**
### 通知
## currency
> /currency

### 子模块
### 接口

---
#### 查询一个账号的所有货币信息
**路径**
> /currency/view/{accountId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountId|integer|账号的id|
**返回值**
> array

**状态码**

---
#### 查询一个账号的指定的货币的信息
**路径**
> /currency/view/{accountId}/{currencyId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountId|integer|账号的id|
|currencyId|integer|货币的id|
**返回值**
> CurrencyRecord

**状态码**

---
#### 查询货币变化记录，调试用
**路径**
> /currency/logs

**请求方法**
`GET`
**参数**
无
**返回值**
> null

**状态码**

---
#### 给当前登录的账号的增加货币，调试用
**路径**
> /currency/giveMeMoney

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|integer|货币id|
|amount|integer|数量|
**返回值**
> null

**状态码**

---
#### 获取前一天的块币日常记录
**路径**
> /currency/lastDayKuaibiDailiRecord

**请求方法**
`GET`
**参数**
无
**返回值**
> KuaibiDailyRecord

**状态码**

---
#### 获取今天的块币日常记录
**路径**
> /currency/todayKuaibiDailyRecord

**请求方法**
`GET`
**参数**
无
**返回值**
> KuaibiDailyRecord

**状态码**
### 通知
**路径**
> /user/queue/currency/currencyChanged

**描述**
> 货币变化时的通知消息

## chat
> /chat

### 子模块
### 接口

---
#### 发送一条消息
**路径**
> /chat/sendMessage

**请求方法**
`POST`
**参数**
无
**返回值**
> ChatMessage

**状态码**

---
#### 获取最近的公共消息
**路径**
> /chat/public/view

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获取未读消息的信息
**路径**
> /chat/private/incomingInfo

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获取与一个指定的账号相关的收发的消息
**路径**
> /chat/private/conversation

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|anotherAccountId|integer|要查询的聊天对象的账号id|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> array

**状态码**

---
#### 将一个发送者发送给自己的所有消息标记为已读
**路径**
> /chat/private/markAlreadyRead

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|senderAccountId|integer|要操作的发送者账号id|
**返回值**
> null

**状态码**

---
#### 获得指定的最近的界面广播记录
**路径**
> /chat/latestInterestingMessage/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|广播id|
**返回值**
> array

**状态码**
### 通知
**路径**
> /topic/chat/message

**描述**
> 有新的公共消息的通知

**路径**
> /user/queue/chat/message/private

**描述**
> 有新的私人消息的通知

## 聊天管理
> /management/chat

### 子模块
### 接口

---
#### 发送一条公告
**路径**
> /management/chat/sendGameMasterMessage

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|serviceId|number|服务id（可选）|
**返回值**
> ChatMessage

**状态码**

---
#### 获取当前的自动发送广播配置
**路径**
> /management/chat/sendingBroadcastState

**请求方法**
`GET`
**参数**
无
**返回值**
> SendingBroadcastSetting

**状态码**

---
#### 创建一个新的自动发送广播配置，会取代原有的
**路径**
> /management/chat/createSendingBroadcastTask

**请求方法**
`POST`
**参数**
无
**返回值**
> SendingBroadcastSetting

**状态码**

---
#### 取消当前的自动发送广播配置
**路径**
> /management/chat/cancleSendingBroadcastTask

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## ranking
> /ranking

### 子模块
### 接口

---
#### 查询指定排行榜
**路径**
> /ranking/view/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|排行榜的 id|
|topRecordSize|number|要查询的记录的长度（可选，默认100，最大100）|
**返回值**
> SimpleRanking

**状态码**

---
#### 查询指定排行榜的指定账号的记录
**路径**
> /ranking/view/{rankingId}/{accountId}/

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|rankingId|number|排行榜的 id|
|accountId|number|账号 id|
**返回值**
> array

**状态码**

---
#### 触发每日重置（测试用）
**路径**
> /ranking/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## title
> /title

### 子模块
### 接口

---
#### 查询指定的称号
**路径**
> /title/view/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|称号的 id|
**返回值**
> Title

**状态码**

---
#### 查询自己所有的称号
**路径**
> /title/viewMine

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 设置（装着）一个主称号
**路径**
> /title/action/{id}/primary

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|称号的 id|
**返回值**
> null

**状态码**

---
#### 取消（卸下）主称号
**路径**
> /title/untitle

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**

---
#### 生成一个称号（测试用）
**路径**
> /title/grantForTest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|definitionId|number|称号的配置表定义的 id|
**返回值**
> Title

**状态码**

---
#### 兑换一个称号
**路径**
> /title/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|用来兑换的货币 id|
**返回值**
> TitleRedeemResult

**状态码**
### 通知
## invitation
> /invitation

### 子模块
### 接口

---
#### 获取自己的邀请者信息
**路径**
> /invitation/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> InvitationInfo

**状态码**
 - `1`: 自己的邀请者信息不存在

---
#### 创建自己的邀请者信息（保留作测试用）
**路径**
> /invitation/create

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|invitationCode|string|上游邀请者的邀请码（可选）|
**返回值**
> InviterRecord

**状态码**
 - `400`: 邀请者记录已存在
 - `401`: 邀请码无效
 - `402`: 邀请者已达到邀请数量限制

---
#### 校验邀请码是否可用
**路径**
> /invitation/verify

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|invitationCode|string|邀请码|
**返回值**
> null

**状态码**
 - `401`: 邀请码无效
 - `402`: 邀请者已达到邀请数量限制

---
#### 结算邀请奖励
**路径**
> /invitation/resolveInvitationReward

**请求方法**
`POST`
**参数**
无
**返回值**
> InviterRecord

**状态码**
 - `404`: 自己的邀请者信息不存在

---
#### 领取邀请奖励
**路径**
> /invitation/obtainInvitationReward

**请求方法**
`POST`
**参数**
无
**返回值**
> InviterRecord

**状态码**
 - `403`: 当天已经领取过了
 - `404`: 自己的邀请者信息不存在

---
#### 获得今天的邀请回报记录集（今天结算的是昨天的奖励）
**路径**
> /invitation/todayInvitationRewardLogs

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获得今天的块币大转盘能量邀请回报分组记录
**路径**
> /invitation/groupedKbdzpReward

**请求方法**
`GET`
**参数**
无
**返回值**
> GroupedInvitationReward

**状态码**

---
#### 获得今天的块币邀请回报分组记录
**路径**
> /invitation/groupedKuaibiRewardLogs

**请求方法**
`GET`
**参数**
无
**返回值**
> GroupedInvitationReward

**状态码**

---
#### 扩展一次邀请上限
**路径**
> /invitation/extendInvitationLimit

**请求方法**
`POST`
**参数**
无
**返回值**
> InviterRecord

**状态码**
 - `405`: 邀请上限已达最大
### 通知
## 邮件管理
> /management/mail

### 子模块
### 接口

---
#### 向单个用户发送邮件
**路径**
> /management/mail/sendMailToOne

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountId|integer|发送目标的账号id|
|title|string|标题|
|content|string|正文|
|attachment|string|附件，货币堆的文本形式|
**返回值**
> Mail

**状态码**

---
#### 向所有人发邮件
**路径**
> /management/mail/sendMailToAll

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|title|string|标题|
|content|string|正文|
|attachment|string|附件，货币堆的文本形式|
**返回值**
> null

**状态码**
### 通知
## mail
> /mail

### 子模块
### 接口

---
#### 获得所有的自己的邮件
**路径**
> /mail/view/mine

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|page|integer|分页编号，从 0 开始|
|size|integer|分页大小|
**返回值**
> array

**状态码**

---
#### 检查是否有未读邮件
**路径**
> /mail/existsUnread

**请求方法**
`GET`
**参数**
无
**返回值**
> boolean

**状态码**

---
#### 标记一个邮件为已读
**路径**
> /mail/action/{mailId}/markAlreadyRead

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|mailId|integer|邮件id|
**返回值**
> Mail

**状态码**
 - `500`: ��是邮件的所有者

---
#### 领取一个邮件的附件
**路径**
> /mail/action/{mailId}/obtainAttachment

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|mailId|integer|邮件id|
**返回值**
> Mail

**状态码**
 - `500`: 不是邮件的所有者
 - `501`: 已经领取过附件

---
#### 删除一个邮件
**路径**
> /mail/action/{mailId}/delete

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|mailId|integer|邮件id|
**返回值**
> null

**状态码**
 - `500`: 不是邮件的所有者

---
#### 删除所有已读已领取附件的邮件
**路径**
> /mail/deleteNeedless

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
**路径**
> /user/queue/mail/mailSent

**描述**
> 对单个用户发送邮件时的通知

**路径**
> /topic/mail/mailSent

**描述**
> 群发邮件时的通知（此时邮件中的id和accountId均为0）

## 任务管理
> /management/quest

### 子模块
### 接口

---
#### 触发重置
**路径**
> /management/quest/triggerReset

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|resetType|string|重置类型|
**返回值**
> null

**状态码**

---
#### 为所有玩家尝试领取一个任务
**路径**
> /management/quest/tryPickupForAll

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|questId|integer|任务的 id|
**返回值**
> null

**状态码**
### 通知
## quest
> /quest

### 子模块
### 接口

---
#### 获得自己的所有的任务记录
**路径**
> /quest/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获得自己的指定的任务记录
**路径**
> /quest/view/myself/{questId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|questId|integer|任务的id|
**返回值**
> QuestRecord

**状态码**

---
#### 开始一个任务
**路径**
> /quest/action/myself/{questId}/start

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|questId|integer|任务的id|
**返回值**
> QuestRecord

**状态码**
 - `-1`: 任务已经开始
 - `-1`: 未达到等级要求
 - `-1`: 未达到前置条件

---
#### 完成一个任务目标
**路径**
> /quest/action/myself/{questId}/achieveObjective

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|questId|integer|任务的id|
|objectiveIndex|integer|任务目标在任务定义中的索引|
|args|string|逗号分隔的额外参数列表（可选）|
**返回值**
> QuestRecord

**状态码**
 - `-1`: 任务目标已经完成

---
#### 触发每日重置
**路径**
> /quest/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
**路径**
> /user/queue/quest/started

**描述**
> 开始了新任务的通知

**路径**
> /user/queue/quest/completed

**描述**
> 任务完成的通知

## pet
> /pet

### 子模块
### 接口

---
#### 获得所有的自己宠物的 id 的列表
**路径**
> /pet/view/mine/id

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获得所有的自己神兽的 id 的列表
**路径**
> /pet/view/legendaryOfMine/id

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询指定宠物的能力参数
**路径**
> /pet/view/{id}/parameters

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
**返回值**
> array

**状态码**

---
#### 查询自己的拥有候选技能的宠物的 id 的列表
**路径**
> /pet/viewMineHasCandidateAbilitiesIds

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 宠物改名
**路径**
> /pet/action/{id}/rename

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
|newName|string|新名字|
**返回值**
> Pet

**状态码**

---
#### 抽选宠物技能
**路径**
> /pet/action/{id}/gachaAbility

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
**返回值**
> PetGachaAbilityResult

**状态码**

---
#### 学习宠物技能
**路径**
> /pet/action/{id}/aquireAbility

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
|abilityid|number|技能的 id|
**返回值**
> Pet

**状态码**

---
#### 宠物冲星
**路径**
> /pet/action/{id}/enhance

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
**返回值**
> PetEnhanceResult

**状态码**

---
#### 宠物炼化
**路径**
> /pet/action/{id}/fusion

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|宠物的 id|
|subPetId|number|作为材料的宠物的 id|
**返回值**
> PetFusionResult

**状态码**

---
#### 查询指定的宠物的详细信息
**路径**
> /pet/viewDetail

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petIds|string|逗号分隔的宠物 id 的列表|
**返回值**
> array

**状态码**

---
#### 设置宠物出战队列
**路径**
> /pet/modifyBattleList

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petIds|string|逗号分隔的宠物 id 的列表|
**返回值**
> null

**状态码**

---
#### 生成一个宠物（测试用）
**路径**
> /pet/createForTest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|definitionId|number|配置表的定义 id|
**返回值**
> Pet

**状态码**

---
#### 查询当前获得宠物的价格
**路径**
> /pet/gachaPrice

**请求方法**
`GET`
**参数**
无
**返回值**
> number

**状态码**

---
#### 获得宠物
**路径**
> /pet/gacha

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|expectedPrice|number|期望的价格|
**返回值**
> PetDetail

**状态码**

---
#### 查询最近的广播信息
**路径**
> /pet/latestInterestingGachas

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 触发每日重置（测试用）
**路径**
> /pet/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**

---
#### 查询宠物获得排行榜
**路径**
> /pet/gachaRanking

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询宠物获得排行榜奖励信息
**路径**
> /pet/gachaRankingAward

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询宠物获得排行榜的共享信息
**路径**
> /pet/gachaRankingShared

**请求方法**
`GET`
**参数**
无
**返回值**
> PetGachaRankingSharedRecord

**状态码**

---
#### 领取排行奖励
**路径**
> /pet/obtainRankingAward

**请求方法**
`POST`
**参数**
无
**返回值**
> PetGachaRankingAwardResult

**状态码**

---
#### 宠物回收
**路径**
> /pet/recycle

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petIds|string|逗号分隔的宠物 id 列表|
**返回值**
> array

**状态码**

---
#### 取得从一个原型能够生成的宠物的视图
**路径**
> /pet/prototype/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|神宠的定义 id|
**返回值**
> PetDetail

**状态码**

---
#### 兑换一只宠物
**路径**
> /pet/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|用来兑换的货币 id|
**返回值**
> PetDetail

**状态码**
### 通知
## award
> /award

### 子模块
### 接口

---
#### 用货币兑换一个奖励
**路径**
> /award/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|要兑换的货币id|
**返回值**
> AwardResult

**状态码**
### 通知
**路径**
> /user/queue/award/award

**描述**
> 获得奖励的通知

## 块币大转盘管理
> /management/kbdzp

### 子模块
### 接口

---
#### 查看块币大转盘的共享记录
**路径**
> /management/kbdzp/view

**请求方法**
`GET`
**参数**
无
**返回值**
> KbdzpSharedRecord

**状态码**

---
#### 为不存在记录的玩家生成记录
**路径**
> /management/kbdzp/fixRecords

**请求方法**
`GET`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## 块币大转盘
> /kbdzp

### 子模块
### 接口

---
#### 查看自己的块币大转盘记录
**路径**
> /kbdzp/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> KbdzpRecord

**状态码**

---
#### 结算一次块币大转盘能量回复
**路径**
> /kbdzp/recoverEnergy

**请求方法**
`POST`
**参数**
无
**返回值**
> KbdzpRecoverResult

**状态码**

---
#### 激活能量回复奖励1
**路径**
> /kbdzp/enableBooster1

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|activationCode|string|激活码|
**返回值**
> KbdzpRecord

**状态码**
 - `302`: 指定的激活码已经使用过
 - `301`: 激活码不正确

---
#### 激活能量回复奖励2
**路径**
> /kbdzp/enableBooster2

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|activationCode|string|激活码|
**返回值**
> KbdzpRecord

**状态码**
 - `302`: 指定的激活码已经使用过
 - `301`: 激活码不正确

---
#### 转一下转盘
**路径**
> /kbdzp/makeTurn

**请求方法**
`POST`
**参数**
无
**返回值**
> KbdzpRecord

**状态码**
 - `300`: 能量值不足
 - `304`: 当前存在未领取的奖励

---
#### 领取转盘奖励
**路径**
> /kbdzp/obtainAward

**请求方法**
`POST`
**参数**
无
**返回值**
> KbdzpRecord

**状态码**
 - `305`: 当前不存在未领取的奖励

---
#### 获得最近的需要展示的奖励记录
**路径**
> /kbdzp/latestInterestingAwards

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 领取被邀请奖励
**路径**
> /kbdzp/obtainInviteeBonus

**请求方法**
`POST`
**参数**
无
**返回值**
> KbdzpRecord

**状态码**
 - `303`: 邀请奖励不可用
### 通知
## party
> /party

### 子模块
### 接口

---
#### 获得自己的助战队伍信息
**路径**
> /party/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> PartyComplex

**状态码**

---
#### 请求一批助战备选
**路径**
> /party/requestCandidates

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|highLevel|boolean|是否请求高战力备选列表|
**返回值**
> PartyRecord

**状态码**

---
#### 从好友中请求一批助战备选
**路径**
> /party/requestCandidatesInFriends

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|highLevel|boolean|是否请求高战力备选列表|
**返回值**
> PartyRecord

**状态码**

---
#### 邀请一名玩家助战
**路径**
> /party/invite

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetAccountId|integer|要邀请的目标的账号id|
**返回值**
> SupportRelation

**状态码**

---
#### 解除一名玩家助战
**路径**
> /party/release

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetAccountId|integer|要解除的目标的账号id|
**返回值**
> null

**状态码**

---
#### 结算前一天的助战奖励
**路径**
> /party/resolveSupportReward

**请求方法**
`POST`
**参数**
无
**返回值**
> PartyRecord

**状态码**

---
#### 领取当前可领取的助战奖励
**路径**
> /party/obtainSupportReward

**请求方法**
`POST`
**参数**
无
**返回值**
> PartyRecord

**状态码**

---
#### 获得最近为他人助战的记录
**路径**
> /party/latestSupportLogs

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获得今天的助战奖励
**路径**
> /party/todaySupportReward

**请求方法**
`GET`
**参数**
无
**返回值**
> number

**状态码**
### 通知
**路径**
> /user/queue/party/supportExpired

**描述**
> 助战队友离队的通知

## battle
> /battle

### 子模块
### 接口

---
#### 开启一场战斗
**路径**
> /battle/start

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|battleDescriptorId|integer|战斗配置的id|
|oneshot|boolean|是否直接进行到结束|
**返回值**
> BattleResponse

**状态码**

---
#### 获得一个战斗会话的信息
**路径**
> /battle/view/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|战斗会话的id|
**返回值**
> BattleResponse

**状态码**

---
#### 进行下一回合
**路径**
> /battle/action/{id}/nextTurn

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|integer|战斗会话的id|
|turnCount|integer|回合数|
|skillId|integer|技能id（可选）|
|targetId|integer|目标id（可选）|
**返回值**
> TurnInfo

**状态码**

---
#### 清理未结束的战斗
**路径**
> /battle/clean

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**
### 通知
## auction
> /auction

### 子模块
### 接口

---
#### 查询拍卖总览信息
**路径**
> /auction/overall

**请求方法**
`GET`
**参数**
无
**返回值**
> AuctionOverall

**状态码**

---
#### 查询可以领取的成交的拍卖品
**路径**
> /auction/commodity/deliverable

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 领取暂存的块币和所有成交的拍卖品
**路径**
> /auction/withdrawAll

**请求方法**
`POST`
**参数**
无
**返回值**
> CommodityWithdrawResult

**状态码**

---
#### 创建拍卖模块的玩家记录
**路径**
> /auction/createRecord

**请求方法**
`GET`
**参数**
无
**返回值**
> AuctionRecord

**状态码**

---
#### 对指定拍卖品出价
**路径**
> /auction/commodity/{id}/bid

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|拍卖品 id|
|price|number|出价|
**返回值**
> Commodity

**状态码**

---
#### 给指定拍卖品点赞
**路径**
> /auction/commodity/{id}/like

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|拍卖品 id|
**返回值**
> WebMessageWrapper

**状态码**
### 通知
## baccarat
> /baccarat

### 子模块
### 接口

---
#### 查询信息
**路径**
> /baccarat/overall

**请求方法**
`GET`
**参数**
无
**返回值**
> BaccaratOverall

**状态码**

---
#### 下注
**路径**
> /baccarat/bet

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|betIndex|number|0庄赢 1闲赢 2和 3庄对 4闲对 5白板|
|amount|number|毫块币|
**返回值**
> BaccaratOverall

**状态码**

---
#### 取消下注
**路径**
> /baccarat/unBet

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|betIndex|number|0庄赢 1闲赢 2和 3庄对 4闲对 5白板|
**返回值**
> BaccaratOverall

**状态码**

---
#### 最近记录
**路径**
> /baccarat/record

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
### 通知
## baccaratManagement
> /management/baccarat

### 子模块
### 接口

---
#### 关闭
**路径**
> /management/baccarat/close

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**

---
#### 开启
**路径**
> /management/baccarat/open

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## brawl
> /brawl

### 子模块
### 接口

---
#### 领奖
**路径**
> /brawl/award

**请求方法**
`POST`
**参数**
无
**返回值**
> BrawlOverall

**状态码**

---
#### 随机生成乱斗队伍
**路径**
> /brawl/team

**请求方法**
`POST`
**参数**
无
**返回值**
> BrawlOverall

**状态码**

---
#### 结算一场乱斗战斗
**路径**
> /brawl/finish

**请求方法**
`POST`
**参数**
无
**返回值**
> BrawlOverall

**状态码**

---
#### 查询自己的乱斗信息
**路径**
> /brawl/get

**请求方法**
`GET`
**参数**
无
**返回值**
> BrawlOverall

**状态码**

---
#### 开始一场乱斗战斗
**路径**
> /brawl/start

**请求方法**
`POST`
**参数**
无
**返回值**
> BrawlOverall

**状态码**

---
#### 重置乱斗状态至等待组队
**路径**
> /brawl/reset

**请求方法**
`POST`
**参数**
无
**返回值**
> BrawlOverall

**状态码**
### 通知
## changlefang
> /changlefang

### 子模块
### 接口

---
#### 兑换块币
**路径**
> /changlefang/exchange_kc

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|amount|number|兑换的块币数量（不是毫块币）|
**返回值**
> ChanglefangOverall

**状态码**

---
#### 购买本票
**路径**
> /changlefang/buy

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|amount|number|购买的本票数量|
**返回值**
> ChanglefangOverall

**状态码**

---
#### 查询长乐坊信息（不包含记录）
**路径**
> /changlefang/get

**请求方法**
`GET`
**参数**
无
**返回值**
> ChanglefangOverall

**状态码**

---
#### 查询长乐坊记录
**路径**
> /changlefang/log

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
### 通知
## changlefangManagement
> /management/changlefang

### 子模块
### 接口

---
#### 每日重置
**路径**
> /management/changlefang/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## 福星降临
> /fxjl

### 子模块
### 接口

---
#### 查询总览信息
**路径**
> /fxjl/overall

**请求方法**
`GET`
**参数**
无
**返回值**
> FxjlOverall

**状态码**

---
#### 创建福星降临记录
**路径**
> /fxjl/createRecord

**请求方法**
`POST`
**参数**
无
**返回值**
> FxjlRecord

**状态码**

---
#### 开始一个福星降临任务
**路径**
> /fxjl/startQuest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|number|任务在全局记录中的索引|
**返回值**
> QuestRecord

**状态码**

---
#### 重置一个福星降临任务
**路径**
> /fxjl/resetQuest

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|number|任务在全局记录中的索引|
**返回值**
> WebMessageWrapper

**状态码**

---
#### 领取奖励
**路径**
> /fxjl/obtainAward

**请求方法**
`POST`
**参数**
无
**返回值**
> AwardResult

**状态码**
### 通知
## mineExploration
> /mineExploration

### 子模块
### 接口

---
#### 领奖
**路径**
> /mineExploration/award

**请求方法**
`POST`
**参数**
无
**返回值**
> MineExplorationOverall

**状态码**

---
#### 领代金券
**路径**
> /mineExploration/coupon

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|couponSendId|number|代金券Id|
**返回值**
> MineExplorationOverall

**状态码**

---
#### 挖开某个点
**路径**
> /mineExploration/dig

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|row|number|行编号，0~4|
|column|number|列编号，0~4|
**返回值**
> MineExplorationOverall

**状态码**

---
#### 续命
**路径**
> /mineExploration/add

**请求方法**
`POST`
**参数**
无
**返回值**
> MineExplorationOverall

**状态码**

---
#### 查询自己的挖矿信息
**路径**
> /mineExploration/get

**请求方法**
`GET`
**参数**
无
**返回值**
> MineExplorationOverall

**状态码**

---
#### 开始一局挖矿
**路径**
> /mineExploration/start

**请求方法**
`POST`
**参数**
无
**返回值**
> MineExplorationOverall

**状态码**
### 通知
## mineExplorationManagement
> /management/mineExploration

### 子模块
### 接口

---
#### 每日重置
**路径**
> /management/mineExploration/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**

---
#### 活动结束时清理未领取的奖励
**路径**
> /management/mineExploration/end

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## 名剑大会
> /mjdh

### 子模块
### 接口

---
#### 触发每日重置（测试用）
**路径**
> /mjdh/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> void

**状态码**

---
#### 查看当前赛季的信息
**路径**
> /mjdh/season/current

**请求方法**
`GET`
**参数**
无
**返回值**
> MjdhSeason

**状态码**

---
#### 查看当前赛季的详细信息
**路径**
> /mjdh/season/current/detail

**请求方法**
`GET`
**参数**
无
**返回值**
> MjdhSeasonDetail

**状态码**

---
#### 查看自己当前赛季的玩家记录
**路径**
> /mjdh/player/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> MjdhPlayerRecord

**状态码**

---
#### 查看指定账号当前赛季的玩家记录
**路径**
> /mjdh/player/{accountId}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountId|number|要查询的账号id|
**返回值**
> MjdhPlayerRecord

**状态码**

---
#### 创建自己的当前赛季的记录
**路径**
> /mjdh/player/create

**请求方法**
`POST`
**参数**
无
**返回值**
> MjdhPlayerRecord

**状态码**

---
#### 查看所有的胜者记录
**路径**
> /mjdh/winner/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查看指定的赛季的指定排名的胜者记录
**路径**
> /mjdh/winner/{seasonId}/{ranking}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|seasonId|number|赛季编号|
|ranking|number|排名|
**返回值**
> MjdhWinnerRecord

**状态码**

---
#### 开始匹配
**路径**
> /mjdh/startMatch

**请求方法**
`POST`
**参数**
无
**返回值**
> Object

**状态码**

---
#### 取消匹配
**路径**
> /mjdh/cancelMatch

**请求方法**
`POST`
**参数**
无
**返回值**
> Object

**状态码**

---
#### 领取每日首胜奖励
**路径**
> /mjdh/player/myself/obtainDailyFirstWinAward

**请求方法**
`POST`
**参数**
无
**返回值**
> array

**状态码**

---
#### 领取每日连胜奖励
**路径**
> /mjdh/player/myself/obtainDailyConsecutiveWinAward

**请求方法**
`POST`
**参数**
无
**返回值**
> array

**状态码**

---
#### 领取每日十胜奖励
**路径**
> /mjdh/player/myself/obtainDailyTenBattleAward

**请求方法**
`POST`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查看自己相关的战斗记录
**路径**
> /mjdh/battleLog/mine/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
### 通知
**路径**
> /user/queue/mjdh/singlePlayerBattleStarted

**描述**
> 名剑大会单人战斗开始的通知

**路径**
> /user/queue/mjdh/multiplayerBattleStarted

**描述**
> 名剑大会多人战斗开始的通知

**路径**
> /user/queue/mjdh/battleEnd

**描述**
> 名剑大会战斗结束的通知

## secretShopManagement
> /management/secretShop

### 子模块
### 接口

---
#### 每日重置
**路径**
> /management/secretShop/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## slots
> /slots

### 子模块
### 接口

---
#### 查询自己的被点赞信息
**路径**
> /slots/getLike

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己好友的大奖信息
**路径**
> /slots/getFriendBigPrize

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 领被点赞奖
**路径**
> /slots/takeLike

**请求方法**
`POST`
**参数**
无
**返回值**
> SlotsOverall

**状态码**

---
#### 点赞
**路径**
> /slots/like

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|bigPrizeId|number|大奖记录Id|
**返回值**
> SlotsOverall

**状态码**

---
#### 领奖
**路径**
> /slots/take

**请求方法**
`POST`
**参数**
无
**返回值**
> SlotsOverall

**状态码**

---
#### 摇奖
**路径**
> /slots/pull

**请求方法**
`POST`
**参数**
无
**返回值**
> SlotsOverall

**状态码**

---
#### 锁定/解锁坑位
**路径**
> /slots/lock

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|slotIndex|number|坑位编号0~3|
|lock|number|是否锁定|
**返回值**
> SlotsOverall

**状态码**

---
#### 查询自己的摇奖信息
**路径**
> /slots/get

**请求方法**
`GET`
**参数**
无
**返回值**
> SlotsOverall

**状态码**
### 通知
## slotsManagement
> /management/slots

### 子模块
### 接口

---
#### 每日重置
**路径**
> /management/slots/dailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**

---
#### 活动结束时清理未领取的奖励
**路径**
> /management/slots/end

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## 元宵佳肴
> /yuanxiaojiayao

### 子模块
### 接口

---
#### 触发每日重置
**路径**
> /yuanxiaojiayao/triggerDailyReset

**请求方法**
`POST`
**参数**
无
**返回值**
> void

**状态码**

---
#### 创建记录
**路径**
> /yuanxiaojiayao/createRecord

**请求方法**
`POST`
**参数**
无
**返回值**
> YxjyRecord

**状态码**

---
#### 开吃大餐
**路径**
> /yuanxiaojiayao/obtainAward

**请求方法**
`POST`
**参数**
无
**返回值**
> YxjyRecord

**状态码**

---
#### 查询自己的记录
**路径**
> /yuanxiaojiayao/viewMyself

**请求方法**
`GET`
**参数**
无
**返回值**
> YxjyRecord

**状态码**

---
#### 发出佳肴邀请
**路径**
> /yuanxiaojiayao/publishInvitation

**请求方法**
`POST`
**参数**
无
**返回值**
> YxjyRecord

**状态码**

---
#### 接受邀请
**路径**
> /yuanxiaojiayao/attend

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetAccountId|number|玩家A的账号id|
**返回值**
> YxjyRecord

**状态码**
### 通知
## yxjyManagement
> /management/yxjy

### 子模块
### 接口

---
#### 活动结束时清理未领取的奖励
**路径**
> /management/yxjy/end

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## 在线奖励
> /zxjl

### 子模块
### 接口

---
#### 获取奖励
**路径**
> /zxjl/obtainAward

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|number|要领取的奖励的索引|
**返回值**
> AwardResult

**状态码**

---
#### 查询自己的记录
**路径**
> /zxjl/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> ZxjlRecord

**状态码**
### 通知
## zxjlManagement
> /management/zxjl

### 子模块
### 接口

---
#### 活动结束时清理未领取的奖励
**路径**
> /management/zxjl/end

**请求方法**
`GET`
**参数**
无
**返回值**
> Object

**状态码**
### 通知
## impartation
> /impartation

### 子模块
### 接口

---
#### 触发每日重置（测试用）
**路径**
> /impartation/triggerDailyReset

**请求方法**
`GET`
**参数**
无
**返回值**
> void

**状态码**

---
#### 查询自己的师徒模块记录
**路径**
> /impartation/view/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> ImpartationRecord

**状态码**

---
#### 查询自己作为徒弟的师徒关系记录
**路径**
> /impartation/disciple/meAsDisciple

**请求方法**
`GET`
**参数**
无
**返回值**
> DiscipleRecord

**状态码**

---
#### 查询自己作为师父的师徒关系记录
**路径**
> /impartation/disciple/myDisciples

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询指定玩家的未出师的徒弟数量
**路径**
> /impartation/disciple/countByMasterAccountId

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|masterAccountId|number|要查询的玩家的账号 id|
**返回值**
> int

**状态码**

---
#### 创建记录或变更自己的师徒模块的角色
**路径**
> /impartation/createOrChangeRole

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|role|ImpartationRole|要变更的角色|
**返回值**
> ImpartationRecord

**状态码**

---
#### 查询自己发起的师徒请求
**路径**
> /impartation/disciplineRequest/fromMe/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询发送给自己的师徒请求
**路径**
> /impartation/disciplineRequest/toMe/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 接受一个师徒请求
**路径**
> /impartation/disciplineRequest/toMe/{discipleAccountId}/accept

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|discipleAccountId|number|徒弟的账号 id|
**返回值**
> DiscipleRecord

**状态码**

---
#### 清空发送给自己的师徒请求
**路径**
> /impartation/disciplineRequest/toMe/clean

**请求方法**
`POST`
**参数**
无
**返回值**
> WebMessageWrapper

**状态码**

---
#### 查询自己的每日修行记录
**路径**
> /impartation/dailyPractice/mine/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询指定账号的每日修行记录
**路径**
> /impartation/dailyPractice/{accountId}/

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountId|number|要查询的账号 id|
**返回值**
> array

**状态码**

---
#### 生成每日修行，如果已经生成过了则返回现有的
**路径**
> /impartation/dailyPractice/mine/generate

**请求方法**
`POST`
**参数**
无
**返回值**
> array

**状态码**

---
#### 完成指定的每日修行
**路径**
> /impartation/dailyPractice/mine/{id}/complete

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|每日修行的 id|
**返回值**
> CompleteDailyPracticeResult

**状态码**

---
#### 完成指定的每日修行
**路径**
> /impartation/dailyPractice/mine/complete

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|ids|string|逗号分隔的每日修行 id 的列表|
**返回值**
> array

**状态码**

---
#### 获取指定的每日修行的奖励
**路径**
> /impartation/dailyPractice/mine/{id}/obtainAward

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|每日修行的 id|
**返回值**
> ObtainDailyPracticeRewardResult

**状态码**

---
#### 作为徒弟确认出师
**路径**
> /impartation/disciple/meAsDisciple/confirm

**请求方法**
`POST`
**参数**
无
**返回值**
> DiscipleRecord

**状态码**

---
#### 作为师父确认出师
**路径**
> /impartation/disciple/myDisciples/{id}/confirm

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|徒弟的账号 id|
**返回值**
> DiscipleRecord

**状态码**

---
#### 作为徒弟领取师徒块币奖励
**路径**
> /impartation/disciple/meAsDisciple/obtainKuaibiPoolAward

**请求方法**
`POST`
**参数**
无
**返回值**
> CurrencyStack

**状态码**

---
#### 作为师父领取师徒块币奖励
**路径**
> /impartation/disciple/myDisciples/{id}/obtainKuaibiPoolAward

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|徒弟的账号 id|
**返回值**
> CurrencyStack

**状态码**

---
#### 领取元宝经验奖励
**路径**
> /impartation/disciple/meAsDisciple/obtainYuanbaoExpPoolAward

**请求方法**
`POST`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询一些随机的师父的账号 id
**路径**
> /impartation/viewRandomMasterAccountId

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 获得当前的块币池的值
**路径**
> /impartation/disciple/{id}/currentKuaibiPool

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|要查询的徒弟的账号 id|
**返回值**
> long

**状态码**

---
#### null
**路径**
> /impartation/disciple/meAsDisciple/delete

**请求方法**
`POST`
**参数**
无
**返回值**
> null

**状态码**

---
#### null
**路径**
> /impartation/disciple/myDisciples/{id}/delete

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|徒弟的账号 id|
**返回值**
> null

**状态码**

---
#### 创建师徒请求
**路径**
> /impartation/disciplineRequest/fromMe/{masterAccountId}/create

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|masterAccountId|number|师父的账号 id|
**返回值**
> DisciplineRequest

**状态码**
### 通知
## 神兽
> /legendaryPet

### 子模块
### 接口

---
#### 神兽兑换
**路径**
> /legendaryPet/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|definitionId|number|要兑换的宠物定义的id|
**返回值**
> Pet

**状态码**

---
#### 神兽进阶
**路径**
> /legendaryPet/ascend

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petId|number|宠物id|
**返回值**
> Pet

**状态码**

---
#### 神兽消耗品获得
**路径**
> /legendaryPet/redeemSpecial

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|用于兑换的货币id|
**返回值**
> Pet

**状态码**

---
#### 查询所有神兽生成记录
**路径**
> /legendaryPet/generation/

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**
### 通知
## 交易行
> /market

### 子模块
### 接口

---
#### 购买货品
**路径**
> /market/consignment/{id}/purchase

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> Consignment

**状态码**

---
#### 查看自己相关的货品，包括自己出售的和可领取的
**路径**
> /market/consignment/mine

**请求方法**
`GET`
**参数**
无
**返回值**
> MyConsignmentsComplex

**状态码**

---
#### 查看自己收藏的货品
**路径**
> /market/consignment/marked

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查看所有上架中的货品
**路径**
> /market/consignment/

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> PagedConsignmentList

**状态码**

---
#### 查看上架中的装备货品
**路径**
> /market/consignment/equipments

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|part|number|装备部位筛选条件（可选）|
|color|number|品质筛选条件（可选）|
|maxEnhanceLevel|number|最大强化等级匹配条件（可选）|
|paramMatch|string|属性筛选条件匹配方式，'all' 为全条件匹配，'any' 为任意条件匹配，（可选，默认 'all'）|
|patk|number|物伤匹配条件（可选）|
|matk|number|法伤匹配条件（可选）|
|fc|number|战斗力匹配条件（可选）|
|effectMatch|string|特效筛选条件匹配方式，'all' 为全条件匹配，'any' 为任意条件匹配，（可选，默认 'all'）|
|effectIds|string|装备特效匹配条件，逗号分隔列表（可选��|
|skillEnhancementEffectIds|string|门派技能强化匹配条件，逗号分隔列表（可选）|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> PagedConsignmentList

**状态码**

---
#### 查看上架中的宠物货品
**路径**
> /market/consignment/pets

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|petDefinitionId|number|宠物种类筛选条件（可选）|
|petRank|number|冲星匹配条件（可选）|
|maxPetRank|number|冲星上限匹配条件（可选）|
|aptitudeHp|number|生命资质匹配条件（可选）|
|aptitudeAtk|number|攻击资质匹配条件（可选）|
|aptitudePdef|number|物防资质匹配条件（可选）|
|aptitudeMdef|number|法防资质匹配条件（可选）|
|aptitudeSpd|number|速度资质匹配条件（可选）|
|abilitiyMatch|string|技能筛选条件匹配方式，'all' 为全条件匹配，'any' 为任意条件匹配，（可选，默认 'all'）|
|abilityIds|string|技能匹配条件，逗号分隔列表（可选）|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> PagedConsignmentList

**状态码**

---
#### 查看上架中的称号货品
**路径**
> /market/consignment/titles

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|page|number|分页编号，从 0 开始（可选）|
|size|number|分页大小（可选）|
**返回值**
> PagedConsignmentList

**状态码**

---
#### 上架货品（从身上上架）
**路径**
> /market/consignment/create

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|goodsType|GoodsType|货品类型|
|goodsObjectId|number|货品对象的id|
|price|number|售出的价格|
**返回值**
> Consignment

**状态码**

---
#### 下架货品
**路径**
> /market/consignment/{id}/suspend

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> Consignment

**状态码**

---
#### 上架货品（从临时仓库上架）
**路径**
> /market/consignment/{id}/resume

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
|price|number|售出的价格|
**返回值**
> Consignment

**状态码**

---
#### 临时仓库取回（普通取回）
**路径**
> /market/consignment/{id}/cancel

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> WebMessageWrapper

**状态码**

---
#### 查看自己的收藏
**路径**
> /market/marker/mine

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 收藏指定货品
**路径**
> /market/consignment/{id}/mark

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> ConsignmentMarker

**状态码**

---
#### 取消收藏指定货品
**路径**
> /market/consignment/{id}/unmark

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> WebMessageWrapper

**状态码**

---
#### 临时仓库取回（块币取回）
**路径**
> /market/consignment/{id}/obtainPayment

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> Consignment

**状态码**

---
#### 临时仓库取回（购买取回）
**路径**
> /market/consignment/{id}/obtainGoods

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|货品id|
**返回值**
> Consignment

**状态码**
### 通知
## 天赋
> /perk

### 子模块
### 接口

---
#### 天赋培养
**路径**
> /perk/ring/myself/makeProgress

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|amountToConsume|number|要消耗的材料的数量|
**返回值**
> PerkRingDetail

**状态码**

---
#### 查看自己的天赋环的信息
**路径**
> /perk/ring/myself

**请求方法**
`GET`
**参数**
无
**返回值**
> PerkRingDetail

**状态码**

---
#### 切换效果
**路径**
> /perk/ring/myself/switchSelection

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|number|天赋索引，从 0 开始|
|selection|PerkSelection|天赋效果选择|
**返回值**
> PerkRingDetail

**状态码**

---
#### 创建天赋环记录
**路径**
> /perk/ring/create

**请求方法**
`POST`
**参数**
无
**返回值**
> PerkRingDetail

**状态码**

---
#### 激活效果
**路径**
> /perk/ring/myself/makeSelection

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|index|number|天赋索引，从 0 开始|
|selection|PerkSelection|天赋效果选择|
**返回值**
> PerkRingDetail

**状态码**
### 通知
## 趣币
> /qubi

### 子模块
### 接口

---
#### 创建趣币订单
**路径**
> /qubi/createOrder

**请求方法**
`POST`
**参数**
无
**返回值**
> CreateOrderResult

**状态码**
### 通知
## shop
> /shop

### 子模块
### 接口

---
#### 查询一个指定的商品
**路径**
> /shop/getCommodity

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|commodityId|number|商品Id|
**返回值**
> ShopCommodityRecord

**状态码**

---
#### 查询一个指定的商店
**路径**
> /shop/getShop

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|shopId|number|商店Id|
**返回值**
> array

**状态码**

---
#### 购买商品
**路径**
> /shop/buy

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|shopId|number|商店Id|
|commodityId|number|商品Id|
|amount|number|数量|
|expectedPrice|number|单价|
**返回值**
> array

**状态码**
### 通知
## Tron 交易
> /tronExchange

### 子模块
### 接口

---
#### 提交一个 Tron 交易的 id 来进行充值
**路径**
> /tronExchange/chargeByTransaction

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|txId|string|Tron 交易的 id|
**返回值**
> TronChargeRequest

**状态码**
### 通知
## friend
> /friend

### 子模块
### 接口

---
#### 查询推荐的好友列表
**路径**
> /friend/recommend

**请求方法**
`GET`
**参数**
无
**返回值**
> FriendRecommend

**状态码**

---
#### 查询别人对自己发起的好友申请列表
**路径**
> /friend/getApply

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 批量处理别人对自己发起的好友申请
**路径**
> /friend/batchHandle

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|pass|boolean|是否通过|
**返回值**
> Boolean

**状态码**

---
#### 查询自己的好友列表
**路径**
> /friend/get

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 对某个好友发起好友申请
**路径**
> /friend/apply

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetId|number|目标角色Id|
**返回值**
> Boolean

**状态码**

---
#### 查询指定的一个好友
**路径**
> /friend/find

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|accountIdOrName|string|角色Id或角色名称|
**返回值**
> Friend

**状态码**

---
#### 从好友列表中删除一个指定的好友
**路径**
> /friend/delete

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|targetId|number|目标角色Id|
**返回值**
> Boolean

**状态码**

---
#### 处理别人对自己发起的好友申请
**路径**
> /friend/handle

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|actorId|number|发起好友申请的角色Id|
|pass|boolean|是否通过|
**返回值**
> Boolean

**状态码**
### 通知
## fashion
> /fashion

### 子模块
### 接口

---
#### 消耗货币兑换时装
**路径**
> /fashion/redeem

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|currencyId|number|货币Id|
**返回值**
> Fashion

**状态码**

---
#### 查询一件指定的时装信息
**路径**
> /fashion/getFashion

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|fashionId|number|时装实例Id|
**返回值**
> Fashion

**状态码**

---
#### 查询一个指定的染色信息
**路径**
> /fashion/getDye

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|dyeId|number|染色方案Id|
**返回值**
> FashionDye

**状态码**

---
#### 查询自己所有的时装信息
**路径**
> /fashion/getByAccountId

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查询自己指定时装原型的所有染色信息
**路径**
> /fashion/getDyeByAccountIdAndDefinitionId

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|definitionId|number|时装原型Id|
**返回值**
> array

**状态码**

---
#### 穿戴时装
**路径**
> /fashion/putOn

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|fashionId|number|时装实例Id|
**返回值**
> WebMessageWrapper

**状态码**

---
#### 脱下时装
**路径**
> /fashion/putOff

**请求方法**
`POST`
**参数**
无
**返回值**
> WebMessageWrapper

**状态码**

---
#### 增加一个染色方案
**路径**
> /fashion/addDye/{fashionId}

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|fashionId|number|时装实例id|
**返回值**
> Fashion

**状态码**

---
#### 更换指定染色方案
**路径**
> /fashion/chooseDye

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|fashionId|number|时装实例Id|
|dyeId|number|染色方案Id|
**返回值**
> Fashion

**状态码**

---
#### 卸下染色方案
**路径**
> /fashion/putOffDye

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|fashionId|number|时装实例Id|
**返回值**
> Fashion

**状态码**
### 通知
## multiplayer
> /multiplayerBattle

### 子模块
### 接口

---
#### 直接开始一场多人战斗（测试用）
**路径**
> /multiplayerBattle/startBattle

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|redPartyAccountIds|string|要参加战斗的红队账号id的逗号分隔列表|
|bluePartyAccountIds|string|要参加战斗的蓝队账号id的逗号分隔列表|
**返回值**
> void

**状态码**

---
#### 查询自己正在参加的多人战斗
**路径**
> /multiplayerBattle/attendingSessionIds

**请求方法**
`GET`
**参数**
无
**返回值**
> array

**状态码**

---
#### 查看指定的战斗会话的战斗信息
**路径**
> /multiplayerBattle/{id}

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|战斗会话的id|
**返回值**
> BattleResult

**状态码**

---
#### 获取同步信息
**路径**
> /multiplayerBattle/{id}/viewSync

**请求方法**
`GET`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|战斗会话的id|
**返回值**
> SyncMessage

**状态码**

---
#### 清理掉所有的战斗会话（测试用）
**路径**
> /multiplayerBattle/clean

**请求方法**
`POST`
**参数**
无
**返回值**
> void

**状态码**

---
#### 进行同步
**路径**
> /multiplayerBattle/{id}/sync

**请求方法**
`POST`
**参数**
|name|type|description|
|:-----------:|:-----------|:-----------|
|id|number|战斗会话的id|
**返回值**
> WebMessageWrapper

**状态码**
### 通知
**路径**
> /user/queue/multiplayerBattle/sync

**描述**
> 多人战斗的同步通知

## 接口
## 通知
