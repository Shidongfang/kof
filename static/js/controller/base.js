export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;  //用outer代替外面的this,否则后面再使用this将是里面的this
        this.$canvas.keydown(function (e) {
            outer.pressed_keys.add(e.key);
        })

        this.$canvas.keyup(function (e) {
            outer.pressed_keys.delete(e.key);
        })
    }
}