
    // direction definition for enum
    export const enum StepDirection { Right=0, RightDown, Down, LeftDown, Left, LeftUp, Up, RightUp, Center };
    // direction definition for string 
    export let StepDirectionString: Array<string> = ["r","rd","d","ld","l","lu","u","ru","c"];

    export class PathStep {
        public stepDirection: StepDirection;                // 方向
        public stepDeltaX: number;                          // x 位移
        public stepDeltaY: number;                          // y 位移

        public constructor (
            stepDirection: StepDirection,
            stepDeltaX: number,
            stepDeltaY: number
        ) {
            this.stepDirection = stepDirection;
            this.stepDeltaX = stepDeltaX;
            this.stepDeltaY = stepDeltaY;
        }
    }
