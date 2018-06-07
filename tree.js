var w = window.innerWidth,
    h = window.innerHeight;
var ctx = null;
var treeNum = 5;
var initRadius = 30; // 树干的初始宽度
var maxGeneration = 6; // 最多分支的次数
var branchArray = null; // 树干的集合
var leaves = []; // 花的集合
var leavesDiot = [];
var flowers = []; // 花的集合
var imgObj = new Image();
imgObj.src = "http://oyu1dprzo.bkt.clouddn.com/leaf.png?imageView2/0/format/png/q/75|imageslim";

window.MyRequestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.MyCancelRequestAnimationFrame = window.cancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame;

/**
 * 初始化canvas
 */
function initCanvas() {
    var canvas = document.getElementById("canvastree");
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        initTree();
        loop();
    }
}

/**
 * 初始化树的数量
 */
function initTree() {
    branchArray = new BranchArray();
    for (var i = 0; i < treeNum; i++) {
        branchArray.add(new Branch(w / 2, h));
    }
}

/**
 * 树干
 * @param x
 * @param y
 * @constructor
 */
function Branch(x, y) {
    this.x = x;
    this.y = y;
    this.radius = initRadius;
    this.angle = Math.PI / 2; // 树枝的初始角度
    this.speed = 2.03; // 数生长的速度
    this.generation = 1;
}

/**
 * 生长
 */
Branch.prototype.grow = function() {
    this.draw();
    this.update();
}

Branch.prototype.draw = function() {
    ctx.fillStyle = '#55220F';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
}

/**
 * 更改数的高度以及扭曲度
 */
Branch.prototype.update = function() {
    // 计算树干每次的扭曲角度，因为树一般不是笔直生长的，都会有不规则的扭曲
    this.angle += random(-0.2 * this.generation / 2, 0.2 * this.generation / 2);
    // console.log('this.generation',this.generation)
    if (this.generation > 1) {
        this.angle += random(-0.5 * this.generation / 2, 0.5 * this.generation / 2);
    }
    var vx = this.speed * Math.cos(this.angle);
    // 因为初始角度设置为Math.PI , 所以vy要取负数
    var vy = -this.speed * Math.sin(this.angle);
    if (this.radius < 0.99 || this.generation > maxGeneration) {
        branchArray.remove(this);
    }
    this.x += vx;
    this.y += vy;
    // this.radius *= 0.98;
    this.radius *= (0.99 - this.generation / 250);
    if (this.radius >= 0.9) {
        // 计算当前是第几代分支
        var g = (maxGeneration - 1) * initRadius / (initRadius - 1) / this.radius + (initRadius - maxGeneration) / (initRadius - 1);
        if (g > this.generation + 1) {
            this.generation = Math.floor(g);
            // 随机创建分支
            for (var i = 0; i < random(1, 2); i++) {
                this.clone(this);
            }
        }
        if (g > 1.2) {
            if (g < 1.5) {
                if (Math.random() < 0.02) {
                    leaves.push(new Leaf(this.x, this.y));
                }
            } else if (g < 2) {
                if (Math.random() < 0.1) {
                    leaves.push(new Leaf(this.x, this.y));
                }
            } else if (g < 3) {
                if (Math.random() < 0.18) {
                    leaves.push(new Leaf(this.x, this.y));
                }
                if (Math.random() < 0.02) {
                    flowers.push(new Flower(this.x, this.y));
                }
            } else {
                if (Math.random() < 0.3) {
                    leaves.push(new Leaf(this.x, this.y));
                }
                if (Math.random() < 0.05) {
                    flowers.push(new Flower(this.x, this.y));
                }
            }
        }
    }
}

/**
 * 创建分支
 * @param b
 */
Branch.prototype.clone = function(b) {
    var obj = new Branch(b.x, b.y);
    obj.angle = b.angle;
    obj.radius = b.radius;
    obj.speed = b.speed;
    obj.generation = b.generation;
    branchArray.add(obj);
}

function BranchArray() {
    this.branchs = [];
}

/**
 * 添加树干到集合中
 * @param b
 */
BranchArray.prototype.add = function(b) {
    this.branchs.push(b);
}
/**
 * 从集合中
 移除树干
 * @param b
 */
BranchArray.prototype.remove = function(b) {
    if (this.branchs.length > 0) {
        var index = this.branchs.findIndex(function(item) {
            return b === item;
        })
        if (index != -1) {
            this.branchs.splice(index, 1);
        }
    }
}
/**
 * 叶
 * @param x
 * @param y
 * @constructor
 */
function Leaf(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = (Math.random() * 360) * Math.PI / 180; // 叶的旋转方向
    this.size = 2; // 叶的大小
    this.speed = 1.0235; // 叶的生长速度
    this.sizeMax = random(6, 16); // 叶的大小
}

/**
 * 花朵开放（通过改变花的半径实现开放的效果）
 * @param index
 */
Leaf.prototype.update = function(index) {
    if (this.size >= this.sizeMax) {
        leaves.splice(index, 1);
        return;
    }
    this.size *= this.speed;
    if (this.size > this.sizeMax) this.r = this.sizeMax;
}

/**
 * 绘制花朵
 */
Leaf.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(imgObj, 0, 0, this.size, this.size);
    ctx.restore();
    ctx.beginPath();
    ctx.fill();
}

/**
 * 花
 * @param x
 * @param y
 * @constructor
 */
function Flower(x, y) {
    this.x = x;
    this.y = y;
    this.r = 1; // 花瓣的半径
    this.petals = 5; // 花瓣数量
    this.speed = 1.0235; // 花的绽放速度
    this.maxR = random(1, 5); // 花的大小
}

/**
 * 花朵开放（通过改变花的半径实现开放的效果）
 * @param index
 */
Flower.prototype.update = function(index) {
    if (this.r == this.maxR) {
        flowers.splice(index, 1);
        return;
    }
    this.r *= this.speed;
    if (this.r > this.maxR) this.r = this.maxR;
}

/**
 * 绘制花朵
 */
Flower.prototype.draw = function() {
    ctx.fillStyle = "#F3097B";
    for (var i = 1; i <= this.petals; i++) {
        var x0 = this.x + this.r * Math.cos(Math.PI / 180 * (360 / this.petals) * i);
        var y0 = this.y + this.r * Math.sin(Math.PI / 180 * (360 / this.petals) * i);
        ctx.beginPath();
        ctx.arc(x0, y0, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.fillStyle = "#F56BC1";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 循环遍历所有树干和花，并调用更新和draw方法，实现动画效果
 */
function loop() {
    for (var i = 0; i < branchArray.branchs.length; i++) {
        var b = branchArray.branchs[i];
        b.grow();
    }
    var len = leaves.length;
    while (len--) {
        leaves[len].draw();
        leaves[len].update();
    }
    var flowersLen = flowers.length;
    while (flowersLen--) {
        flowers[flowersLen].draw();
        flowers[flowersLen].update();
    }
    MyRequestAnimationFrame(loop);
}
window.onload = initCanvas;