//app.js

var size;

var mylabel;
//背景スクロールで追加した部分
var gameLayer;
var background;
var scrollSpeed = 1;
//宇宙船で追加した部分　重力
var ship;
var gameGravity = -0.05;
//宇宙船を操作するで追加した部分 エンジンの推進力
var gameThrust = 0.1;
//パーティクル
var emitter;
var　 audioEngine;

var gameScene = cc.Scene.extend({

  onEnter: function() {
    this._super();

    gameLayer = new game();
    gameLayer.init();
    this.addChild(gameLayer);
    //音楽再生エンジン
    audioEngine = cc.audioEngine;
    //bgm再生
    if (!audioEngine.isMusicPlaying()) {
      //audioEngine.playMusic("res/bgm_main.mp3", true);
      audioEngine.playMusic(res.bgm_main, true);
    }
  },

});


var game = cc.Layer.extend({
  init: function() {
    this._super();
    size = cc.director.getWinSize();
    //BGMと効果音のエンジンを追加

    //宇宙船を操作するで追加した部分
    cc.eventManager.addListener({
      event: cc.EventListener.MOUSE,
      onMouseDown: function(event) {
        ship.engineOn = true;
      },
      onMouseUp: function(event) {
        ship.engineOn = false;
      }
    }, this)

    //スクロールする背景スプライトをインスタンス　スクロール速度:scrollSpeed
    background = new ScrollingBG();
    this.addChild(background);

    ship = new Ship();
    this.addChild(ship);

    //scheduleUpdate関数は、描画の都度、update関数を呼び出す
    this.scheduleUpdate();
    //小惑星の生成で追加
    this.schedule(this.addAsteroid, 0.5);
    //ここからパーティクルの設定
    emitter = cc.ParticleSun.create();
    this.addChild(emitter, 1);
    var myTexture = cc.textureCache.addImage(res.particle_png);
    emitter.setTexture(myTexture);
    emitter.setStartSize(2);
    emitter.setEndSize(4);

  },
  update: function(dt) {
    //backgroundのscrollメソッドを呼び出す
    background.scroll();
    ship.updateY();
  },
  //小惑星の生成で追加
  addAsteroid: function(event) {
    var asteroid = new Asteroid();
    this.addChild(asteroid);
  },
  removeAsteroid: function(asteroid) {
    this.removeChild(asteroid);
  },
  //BGMと効果音の関数を追加
  /*
  playSe: function() {
    this.audioEngine.playEffect(res.se_surprize);
  },
  playBgm: function() {
    if (!this.audioEngine.isMusicPlaying()) {
      this.audioEngine.playMusic(res.bgm_main, true);
    }
  },
  stopBgm: function() {
    if (this.audioEngine.isMusicPlaying()) {
      this.audioEngine.stopMusic();
    }
  },
  bgmUp: function() {
    this.audioEngine.setMusicVolume(this.audioEngine.getMusicVolume() + 0.1);
  },
  bgmDown: function() {
    this.audioEngine.setMusicVolume(this.audioEngine.getMusicVolume() - 0.1);
  },
  seUp: function() {
    this.audioEngine.setEffectsVolume(this.audioEngine.getEffectsVolume() + 0.1);
  },
  seDown: function() {
    this.audioEngine.setEffectsVolume(this.audioEngine.getEffectsVolume() - 0.1);
  }*/

});

//スクロール移動する背景クラス
var ScrollingBG = cc.Sprite.extend({
  //ctorはコンストラクタ　クラスがインスタンスされたときに必ず実行される
  ctor: function() {
    this._super();
    this.initWithFile(res.background_png);
  },
  //onEnterメソッドはスプライト描画の際に必ず呼ばれる
  onEnter: function() {
    //背景画像の描画開始位置 横960の画像の中心が、画面の端に設置される
    this.setPosition(size.width, size.height / 2);
    //  this.setPosition(480,160);
  },
  scroll: function() {
    //座標を更新する
    this.setPosition(this.getPosition().x - scrollSpeed, this.getPosition().y);
    //画面の端に到達したら反対側の座標にする
    if (this.getPosition().x < 0) {
      this.setPosition(this.getPosition().x + 480, this.getPosition().y);
    }
  }
});

//重力（仮）で落下する　宇宙船　
var Ship = cc.Sprite.extend({
  ctor: function() {
    this._super();
    this.initWithFile(res.ship_png);
    this.ySpeed = 0; //宇宙船の垂直速度
    //宇宙船を操作するで追加した部分
    this.engineOn = false; //カスタム属性追加　宇宙船のエンジンのON OFF
    this.invulnerability = 0; //無敵モード時間　初期値0
  },
  onEnter: function() {
    this.setPosition(60, 160);
  },
  updateY: function() {
    //宇宙船を操作するで追加した部分
    if (this.engineOn) {
      this.ySpeed += gameThrust;
      //ここでパーティクルエフェクトを宇宙船のすぐ後ろに配置している
      emitter.setPosition(this.getPosition().x - 25, this.getPosition().y);
    } else {
      //エンジンOffのときは画面外に配置
      emitter.setPosition(this.getPosition().x - 250, this.getPosition().y);
    }

    //無敵モード中の視覚効果
    if (this.invulnerability > 0) {
      this.invulnerability--;
      this.setOpacity(255 - this.getOpacity());
    }


    this.setPosition(this.getPosition().x, this.getPosition().y + this.ySpeed);
    this.ySpeed += gameGravity;

    //宇宙船が画面外にでたら、リスタートさせる
    if (this.getPosition().y < 0 || this.getPosition().y > 320) {
      restartGame();

    }
  }
});
//小惑星クラス
var Asteroid = cc.Sprite.extend({
  ctor: function() {
    this._super();
    this.initWithFile(res.asteroid_png);
  },
  onEnter: function() {
    this._super();
    this.setPosition(600, Math.random() * 320);
    var moveAction = cc.MoveTo.create(2.5, new cc.Point(-100, Math.random() * 320));
    this.runAction(moveAction);
    this.scheduleUpdate();
  },
  update: function(dt) {
    //小惑星との衝突を判定する処理
    var shipBoundingBox = ship.getBoundingBox();
    var asteroidBoundingBox = this.getBoundingBox();
    //rectIntersectsRectは２つの矩形が交わっているかチェックする
    if (cc.rectIntersectsRect(shipBoundingBox, asteroidBoundingBox) && ship.invulnerability == 0) {
      gameLayer.removeAsteroid(this); //小惑星を削除する
      //ボリュームを上げる
      audioEngine.setEffectsVolume(audioEngine.getEffectsVolume() + 0.3);
      //効果音を再生する
    //  audioEngine.playEffect("res/se_bang.mp3");
      audioEngine.playEffect(res.se_bang);
      //bgmの再生をとめる
      if (audioEngine.isMusicPlaying()) {
        audioEngine.stopMusic();
      }
      restartGame();
    }
    //画面の外にでた小惑星を消去する処理
    if (this.getPosition().x < -50) {
      gameLayer.removeAsteroid(this)
    }
  }
});
//宇宙船を元の位置に戻して、宇宙船の変数を初期化する
function restartGame() {
  ship.ySpeed = 0;
  ship.setPosition(ship.getPosition().x, 160);
  ship.invulnerability = 100;
  //bgmリスタート
  if (!audioEngine.isMusicPlaying()) {
    audioEngine.resumeMusic();
  }
}
