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
 TODO
 1.美术资源
 2.胜利提示
 3.延迟判定（胜利提示以及重置时stop move）
 4.胜利
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

SPRITE_WIDTH = 80;

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
        var winWidth = this._winSize.width;
        var winHeight = this._winSize.height;
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: this._winSize.width / 2,
            y: this._winSize.height / 2,
            scale: 1,
            rotation: 180
        });
        this.addChild(this.sprite, 0);
        this._targetRect = []
        var left_x =50;
        var left_y =  this._winSize.height/2-130;
        this._targetRect[0] = cc.rect(left_x, left_y,this._winSize.width/2-10 -left_x, this._winSize.height-100 -(left_y));
        var right_x = this._winSize.width/2+10;
        var right_y = left_y;
        this._targetRect[1] = cc.rect(right_x, right_y,this._winSize.width-50-right_x, this._winSize.height-100 - right_y);
        this._count = []
        this._count[0] = 0;
        this._count[1] = 0;
        this._paddles = [];
        var index = 0
        for (var i =0; i <SPRITE_CLASS.length; i++) {
            for (var j =0; j <SPRITE_CLASS[i].length; j++) {
                cc.log(i+" "+j+" "+SPRITE_CLASS[i][j])
                var paddleTexture = cc.textureCache.addImage(SPRITE_CLASS[i][j])
                var paddle = Paddle.paddleWithTexture(paddleTexture);
                paddle.attr({scale:SPRITE_WIDTH/240});
                paddle.x =  50+100 * index;
                paddle.y = 15 ;
                paddle._classId = i;
                this._paddles.push(paddle);
                this.addChild(paddle);
                index ++;

            };
        };
        this.schedule(this.update);
        
        //rect
        var title=new cc.LabelTTF("定价策略的灵活运用","Thonburi",50);
        title.setPosition(this._winSize.width/2, this._winSize.height - 20);
        this.addChild(title);
        var draw = new cc.DrawNode();
        this.addChild(draw, 10);
        draw.drawRect(cc.p(this._targetRect[0].x, this._targetRect[0].y), cc.p(this._targetRect[0].x + this._targetRect[0].width, this._targetRect[0].y + this._targetRect[0].height), null, 2, cc.color(255, 0, 255, 255));
        draw.drawRect(cc.p(this._targetRect[1].x, this._targetRect[1].y), cc.p(this._targetRect[1].x + this._targetRect[1].width, this._targetRect[1].y + this._targetRect[1].height), null, 2, cc.color(255, 0, 255, 255));
        var l = new cc.LabelTTF("撇脂策略", "Thonburi", 30);
        l.setPosition(this._targetRect[0].x+this._targetRect[0].width/2, this._targetRect[0].y+this._targetRect[0].height+20);
        this.addChild(l);
        var r = new cc.LabelTTF("渗透策略", "Thonburi", 30);
        r.setPosition(this._targetRect[1].x+this._targetRect[1].width/2, this._targetRect[1].y+this._targetRect[1].height+20);
        this.addChild(r);
        //buttong
        var button = new ccui.Button();
        button.setTouchEnabled(true);
        button.loadTextures(res.B1_PNG, res.B2_PNG, "");
        button.setTitleText("重置");
        button.setPosition(cc.p(50,50));
        button.addTouchEventListener(this.touchEvent,this);
        this.addChild(button,20);

        var button1 = new ccui.Button();
        button1.setTouchEnabled(true);
        button1.loadTextures(res.B1_PNG, res.B2_PNG, "");
        button1.setTitleText("答案");
        button1.setPosition(cc.p(50,100));
        button1.addTouchEventListener(this.eventSuccess,this);
        this.addChild(button1,20);
    },
    initPosition:function(){
    	this._count[0] = 0;
    	this._count[1] = 0;
    	for (var i = 0; i < this._paddles.length; i++) {
    		var paddle = this._paddles[i]
    		paddle.x =  50+100 * i;
    		paddle.y = 15 ;
    		paddle.setTouchState(true);
    	}
    },
    //计算最终放置的位置
    getTarPosition:function(classId,index){
        var row = Math.floor(index/3);
        var column = index%3;
        var y = this._targetRect[classId].y+this._targetRect[classId].height - (60 + row*(SPRITE_WIDTH+20));
        var x = this._targetRect[classId].x + 20 + SPRITE_WIDTH/2+ column*(SPRITE_WIDTH + 20);
    	return cc.p(x,y)
    },
    eventSuccess: function (sender, type) {
    	if (type == ccui.Widget.TOUCH_ENDED) {
            this._count[0] = 0;
            this._count[1] = 0;
    		for (var i = 0; i < this._paddles.length; i++) {
                var classId = this._paddles[i]._classId;
                this._paddles[i].runAction(cc.moveTo(1, this.getTarPosition(classId,this._count[classId])));
                this._paddles[i].setTouchState(false);
                this._count[classId]++;
            }
    	}
    },
    touchEvent: function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            this.initPosition();
        }
    },
    doTest:function(){
        for (var i = 0; i < this._paddles.length; i++) {
            if(!this._paddles[i].isSuccess()){
            	//cc.log(i+",false")
                return false;
            }
        }
        //cc.log(i+",true")
        return true;
        
    },
    updatePosition:function(){
        for (var i = 0; i < this._paddles.length; i++) {
        	if(this._paddles[i].movedState == true){
                //刚被移动过
                if (cc.rectContainsPoint(this._targetRect[0], cc.p(this._paddles[i].x,this._paddles[i].y))){
                	this._paddles[i].runAction(cc.moveTo(1, this.getTarPosition(0,this._count[0])));
                	this._paddles[i].setTouchState(false);
                	this._count[0]++;
                }
                else if (cc.rectContainsPoint(this._targetRect[1], cc.p(this._paddles[i].x,this._paddles[i].y))){
                	this._paddles[i].runAction(cc.moveTo(1, this.getTarPosition(1,this._count[1])));
                	this._paddles[i].setTouchState(false);
                	this._count[1]++;
                }
                this._paddles[i].movedState = false;
            }
        }
    },
    update:function (delta) {
    	this.updatePosition();
    	if(this.doTest()){
            cc.log("isSuccess");
        }
    }
});
