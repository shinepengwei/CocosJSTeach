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
    res.CloseNormal_png8,
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
        this._targetRect = [];
        var left_y1 =  this._winSize.height/2-130;
        var left_y2 = this._winSize.height-100
        var left_x1 =50;
        var left_x2 = this._winSize.width/2-80
        var right_x1 = this._winSize.width/2-60;
        var right_x2 = this._winSize.width-190
        this._targetRect[0] = cc.rect(left_x1, left_y1, left_x2-left_x1,  left_y2-(left_y1));
        this._targetRect[1] = cc.rect(right_x1, left_y1,right_x2 - right_x1, left_y2 - left_y1);
        this._count = [];
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
                paddle.y = 45 ;
                paddle.initPos = cc.p(paddle.x,paddle.y)
                paddle._classId = i;
                this._paddles.push(paddle);
                this.addChild(paddle);
                index ++;

            };
        };
        this.schedule(this.update);
        
        //rect
        var title=new cc.LabelTTF("定价策略的灵活运用","Thonburi",50);
        title.setColor(cc.color(37, 162, 234, 255));
        title.setPosition(this._winSize.width/2, this._winSize.height - 30);
        this.addChild(title);
        var draw = new cc.DrawNode();
        this.addChild(draw, 10);
        draw.drawRect(cc.p(this._targetRect[0].x, this._targetRect[0].y), cc.p(this._targetRect[0].x + this._targetRect[0].width, this._targetRect[0].y + this._targetRect[0].height), null, 2, cc.color(37, 162, 234, 255));
        draw.drawRect(cc.p(this._targetRect[1].x, this._targetRect[1].y), cc.p(this._targetRect[1].x + this._targetRect[1].width, this._targetRect[1].y + this._targetRect[1].height), null, 2, cc.color(37, 162, 234, 255));
        var l = new cc.LabelTTF("撇脂策略", "Thonburi", 30);
        l.setColor(cc.color(37, 162, 234, 255));
        l.setPosition(this._targetRect[0].x+this._targetRect[0].width/2, this._targetRect[0].y+this._targetRect[0].height+20);
        this.addChild(l);
        var r = new cc.LabelTTF("渗透策略", "Thonburi", 30);
        r.setColor(cc.color(37, 162, 234, 255));
        r.setPosition(this._targetRect[1].x+this._targetRect[1].width/2, this._targetRect[1].y+this._targetRect[1].height+20);
        this.addChild(r);
        var item1 = new cc.MenuItemImage(res.B2_PNG, res.B2_PNG, this.touchEvent, this);
        var item2 = new cc.MenuItemImage(res.B1_PNG, res.B1_PNG, this.eventSuccess, this);
        item1.setPosition(cc.p(right_x2 + 95,left_y1 + 100));
        item2.setPosition(cc.p(right_x2 + 95,left_y1 + 200));
        var menu = new cc.Menu(item1, item2);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    },
    initGameState:function(){
    	this._count[0] = 0;
    	this._count[1] = 0;
        if (this.stateLabel!= null) this.stateLabel.removeFromParent();
        this.stateLabel = null;
        this.stopAllActions()
    	for (var i = 0; i < this._paddles.length; i++) {
    		var paddle = this._paddles[i]
    		paddle.x = paddle.initPos.x;
    		paddle.y = paddle.initPos.y ;
    		paddle.setTouchState(true);
            paddle.stopAllActions()
    	}
    },
    //计算最终放置的位置
    getTarPosition:function(classId,index){
        var row = Math.floor(index/3);
        var column = index%3;
        var y = this._targetRect[classId].y+this._targetRect[classId].height - (60 + row*(SPRITE_WIDTH+10));
        var x = this._targetRect[classId].x + 5 + SPRITE_WIDTH/2+ column*(SPRITE_WIDTH + 10);
    	return cc.p(x,y)
    },
    doSuccessComplete:function  () {
        this._doSuccessComplete = true
    },
    eventSuccess: function (sender) {
        this._count[0] = 0;
        this._count[1] = 0;
        if (this.stateLabel!= null) this.stateLabel.removeFromParent();
        this.stateLabel = null;
		for (var i = 0; i < this._paddles.length; i++) {
            var classId = this._paddles[i]._classId;
            this._paddles[i].stopAllActions()
            this._paddles[i].runAction(cc.moveTo(1, this.getTarPosition(classId,this._count[classId])));
            this._paddles[i].setTouchState(false);
            this._count[classId]++;
            this._doSuccessComplete = false
            this.runAction(cc.sequence(
               cc.delayTime(1),
               cc.callFunc(this.doSuccessComplete, this))
            );
        }
    },
    touchEvent: function (sender) {
            this.initGameState();
    },
    doTestSuccess:function(){
        for (var i = 0; i < this._paddles.length; i++) {
            if(!this._paddles[i].isSuccess(this._targetRect)){
                return false;
            }
        }
        return true;
    },
    doTestFailed:function(){
        for (var i = 0; i < this._paddles.length; i++) {
            if(this._paddles[i].getTouchState()){
                return false;
            }
        }
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
                }else{
                    this._paddles[i].runAction(cc.moveTo(0.4, this._paddles[i].initPos));
                }
                this._paddles[i].movedState = false;
            }
        }
    },
    update:function (delta) {
    	this.updatePosition();
        if (this.stateLabel !=null) return false;
        if (this._doSuccessComplete != null && this._doSuccessComplete == false) return false;
    	if(this.doTestSuccess()){
            var r = new cc.LabelTTF("游戏成功", "Arial", 30);
            r.setPosition(this._targetRect[1].x+this._targetRect[1].width + 90, this._targetRect[1].y);
            this.addChild(r);
            r.setColor(cc.color(37, 162, 234, 255));
            this.stateLabel = r
        }else{
            if (this.doTestFailed()){
                var r = new cc.LabelTTF("失败请重置", "Arial", 30);
                r.setPosition(this._targetRect[1].x+this._targetRect[1].width + 90, this._targetRect[1].y);
                this.addChild(r);
                r.setColor(cc.color(37, 162, 234, 255));
                this.stateLabel = r
            }
            
        }
    }
});
