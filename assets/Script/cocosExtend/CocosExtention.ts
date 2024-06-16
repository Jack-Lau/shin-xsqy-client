
class SizeTo extends cc.ActionInterval {
    _startX = 1;
    _startY = 1;
    _endX = 0;
    _endY = 0;
    _deltaX = 0;
    _deltaY = 0;

    constructor (duration?, sx?, sy?) {
        super();
        sx !== undefined && this.initWithDuration(duration, sx, sy);
    }

    /*
     * Initializes the action.
     * @param {Number} duration
     * @param {Number} sx
     * @param {Number} [sy=]
     * @return {Boolean}
     */
    // function overload here
    initWithDuration(duration, sx, sy) {
        if (super['initWithDuration'](duration)) {
            this._endX = sx;
            this._endY = (sy != null) ? sy : sx;
            return true;
        }
        return false;
    }

    clone () {
        var action = new SizeTo();
        this['_cloneDecoration'](action);
        action.initWithDuration(this['_duration'], this._endX, this._endY);
        return action;
    }

    startWithTarget (target) {
        super['startWithTarget'](target);
        this._startX = target.width;
        this._startY = target.height;
        this._deltaX = this._endX - this._startX;
        this._deltaY = this._endY - this._startY;
    }

    update (dt) {
        dt = this['_computeEaseTime'](dt);
        if (this['target']) {
            this['target'].width = this._startX + this._deltaX * dt;
            this['target'].height = this._startY + this._deltaY * dt;
        }
    }
}

export module ccExtension {
    export function sizeTo (duration, sx, sy) { //function overload
        return new SizeTo(duration, sx, sy);
    };
}