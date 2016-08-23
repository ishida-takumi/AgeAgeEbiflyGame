//myScene.js
var OverLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        var size = cc.director.getWinSize();
        /*
                var sprite = cc.Sprite.create(res.HelloWorld_png);
                sprite.setPosition(size.width / 2, size.height / 2);
                sprite.setScale(0.8);
                this.addChild(sprite, 0);
        */
        var gameover_png = cc.Sprite.create(res.gameover_png);
         gameover_png.setPosition(size.width / 2, size.height / 2);
        this.addChild(gameover_png);
        //add code

        var shrimp01 = cc.Sprite.create(res.shrimp01_png);　
        shrimp01.setPosition(size.width * 1 / 6, size.height*1 / 6);　
        this.addChild(shrimp01);

        // タップイベントリスナーを登録する
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);

        return true;
    },

    onTouchBegan: function(touch, event) {
        return true;
    },
    onTouchMoved: function(touch, event) {},
    onTouchEnded: function(touch, event) {
        // 次のシーンに切り替える
        cc.director.runScene(new TitleScene());
    },
});

var OverScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var overlayer = new OverLayer();
        this.addChild(overlayer);
    }
});
