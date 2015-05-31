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
var PADDLE_STATE_GRABBED = 0;
var PADDLE_STATE_UNGRABBED = 1;

var Paddle = cc.Sprite.extend({
    _state:PADDLE_STATE_UNGRABBED,
    _rect:null,
    _classId:null,
    movedState:null,
    _touchState :true,//是否可以拖拽
    initPos:null,
    ctor: function(){
        this._super();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
    },

    rect:function () {
        return cc.rect(-this._rect.width / 2, -this._rect.height / 2, this._rect.width, this._rect.height);
    },
    initWithTexture:function (aTexture) {
        if (this._super(aTexture)) {
            this._state = PADDLE_STATE_UNGRABBED;
        }
        if (aTexture instanceof cc.Texture2D) {
            this._rect = cc.rect(0, 0, 80, 80);
        } else if ((aTexture instanceof HTMLImageElement) || (aTexture instanceof HTMLCanvasElement)) {
            this._rect = cc.rect(0, 0, 80, 80);
        }
        _classId = 1;
        this.movedState = false;
        return true;
    },
    isSuccess:function(_targetRect){
        var width = cc.director.getWinSize().width;
        if(this._touchState ) return false;
        if (cc.rectContainsPoint(_targetRect[this._classId],cc.p(this.x,this.y))){
            return true
        }
        return false
    },
    setTouchState:function(st){
    	this._touchState = st;
    },
    getTouchState:function () {
        return this._touchState
    },
    
    containsTouchLocation:function (touch) {
        var getPoint = touch.getLocation();
        var myRect = this.rect();

        myRect.x += this.x;
        myRect.y += this.y;
        return cc.rectContainsPoint(myRect, getPoint);//this.convertTouchToNodeSpaceAR(touch));
    },

    onTouchBegan:function (touch, event) {
    	var target = event.getCurrentTarget();
    	if (!target._touchState) return false;
        
        if (target._state != PADDLE_STATE_UNGRABBED) return false;
        if (!target.containsTouchLocation(touch)) return false;

        target._state = PADDLE_STATE_GRABBED;
        return true;
    },
    onTouchMoved:function (touch, event) {
        var target = event.getCurrentTarget();
        // If it weren't for the TouchDispatcher, you would need to keep a reference
        // to the touch from touchBegan and check that the current touch is the same
        // as that one.
        // Actually, it would be even more complicated since in the Cocos dispatcher
        // you get Array instead of 1 cc.Touch, so you'd need to loop through the set
        // in each touchXXX method.
        cc.assert(target._state == PADDLE_STATE_GRABBED, "Paddle - Unexpected state!");

        var touchPoint = touch.getLocation();
        //touchPoint = cc.director.convertToGL( touchPoint );

        target.x = touchPoint.x;
        target.y = touchPoint.y;
    },
    onTouchEnded:function (touch, event) {
        var target = event.getCurrentTarget();
        cc.assert(target._state == PADDLE_STATE_GRABBED, "Paddle - Unexpected state!");
        target._state = PADDLE_STATE_UNGRABBED;
        target.movedState = true

    },
    touchDelegateRetain:function () {
    },
    touchDelegateRelease:function () {
    }
});
Paddle.paddleWithTexture = function (aTexture) {
    var paddle = new Paddle();
    paddle.initWithTexture(aTexture);

    return paddle;
};
