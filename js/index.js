(function () {
    var sw = 20,//一个方块的宽
        sh = 20,//一个方块的高
        tr = 30,//一共有30行
        td = 30;//一共有30列
    var snake = null;//蛇的实例
    var food = null;//食物的实例
    var game = null;//游戏的实例
    var scoreDom = document.getElementsByClassName('score')[0];

    /**
     * 创建小方块的构造函数
     * @param {*} x 横坐标
     * @param {*} y 竖坐标
     * @param {*} classname 类名
     */
    function Square(x, y, classname) {
        this.x = x * sw;
        this.y = y * sh;
        this.class = classname;
        // 方块的父级
        this.parent = document.getElementById('snakeWrap');
        // 方块对应的DOM元素
        this.viewContent = document.createElement('div');
        // 对应类名
        this.viewContent.className = this.class;
    };

    /**
     * 创建方块DOM并添加到页面当中
     */
    Square.prototype.create = function () {
        this.viewContent.style.position = 'absolute';
        this.viewContent.style.width = sw + 'px';
        this.viewContent.style.height = sh + 'px';
        this.viewContent.style.left = this.x + 'px';
        this.viewContent.style.top = this.y + 'px';
        this.parent.appendChild(this.viewContent);
    };

    /**
     * 移除方块
     */
    Square.prototype.remove = function () {
        this.parent.removeChild(this.viewContent);
    };








    /**
     * 创建蛇的构造函数
     */
    function Snake() {
        this.head = null;//存一下蛇头的信息
        this.tail = null;//存一下蛇尾的信息
        this.pos = [];//存储蛇身上的每一个方块的位置，是一个二维数组
        this.directionNum = {//存储蛇前进的方向
            left: {
                x: -1,
                y: 0,
                rotate: 180 //蛇头在不同的方向上进行旋转，不然始终都是向右
            },
            up: {
                x: 0,
                y: -1,
                rotate: -90 //蛇头在不同的方向上进行旋转，不然始终都是向右
            },
            right: {
                x: 1,
                y: 0,
                rotate: 0 //蛇头在不同的方向上进行旋转，不然始终都是向右
            },
            down: {
                x: 0,
                y: 1,
                rotate: 90 //蛇头在不同的方向上进行旋转，不然始终都是向右
            }
        };
    };

    Snake.prototype.init = function () {
        //创建一个蛇头
        var snakeHead = new Square(2, 0, 'snakeHead');
        snakeHead.create();
        this.head = snakeHead//存储蛇头信息
        this.pos.push([2, 0]);//把蛇头的位置存储起来

        // 创建蛇身体1
        var snakeBody1 = new Square(1, 0, 'snakeBody');
        snakeBody1.create();
        this.pos.push([1, 0]);

        // 创建蛇身体2
        var snakeBody2 = new Square(0, 0, 'snakeBody');
        snakeBody2.create();
        this.tail = snakeBody2;//把蛇尾的信息存储起来
        this.pos.push([0, 0]);//把蛇身的位置存储起来

        // 要想蛇整体移动 -> 形成链表关系
        snakeHead.last = null;
        snakeHead.next = snakeBody1;

        snakeBody1.last = snakeHead;
        snakeBody1.next = snakeBody2;

        snakeBody2.last = snakeBody1;
        snakeBody2.next = null;

        // 给蛇添加一条属性，默认让蛇向右前进
        this.direction = this.directionNum.right;
    };

    /**
     * 这个方法用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情
     */
    Snake.prototype.getNextPos = function () {
        //蛇头要走的下一个坐标
        var nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]
        //下一个点是自己：代表撞到了自己，游戏结束
        var selfCollied = false;
        this.pos.forEach(function (ele) {
            // 如果数组中的两数据都相等，说明下一个点在蛇身体里面能够找到，代表撞到了自己
            if (ele[0] == nextPos[0] && ele[1] == nextPos[1]) {
                selfCollied = true;
            }
        });
        if (selfCollied) {
            this.strategies.die.call(this);
            return;
        }
        //下一个点是围墙：游戏结束
        if ((nextPos[0] < 0 || nextPos[1] < 0) || (nextPos[0] > td - 1 || nextPos[1] > tr - 1)) {
            this.strategies.die.call(this);
            return;
        }
        //下一个点是食物：吃
        if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
            this.strategies.eat.call(this);
            return;
        }
        //下一个点什么都不是：走
        this.strategies.move.call(this);
    };

    /**
     * 碰撞之后要做的事情
     */
    Snake.prototype.strategies = {
        move: function (format) {//这个参数用于决定要不要删除最后一节方块（蛇尾）
            //创建一个新的身体（在旧蛇头的位置），并且更新链表的关系
            var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
            newBody.next = this.head.next;
            this.head.next.last = newBody;
            newBody.last = null;
            this.head.remove();
            newBody.create();

            //创建一个新的蛇头（蛇头下一个要走的点），并且更新链表的关系
            var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
            newHead.next = newBody;
            newHead.last = null;
            newBody.last = newHead;
            newHead.viewContent.style.transform = `rotate(${this.direction.rotate}deg)`;
            newHead.create();

            //蛇身上的每一个方块的坐标也要更新
            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
            this.head = newHead;

            //如果format为false,表示需要删除(蛇尾)
            if (!format) {
                this.tail.remove();
                this.tail = this.tail.last;
                this.pos.pop();
            }
        },
        eat: function () {
            this.strategies.move.call(this, true);
            createFood();
            game.score++;
            scoreDom.innerHTML = `当前得分：${game.score}`;
        },
        die: function () {
            game.over();
        }
    };
    snake = new Snake();

    /**
     * 创建食物
     */
    function createFood() {
        // 食物小方块的随机坐标
        var x = null, y = null;
        // 循环跳出的条件,true表示食物的坐标在蛇身上 -> 循环，false表示食物的坐标不在蛇身上 -> 不循环
        var include = true;
        while (include) {
            x = Math.round(Math.random() * (td - 1));
            y = Math.round(Math.random() * (tr - 1));
            snake.pos.forEach(function (ele) {
                // 这个条件成立说明在随机出来的这个坐标，在蛇身上没有找到
                if (ele[0] != x && ele[1] != y) {
                    include = false;
                }
            })
        };
        // 生成食物
        food = new Square(x, y, 'food');
        // 存储一下生成食物的坐标，用于跟蛇头要走的一一个点做对比（看有没有碰上）
        food.pos = [x, y];
        var foodDom = document.querySelector('.food');
        if(foodDom) {
            foodDom.style.left = x * sw + 'px';
            foodDom.style.top = y * sh + 'px';
        } else {
            food.create();
        }
    };










    /**
     * 控制游戏:构造函数
     */
    function Game() {
        this.timer = null;
        this.score = 0;
    };

    /**
     * 游戏初始化
     */
    Game.prototype.init = function () {
        snake.init();
        createFood();
        this.start();
        // 绑定键盘事件
        document.onkeydown = function (e) {
            if (e.which == 37 && snake.direction != snake.directionNum.right) {
                snake.direction = snake.directionNum.left;
            } else if (e.which == 38 && snake.direction != snake.directionNum.down) {
                snake.direction = snake.directionNum.up;
            } else if (e.which == 39 && snake.direction != snake.directionNum.left) {
                snake.direction = snake.directionNum.right;
            } else if (e.which == 40 && snake.direction != snake.directionNum.up) {
                snake.direction = snake.directionNum.down;
            }
        }
    };

    /**
     * 开始游戏
     */
    Game.prototype.start = function () {
        this.timer = setInterval(function () {
            snake.getNextPos();
        }, 200);
    };

    /**
     * 暂停游戏
     */
     Game.prototype.pause = function () {
        clearInterval(this.timer);
     };

    /**
     * 结束游戏
     */
    Game.prototype.over = function () {
        clearInterval(this.timer);
        alert(`累计得分为：${this.score}`);
        // 游戏回到最初始时的状态
        var snakeWrap = document.getElementById('snakeWrap');
        snakeWrap.innerHTML = '';
        snake = new Snake();
        game = new Game();

        var startBtnWrap = document.querySelector('.startBtn');
        startBtnWrap.style.display = 'block';
    };
    game = new Game();

    // 点击开始
    var startBtn = document.querySelector('.startBtn button');
    startBtn.onclick = function () {
        startBtn.parentNode.style.display = 'none';
        game.init();
    };
    
    // 点击结束
    var snakeWrap = document.getElementById('snakeWrap');
    var pauseBtn = document.querySelector('.pauseBtn button');
    snakeWrap.onclick = function () {
        game.pause();
        pauseBtn.parentNode.style.display = 'block';
    };
    pauseBtn.onclick = function () {
        game.start();
        pauseBtn.parentNode.style.display = 'none';
    };

}());