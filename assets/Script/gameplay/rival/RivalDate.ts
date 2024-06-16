
export default class RivalDate {

    private static _instance: RivalDate = null;

    playerTeam: any[] = [];
    enemyTeam: any[] = [];

    public static getInstance() {
        if (this._instance == null) {
            this._instance = new RivalDate();
        }
        return this._instance;
    }
}