import { AcGameObject } from "/static/js/ac_game_object/base.js";

export class Player extends AcGameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.vx = 0;
        this.vy = 0;

        this.speedx = 400; // 水平速度
        this.speedy = -1300; //跳跃的初始速度

        this.gravity = 50;

        this.direction = 1; // 正方向

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3; // 0 : idle 1 : 向前 2 : 向后 3 : 跳跃 4: 攻击 
                         //5 : 被打 6 : 死亡 7: 下蹲 8:防御 9：翻滚
        this.animations = new Map();

        this.frame_current_cnt = 0;  //当前渲染到了第几帧

        this.hp = 1000;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.$hp_div = this.$hp.find('div');
        this.$ko = this.root.$kof.find(`.kof-ko`);

        this.is_squat = false;
    }

    start() {

    }

    update_control() {
        let w, a, s, d, attack, l;
        if (this.id === 0) {
            w = this.pressed_keys.has('k');
            a = this.pressed_keys.has('a');
            s = this.pressed_keys.has('s');
            d = this.pressed_keys.has('d');
            attack = this.pressed_keys.has('j');
            l = this.pressed_keys.has('l');
        } else {
            w = this.pressed_keys.has('2');
            a = this.pressed_keys.has('ArrowLeft');
            s = this.pressed_keys.has('ArrowDown');
            d = this.pressed_keys.has('ArrowRight');
            attack = this.pressed_keys.has('1');
            l = this.pressed_keys.has('3');
        }

        //console.log(this.pressed_keys);

        if(this.status === 7) {

            if(s){
                if(d) {
                    this.vx = this.speedx / 4;
                }else if (a) {
                    this.vx = -this.speedx / 4;
                }else {
                    this.vx = 0;
                }
                this.is_squat = true;
            }
            else 
            {
                this.status = 0;
                this.is_squat = false;
            }
        } 
        

        if (this.status === 0 || this.status === 1) 
        {
            if (s)
            {   
                this.status = 7; 
                this.frame_current_cnt = 0;
                this.is_squat = true;
            }
            else if (attack) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } 
            else if (w) 
            {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } 
            else if (d) 
            {
                /* if(l) 
                {
                    this.status = 9;
                    if(this.direction === 1) this.frame_current_cnt = 0;
                    else this.frame_current_cnt = (this.frame_cnt -2) * this.frame_rate;
                }
                else */ this.status = 1;
                this.vx = this.speedx;
            } 
            else if (a) 
            {
                /* if(l) 
                {
                    this.status = 9;
                    this.frame_current_cnt = 0;
                }
                else */ this.status = 1;
                this.vx = -this.speedx;
            }
            else 
            {
                this.vx = 0;
                this.status = 0;
                this.is_squat = false;
            }
        }
    }

    update_move() {
        this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            if (this.status === 3) this.status = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }

    }

    update_direction() {
        if (this.status === 6) return;

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    is_attack() {
        if (this.status === 6) return;

        if(this.is_squat) this.status = 8;
        else this.status = 5;
        this.frame_current_cnt = 0;

        if(this.status === 8) this.hp = Math.max(this.hp - 100, 0);
        else this.hp = Math.max(this.hp - 200, 0);

        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 1000
        }, 700);
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 1000
        }, 1000);

        if (this.hp === 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
            this.root.game_map.music.pause();
            this.$ko.css('display','block');
        }
    }

    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false;
        return true;

    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 35) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update() {
        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();
        this.render();
    }
    render() {
        let status = this.status;

        if(status === 0 && this.is_squat) 
        if (this.status === 1 && this.vx * this.direction < 0) status = 2;

        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate % obj.frame_cnt);
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save();
                this.ctx.scale(-1, 1); //将坐标轴以 x 轴 左右翻转
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0); // 平移坐标轴
                let k = parseInt(this.frame_current_cnt / obj.frame_rate % obj.frame_cnt);
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();
            }
        }

        if (status === 4 || status === 5 || status === 6 || status === 8 ) {
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                }
            }
        }

        if(status === 7){
            if( parseInt((this.frame_current_cnt / obj.frame_rate)) % obj.frame_cnt 
                 === obj.frame_cnt -2){
                    this.frame_current_cnt--;
                 }
        }

        /* if(status === 9){
            if(this.direction === 1)
            {
                if( parseInt((this.frame_current_cnt / obj.frame_rate)) % obj.frame_cnt 
                 === obj.frame_cnt -2){
                    this.frame_current_cnt--;
                 }
            } else {
                if( parseInt((this.frame_current_cnt / obj.frame_rate)) % obj.frame_cnt 
                 === obj.frame_cnt -2){
                    this.frame_current_cnt--;
                 }
            }
            this.status = 0;
        } */
        this.frame_current_cnt++;
    }
}