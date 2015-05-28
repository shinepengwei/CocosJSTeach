/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var HIGH_PLAYER = 0;
var LOW_PLAYER = 1;
var STATUS_BAR_HEIGHT = 20.0;
var SPRITE_TAG = 0;
var SPRITE_CLASS =[]
SPRITE_CLASS[0] =[
    res.CloseNormal_png1,
    res.CloseNormal_png2,
    res.CloseNormal_png3,
    res.CloseNormal_png4
    ]
SPRITE_CLASS[1] =[
    res.CloseNormal_png5,
    res.CloseNormal_png6,
    res.CloseNormal_png7,
    ]

var TouchesTestScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PongLayer();
        this.addChild(layer);
    }
});


var PongLayer = cc.Layer.extend({
    _paddles:[],
    _winSize:null,
    _bgSprite:null,

    ctor:function () {
        this._super();
        this._winSize = cc.director.getWinSize();
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: this._winSize.width / 2,
            y: this._winSize.height / 2,
            scale: 0.5,
            rotation: 180
        });
        this.addChild(this.sprite, 0);

        this._paddles = [];
        var index = 0
        for (var i =0; i <SPRITE_CLASS.length; i++) {
            for (var j =0; j <SPRITE_CLASS[i].length; j++) {
                index ++;
                cc.log(i+" "+j+" "+SPRITE_CLASS[i][j])
                var paddleTexture = cc.textureCache.addImage(SPRITE_CLASS[i][j])
                var paddle = Paddle.paddleWithTexture(paddleTexture);
                paddle.x = 20 + 20 * index;
                paddle.y = 15 ;
                paddle._classId = i;
                this._paddles.push(paddle);
            };
            
        };


        // var paddleTexture = cc.textureCache.addImage(res.CloseNormal_png);

        

        // var paddle = Paddle.paddleWithTexture(paddleTexture);
        // paddle.x = this._winSize.width / 2;
        // paddle.y = 15;
        // this._paddles.push(paddle);

        // paddle = Paddle.paddleWithTexture(paddleTexture);
        // paddle.x = this._winSize.width / 2;
        // paddle.y = this._winSize.height - STATUS_BAR_HEIGHT - 15;
        // this._paddles.push(paddle);

        // paddle = Paddle.paddleWithTexture(paddleTexture);
        // paddle.x = this._winSize.width / 2;
        // paddle.y = 100;
        // this._paddles.push(paddle);

        // paddle = Paddle.paddleWithTexture(paddleTexture);
        // paddle.x = this._winSize.width / 2;
        // paddle.y = this._winSize.height - STATUS_BAR_HEIGHT - 100;
        // this._paddles.push(paddle);

        for (var i = 0; i < this._paddles.length; i++) {
            if (!this._paddles[i])
                break;

            this.addChild(this._paddles[i]);
        }

        this.schedule(this.update);
    },
    doTest:function(){
        for (var i = 0; i < this._paddles.length; i++) {
            if(!this._paddles[i].isSuccess()){
            	cc.log(i+",false")
                return false;
            }
        }
        cc.log(i+",true")
        return true;
        
    },
    update:function (delta) {
    	if(this.doTest()){
            cc.log("isSuccess");
        }
    	else{
    		cc.log("not");
    	}
    }
});
