let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.timedelta = 0; //时间差
        this.has_call_start = false;
    }

    start() {         //初始执行一次

    }

    update() {       //每一帧执行一次

    }

    destroy() {      //删除当前对象
        for (let i in AC_GAME_OBJECTS) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1); //删除
                break;
            }
        }
    }
}

let last_timestamp;  //上一帧执行时刻
let AC_GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME); //递归执行
}

requestAnimationFrame(AC_GAME_OBJECTS_FRAME); //启动执行

export {
    AcGameObject
}
