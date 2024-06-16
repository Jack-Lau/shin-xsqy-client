import MapScene from "./MapScene";
import MapConfig from "../config/MapConfig";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";

export default class MapManager {
	
    private static _instance: MapManager = null;
	
    public _currentMapId: number = 1;
	public _currentXPos: number = 1;
	public _currentYPos: number = 1;
	
    public mapScene;

    constructor() {

    }

    public static getInstance() {
        if (this._instance == null) {
            this._instance = new MapManager();
        }
        return this._instance;
    }

    set currentMapId (mapId: number) {
        this._currentMapId = mapId;
        EventDispatcher.dispatch(Notify.MAP_CHANGED, {mapId: mapId});
    }
	
	set currentXPos (xPos: number) {
		this._currentXPos = xPos;
	}
	
	set currentYPos (yPos: number) {
		this._currentYPos = yPos;
	}
	
    get currentMapId () {
        return this._currentMapId;
    }
	
	get currentXPos () {
		return this._currentXPos;
	}
	
	get currentYPos () {
		return this._currentYPos;
	}	

}