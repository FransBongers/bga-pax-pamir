var Modal = (function () {
    function Modal(id, config) {
        var _this = this;
        this.open = false;
        this.container = 'ebd-body';
        this.class = 'custom_popin';
        this.autoShow = false;
        this.modalTpl = "\n    <div id='popin_${id}_container' class=\"${class}_container\">\n      <div id='popin_${id}_underlay' class=\"${class}_underlay\"></div>\n      <div id='popin_${id}_wrapper' class=\"${class}_wrapper\">\n        <div id=\"popin_${id}\" class=\"${class}\">\n          ${titleTpl}\n          ${closeIconTpl}\n          ${helpIconTpl}\n          ${contentsTpl}\n        </div>\n      </div>\n    </div>\n  ";
        this.closeIcon = 'fa-times-circle';
        this.closeIconTpl = '<a id="popin_${id}_close" class="${class}_closeicon"><i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i></a>';
        this.closeAction = 'destroy';
        this.closeWhenClickOnUnderlay = true;
        this.helpIcon = null;
        this.helpLink = '#';
        this.helpIconTpl = '<a href="${helpLink}" target="_blank" id="popin_${id}_help" class="${class}_helpicon"><i class="fa ${helpIcon} fa-2x" aria-hidden="true"></i></a>';
        this.title = null;
        this.titleTpl = '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>';
        this.contentsTpl = "\n      <div id=\"popin_${id}_contents\" class=\"${class}_contents\">\n        ${contents}\n      </div>";
        this.contents = '';
        this.verticalAlign = 'center';
        this.animationDuration = 500;
        this.fadeIn = true;
        this.fadeOut = true;
        this.openAnimation = false;
        this.openAnimationTarget = null;
        this.openAnimationDelta = 200;
        this.onShow = null;
        this.onHide = null;
        this.statusElt = null;
        this.scale = 1;
        this.breakpoint = null;
        if (id === undefined) {
            console.error('You need an ID to create a modal');
            throw 'You need an ID to create a modal';
        }
        this.id = id;
        Object.entries(config).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value !== undefined) {
                _this[key] = value;
            }
        });
        this.create();
        if (this.autoShow)
            this.show();
    }
    Modal.prototype.isDisplayed = function () {
        return this.open;
    };
    Modal.prototype.isCreated = function () {
        return this.id != null;
    };
    Modal.prototype.create = function () {
        var _this = this;
        dojo.destroy('popin_' + this.id + '_container');
        var titleTpl = this.title == null ? '' : dojo.string.substitute(this.titleTpl, this);
        var closeIconTpl = this.closeIcon == null ? '' : dojo.string.substitute(this.closeIconTpl, this);
        var helpIconTpl = this.helpIcon == null ? '' : dojo.string.substitute(this.helpIconTpl, this);
        var contentsTpl = dojo.string.substitute(this.contentsTpl, this);
        var modalTpl = dojo.string.substitute(this.modalTpl, {
            id: this.id,
            class: this.class,
            titleTpl: titleTpl,
            closeIconTpl: closeIconTpl,
            helpIconTpl: helpIconTpl,
            contentsTpl: contentsTpl,
        });
        dojo.place(modalTpl, this.container);
        dojo.style('popin_' + this.id + '_container', {
            display: 'none',
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
        });
        dojo.style('popin_' + this.id + '_underlay', {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            zIndex: 949,
            opacity: 0,
            backgroundColor: 'white',
        });
        dojo.style('popin_' + this.id + '_wrapper', {
            position: 'fixed',
            left: '0px',
            top: '0px',
            width: 'min(100%,100vw)',
            height: '100vh',
            zIndex: 950,
            opacity: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: this.verticalAlign,
            paddingTop: this.verticalAlign == 'center' ? 0 : '125px',
            transformOrigin: 'top left',
        });
        this.adjustSize();
        this.resizeListener = dojo.connect(window, 'resize', function () { return _this.adjustSize(); });
        if (this.closeIcon != null && $('popin_' + this.id + '_close')) {
            dojo.connect($('popin_' + this.id + '_close'), 'click', function () { return _this[_this.closeAction](); });
        }
        if (this.closeWhenClickOnUnderlay) {
            dojo.connect($('popin_' + this.id + '_underlay'), 'click', function () { return _this[_this.closeAction](); });
            dojo.connect($('popin_' + this.id + '_wrapper'), 'click', function () { return _this[_this.closeAction](); });
            dojo.connect($('popin_' + this.id), 'click', function (evt) { return evt.stopPropagation(); });
        }
    };
    Modal.prototype.updateContent = function (newContent) {
        var contentContainerId = "popin_".concat(this.id, "_contents");
        dojo.empty(contentContainerId);
        dojo.place(newContent, contentContainerId);
    };
    Modal.prototype.adjustSize = function () {
        var bdy = dojo.position(this.container);
        dojo.style('popin_' + this.id + '_container', {
            width: bdy.w + 'px',
            height: bdy.h + 'px',
        });
        if (this.breakpoint != null) {
            var newModalWidth = bdy.w * this.scale;
            var modalScale = newModalWidth / this.breakpoint;
            if (modalScale > 1)
                modalScale = 1;
            dojo.style('popin_' + this.id, {
                transform: "scale(".concat(modalScale, ")"),
                transformOrigin: this.verticalAlign == 'center' ? 'center center' : 'top center',
            });
        }
    };
    Modal.prototype.getOpeningTargetCenter = function () {
        var startTop, startLeft;
        if (this.openAnimationTarget == null) {
            startLeft = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2;
            startTop = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2;
        }
        else {
            var target = dojo.position(this.openAnimationTarget);
            startLeft = target.x + target.w / 2;
            startTop = target.y + target.h / 2;
        }
        return {
            x: startLeft,
            y: startTop,
        };
    };
    Modal.prototype.fadeInAnimation = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var containerId = 'popin_' + _this.id + '_container';
            if (!$(containerId))
                reject();
            if (_this.runningAnimation)
                _this.runningAnimation.stop();
            var duration = _this.fadeIn ? _this.animationDuration : 0;
            var animations = [];
            animations.push(dojo.fadeIn({
                node: 'popin_' + _this.id + '_wrapper',
                duration: duration,
            }));
            animations.push(dojo.animateProperty({
                node: 'popin_' + _this.id + '_underlay',
                duration: duration,
                properties: { opacity: { start: 0, end: 0.7 } },
            }));
            if (_this.openAnimation) {
                var pos = _this.getOpeningTargetCenter();
                animations.push(dojo.animateProperty({
                    node: 'popin_' + _this.id + '_wrapper',
                    properties: {
                        transform: { start: 'scale(0)', end: 'scale(1)' },
                        top: { start: pos.y, end: 0 },
                        left: { start: pos.x, end: 0 },
                    },
                    duration: _this.animationDuration + _this.openAnimationDelta,
                }));
            }
            _this.runningAnimation = dojo.fx.combine(animations);
            dojo.connect(_this.runningAnimation, 'onEnd', function () { return resolve(); });
            _this.runningAnimation.play();
            setTimeout(function () {
                if ($('popin_' + _this.id + '_container'))
                    dojo.style('popin_' + _this.id + '_container', 'display', 'block');
            }, 10);
        });
    };
    Modal.prototype.show = function () {
        var _this = this;
        if (this.isOpening || this.open)
            return;
        if (this.statusElt !== null) {
            dojo.addClass(this.statusElt, 'opened');
        }
        this.adjustSize();
        this.isOpening = true;
        this.isClosing = false;
        this.fadeInAnimation().then(function () {
            if (!_this.isOpening)
                return;
            _this.isOpening = false;
            _this.open = true;
            if (_this.onShow !== null) {
                _this.onShow();
            }
        });
    };
    Modal.prototype.fadeOutAnimation = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var containerId = 'popin_' + _this.id + '_container';
            if (!$(containerId))
                reject();
            if (_this.runningAnimation)
                _this.runningAnimation.stop();
            var duration = _this.fadeOut ? _this.animationDuration + (_this.openAnimation ? _this.openAnimationDelta : 0) : 0;
            var animations = [];
            animations.push(dojo.fadeOut({
                node: 'popin_' + _this.id + '_wrapper',
                duration: duration,
            }));
            animations.push(dojo.animateProperty({
                node: 'popin_' + _this.id + '_underlay',
                duration: duration,
                properties: { opacity: { start: 0.7, end: 0 } },
            }));
            if (_this.openAnimation) {
                var pos = _this.getOpeningTargetCenter();
                animations.push(dojo.animateProperty({
                    node: 'popin_' + _this.id + '_wrapper',
                    properties: {
                        transform: { start: 'scale(1)', end: 'scale(0)' },
                        top: { start: 0, end: pos.y },
                        left: { start: 0, end: pos.x },
                    },
                    duration: _this.animationDuration,
                }));
            }
            _this.runningAnimation = dojo.fx.combine(animations);
            dojo.connect(_this.runningAnimation, 'onEnd', function () { return resolve(); });
            _this.runningAnimation.play();
        });
    };
    Modal.prototype.hide = function () {
        var _this = this;
        if (this.isClosing)
            return;
        this.isClosing = true;
        this.isOpening = false;
        this.fadeOutAnimation().then(function () {
            if (!_this.isClosing || _this.isOpening)
                return;
            _this.isClosing = false;
            _this.open = false;
            dojo.style('popin_' + _this.id + '_container', 'display', 'none');
            if (_this.onHide !== null) {
                _this.onHide();
            }
            if (_this.statusElt !== null) {
                dojo.removeClass(_this.statusElt, 'opened');
            }
        });
    };
    Modal.prototype.destroy = function () {
        var _this = this;
        if (this.isClosing)
            return;
        this.isOpening = false;
        this.isClosing = true;
        this.fadeOutAnimation().then(function () {
            if (!_this.isClosing || _this.isOpening)
                return;
            _this.isClosing = false;
            _this.open = false;
            _this.kill();
        });
    };
    Modal.prototype.kill = function () {
        if (this.runningAnimation)
            this.runningAnimation.stop();
        var underlayId = 'popin_' + this.id + '_container';
        dojo.destroy(underlayId);
        dojo.disconnect(this.resizeListener);
        this.id = null;
        if (this.statusElt !== null) {
            dojo.removeClass(this.statusElt, 'opened');
        }
    };
    return Modal;
}());
var BgaAnimation = (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
function showScreenCenterAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var elementBR = element.getBoundingClientRect();
        var xCenter = (elementBR.left + elementBR.right) / 2;
        var yCenter = (elementBR.top + elementBR.bottom) / 2;
        var x = xCenter - (window.innerWidth / 2);
        var y = yCenter - (window.innerHeight / 2);
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaShowScreenCenterAnimation = (function (_super) {
    __extends(BgaShowScreenCenterAnimation, _super);
    function BgaShowScreenCenterAnimation(settings) {
        return _super.call(this, showScreenCenterAnimation, settings) || this;
    }
    return BgaShowScreenCenterAnimation;
}(BgaAnimation));
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg) scale(").concat((_e = settings.scale) !== null && _e !== void 0 ? _e : 1, ")");
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        var settings = animation.settings;
        var element = settings.element;
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        var transitionTimingFunction = (_b = settings.transitionTimingFunction) !== null && _b !== void 0 ? _b : 'linear';
        element.style.zIndex = "".concat((_c = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _c !== void 0 ? _c : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_d = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _d !== void 0 ? _d : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms ").concat(transitionTimingFunction);
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = (function () {
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_g = (_e = (_d = animation.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : (_f = this.settings) === null || _f === void 0 ? void 0 : _f.duration) !== null && _g !== void 0 ? _g : 500, scale: (_l = (_j = (_h = animation.settings) === null || _h === void 0 ? void 0 : _h.scale) !== null && _j !== void 0 ? _j : (_k = this.zoomManager) === null || _k === void 0 ? void 0 : _k.zoom) !== null && _l !== void 0 ? _l : undefined });
                        _r = animation;
                        return [4, animation.animationFunction(this, animation)];
                    case 1:
                        _r.result = _s.sent();
                        (_o = (_m = animation.settings).animationEnd) === null || _o === void 0 ? void 0 : _o.call(_m, animation);
                        (_p = settings.element) === null || _p === void 0 ? void 0 : _p.classList.remove((_q = settings.animationClass) !== null && _q !== void 0 ? _q : 'bga-animations_animated');
                        return [3, 3];
                    case 2: return [2, Promise.resolve(animation)];
                    case 3: return [2];
                }
            });
        });
    };
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3, 3];
                        return [4, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2, __spreadArray([result], others, true)];
                    case 3: return [2, Promise.resolve([])];
                }
            });
        });
    };
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2, promise];
            });
        });
    };
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
var CardStock = (function () {
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock');
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    CardStock.prototype.remove = function () {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    };
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        var needsCreation = true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        }
        else if ((_c = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _c === void 0 ? void 0 : _c.contains(card)) {
            var element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        }
        if (needsCreation) {
            var element = this.manager.createCardElement(card, ((_d = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _d !== void 0 ? _d : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) {
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3, 4];
                        if (!cards.length) return [3, 3];
                        return [4, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2, result || others];
                    case 3: return [3, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    CardStock.prototype.removeCard = function (card, settings) {
        var promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);
        return promise;
    };
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    CardStock.prototype.removeCards = function (cards, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = cards.map(function (card) { return _this.removeCard(card, settings); });
                        return [4, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        return [2, results.some(function (result) { return result; })];
                }
            });
        });
    };
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards();
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards();
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
var Deck = (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        _this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        _this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        _this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        var shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            _this.addCard(_this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn("Deck card counter created without a cardNumber");
            }
            _this.createCounter((_h = settings.counter.position) !== null && _h !== void 0 ? _h : 'bottom', (_j = settings.counter.extraClasses) !== null && _j !== void 0 ? _j : 'round', settings.counter.counterId);
            if ((_k = settings.counter) === null || _k === void 0 ? void 0 : _k.hideWhenEmpty) {
                _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
            }
        }
        _this.setCardNumber((_l = settings.cardNumber) !== null && _l !== void 0 ? _l : 0);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = undefined; }
        var promise = topCard === null || cardNumber == 0 ?
            Promise.resolve(false) :
            _super.prototype.addCard.call(this, topCard || this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
        return promise;
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1);
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    Deck.prototype.shuffle = function (settings) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var animatedCardsMax, animatedCards, elements, getFakeCard, uid, i, newCard, newElement, pauseDelayAfterAnimation;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 10;
                        this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
                        if (!this.manager.animationsActive()) {
                            return [2, Promise.resolve(false)];
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3, 4];
                        elements = [this.getCardElement(this.getTopCard())];
                        getFakeCard = function (uid) {
                            var newCard;
                            if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                                newCard = {};
                                settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                            }
                            else {
                                newCard = _this.fakeCardGenerator("".concat(_this.element.id, "-shuffle-").concat(uid));
                            }
                            return newCard;
                        };
                        uid = 0;
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = void 0;
                            do {
                                newCard = getFakeCard(uid++);
                            } while (this.manager.getCardElement(newCard));
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _d.sent();
                        pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                        if (!(pauseDelayAfterAnimation > 0)) return [3, 3];
                        return [4, this.manager.animationManager.play(new BgaPauseAnimation({ duration: pauseDelayAfterAnimation }))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2, true];
                    case 4: return [2, Promise.resolve(false)];
                }
            });
        });
    };
    Deck.prototype.getFakeCard = function () {
        return this.fakeCardGenerator(this.element.id);
    };
    return Deck;
}(CardStock));
var LineStock = (function (_super) {
    __extends(LineStock, _super);
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
var ManualPositionStock = (function (_super) {
    __extends(ManualPositionStock, _super);
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
var VoidStock = (function (_super) {
    __extends(VoidStock, _super);
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function () {
                return _this.removeCard(card);
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var CardManager = (function () {
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    CardManager.prototype.removeStock = function (stock) {
        var index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    };
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return Promise.resolve(false);
        }
        div.id = "deleted".concat(id);
        div.remove();
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
    };
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) {
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            var updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.animationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) {
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) {
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardManager.prototype.getFakeCardGenerator = function () {
        var _this = this;
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (function (deckId) { return ({ id: _this.getId({ id: "".concat(deckId, "-fake-top-card") }) }); });
    };
    return CardManager;
}());
var _this = this;
var moveToAnimation = function (_a) {
    var game = _a.game, element = _a.element, toId = _a.toId, _b = _a.remove, remove = _b === void 0 ? false : _b;
    return __awaiter(_this, void 0, void 0, function () {
        var toElement, fromRect, toRect, top, left, originalPositionStyle;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('move to animation');
                    toElement = document.getElementById(toId);
                    fromRect = element.getBoundingClientRect();
                    toRect = toElement.getBoundingClientRect();
                    top = toRect.top - fromRect.top;
                    left = toRect.left - fromRect.left;
                    originalPositionStyle = element.style.position;
                    element.style.top = "".concat(pxNumber(element.style.top) + top, "px");
                    element.style.left = "".concat(pxNumber(element.style.left) + left, "px");
                    element.style.position = 'relative';
                    return [4, game.animationManager.play(new BgaSlideAnimation({
                            element: element,
                            transitionTimingFunction: 'ease-in-out',
                            fromRect: fromRect,
                        }))];
                case 1:
                    _c.sent();
                    if (remove) {
                        element.remove();
                    }
                    else {
                        element.style.position = originalPositionStyle;
                    }
                    return [2];
            }
        });
    });
};
var attachToNewParentNoDestroy = function (mobileEltId, newParentId, pos, placePosition) {
    var mobile = $(mobileEltId);
    var new_parent = $(newParentId);
    var src = dojo.position(mobile);
    if (placePosition)
        mobile.style.position = placePosition;
    dojo.place(mobile, new_parent, pos);
    mobile.offsetTop;
    var tgt = dojo.position(mobile);
    var box = dojo.marginBox(mobile);
    var cbox = dojo.contentBox(mobile);
    var left = box.l + src.x - tgt.x;
    var top = box.t + src.y - tgt.y;
    mobile.style.position = 'absolute';
    mobile.style.left = left + 'px';
    mobile.style.top = top + 'px';
    box.l += box.w - cbox.w;
    box.t += box.h - cbox.h;
    mobile.offsetTop;
    return box;
};
var isFastMode = function () {
    return false;
};
var slide = function (_a) {
    var game = _a.game, mobileElt = _a.mobileElt, targetElt = _a.targetElt, _b = _a.options, options = _b === void 0 ? {} : _b;
    var config = __assign({ duration: 800, delay: 0, destroy: false, attach: true, changeParent: true, pos: null, className: 'moving', from: null, clearPos: true, beforeBrother: null, to: null, phantom: true, zIndex: null }, options);
    config.phantomStart = config.phantomStart || config.phantom;
    config.phantomEnd = config.phantomEnd || config.phantom;
    mobileElt = $(mobileElt);
    var mobile = mobileElt;
    targetElt = $(targetElt);
    var targetId = targetElt;
    var newParent = config.attach ? targetId : $(mobile).parentNode;
    if (isFastMode() && (config.destroy || config.clearPos)) {
        if (config.destroy)
            dojo.destroy(mobile);
        else
            dojo.place(mobile, targetElt);
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }
    if (config.phantomStart && config.from == null) {
        mobile = dojo.clone(mobileElt);
        dojo.attr(mobile, 'id', mobileElt.id + '_animated');
        dojo.place(mobile, 'game_play_area');
        game.framework().placeOnObject(mobile, mobileElt);
        dojo.addClass(mobileElt, 'phantom');
        config.from = mobileElt;
    }
    if (config.phantomEnd) {
        targetId = dojo.clone(mobileElt);
        dojo.attr(targetId, 'id', mobileElt.id + '_afterSlide');
        dojo.addClass(targetId, 'phantom');
        if (config.beforeBrother != null) {
            dojo.place(targetId, config.beforeBrother, 'before');
        }
        else {
            dojo.place(targetId, targetElt);
        }
    }
    dojo.style(mobile, 'zIndex', config.zIndex || 5000);
    dojo.addClass(mobile, config.className);
    if (config.changeParent)
        changeParent(mobile, 'game_play_area');
    if (config.from != null)
        game.framework().placeOnObject(mobile, config.from);
    return new Promise(function (resolve, reject) {
        var animation = config.pos == null
            ? game.framework().slideToObject(mobile, config.to || targetId, config.duration, config.delay)
            : game.framework().slideToObjectPos(mobile, config.to || targetId, config.pos.x, config.pos.y, config.duration, config.delay);
        dojo.connect(animation, 'onEnd', function () {
            dojo.style(mobile, 'zIndex', null);
            dojo.removeClass(mobile, config.className);
            if (config.phantomStart) {
                dojo.place(mobileElt, mobile, 'replace');
                dojo.removeClass(mobileElt, 'phantom');
                mobile = mobileElt;
            }
            if (config.changeParent) {
                if (config.phantomEnd)
                    dojo.place(mobile, targetId, 'replace');
                else
                    changeParent(mobile, newParent);
            }
            if (config.destroy)
                dojo.destroy(mobile);
            if (config.clearPos && !config.destroy)
                dojo.style(mobile, { top: null, left: null, position: null });
            resolve();
        });
        animation.play();
    });
};
var changeParent = function (mobile, new_parent, relation) {
    if (mobile === null) {
        console.error('attachToNewParent: mobile obj is null');
        return;
    }
    if (new_parent === null) {
        console.error('attachToNewParent: new_parent is null');
        return;
    }
    if (typeof mobile == 'string') {
        mobile = $(mobile);
    }
    if (typeof new_parent == 'string') {
        new_parent = $(new_parent);
    }
    if (typeof relation == 'undefined') {
        relation = 'last';
    }
    var src = dojo.position(mobile);
    dojo.style(mobile, 'position', 'absolute');
    dojo.place(mobile, new_parent, relation);
    var tgt = dojo.position(mobile);
    var box = dojo.marginBox(mobile);
    var cbox = dojo.contentBox(mobile);
    var left = box.l + src.x - tgt.x;
    var top = box.t + src.y - tgt.y;
    positionObjectDirectly(mobile, left, top);
    box.l += box.w - cbox.w;
    box.t += box.h - cbox.h;
    return box;
};
var positionObjectDirectly = function (mobileObj, x, y) {
    dojo.style(mobileObj, 'left');
    dojo.style(mobileObj, {
        left: x + 'px',
        top: y + 'px',
    });
    dojo.style(mobileObj, 'left');
};
var PPCardManager = (function (_super) {
    __extends(PPCardManager, _super);
    function PPCardManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return card.id; },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    PPCardManager.prototype.clearInterface = function () { };
    PPCardManager.prototype.setupDiv = function (card, div) {
        if (card.type === 'courtCard') {
            var actions_1 = card.actions, region = card.region, id_1 = card.id;
            div.classList.add("pp_".concat(region));
            Object.keys(actions_1).forEach(function (action, index) {
                var actionId = action + '_' + id_1;
                dojo.place("<div id=\"".concat(actionId, "\" class=\"pp_card_action\" style=\"left: calc(var(--cardScale) * ").concat(actions_1[action].left, "px); top: calc(var(--cardScale) * ").concat(actions_1[action].top, "px);\"></div>"), id_1);
            });
            var spyZoneId = 'spies_' + card.id;
            dojo.place("<div id=\"".concat(spyZoneId, "\" class=\"pp_spy_zone\"></div>"), card.id);
            if (!this.game.spies[card.id]) {
                this.game.spies[card.id] = new LineStock(this.game.cylinderManager, document.getElementById(spyZoneId), {
                    center: false,
                    gap: '0px',
                });
            }
        }
        div.classList.add('pp_card');
        if (card.id.includes('select')) {
            div.classList.add('pp_card_select');
        }
    };
    PPCardManager.prototype.setupFrontDiv = function (card, div) {
        div.classList.add("pp_".concat(card.id));
        if (!card.id.includes('select')) {
            this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
            div.classList.add('pp_card_side');
        }
        else {
            div.classList.add('pp_card_select_side');
        }
    };
    PPCardManager.prototype.setupBackDiv = function (card, div) {
        div.classList.add('pp_card_side');
        div.classList.add('pp_card_back');
    };
    PPCardManager.prototype.isCardVisible = function (card) {
        return (card.type === 'eventCard' || card.type === 'courtCard') && card.location === 'deck' ? false : true;
    };
    return PPCardManager;
}(CardManager));
var CoalitionBlockManager = (function (_super) {
    __extends(CoalitionBlockManager, _super);
    function CoalitionBlockManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    CoalitionBlockManager.prototype.clearInterface = function () { };
    CoalitionBlockManager.prototype.setupDiv = function (block, div) {
        div.classList.add('pp_coalition_block');
        if (block.id.startsWith('temp')) {
            div.classList.add(PP_TEMPORARY);
        }
    };
    CoalitionBlockManager.prototype.setupFrontDiv = function (block, div) {
        div.classList.add('pp_coalition_block_side');
        div.setAttribute('data-coalition', block.coalition);
    };
    CoalitionBlockManager.prototype.setupBackDiv = function (block, div) {
    };
    CoalitionBlockManager.prototype.isCardVisible = function (block) {
        return true;
    };
    return CoalitionBlockManager;
}(CardManager));
var CylinderManager = (function (_super) {
    __extends(CylinderManager, _super);
    function CylinderManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    CylinderManager.prototype.clearInterface = function () { };
    CylinderManager.prototype.setupDiv = function (cylinder, div) {
        div.classList.add('pp_cylinder');
        div.setAttribute('data-color', cylinder.color);
    };
    CylinderManager.prototype.setupFrontDiv = function (cylinder, div) {
        div.classList.add('pp_cylinder_side');
    };
    CylinderManager.prototype.setupBackDiv = function (cylinder, div) {
    };
    CylinderManager.prototype.isCardVisible = function (cylinder) {
        return true;
    };
    return CylinderManager;
}(CardManager));
var FavoredSuitMarkerManager = (function (_super) {
    __extends(FavoredSuitMarkerManager, _super);
    function FavoredSuitMarkerManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    FavoredSuitMarkerManager.prototype.clearInterface = function () { };
    FavoredSuitMarkerManager.prototype.setupDiv = function (token, div) {
        div.classList.add('pp_favored_suit_marker');
    };
    FavoredSuitMarkerManager.prototype.setupFrontDiv = function (token, div) {
        div.classList.add('pp_favored_suit_marker_side');
    };
    FavoredSuitMarkerManager.prototype.setupBackDiv = function (token, div) {
    };
    FavoredSuitMarkerManager.prototype.isCardVisible = function (token) {
        return true;
    };
    return FavoredSuitMarkerManager;
}(CardManager));
var RulerTokenManager = (function (_super) {
    __extends(RulerTokenManager, _super);
    function RulerTokenManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    RulerTokenManager.prototype.clearInterface = function () { };
    RulerTokenManager.prototype.setupDiv = function (token, div) {
        div.classList.add('pp_ruler_token');
        div.setAttribute('data-region', token.region);
    };
    RulerTokenManager.prototype.setupFrontDiv = function (token, div) {
        div.classList.add('pp_ruler_token_side');
    };
    RulerTokenManager.prototype.setupBackDiv = function (token, div) {
    };
    RulerTokenManager.prototype.isCardVisible = function (token) {
        return true;
    };
    return RulerTokenManager;
}(CardManager));
var RupeeManager = (function (_super) {
    __extends(RupeeManager, _super);
    function RupeeManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "".concat(card.id); },
            setupDiv: function (card, div) { return _this.setupDiv(card, div); },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            setupBackDiv: function (card, div) { return _this.setupBackDiv(card, div); },
            isCardVisible: function (card) { return _this.isCardVisible(card); },
            animationManager: game.animationManager,
        }) || this;
        _this.game = game;
        return _this;
    }
    RupeeManager.prototype.clearInterface = function () { };
    RupeeManager.prototype.setupDiv = function (cylinder, div) {
        div.classList.add('pp_rupee');
        div.setAttribute('data-color', cylinder.color);
    };
    RupeeManager.prototype.setupFrontDiv = function (cylinder, div) {
        div.classList.add('pp_rupee_side');
    };
    RupeeManager.prototype.setupBackDiv = function (cylinder, div) {
    };
    RupeeManager.prototype.isCardVisible = function (cylinder) {
        return true;
    };
    return RupeeManager;
}(CardManager));
var TokenManualPositionStock = (function (_super) {
    __extends(TokenManualPositionStock, _super);
    function TokenManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    TokenManualPositionStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card)
            ? this.manager.getCardElement(card)
            :
                animation.fromStock.element;
        var fromRect = element === null || element === void 0 ? void 0 : element.getBoundingClientRect();
        this.updateDisplay(this.element, __spreadArray(__spreadArray([], this.getCards(), true), [card], false), card, this);
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = fromRect
            ? this.animationFromElement(cardElement, fromRect, {
                originalSide: animation.originalSide,
                rotationDelta: animation.rotationDelta,
                animation: animation.animation,
            })
            : Promise.resolve(false);
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    TokenManualPositionStock.prototype.addCard = function (card, animation, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, _super.prototype.addCard.call(this, card, animation, settings)];
                    case 1:
                        result = _a.sent();
                        this.updateDisplay(this.element, this.getCards(), card, this);
                        return [2, result];
                }
            });
        });
    };
    TokenManualPositionStock.prototype.cardRemoved = function (card, settings) {
        _super.prototype.cardRemoved.call(this, card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return TokenManualPositionStock;
}(CardStock));
var LOG_TOKEN_ARMY = 'army';
var LOG_TOKEN_CARD = 'card';
var LOG_TOKEN_CARD_ICON = 'cardIcon';
var LOG_TOKEN_CARD_NAME = 'cardName';
var LOG_TOKEN_COALITION = 'coalition';
var LOG_TOKEN_COALITION_BLACK = 'coalitionBlack';
var LOG_TOKEN_COALITION_NAME = 'coalitionName';
var LOG_TOKEN_CYLINDER = 'cylinder';
var LOG_TOKEN_FAVORED_SUIT = 'favoredSuit';
var LOG_TOKEN_LARGE_CARD = 'largeCard';
var LOG_TOKEN_LEVERAGE = 'leverage';
var LOG_TOKEN_NEW_LINE = 'newLine';
var LOG_TOKEN_PLAYER_NAME = 'playerName';
var LOG_TOKEN_REGION_NAME = 'regionName';
var LOG_TOKEN_ROAD = 'road';
var LOG_TOKEN_RUPEE = 'rupee';
var tooltipIdCounter = 0;
var getTokenDiv = function (_a) {
    var key = _a.key, value = _a.value, game = _a.game;
    var splitKey = key.split('_');
    var type = splitKey[1];
    switch (type) {
        case LOG_TOKEN_ARMY:
            return tplLogTokenArmy({ coalition: value.split('_')[0] });
        case LOG_TOKEN_CARD:
            tooltipIdCounter++;
            return tplLogTokenCard({ cardId: value, cardIdSuffix: tooltipIdCounter });
        case LOG_TOKEN_CARD_NAME:
            return tlpLogTokenBoldText({ text: value });
        case LOG_TOKEN_COALITION:
            return tplLogTokenCoalition({ coalition: value });
        case LOG_TOKEN_COALITION_BLACK:
            return tplLogTokenCoalition({ coalition: value, black: true });
        case LOG_TOKEN_COALITION_NAME:
            return tlpLogTokenBoldText({ text: game.gamedatas.staticData.loyalty[value].name });
        case LOG_TOKEN_CYLINDER:
            return tplLogTokenCylinder({ color: game.playerManager.getPlayer({ playerId: Number(value.split('_')[0]) }).getColor() });
        case LOG_TOKEN_FAVORED_SUIT:
            return tplLogTokenFavoredSuit({ suit: value });
        case LOG_TOKEN_LARGE_CARD:
            tooltipIdCounter++;
            return tplLogTokenCard({ cardId: value, large: true, cardIdSuffix: tooltipIdCounter });
        case LOG_TOKEN_LEVERAGE:
            return tplLogTokenLeverage();
        case LOG_TOKEN_NEW_LINE:
            return '<br>';
        case LOG_TOKEN_PLAYER_NAME:
            var player = game.playerManager.getPlayers().find(function (player) { return player.getName() === value; });
            return player ? tplLogTokenPlayerName({ name: player.getName(), color: player.getHexColor() }) : value;
        case LOG_TOKEN_REGION_NAME:
            return tplLogTokenRegionName({ name: game.gamedatas.staticData.regions[value].name, regionId: value });
        case LOG_TOKEN_ROAD:
            return tplLogTokenRoad({ coalition: value.split('_')[0] });
        case LOG_TOKEN_RUPEE:
            return tplLogTokenRupee();
        default:
            return value;
    }
};
var getLogTokenDiv = function (_a) {
    var logToken = _a.logToken, game = _a.game;
    var _b = logToken.split(':'), type = _b[0], data = _b[1];
    switch (type) {
        case LOG_TOKEN_ARMY:
            return tplLogTokenArmy({ coalition: data });
        case LOG_TOKEN_CARD:
            tooltipIdCounter++;
            return tplLogTokenCard({ cardId: data, cardIdSuffix: tooltipIdCounter });
        case LOG_TOKEN_CARD_ICON:
            tooltipIdCounter++;
            return tplLogTokenCard({ cardId: 'card_back', cardIdSuffix: tooltipIdCounter });
        case LOG_TOKEN_LARGE_CARD:
            tooltipIdCounter++;
            return tplLogTokenCard({ cardId: data, large: true, cardIdSuffix: tooltipIdCounter });
        case LOG_TOKEN_CARD_NAME:
            return tlpLogTokenBoldText({ text: data });
        case LOG_TOKEN_FAVORED_SUIT:
            return tplLogTokenFavoredSuit({ suit: data });
        case LOG_TOKEN_CYLINDER:
            return tplLogTokenCylinder({ color: game.playerManager.getPlayer({ playerId: Number(data) }).getColor() });
        case LOG_TOKEN_COALITION:
            return tplLogTokenCoalition({ coalition: data });
        case LOG_TOKEN_COALITION_BLACK:
            return tplLogTokenCoalition({ coalition: data, black: true });
        case LOG_TOKEN_COALITION_NAME:
            return tlpLogTokenBoldText({ text: game.gamedatas.staticData.loyalty[data].name });
        case LOG_TOKEN_LEVERAGE:
            return tplLogTokenLeverage();
        case LOG_TOKEN_NEW_LINE:
            return '<br>';
        case LOG_TOKEN_PLAYER_NAME:
            var player = game.playerManager.getPlayer({ playerId: Number(data) });
            return tplLogTokenPlayerName({ name: player.getName(), color: player.getHexColor() });
        case LOG_TOKEN_REGION_NAME:
            return tplLogTokenRegionName({ name: game.gamedatas.staticData.regions[data].name, regionId: data });
        case LOG_TOKEN_ROAD:
            return tplLogTokenRoad({ coalition: data });
        case LOG_TOKEN_RUPEE:
            return tplLogTokenRupee();
        default:
            return type;
    }
};
var tplLogTokenArmy = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_coalition_block_side pp_log_token\" data-type=\"army\" data-coalition=\"".concat(coalition, "\"></div>");
};
var tlpLogTokenBoldText = function (_a) {
    var text = _a.text;
    return "<span style=\"font-weight: 700;\">".concat(_(text), "</span>");
};
var tplLogTokenCard = function (_a) {
    var cardId = _a.cardId, large = _a.large, cardIdSuffix = _a.cardIdSuffix;
    return "<div id=\"".concat(cardId, "_").concat(cardIdSuffix, "\" class=\"pp_card_side pp_log_token pp_").concat(cardId).concat(!large ? ' pp_small' : '', "\"></div>");
};
var tplLogTokenCoalition = function (_a) {
    var coalition = _a.coalition, black = _a.black;
    return "<div class=\"pp_log_token pp_loyalty_icon".concat(black ? '_black' : '', " pp_").concat(coalition, "\"></div>");
};
var tplLogTokenCylinder = function (_a) {
    var color = _a.color;
    return "<div class=\"pp_cylinder_side pp_log_token\" data-color=\"".concat(color, "\"></div>");
};
var tplLogTokenFavoredSuit = function (_a) {
    var suit = _a.suit;
    return "<div class=\"pp_log_token pp_impact_icon_suit ".concat(suit, "\"></div>");
};
var tplLogTokenLeverage = function () { return "<div class=\"pp_leverage pp_log_token\"></div>"; };
var tplLogTokenNewCards = function (_a) {
    var cards = _a.cards;
    var newCards = '';
    cards.forEach(function (card) {
        newCards += "<div class=\"pp_card pp_log_token pp_".concat(card.cardId, " pp_large\" style=\"display: inline-block; margin-right: 4px;\"></div>");
    });
    return newCards;
};
var tplLogTokenPlayerName = function (_a) {
    var name = _a.name, color = _a.color;
    return "<span class=\"playername\" style=\"color:#".concat(color, ";\">").concat(name, "</span>");
};
var tplLogTokenRegionName = function (_a) {
    var name = _a.name, regionId = _a.regionId;
    return "<div style=\"display: inline-block;\"><span style=\"font-weight: 700;\">".concat(_(name), "</span><div class=\"pp_log_token pp_").concat(regionId, " pp_region_icon\"></div></div>");
};
var tplLogTokenRoad = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_coalition_block_side pp_log_token\" data-type=\"road\" data-coalition=\"".concat(coalition, "\"></div>");
};
var tplLogTokenRupee = function () { return "<div class=\"pp_rupee_side pp_log_token\"></div>"; };
var _a, _b;
var ANIMATION_WAIT_MS = 100;
var CLIENT_CARD_ACTION_BATTLE = 'clientCardActionBattle';
var CLIENT_CARD_ACTION_BETRAY = 'clientCardActionBetray';
var CLIENT_CARD_ACTION_BUILD = 'clientCardActionBuild';
var CLIENT_CARD_ACTION_GIFT = 'clientCardActionGift';
var CLIENT_CARD_ACTION_MOVE = 'clientCardActionMove';
var CLIENT_CARD_ACTION_TAX = 'clientCardActionTax';
var CLIENT_INITIAL_BRIBE_CHECK = 'clientInitialBribeCheck';
var CLIENT_PLAY_CARD = 'clientPlayCard';
var CLIENT_PURCHASE_CARD = 'clientPurchaseCard';
var CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE = 'clientResolveConfidenceFailure';
var CLIENT_RESOLVE_EVENT_OTHER_PERSUASIVE_METHODS = 'clientResolveEventOtherPersuasiveMethods';
var CLIENT_RESOLVE_EVENT_PASHTUNWALI_VALUES = 'clientResolveEventPashtunwaliValues';
var CLIENT_RESOLVE_EVENT_REBUKE = 'clientResolveEventRebuke';
var CLIENT_RESOLVE_EVENT_RUMOR = 'clientResolveEventRumor';
var PREF_SINGLE_COLUMN_MAP_SIZE = 'singleColumnMapSize';
var PREF_TWO_COLUMNS_LAYOUT = 'twoColumnsLayout';
var PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY = 'confirmEndOfTurnPlayerSwitchOnly';
var PREF_SHOW_ANIMATIONS = 'showAnimations';
var PREF_ANIMATION_SPEED = 'animationSpeed';
var PREF_CARD_INFO_IN_TOOLTIP = 'cardInfoInTooltip';
var PREF_CARD_SIZE_IN_LOG = 'cardSizeInLog';
var PREF_CARD_SIZE_IN_COURT = 'cardSizeInCourt';
var PREF_DISABLED = 'disabled';
var PREF_ENABLED = 'enabled';
var PLAY_CARD = 'playCard';
var PURCHASE_CARD = 'purchaseCard';
var BATTLE = 'battle';
var BETRAY = 'betray';
var BUILD = 'build';
var GIFT = 'gift';
var MOVE = 'move';
var TAX = 'tax';
var CARD_ACTIONS_WITH_COST = [BETRAY, BUILD, GIFT];
var CARD_ACTIONS_WITHOUT_COST = [BATTLE, MOVE, TAX];
var cardActionClientStateMap = (_a = {},
    _a[BATTLE] = CLIENT_CARD_ACTION_BATTLE,
    _a[BETRAY] = CLIENT_CARD_ACTION_BETRAY,
    _a[BUILD] = CLIENT_CARD_ACTION_BUILD,
    _a[GIFT] = CLIENT_CARD_ACTION_GIFT,
    _a[MOVE] = CLIENT_CARD_ACTION_MOVE,
    _a[TAX] = CLIENT_CARD_ACTION_TAX,
    _a);
var ACTIVE_EVENTS = 'activeEvents';
var DISCARD = 'discardPile';
var TEMP_DISCARD = 'tempDiscardPile';
var HAND = 'hand';
var COURT = 'court';
var discardMap = (_b = {},
    _b[DISCARD] = 'pp_pile_discarded_card',
    _b[TEMP_DISCARD] = 'pp_temp_discarded_card',
    _b);
var CARD_WIDTH = 150;
var CARD_HEIGHT = 209;
var ARMY_HEIGHT = 40;
var ARMY_WIDTH = 25;
var COALITION_BLOCK_HEIGHT = 40;
var COALITION_BLOCK_WIDTH = 25;
var ROAD_HEIGHT = 27;
var ROAD_WIDTH = 40;
var TRIBE_WIDTH = 25;
var TRIBE_HEIGHT = 25;
var RUPEE_WIDTH = 50;
var RUPEE_HEIGHT = 50;
var CYLINDER_WIDTH = 30;
var CYLINDER_HEIGHT = 30;
var FAVORED_SUIT_MARKER_WIDTH = 22;
var FAVORED_SUIT_MARKER_HEIGHT = 50;
var RULER_TOKEN_WIDTH = 50;
var RULER_TOKEN_HEIGHT = 50;
var EVENT_CARD = 'eventCard';
var COURT_CARD = 'courtCard';
var ECONOMIC = 'economic';
var MILITARY = 'military';
var POLITICAL = 'political';
var INTELLIGENCE = 'intelligence';
var SUITS = [POLITICAL, INTELLIGENCE, ECONOMIC, MILITARY];
var AFGHAN = 'afghan';
var BRITISH = 'british';
var RUSSIAN = 'russian';
var COALITIONS = [AFGHAN, BRITISH, RUSSIAN];
var HERAT = 'herat';
var KABUL = 'kabul';
var KANDAHAR = 'kandahar';
var PERSIA = 'persia';
var PUNJAB = 'punjab';
var TRANSCASPIA = 'transcaspia';
var REGIONS = [HERAT, KABUL, KANDAHAR, PERSIA, PUNJAB, TRANSCASPIA];
var HERAT_KABUL = 'herat_kabul';
var HERAT_KANDAHAR = 'herat_kandahar';
var HERAT_PERSIA = 'herat_persia';
var HERAT_TRANSCASPIA = 'herat_transcaspia';
var KABUL_KANDAHAR = 'kabul_kandahar';
var KABUL_PUNJAB = 'kabul_punjab';
var KABUL_TRANSCASPIA = 'kabul_transcaspia';
var KANDAHAR_PUNJAB = 'kandahar_punjab';
var PERSIA_TRANSCASPIA = 'persia_transcaspia';
var BORDERS = [
    HERAT_KABUL,
    HERAT_KANDAHAR,
    HERAT_PERSIA,
    HERAT_TRANSCASPIA,
    KABUL_KANDAHAR,
    KABUL_PUNJAB,
    KABUL_TRANSCASPIA,
    KANDAHAR_PUNJAB,
    PERSIA_TRANSCASPIA,
];
var IMPACT_ICON_ROAD = 'road';
var IMPACT_ICON_ARMY = 'army';
var IMPACT_ICON_LEVERAGE = 'leverage';
var IMPACT_ICON_SPY = 'spy';
var IMPACT_ICON_TRIBE = 'tribe';
var IMPACT_ICON_ECONOMIC_SUIT = 'economic';
var IMPACT_ICON_MILITARY_SUIT = 'military';
var IMPACT_ICON_POLITICAL_SUIT = 'political';
var IMPACT_ICON_INTELLIGENCE_SUIT = 'intelligence';
var PP_SELECTABLE = 'pp_selectable';
var PP_SELECTED = 'pp_selected';
var PP_CARD_IN_HAND = 'pp_card_in_hand';
var PP_CARD_IN_ZONE = 'pp_card_in_zone';
var PP_MARKET_CARD = 'pp_market_card';
var PP_ARMY = 'pp_army';
var PP_PRIZE = 'pp_prize';
var PP_ROAD = 'pp_road';
var PP_COALITION_BLOCK = 'pp_coalition_block';
var PP_TEMPORARY = 'pp_temporary';
var PP_AFGHAN = 'pp_afghan';
var PP_BRITISH = 'pp_british';
var PP_RUSSIAN = 'pp_russian';
var ECE_BACKING_OF_PERSIAN_ARISTOCRACY = 'backingOfPersianAristocracy';
var ECE_CONFIDENCE_FAILURE = 'confidenceFailure';
var ECE_CONFLICT_FATIGUE = 'conflictFatigue';
var ECE_CONFLICT_FATIGUE_CARD_ID = 'card_109';
var ECE_COURTLY_MANNERS = 'courtlyManners';
var ECE_COURTLY_MANNERS_CARD_ID = 'card_107';
var ECE_DISREGARD_FOR_CUSTOMS = 'disregardForCustoms';
var ECE_DOMINANCE_CHECK = 'dominanceCheck';
var ECE_EMBARRASSEMENT_OF_RICHES = 'embarrassementOfRiches';
var ECE_FAILURE_TO_IMPRESS = 'failureToImpress';
var ECE_INTELLIGENCE_SUIT = 'intelligenceSuit';
var ECE_KOH_I_NOOR_RECOVERED = 'kohINoorRecovered';
var ECE_KOH_I_NOOR_RECOVERED_CARD_ID = 'card_106';
var ECE_MILITARY_SUIT = 'militarySuit';
var ECE_NATION_BUILDING = 'nationBuilding';
var ECE_NATION_BUILDING_CARD_ID = 'card_112';
var ECE_NATIONALISM = 'nationalism';
var ECE_NATIONALISM_CARD_ID = 'card_110';
var ECE_NEW_TACTICS = 'newTactics';
var ECE_NO_EFFECT = 'noEffect';
var ECE_OTHER_PERSUASIVE_METHODS = 'otherPersuasiveMethods';
var ECE_PASHTUNWALI_VALUES = 'pashtunwaliValues';
var ECE_PASHTUNWALI_VALUES_CARD_ID = 'card_115';
var ECE_POLITICAL_SUIT = 'politicalSuit';
var ECE_PUBLIC_WITHDRAWAL = 'publicWithdrawal';
var ECE_PUBLIC_WITHDRAWAL_CARD_ID = 'card_111';
var ECE_REBUKE = 'rebuke';
var ECE_RIOTS_IN_HERAT = 'riotsInHerat';
var ECE_RIOTS_IN_KABUL = 'riotsInKabul';
var ECE_RIOTS_IN_PERSIA = 'riotsInPersia';
var ECE_RIOTS_IN_PUNJAB = 'riotsInPunjab';
var ECE_RUMOR = 'rumor';
var ECE_RUMOR_CARD_ID = 'card_108';
var SA_INDISPENSABLE_ADVISORS = 'indispensableAdvisors';
var SA_INSURRESCTION = 'insurrection';
var SA_CLAIM_OF_ANCIENT_LINEAGE = 'claimOfAncientLineage';
var SA_BODYGUARDS = 'bodyguards';
var SA_CITADEL_KABUL = 'citadelKabul';
var SA_CITADEL_TRANSCASPIA = 'citadelTranscaspia';
var SA_STRANGE_BEDFELLOWS = 'strangeBedfellows';
var SA_CIVIL_SERVICE_REFORMS = 'civilServiceReforms';
var SA_SAFE_HOUSE = 'safeHouse';
var SA_CHARISMATIC_COURTIERS = 'charismaticCourtiers';
var SA_BLACKMAIL_HERAT = 'blackmailHerat';
var SA_BLACKMAIL_KANDAHAR = 'blackmailKandahar';
var SA_INDIAN_SUPPLIES = 'indianSupplies';
var SA_WELL_CONNECTED = 'wellConnected';
var SA_HERAT_INFLUENCE = 'heratInfluence';
var SA_PERSIAN_INFLUENCE = 'persianInfluence';
var SA_RUSSIAN_INFLUENCE = 'russianInfluence';
var SA_INFRASTRUCTURE = 'infrastructure';
var SA_SAVVY_OPERATOR = 'savvyOperator';
var SA_IRREGULARS = 'irregulars';
var WAKHAN_PLAYER_ID = 1;
var TOP_LEFT = 'topLeft';
var BOTTOM_RIGHT = 'bottomRight';
var BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY = 'battleHighestPriorityCourtCardWithMostSpiesWhereWakhanHasSpy';
var RADICALIZE = 'radicalize';
var RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY = 'radicalizeIfMilitaryFavoredHighestRankedMilitary';
var RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC = 'radicalizeIfPoliticalFavoredHighestRankedEconomic';
var RADICALIZE_HIGHEST_RANKED_POLITICAL = 'radicalizeHighestRankedPolitical';
var RADICALIZE_HIGHEST_RANKED_INTELLIGENCE = 'radicalizeHighestRankedIntelligence';
var RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES = 'radicalizeIfFewerThan2RupeesRadicalizeMostNetRupees';
var RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION = 'radicalizeCardThatGivesControlOfRegion';
var RADICALIZE_INTELLIGENCE = 'radicalizeIntelligence';
var RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS = 'radicalizeCardThatWouldPlaceMostBlocks';
var RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS = 'radicalizeIfNoDominantCoalitionCardThatWouldPlaceMostCylinders';
var RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION = 'radicalizeIfNoCardWithMoveCardWithMoveAction';
var RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT = 'radicalizeIfDominantCoalitionMatchingPatriot';
var RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL = 'radicalizeIfCourtSizeAtLimitHighestRankedPolitical';
var RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE = 'radicalizeIfFewerSpiesThanAnotherPlayerHighestRankedIntelligence';
var PLAYER_INFLUENCE = 'playerInfluence';
var WAKHAN_INFLUENCE = 'wakhanInfluence';
var tplArmy = function (_a) {
    var coalition = _a.coalition, id = _a.id, classesToAdd = _a.classesToAdd;
    return "<div class=\"pp_army pp_".concat(coalition).concat((classesToAdd || []).map(function (classToAdd) { return " ".concat(classToAdd); }), "\" id=\"").concat(id, "\"></div>");
};
var tplCard = function (_a) {
    var cardId = _a.cardId, _b = _a.cardIdSuffix, cardIdSuffix = _b === void 0 ? '' : _b, extraClasses = _a.extraClasses, style = _a.style;
    return "<div id=\"".concat(cardId).concat(cardIdSuffix, "\" class=\"pp_card_side pp_").concat(cardId).concat(extraClasses ? ' ' + extraClasses : '', "\"").concat(style ? " style=\"".concat(style, "\"") : '', "></div>");
};
var tplCardSelect = function (_a) {
    var side = _a.side;
    return "<div id=\"pp_card_select_".concat(side, "\" class=\"pp_card_select_side\"></div>");
};
var tplCoalitionBlock = function (_a) {
    var coalition = _a.coalition, id = _a.id;
    return "<div class=\"pp_coalition_block pp_".concat(coalition, "\" id=\"").concat(id, "\"></div>");
};
var tplCylinder = function (_a) {
    var color = _a.color, id = _a.id;
    return "<div class=\"pp_cylinder pp_player_color_".concat(color, "\" id=\"").concat(id, "\"></div>");
};
var tplFavoredSuit = function (_a) {
    var id = _a.id;
    return "<div class=\"pp_favored_suit_marker\" id=\"".concat(id, "\"></div>");
};
var tplRoad = function (_a) {
    var coalition = _a.coalition, id = _a.id, classesToAdd = _a.classesToAdd;
    return "<div class=\"pp_road pp_".concat(coalition).concat((classesToAdd || []).map(function (classToAdd) { return " ".concat(classToAdd); }), "\" id=\"").concat(id, "\"></div>");
};
var tplRupee = function (_a) {
    var rupeeId = _a.rupeeId;
    return "<div class=\"pp_rupee_side\" id=\"".concat(rupeeId, "\">\n          </div>");
};
var tplRulerToken = function (_a) {
    var id = _a.id, region = _a.region;
    return "<div class=\"pp_ruler_token pp_".concat(region, "\" id=\"").concat(id, "\"></div>");
};
var tplRupeeCount = function (_a) {
    var id = _a.id;
    return "<div id=\"rupees_".concat(id, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_").concat(id, "\" class=\"pp_icon_count\"><span id=\"rupee_count_").concat(id, "_counter\"></span></div></div>");
};
var tplHandCount = function (_a) {
    var id = _a.id;
    return "<div id=\"cards_".concat(id, "\" class=\"pp_icon pp_card_icon\"><div id=\"card_count_").concat(id, "\" class=\"pp_icon_count\"><span id=\"card_count_").concat(id, "_counter\"></span></div></div>");
};
var createCards = function (_a) {
    var cards = _a.cards;
    var result = '';
    cards.forEach(function (cardId) {
        result += tplCard({ cardId: cardId, cardIdSuffix: '_modal' });
    });
    return result;
};
var tplPlayerHandModal = function (_a) {
    var cards = _a.cards;
    return "<div class=\"pp_player_hand_modal_content\">\n            ".concat(createCards({ cards: cards }), "\n          </div>");
};
var tplActiveEvents = function () {
    return "<div id=\"pp_active_events_container\">\n            <div id=\"pp_active_events\" class=\"pp_active_events\"></div>\n          </div>";
};
var tplPlayerHand = function (_a) {
    var playerId = _a.playerId, playerName = _a.playerName;
    return "<div id=\"pp_player_hand_".concat(playerId, "\" class=\"pp_player_hand\">\n            <div id=\"pp_player_hand_title\" class=\"pp_tableau_title\"><span>").concat(_("${playerName}'s hand").replace('${playerName}', playerName), "</span></div>\n            <div id=\"pp_player_hand_cards\" class=\"pp_player_hand_cards\"></div>\n            <div id=\"pp_player_hand_size_").concat(playerId, "\" class=\"pp_player_hand_size\">\n              <span id=\"pp_hand_count_").concat(playerId, "\" class=\"pp_card_count\"></span><span>/</span><span id=\"pp_hand_limit_").concat(playerId, "\" class=\"pp_card_limit\"></span>\n            </div>\n          </div>");
};
var tplPlayerBoard = function (_a) {
    var playerId = _a.playerId;
    return "<div id=\"pp_player_board_".concat(playerId, "\" class=\"pp_player_board\">\n    <div class=\"pp_icon_container\">\n        <div id=\"loyalty_icon_").concat(playerId, "\" class=\"pp_icon pp_loyalty_icon\"><div id=\"influence_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"influence_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"cylinders_").concat(playerId, "\" class=\"pp_icon pp_cylinder_icon\"><div id=\"cylinder_count_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"cylinder_count_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"rupees_").concat(playerId, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"rupee_count_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"cards_").concat(playerId, "\" class=\"pp_icon pp_card_icon\"><div id=\"card_count_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"card_count_").concat(playerId, "_counter\"></span></div></div>\n    </div>\n    <div id=\"suits_").concat(playerId, "\" class=\"pp_icon_container\">\n        <div id=\"pp_political_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon political\"><div id=\"political_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"political_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_intelligence_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon intelligence\"><div id=\"intelligence_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"intelligence_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_economic_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon economic\"><div id=\"economic_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"economic_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_military_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon military\"><div id=\"military_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"military_").concat(playerId, "_counter\"></span></div></div>\n    </div>\n</div>");
};
var tplPlayerBoardWakhan = function (_a) {
    var playerId = _a.playerId;
    return "<div id=\"pp_player_board_".concat(playerId, "\" class=\"pp_player_board\">\n    <div class=\"pp_icon_container\">\n        <div id=\"loyalty_icon_").concat(playerId, "_afghan\" class=\"pp_icon pp_loyalty_icon_black pp_afghan\"><div id=\"influence_").concat(playerId, "_afghan\" class=\"pp_icon_count\"><span id=\"influence_").concat(playerId, "_afghan_counter\"></span></div></div>\n        <div id=\"loyalty_icon_").concat(playerId, "_british\" class=\"pp_icon pp_loyalty_icon_black pp_british\"><div id=\"influence_").concat(playerId, "_british\" class=\"pp_icon_count\"><span id=\"influence_").concat(playerId, "_british_counter\"></span></div></div>\n        <div id=\"loyalty_icon_").concat(playerId, "_russian\" class=\"pp_icon pp_loyalty_icon_black pp_russian\"><div id=\"influence_").concat(playerId, "_russian\" class=\"pp_icon_count\"><span id=\"influence_").concat(playerId, "_russian_counter\"></span></div></div>\n        <div id=\"cylinders_").concat(playerId, "\" class=\"pp_icon pp_cylinder_icon\"><div id=\"cylinder_count_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"cylinder_count_").concat(playerId, "_counter\"></span></div></div>        \n    </div>\n    <div id=\"suits_").concat(playerId, "\" class=\"pp_icon_container\">\n        <div id=\"pp_political_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon political\"><div id=\"political_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"political_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_intelligence_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon intelligence\"><div id=\"intelligence_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"intelligence_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_economic_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon economic\"><div id=\"economic_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"economic_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"pp_military_icon_").concat(playerId, "\" class=\"pp_icon pp_suit_icon military\"><div id=\"military_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"military_").concat(playerId, "_counter\"></span></div></div>\n        <div id=\"rupees_").concat(playerId, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"rupee_count_").concat(playerId, "_counter\"></span></div></div>\n    </div>\n</div>");
};
var tplPlayerTableau = function (_a) {
    var playerId = _a.playerId, playerColor = _a.playerColor, playerName = _a.playerName;
    return "<div id=\"player_tableau_".concat(playerId, "\" >\n  <div id=\"pp_player_tableau_container_").concat(playerId, "\" class=\"pp_player_tableau pp_player_color_").concat(playerColor, "\">\n    <div id=\"pp_player_to_left_of_").concat(playerId, "\" class=\"pp_player_to_left\">\n      <div class=\"pp_player_color_block\"></div>\n    </div>\n      <div class=\"pp_tableau_left\">\n        <div id=\"pp_ruler_tokens_player_").concat(playerId, "\" class=\"pp_ruler_tokens_player\"></div>\n        <div class=\"pp_loyalty_dial_section\">\n          <div id=\"pp_prizes_").concat(playerId, "\" class=\"pp_prizes\"></div>\n            <div id=\"pp_loyalty_dial_container_").concat(playerId, "\" class=\"pp_loyalty_dial_container\">\n               <div id=\"pp_loyalty_dial_").concat(playerId, "\" class=\"pp_loyalty_dial\"></div>\n            <div class=\"pp_loyalty_dial_cover pp_player_color_").concat(playerColor, "\"></div>\n            <div id=\"pp_gift_2_").concat(playerId, "\" class=\"pp_gift pp_gift_2\">\n                <div id=\"pp_gift_2_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n            </div>\n            <div id=\"pp_gift_4_").concat(playerId, "\" class=\"pp_gift pp_gift_4\">\n                <div id=\"pp_gift_4_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n            </div>\n            <div id=\"pp_gift_6_").concat(playerId, "\" class=\"pp_gift pp_gift_6\">\n                <div id=\"pp_gift_6_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class=\"pp_player_tableau_right\">\n          <div class=\"pp_player_tableau_title_container\">\n              <div id=\"pp_tableau_title_player_").concat(playerId, "\" class=\"pp_player_tableau_title\"><span>").concat(_("${playerName}'s court").replace('${playerName}', playerName), "</span></div>\n              <div id=\"pp_tableau_title_icons_player_").concat(playerId, "\" class=\"pp_player_tableau_icons\">\n                  <div id=\"rupees_tableau_").concat(playerId, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_tableau_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"rupee_count_tableau_").concat(playerId, "_counter\"></span></div></div>\n                  <div id=\"cards_tableau_").concat(playerId, "\" class=\"pp_icon pp_card_icon_tableau\"><div id=\"card_count_tableau_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"card_count_tableau_").concat(playerId, "_counter\"></span></div></div>\n              </div>\n          </div>\n          <div class=\"pp_tableau_inner_container\">\n              <div class=\"pp_tableau_inner_left\">\n                  <div id=\"pp_cylinders_player_").concat(playerId, "\" class=\"pp_cylinders pp_cylinders_player_").concat(playerId, "\"></div>\n              </div>\n              <div class=\"pp_tableau_inner_right\">\n                  <div id=\"pp_court_player_").concat(playerId, "\" class=\"pp_court pp_court_player_").concat(playerId, "\"></div>\n              </div>\n          </div>\n          <div id=\"pp_player_court_size_").concat(playerId, "\" class=\"pp_player_tableau_court_size\">\n            <span id=\"pp_court_count_").concat(playerId, "\" class=\"pp_card_count\"></span><span>/</span><span id=\"pp_court_limit_").concat(playerId, "\" class=\"pp_card_limit\"></span>\n          </div>\n      </div>\n      <div id=\"pp_player_to_right_of_").concat(playerId, "\" class=\"pp_player_to_right\">\n        <div class=\"pp_player_color_block\"></div>\n        <div class=\"pp_player_color_block\"></div>\n      </div>\n  </div>\n  <div id=\"pp_player_events_container_").concat(playerId, "\" class=\"pp_player_events_container\">\n      <div id=\"player_tableau_events_").concat(playerId, "\">\n      </div>\n  </div>\n</div>");
};
var tplWakhanPlayerPanel = function (_a) {
    var name = _a.name;
    return "<div id=\"overall_player_board_1\" class=\"player-board\">\n            <div class=\"player_board_inner\" id=\"player_board_inner_8A70B2\">\n              <div class=\"emblemwrap\" id=\"avatarwrap_1\">\n                  <div class=\"pp_wakhan_avatar avatar emblem\" id=\"avatar_1\"></div>\n              </div>\n              <div class=\"player-name\" id=\"player_name_1\">\n                <a style=\"color: #8A70B2\">".concat(name, "</a>\n              </div>\n              <div id=\"player_board_1\" class=\"player_board_content\">\n                <div class=\"player_score\" style=\"margin-top: 5px;\">\n                  <span id=\"player_score_1\" class=\"player_score_value\"></span> <i class=\"fa fa-star\" id=\"icon_point_1\"></i>\n                </div>\n              </div>\n            </div>\n          </div>");
};
var tplWakhanTableau = function (_a) {
    var playerId = _a.playerId, playerColor = _a.playerColor, playerName = _a.playerName;
    return "<div id=\"player_tableau_".concat(playerId, "\">\n            <div id=\"pp_player_tableau_container_").concat(playerId, "\" class=\"pp_player_tableau pp_player_color_").concat(playerColor, "\">\n              <div id=\"pp_player_to_left_of_").concat(playerId, "\" class=\"pp_player_to_left\">\n                <div class=\"pp_player_color_block\"></div>\n              </div>\n                <div class=\"pp_wakhan_tableau_left\">\n                  <div style=\"flex-grow: 1;\">\n                    <div id=\"pp_ruler_tokens_player_").concat(playerId, "\" class=\"pp_ruler_tokens_player\"></div>\n                    <div id=\"pp_wakhan_gifts\">\n                      <div id=\"pp_gift_2_").concat(playerId, "\" class=\"pp_wakhan_gift pp_wakhan_gift_2\">\n                        <div id=\"pp_gift_2_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n                      </div>\n                      <div id=\"pp_gift_4_").concat(playerId, "\" class=\"pp_wakhan_gift pp_wakhan_gift_4\" style=\"margin-left: 10px;\">\n                        <div id=\"pp_gift_4_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n                      </div>\n                      <div id=\"pp_gift_6_").concat(playerId, "\" class=\"pp_wakhan_gift pp_wakhan_gift_6\" style=\"margin-left: 10px;\">\n                        <div id=\"pp_gift_6_zone_").concat(playerId, "\" class=\"pp_gift_zone\"></div>\n                      </div>\n                    </div>\n                  </div>\n                  <div id=\"pp_prizes_").concat(playerId, "\" class=\"pp_prizes\" style=\"left: 10px;\"></div>\n                  <div class=\"pp_wakhan_deck_container\">\n                    <div id=\"pp_wakhan_deck\" class=\"pp_wakhan_card\"></div>\n                    <div id=\"pp_wakhan_discard\" class=\"pp_wakhan_card\"></div>\n                  </div>\n                </div>\n                <div class=\"pp_player_tableau_right\">\n                    <div class=\"pp_player_tableau_title_container\">\n                        <div id=\"pp_tableau_title_player_").concat(playerId, "\" class=\"pp_player_tableau_title\" style=\"margin-right: calc(var(--rightColumnScale)* 236px);\"><span>").concat(_("${playerName}'s court").replace('${playerName}', playerName), "</span></div>\n                        <div id=\"pp_tableau_title_icons_player_").concat(playerId, "\" class=\"pp_player_tableau_icons\">\n                            <div id=\"rupees_tableau_").concat(playerId, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_tableau_").concat(playerId, "\" class=\"pp_icon_count\"><span id=\"rupee_count_tableau_").concat(playerId, "_counter\"></span></div></div>\n                        </div>\n                    </div>\n                    <div class=\"pp_tableau_inner_container\">\n                      <div class=\"pp_tableau_inner_left\">\n                          <div id=\"pp_cylinders_player_").concat(playerId, "\" class=\"pp_cylinders pp_cylinders_player_").concat(playerId, "\"></div>\n                      </div>\n                      <div class=\"pp_tableau_inner_right\">\n                        <div id=\"pp_court_player_").concat(playerId, "\" class=\"pp_court pp_court_player_").concat(playerId, "\"></div>\n                      </div>\n                    </div>\n                    <div id=\"pp_player_court_size_").concat(playerId, "\" class=\"pp_player_tableau_court_size\">\n                      <span id=\"pp_court_count_").concat(playerId, "\" class=\"pp_card_count\"></span><span>/</span><span id=\"pp_court_limit_").concat(playerId, "\" class=\"pp_card_limit\"></span>\n                    </div>\n                </div>\n                <div id=\"pp_player_to_right_of_").concat(playerId, "\" class=\"pp_player_to_right\">\n                  <div class=\"pp_player_color_block\"></div>\n                  <div class=\"pp_player_color_block\"></div>\n                </div>\n            </div>\n            <div id=\"pp_player_events_container_").concat(playerId, "\" class=\"pp_player_events_container\">\n                <div id=\"player_tableau_events_").concat(playerId, "\">\n                </div>\n            </div>\n          </div>");
};
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () { };
var capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
var getKeywords = function (_a) {
    var _b = _a.playerColor, playerColor = _b === void 0 ? '#000' : _b;
    return {
        you: '${you}',
        playerName: "<span style=\"font-weight:bold;color:#".concat(playerColor, ";\">${playerName}</span>"),
        herat: '<div class="pp_keyword_token pp_herat_icon"></div>',
        kabul: '<div class="pp_keyword_token pp_kabul_icon"></div>',
        kandahar: '<div class="pp_keyword_token pp_kandahar_icon"></div>',
        persia: '<div class="pp_keyword_token pp_persia_icon"></div>',
        punjab: '<div class="pp_keyword_token pp_punjab_icon"></div>',
        transcaspia: '<div class="pp_keyword_token pp_transcaspia_icon"></div>',
    };
};
var substituteKeywords = function (_a) {
    var string = _a.string, args = _a.args, playerColor = _a.playerColor;
    return dojo.string.substitute(_(string), __assign(__assign({}, getKeywords({ playerColor: playerColor })), (args || {})));
};
var extractId = function (input) {
    return input.id;
};
var getArmy = function (token) { return (__assign(__assign({}, token), { coalition: token.id.split('_')[1], type: 'army' })); };
var getRoad = function (token) { return (__assign(__assign({}, token), { coalition: token.id.split('_')[1], type: 'road' })); };
var pxNumber = function (px) {
    if ((px || '').endsWith('px')) {
        return Number(px.slice(0, -2));
    }
    else {
        return 0;
    }
};
var getCoalitionForBlock = function (coalitionBlockId) { return coalitionBlockId.split('_')[1]; };
var InfoPanel = (function () {
    function InfoPanel(game) {
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setup({ gamedatas: gamedatas });
    }
    InfoPanel.prototype.clearInterface = function () { };
    InfoPanel.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
    };
    InfoPanel.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        var node = document.getElementById("player_boards");
        if (!node) {
            return;
        }
        node.insertAdjacentHTML("afterbegin", tplInfoPanel());
    };
    return InfoPanel;
}());
var tplInfoPanel = function () { return "\n<div class='player-board' id=\"info_panel\">\n  <div id=\"info_panel_buttons\">\n\n  </div>\n</div>"; };
var PPActiveEvents = (function () {
    function PPActiveEvents(game) {
        this.zoneId = 'pp_active_events';
        this.containerId = 'pp_active_events_container';
        this.game = game;
        dojo.place(tplActiveEvents(), 'pp_player_tableaus', 1);
        this.setupActiveEvents({ gamedatas: game.gamedatas });
    }
    PPActiveEvents.prototype.setupActiveEvents = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.zone = new LineStock(this.game.cardManager, document.getElementById(this.zoneId), {
            center: false,
        });
        var events = gamedatas.activeEvents || [];
        this.zone.addCards(events.map(function (token) { return _this.game.getCard(token); }));
        this.updateVisiblity();
        events.forEach(function (card) {
            _this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
        });
    };
    PPActiveEvents.prototype.clearInterface = function () {
        this.zone.removeAll();
        this.zone = undefined;
    };
    PPActiveEvents.prototype.makeVisible = function () {
        var node = dojo.byId(this.containerId);
        node.style.setProperty('margin-bottom', 'calc(var(--cardScale) * -75px)');
    };
    PPActiveEvents.prototype.hide = function () {
        var node = dojo.byId(this.containerId);
        node.style.setProperty('margin-bottom', 'calc(var(--cardScale) * -209px)');
    };
    PPActiveEvents.prototype.updateVisiblity = function () {
        if (this.zone.getCards().length > 0) {
            this.makeVisible();
        }
        else {
            this.hide();
        }
    };
    PPActiveEvents.prototype.addCardFromMarket = function (_a) {
        var cardId = _a.cardId, row = _a.row, column = _a.column;
        return __awaiter(this, void 0, void 0, function () {
            var isSpectator, playerIdTopTableau, player, originalZIndex;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.makeVisible();
                        isSpectator = this.game.framework().isSpectator;
                        playerIdTopTableau = !isSpectator ? this.game.getPlayerId() : this.game.gamedatas.paxPamirPlayerOrder[0];
                        player = this.game.playerManager.getPlayer({ playerId: playerIdTopTableau });
                        originalZIndex = player.elevateTableau();
                        return [4, Promise.all([
                                this.getZone().addCard(this.game.getCard({
                                    id: cardId,
                                    state: 0,
                                    used: 0,
                                    location: 'activeEvents',
                                })),
                            ])];
                    case 1:
                        _b.sent();
                        player.removeTableauElevation(originalZIndex);
                        return [2];
                }
            });
        });
    };
    PPActiveEvents.prototype.discardCard = function (_a) {
        var cardId = _a.cardId;
        return __awaiter(this, void 0, void 0, function () {
            var isSpectator, playerIdTopTableau, player, originalZIndex;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isSpectator = this.game.framework().isSpectator;
                        playerIdTopTableau = !isSpectator ? this.game.getPlayerId() : this.game.gamedatas.paxPamirPlayerOrder[0];
                        player = this.game.playerManager.getPlayer({ playerId: playerIdTopTableau });
                        originalZIndex = player.elevateTableau();
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1:
                        _b.sent();
                        player.removeTableauElevation(originalZIndex);
                        this.updateVisiblity();
                        return [2];
                }
            });
        });
    };
    PPActiveEvents.prototype.getZone = function () {
        return this.zone;
    };
    PPActiveEvents.prototype.hasCard = function (_a) {
        var cardId = _a.cardId;
        return this.zone.getCards().some(function (card) { return card.id === cardId; });
    };
    return PPActiveEvents;
}());
var tplCardTooltipContainer = function (_a) {
    var card = _a.card, content = _a.content;
    return "<div class=\"pp_card_tooltip\">\n  <div class=\"pp_card_tooltip_inner_container\">\n    ".concat(content, "\n  </div>\n  ").concat(card, "\n</div>");
};
var getImpactIconText = function (_a) {
    var impactIcon = _a.impactIcon;
    switch (impactIcon) {
        case IMPACT_ICON_ARMY:
            return _('Place one coalition block of your loyalty in this region. This piece is now an army.');
        case IMPACT_ICON_ROAD:
            return _('Place one coalition block of your loyalty on any border of this region. This piece is now a road.');
        case IMPACT_ICON_LEVERAGE:
            return _('Take two rupees from the bank. This card is leveraged.');
        case IMPACT_ICON_SPY:
            return _("Place one of your cylinders on a card in any player's court that matches the played card's region. This piece is now a spy.");
        case IMPACT_ICON_TRIBE:
            return _('Place one of your cylinders in this region. This piece is now a tribe.');
        case IMPACT_ICON_ECONOMIC_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_MILITARY_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_POLITICAL_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_INTELLIGENCE_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        default:
            return '';
    }
};
var tplTooltipImpactIcon = function (_a) {
    var impactIcon = _a.impactIcon, loyalty = _a.loyalty;
    var icon = '';
    switch (impactIcon) {
        case IMPACT_ICON_ARMY:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_army_".concat(loyalty || 'neutral', "\"></div>");
            break;
        case IMPACT_ICON_ROAD:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_road_".concat(loyalty || 'neutral', "\"></div>");
            break;
        case IMPACT_ICON_TRIBE:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_".concat(impactIcon, "\"></div>");
            break;
        case IMPACT_ICON_LEVERAGE:
        case IMPACT_ICON_SPY:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_".concat(impactIcon, "\"></div>");
            break;
        case IMPACT_ICON_ECONOMIC_SUIT:
        case IMPACT_ICON_MILITARY_SUIT:
        case IMPACT_ICON_POLITICAL_SUIT:
        case IMPACT_ICON_INTELLIGENCE_SUIT:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_suit ".concat(impactIcon, "\"></div>");
            break;
        default:
            break;
    }
    return "<div class=\"pp_card_tooltip_section_container\">\n            <div class=\"pp_card_tooltip_section_inner_container\">\n              ".concat(icon, "\n            </div>\n            <span class=\"pp_impact_icon_text\">").concat(getImpactIconText({ impactIcon: impactIcon }), "</span>\n          </div>");
};
var getCardActionText = function (_a) {
    var type = _a.type;
    switch (type) {
        case BATTLE:
            return _('At a single site (region or court card), remove any combination of enemy tribes, roads, spies or armies equal to rank. You cannot remove more units than you yourself have armies/spies in that battle.');
        case BETRAY:
            return _('Pay 2. Discard a card where you have a spy. You may take its prize.');
        case BUILD:
            return _('Pay 2/4/6 to place 1, 2 or 3 blocks in any region you rule (as an army) or on adjacent borders (as a road).');
        case GIFT:
            return _('Pay 2/4/6 to purchase 1st, 2nd or 3rd gift.');
        case MOVE:
            return _('For each rank, move one spy or army.');
        case TAX:
            return _('Take rupees from market cards. If you rule a region, may take from players with at least one card associated with that region.');
        default:
            return '';
    }
};
var tplTooltipCardAction = function (_a) {
    var type = _a.type, rank = _a.rank;
    return "<div class=\"pp_card_tooltip_section_container\">\n    <div class=\"pp_card_tooltip_section_inner_container\">\n      <div class=\"pp_tooltip_card_action pp_card_action_".concat(type, " pp_rank_").concat(rank, "\"></div>\n    </div>\n    <span class=\"pp_impact_icon_text\">").concat(getCardActionText({ type: type }), "</span>\n  </div>");
};
var tplCourtCardTooltip = function (_a) {
    var cardId = _a.cardId, cardInfo = _a.cardInfo, specialAbilities = _a.specialAbilities;
    var impactIcons = '';
    if (cardInfo.impactIcons.length > 0) {
        impactIcons += "<span class=\"pp_section_title\">".concat(_('Impact icons'), "</span>");
        new Set(cardInfo.impactIcons).forEach(function (icon) {
            impactIcons += tplTooltipImpactIcon({ impactIcon: icon, loyalty: cardInfo.loyalty });
        });
    }
    var cardActions = '';
    if (Object.values(cardInfo.actions).length > 0) {
        cardActions += "<span class=\"pp_section_title\">".concat(_('Card actions'), "</span>");
        Object.values(cardInfo.actions).forEach(function (_a) {
            var type = _a.type;
            cardActions += tplTooltipCardAction({ type: type, rank: cardInfo.rank });
        });
    }
    var specialAbility = '';
    if (cardInfo.specialAbility) {
        specialAbility = "<span class=\"pp_section_title\">".concat(_(specialAbilities[cardInfo.specialAbility].title), "</span>\n    <span class=\"pp_special_ability_text\">").concat(_(specialAbilities[cardInfo.specialAbility].description), "</span>\n    ");
    }
    return tplCardTooltipContainer({
        card: "<div class=\"pp_card_side pp_card_in_tooltip pp_".concat(cardId, "\"></div>"),
        content: "\n  <span class=\"pp_title\">".concat(_(cardInfo.name), "</span>\n  <span class=\"pp_flavor_text\">").concat(_(cardInfo.flavorText), "</span>\n  ").concat(impactIcons, "\n  ").concat(cardActions, "\n  ").concat(specialAbility, "\n  "),
    });
};
var tplEventCardTooltipDiscarded = function (_a) {
    var _b;
    var title = _a.title, description = _a.description, effect = _a.effect;
    if ([ECE_INTELLIGENCE_SUIT, ECE_MILITARY_SUIT, ECE_POLITICAL_SUIT].includes(effect)) {
        var eventEffectImpactIconMap = (_b = {},
            _b[ECE_INTELLIGENCE_SUIT] = IMPACT_ICON_INTELLIGENCE_SUIT,
            _b[ECE_MILITARY_SUIT] = IMPACT_ICON_MILITARY_SUIT,
            _b[ECE_POLITICAL_SUIT] = IMPACT_ICON_POLITICAL_SUIT,
            _b);
        var impactIcon = eventEffectImpactIconMap[effect];
        return tplTooltipImpactIcon({ impactIcon: impactIcon, loyalty: null });
    }
    else {
        return "<span class=\"pp_event_effect_text\" style=\"margin-bottom: 16px;\">".concat(_(description) || '', "</span>");
    }
};
var tplEventCardTooltip = function (_a) {
    var cardId = _a.cardId, cardInfo = _a.cardInfo;
    return tplCardTooltipContainer({
        card: "<div class=\"pp_card_side pp_card_in_tooltip pp_".concat(cardId, "\"></div>"),
        content: "\n    <span class=\"pp_title\">".concat(_('Event card'), "</span>\n    <span class=\"pp_flavor_text\">").concat(_("Each event card has two effects. The bottom effect is triggered if it is purchased by a player. The top effect is triggered if the card is automatically discarded during the cleanup phase at the end of a player's turn."), "</span>\n    <span class=\"pp_section_title\">").concat(_('If discarded: ')).concat(_(cardInfo.discarded.title) || '', "</span>\n     ").concat(tplEventCardTooltipDiscarded(cardInfo.discarded), " \n    <span class=\"pp_section_title\">").concat(cardId !== 'card_111' ? _('If purchased: ') : _('Until discarded: ')).concat(_(cardInfo.purchased.title) || '', "</span>\n    <span class=\"pp_event_effect_text\">").concat(_(cardInfo.purchased.description) || '', "</span>\n  "),
    });
};
var tplIconToolTip = function (_a) {
    var title = _a.title, text = _a.text, iconHtml = _a.iconHtml, iconWidth = _a.iconWidth;
    return "<div class=\"pp_icon_tooltip\">\n            <div class=\"pp_icon_tooltip_icon\"".concat(iconWidth ? "style=\"min-width: ".concat(iconWidth, "px;\"") : '', ">\n              ").concat(iconHtml, "\n            </div>\n            <div class=\"pp_icon_tooltip_content\">\n              ").concat(title ? "<span class=\"pp_tooltip_title\" >".concat(title, "</span>") : '', "\n              <span class=\"pp_tooltip_text\">").concat(text, "</span>\n            </div>\n          </div>");
};
var tplCylinderCountToolTip = function (_a) {
    var playerColor = _a.playerColor;
    return tplIconToolTip({
        iconHtml: "<div class=\"pp_icon pp_cylinder_icon pp_player_color_".concat(playerColor, "\"></div>"),
        title: _('CYLINDERS IN PLAY'),
        text: _('When a Dominance Check is unsuccessful, players will score points based on the number of cylinders they have in play (even zero).'),
    });
};
var tplRupeeCountToolTip = function () {
    return tplIconToolTip({
        iconHtml: "<div class=\"pp_icon pp_player_board_rupee\"></div>",
        title: _('RUPEES'),
        text: _('The number of rupees owned by this player.'),
    });
};
var tplHandCountCountToolTip = function () {
    return tplIconToolTip({
        iconHtml: "<div class=\"pp_icon pp_card_icon\"></div>",
        title: _('CARDS IN HAND'),
        text: _('The number of cards this player has in hand.'),
        iconWidth: 32,
    });
};
var tplInfluenceCountToolTip = function (_a) {
    var coalition = _a.coalition, _b = _a.black, black = _b === void 0 ? false : _b;
    return tplIconToolTip({
        iconHtml: "<div class=\"pp_icon pp_loyalty_icon".concat(black ? '_black' : '', " pp_").concat(coalition, "\"></div>"),
        title: _('LOYALTY AND INFLUENCE'),
        text: _('When a Dominance Check is successful, players loyal to the Dominant Coalition will score points based on their influence points. Each loyal player has one influence point plus the sum of their gifts, prizes, and the number of patriots in their court.'),
    });
};
var tplSuitToolTip = function (_a) {
    var suit = _a.suit;
    var SUIT_TITLE = {
        economic: _('TAX SHELTER'),
        intelligence: _('HAND SIZE'),
        military: _('FINAL TIES'),
        political: _('COURT SIZE'),
    };
    var SUIT_DESCRIPTION = {
        economic: _('The economic suit determines your tax shelter. Your tax shelter is equal to the number of Economic Stars in your court. Opponents may only tax rupees in excess of this.'),
        intelligence: _('The intelligence suit determines your hand size. Your hand size is equal to 2 plus the number of Intelligence Stars in your court. During cleanup, you must discard your hand down to this.'),
        military: _('The military suit is the final score tie-breaker. If final score is tied, the number of Military Stars in your court determines victory.'),
        political: _('The political suit determines your court size. Your court size is equal to 3 plus the number of Political Stars in your court. During cleanup, you must discard your court down to this.'),
    };
    return "<div class=\"pp_suit_tooltip\">\n            <div class=\"pp_icon pp_suit_icon ".concat(suit, "\" style=\"min-width: 44px; margin-left: -2px;\"></div>\n            <div class=\"pp_suit_tooltip_content\">  \n              <span class=\"pp_tooltip_title\" >").concat(SUIT_TITLE[suit], "</span>\n              <span class=\"pp_tooltip_text\">").concat(SUIT_DESCRIPTION[suit], "</span>\n            </div>\n          </div>");
};
var tplFavoredSuitMarkerToolTip = function () {
    var title = _('FAVORED SUIT MARKER');
    var text = _('This marker is on the currently favored suit. This suit determines which cards take bonus actions and makes cards more expensive when the favored suit is military.');
    return "<div class=\"pp_suit_tooltip\">\n            <div class=\"pp_favored_suit_marker\" style=\"min-width: 30px; background-position: center; margin-left: -4px;\"></div>\n            <div class=\"pp_suit_tooltip_content\">  \n              <span class=\"pp_tooltip_title\" >".concat(title, "</span>\n              <span class=\"pp_tooltip_text\">").concat(text, "</span>\n            </div>\n          </div>");
};
var tplMarketMilitaryCostToolTip = function () {
    var title = _('CARD COST DOUBLED');
    var text = _('Because military cards are favored the cost to purchase cards is currently doubled. Two rupees are placed on each card instead of one.');
    return "<div class=\"pp_suit_tooltip\">\n            <div class=\"pp_military_cost_icon\" style=\"min-width: 53px; margin-right: 4px;\"></div>\n            <div class=\"pp_suit_tooltip_content\">  \n            <span class=\"pp_tooltip_title\" >".concat(title, "</span>\n              <span class=\"pp_tooltip_text\">").concat(text, "</span>\n            </div>\n          </div>");
};
var tplVirtualScoresTooltip = function () {
    return "\n    <div class=\"pp_virtual_score_tooltip\">\n      <span class=\"pp_tooltip_title\" >".concat(_('Victory'), "</span>\n      <span class=\"pp_tooltip_text\">").concat(_('description'), "</span>\n    </div>\n  ");
};
var tplWakhanCardTooltip = function (_a) {
    var _b, _c;
    var wakhanDeckCardId = _a.wakhanDeckCardId, wakhanDiscardCardId = _a.wakhanDiscardCardId, game = _a.game;
    var WAKHAN_ARROW_DESCRIPTION = (_b = {},
        _b[BOTTOM_RIGHT] = _('Bottom (right)'),
        _b[TOP_LEFT] = _('Top (left)'),
        _b);
    var WAKHAN_ACTION_DESCRIPTION = (_c = {},
        _c[BATTLE] = _('Battle'),
        _c[BETRAY] = _('Betray'),
        _c[BUILD] = _('Build'),
        _c[GIFT] = _('Gift'),
        _c[MOVE] = _('Move'),
        _c[TAX] = _('Tax'),
        _c[RADICALIZE] = _('Radicalize'),
        _c[RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY] = _('If military cards are favored, radicalize the highest ranked military card'),
        _c[RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC] = _('If political cards are favored, radicalize the highest ranked economic card'),
        _c[RADICALIZE_HIGHEST_RANKED_POLITICAL] = _('Radicalize the highest ranked political card'),
        _c[RADICALIZE_HIGHEST_RANKED_INTELLIGENCE] = _('Radicalize the highest ranked intelligence card'),
        _c[RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES] = _('If Wakhan has fewer than 2 Rupees, radicalize the card that will net the most rupees'),
        _c[RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION] = _('Radicalize a card that will gain Wakhan control of a region'),
        _c[RADICALIZE_INTELLIGENCE] = _('Radicalize an intelligence card'),
        _c[RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS] = _('Radicalize the card that would place most armies and/or roads'),
        _c[RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS] = _('If no coalition has dominance, radicalize the card that would place the most spies and/or tribes'),
        _c[RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION] = _('If Wakhan has no card with the move action, radicalize a card with the move action'),
        _c[RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT] = _('If a coalition has dominance radicalize a matching patriot'),
        _c[RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL] = _("If Wakhan's court size is at its limit, radicalize the highest ranked political card"),
        _c[RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE] = _('If Wakhan has fewer spies than another player then radicalize the highest ranked intelligence card'),
        _c[BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY] = _('Battle on the highest priority court card with the most spies where Wakhan also has at least one spy'),
        _c);
    var topOfDeck = game.getWakhanCardInfo({ wakhanCardId: wakhanDeckCardId }).back;
    var topOfDiscard = game.getWakhanCardInfo({ wakhanCardId: wakhanDiscardCardId }).front;
    return tplCardTooltipContainer({
        card: "<div class=\"pp_wakhan_card_in_tooltip pp_".concat(wakhanDiscardCardId, "_front\"></div>"),
        content: "\n    <span class=\"pp_title\">".concat(_('AI card'), "</span>\n    <span class=\"pp_flavor_text\">").concat(_('Each turn Wakhan draws an AI card. The face-up card and the back of the card on top of the draw deck are used to make decisions for Wakhan.'), "</span>\n    <span class=\"pp_section_title\">").concat(_('Pragmatic Loyalty'), "</span>\n    <div style=\"display: flex; flex-direction: row;\">\n      ").concat(topOfDiscard.pragmaticLoyalty.map(function (coalition) { return "<div class=\"pp_wakhan_icon pp_".concat(coalition, "\"></div>"); }).join(''), "\n    </div>\n    <span class=\"pp_section_title\">").concat(_("Wakhan's Actions"), "</span>\n    ").concat(topOfDiscard.actions
            .map(function (action) { return "<span class=\"pp_tooltip_text pp_wakhan_action\">".concat(WAKHAN_ACTION_DESCRIPTION[action], "</span>"); })
            .join(''), "\n    <span class=\"pp_section_title\">").concat(_('Arrows'), "</span>\n    <div style=\"display: flex; flex-direction: row; justify-content: space-evenly;\">\n      <div style=\"display: flex; flex-direction: row; align-items: center;\">\n        <span class=\"pp_section_title\" style=\"margin: 0px;\">").concat(WAKHAN_ARROW_DESCRIPTION[topOfDeck.rowSide[topOfDiscard.rowSideArrow]], "</span>\n        <div class=\"pp_wakhan_icon pp_red_arrow\" style=\"margin-left: -6px;\"></div>\n      </div>\n      <div style=\"display: flex; flex-direction: row; align-items: center;\">\n        <span class=\"pp_title\" style=\"margin: 0px; font-size: xx-large;\">").concat(topOfDeck.columnNumbers[topOfDiscard.columnArrow], "</span>\n        <div class=\"pp_wakhan_icon pp_black_arrow\" style=\"margin-left: 6px;\"></div>\n      </div>\n    </div>\n    <span class=\"pp_section_title\">").concat(_('Region Priority'), "</span>\n    <div style=\"display: flex; flex-direction: row;\">\n      ").concat(topOfDiscard.regionOrder.map(function (region) { return "<div class=\"pp_wakhan_icon pp_region_icon pp_".concat(region, "\"></div>"); }).join(''), "\n    </div>\n    "),
    });
};
var PPTooltipManager = (function () {
    function PPTooltipManager(game) {
        this.idRegex = /id="[a-z]*_[0-9]*_[0-9]*"/;
        this.game = game;
    }
    PPTooltipManager.prototype.addPlayerIconToolTips = function (_a) {
        var playerColor = _a.playerColor, playerId = _a.playerId;
        this.game.framework().addTooltipHtml("cylinders_".concat(playerId), tplCylinderCountToolTip({ playerColor: playerColor }), 500);
        this.game.framework().addTooltipHtml("rupees_".concat(playerId), tplRupeeCountToolTip(), 500);
        if (playerId !== WAKHAN_PLAYER_ID) {
            this.game.framework().addTooltipHtml("cards_".concat(playerId), tplHandCountCountToolTip(), 500);
        }
    };
    PPTooltipManager.prototype.setupFavoredSuitMarkerTooltip = function () {
        var html = tplFavoredSuitMarkerToolTip();
        this.game.framework().addTooltipHtml('favored_suit_marker', html, 500);
    };
    PPTooltipManager.prototype.addSuitTooltip = function (_a) {
        var suit = _a.suit, nodeId = _a.nodeId;
        var html = tplSuitToolTip({ suit: suit });
        this.game.framework().addTooltipHtml(nodeId, html, 500);
    };
    PPTooltipManager.prototype.addInfluenceCountTooltip = function (_a) {
        var playerId = _a.playerId, coalition = _a.coalition;
        this.game.framework().addTooltipHtml("loyalty_icon_".concat(playerId), tplInfluenceCountToolTip({ coalition: coalition }), 500);
    };
    PPTooltipManager.prototype.removeInfluenceCountTooltip = function (_a) {
        var playerId = _a.playerId;
        this.removeTooltip("loyalty_icon_".concat(playerId));
    };
    PPTooltipManager.prototype.addMiltiarySuitIndicatorMarketTooltip = function () {
        var html = tplMarketMilitaryCostToolTip();
        this.game.framework().addTooltipHtml('pp_market_board_military_suit_icon', html, 500);
    };
    PPTooltipManager.prototype.removeMiltiarySuitIndicatorMarketTooltip = function () {
        this.removeTooltip('pp_market_board_military_suit_icon');
    };
    PPTooltipManager.prototype.addWakhanInfluenceCountTooltips = function (_a) {
        var _this = this;
        var pragmaticLoyalty = _a.pragmaticLoyalty;
        COALITIONS.forEach(function (coalition) {
            _this.game.framework().addTooltipHtml("loyalty_icon_1_".concat(coalition), tplInfluenceCountToolTip({ coalition: coalition, black: coalition !== pragmaticLoyalty }), 500);
        });
    };
    PPTooltipManager.prototype.removeWakhanInfluenceCountTooltips = function () {
        var _this = this;
        COALITIONS.forEach(function (coalition) {
            _this.removeTooltip("loyalty_icon_1_".concat(coalition));
        });
    };
    PPTooltipManager.prototype.addTextToolTip = function (_a) {
        var nodeId = _a.nodeId, text = _a.text;
        this.game.framework().addTooltip(nodeId, _(text), '', 500);
    };
    PPTooltipManager.prototype.addTooltipToCard = function (_a) {
        var cardId = _a.cardId, _b = _a.cardIdSuffix, cardIdSuffix = _b === void 0 ? '' : _b;
        var cardInfo = this.game.getCardInfo(cardId);
        if (cardInfo.type === COURT_CARD) {
            var html = tplCourtCardTooltip({ cardId: cardId, cardInfo: cardInfo, specialAbilities: this.game.gamedatas.staticData.specialAbilities });
            this.game.framework().addTooltipHtml("".concat(cardId).concat(cardIdSuffix), html, 500);
        }
        else {
            var html = tplEventCardTooltip({ cardId: cardId, cardInfo: cardInfo });
            this.game.framework().addTooltipHtml("".concat(cardId).concat(cardIdSuffix), html, 500);
        }
    };
    PPTooltipManager.prototype.addWakhanCardTooltip = function (_a) {
        var wakhanDeckCardId = _a.wakhanDeckCardId, wakhanDiscardCardId = _a.wakhanDiscardCardId;
        var html = tplWakhanCardTooltip({ wakhanDeckCardId: wakhanDeckCardId, wakhanDiscardCardId: wakhanDiscardCardId, game: this.game });
        this.game.framework().addTooltipHtml("pp_wakhan_deck", html, 500);
        this.game.framework().addTooltipHtml("pp_wakhan_discard", html, 500);
    };
    PPTooltipManager.prototype.removeTooltip = function (nodeId) {
        this.game.framework().removeTooltip(nodeId);
    };
    PPTooltipManager.prototype.checkLogTooltip = function (lastNotif) {
        var _this = this;
        var _a;
        if (!((_a = lastNotif === null || lastNotif === void 0 ? void 0 : lastNotif.msg) === null || _a === void 0 ? void 0 : _a.args)) {
            return;
        }
        Object.keys(lastNotif.msg.args).forEach(function (key) {
            var _a, _b;
            if (!(key.startsWith('logTokenLargeCard') || key.startsWith('tkn_largeCard'))) {
                return;
            }
            var id = (_b = (_a = _this.idRegex.exec(lastNotif.msg.args[key])) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.slice(0, -1).slice(4);
            if (!id || !id.startsWith('card_')) {
                return;
            }
            var splitId = id.split('_');
            var cardId = "".concat(splitId[0], "_").concat(splitId[1]);
            var cardIdSuffix = "_".concat(Number(splitId[2]) + 1);
            _this.addTooltipToCard({ cardId: cardId, cardIdSuffix: cardIdSuffix });
        });
    };
    PPTooltipManager.prototype.setupTooltips = function () {
        this.setupCardCounterTooltips();
        this.setupFavoredSuitMarkerTooltip();
    };
    PPTooltipManager.prototype.setupCardCounterTooltips = function () {
        this.game.framework().addTooltip('pp_deck_counter_container', _('Total number of cards in the deck'), '', 500);
        this.game
            .framework()
            .addTooltip('pp_deck_counter_dominance_check_container', _('Number of Dominance Check cards in the deck'), '', 500);
        this.game.framework().addTooltip('pp_discard_pile_counter_container', _('Total number of cards in the discard pile'), '', 500);
        this.game
            .framework()
            .addTooltip('pp_discard_pile_counter_dominance_check_container', _('Number of Dominance Check cards in the discard pile'), '', 500);
    };
    return PPTooltipManager;
}());
var DiscardPile = (function () {
    function DiscardPile(_a) {
        var game = _a.game, containerId = _a.containerId;
        this.visibleCardId = undefined;
        this.game = game;
        this.containterId = containerId;
        this.setup({ gamedatas: game.gamedatas });
    }
    DiscardPile.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        var discardPileTitle = $('pp_discard_pile_title');
        if (!discardPileTitle) {
            var discardPile = $('pp_discard_pile');
            discardPile.insertAdjacentHTML('afterbegin', "<span id=\"pp_discard_pile_title\">".concat(_('Discard'), "</span>"));
        }
        this.stock = new VoidStock(this.game.cardManager, document.getElementById(this.containterId));
        if (gamedatas.discardPile.topCard) {
            this.setVisibleCard({ cardId: gamedatas.discardPile.topCard.id });
        }
    };
    DiscardPile.prototype.clearInterface = function () {
        if (this.visibleCardId) {
            var node = $(this.containterId);
            node.classList.remove("pp_".concat(this.visibleCardId));
            node.style.opacity = "0";
            this.visibleCardId = undefined;
        }
    };
    DiscardPile.prototype.setVisibleCard = function (_a) {
        var cardId = _a.cardId;
        var node = $(this.containterId);
        if (this.visibleCardId) {
            node.classList.replace("pp_".concat(this.visibleCardId), "pp_".concat(cardId));
        }
        else {
            node.classList.add("pp_".concat(cardId));
            node.style.opacity = "1";
        }
        this.visibleCardId = cardId;
    };
    DiscardPile.prototype.discardCardFromLocation = function (_a) {
        var cardId = _a.cardId, from = _a.from;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.stock.addCard({
                            id: cardId,
                        }, { fromElement: document.getElementById(from) })];
                    case 1:
                        _b.sent();
                        this.setVisibleCard({ cardId: cardId });
                        this.game.objectManager.incCardCounter({ cardId: cardId, location: 'discardPile' });
                        return [2];
                }
            });
        });
    };
    DiscardPile.prototype.discardCardFromZone = function (cardId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.stock.addCard({
                            id: cardId,
                        })];
                    case 1:
                        _a.sent();
                        this.setVisibleCard({ cardId: cardId });
                        this.game.objectManager.incCardCounter({ cardId: cardId, location: 'discardPile' });
                        return [2];
                }
            });
        });
    };
    return DiscardPile;
}());
var TempDiscardPile = (function () {
    function TempDiscardPile(_a) {
        var game = _a.game;
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    TempDiscardPile.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        this.zone = new LineStock(this.game.cardManager, document.getElementById('pp_temp_discarded_card'), { center: false });
        if (gamedatas.tempDiscardPile) {
            this.zone.addCard(__assign(__assign({}, gamedatas.tempDiscardPile), this.game.getCardInfo(gamedatas.tempDiscardPile.id)));
        }
    };
    TempDiscardPile.prototype.clearInterface = function () {
        this.zone.removeAll();
        this.zone = undefined;
    };
    TempDiscardPile.prototype.getZone = function () {
        return this.zone;
    };
    return TempDiscardPile;
}());
var FavoredSuit = (function () {
    function FavoredSuit(_a) {
        var game = _a.game;
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    FavoredSuit.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.favoredSuitZones = {};
        Object.keys(this.game.gamedatas.staticData.suits).forEach(function (suit) {
            _this.favoredSuitZones[suit] = new LineStock(_this.game.favoredSuitMarkerManager, document.getElementById("pp_favored_suit_".concat(suit)));
        });
        this.favoredSuit = gamedatas.favoredSuit;
        this.favoredSuitZones[this.favoredSuit].addCard({
            id: 'favored_suit_marker',
            location: '',
            state: 0,
            used: 0,
        });
        this.game.market.setMilitarySuitIndicatorVisible({ visible: this.favoredSuit === MILITARY });
    };
    FavoredSuit.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.favoredSuitZones).forEach(function (key) {
            _this.favoredSuitZones[key].removeAll();
            _this.favoredSuitZones[key] = undefined;
        });
    };
    FavoredSuit.prototype.getFavoredSuitZone = function (_a) {
        var suit = _a.suit;
        return this.favoredSuitZones[suit];
    };
    FavoredSuit.prototype.get = function () {
        return this.favoredSuit;
    };
    FavoredSuit.prototype.changeTo = function (_a) {
        var suit = _a.suit;
        return __awaiter(this, void 0, void 0, function () {
            var currentSuit;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentSuit = this.favoredSuit;
                        this.favoredSuit = suit;
                        if (currentSuit === MILITARY) {
                            this.game.market.setMilitarySuitIndicatorVisible({ visible: false });
                        }
                        return [4, this.favoredSuitZones[suit].addCard({
                                id: 'favored_suit_marker',
                                location: '',
                                state: 0,
                                used: 0,
                            })];
                    case 1:
                        _b.sent();
                        if (this.favoredSuit === MILITARY) {
                            this.game.market.setMilitarySuitIndicatorVisible({ visible: true });
                        }
                        return [2];
                }
            });
        });
    };
    return FavoredSuit;
}());
var Supply = (function () {
    function Supply(_a) {
        var game = _a.game;
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    Supply.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.coalitionBlocks = {};
        COALITIONS.forEach(function (coalition) {
            _this.coalitionBlocks[coalition] = new LineStock(_this.game.coalitionBlockManager, document.getElementById("pp_".concat(coalition, "_coalition_blocks")), { center: false });
            _this.coalitionBlocks[coalition].addCards(gamedatas.coalitionBlocks[coalition].map(function (token) { return (__assign(__assign({}, token), { type: 'supply', coalition: coalition })); }));
        });
        this.checkDominantCoalition();
    };
    Supply.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.coalitionBlocks).forEach(function (key) {
            _this.coalitionBlocks[key].removeAll();
            _this.coalitionBlocks[key] = undefined;
        });
    };
    Supply.prototype.getCoalitionBlocksZone = function (_a) {
        var coalition = _a.coalition;
        return this.coalitionBlocks[coalition];
    };
    Supply.prototype.checkDominantCoalition = function () {
        debug('checkDominantCoalition');
        var coalitions = [
            {
                coalition: AFGHAN,
                supplyCount: this.coalitionBlocks[AFGHAN].getCards().length,
            },
            {
                coalition: BRITISH,
                supplyCount: this.coalitionBlocks[BRITISH].getCards().length,
            },
            {
                coalition: RUSSIAN,
                supplyCount: this.coalitionBlocks[RUSSIAN].getCards().length,
            },
        ];
        var isConflictFatigueActive = this.game.playerManager
            .getPlayers()
            .some(function (player) { return player.ownsEventCard({ cardId: ECE_CONFLICT_FATIGUE_CARD_ID }); });
        var requiredDifferenceToBeDominant = isConflictFatigueActive ? 2 : 4;
        coalitions.sort(function (a, b) { return a.supplyCount - b.supplyCount; });
        var node = $('pp_dominant_coalition_banner');
        if (coalitions[1].supplyCount - coalitions[0].supplyCount >= requiredDifferenceToBeDominant) {
            var dominantCoalition = coalitions[0].coalition;
            var log = _('Dominant coalition: ${tkn_coalitionBlack}');
            node.innerHTML = this.game.format_string_recursive(log, {
                tkn_coalitionBlack: dominantCoalition,
            });
            node.classList.remove(PP_AFGHAN, PP_BRITISH, PP_RUSSIAN);
            node.classList.add("pp_".concat(dominantCoalition));
        }
        else {
            node.innerHTML = _('No dominant coalition');
            node.classList.remove(PP_AFGHAN, PP_BRITISH, PP_RUSSIAN);
        }
    };
    return Supply;
}());
var VpTrack = (function () {
    function VpTrack(_a) {
        var game = _a.game;
        this.game = game;
        this.setupVpTrack({ gamedatas: game.gamedatas });
    }
    VpTrack.prototype.clearInterface = function () {
        for (var i = 0; i <= 23; i++) {
            this.vpTrackZones[i].removeAll();
            this.vpTrackZones[i] = undefined;
        }
    };
    VpTrack.prototype.setupVpTrack = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.vpTrackZones = {};
        for (var i = 0; i <= 23; i++) {
            this.vpTrackZones[i] = new TokenManualPositionStock(this.game.cylinderManager, document.getElementById("pp_vp_track_".concat(i)), {}, function (element, cards, lastCard, stock) {
                return updateZoneDislay(_this.customPatternVpTrack, element, cards, lastCard, stock);
            });
        }
        for (var playerId in gamedatas.paxPamirPlayers) {
            var player = gamedatas.paxPamirPlayers[playerId];
            var zone = this.getZone(player.score);
            zone.addCard({
                id: "vp_cylinder_".concat(playerId),
                color: player.color,
                state: 0,
                used: 0,
                location: "vp_track_".concat(player.score),
            });
        }
    };
    VpTrack.prototype.getZone = function (score) {
        return this.vpTrackZones[score];
    };
    VpTrack.prototype.customPatternVpTrack = function (_a) {
        var i = _a.index, numberOfItems = _a.itemCount;
        switch (i) {
            case 0:
                return { x: 9, y: -16, w: 40, h: 27 };
            case 1:
                return { x: -16, y: 4, w: 40, h: 27 };
            case 2:
                return { x: 36, y: 0, w: 40, h: 27 };
            case 3:
                return { x: 0, y: 34, w: 40, h: 27 };
            case 4:
                return { x: 30, y: 30, w: 40, h: 27 };
        }
    };
    return VpTrack;
}());
var ObjectManager = (function () {
    function ObjectManager(game) {
        this.counters = {
            deck: {
                cards: new ebg.counter(),
                dominanceCheckCards: new ebg.counter(),
            },
            discardPile: {
                cards: new ebg.counter(),
                dominanceCheckCards: new ebg.counter(),
            },
        };
        this.game = game;
        this.discardPile = new DiscardPile({ game: game, containerId: 'pp_pile_discarded_card' });
        this.tempDiscardPile = new TempDiscardPile({ game: game });
        this.favoredSuit = new FavoredSuit({ game: game });
        this.supply = new Supply({ game: game });
        this.vpTrack = new VpTrack({ game: game });
        this.setupCardCounters({ gamedatas: game.gamedatas });
    }
    ObjectManager.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
        this.discardPile.setup({ gamedatas: gamedatas });
        this.favoredSuit.setup({ gamedatas: gamedatas });
        this.supply.setup({ gamedatas: gamedatas });
        this.tempDiscardPile.setup({ gamedatas: gamedatas });
        this.vpTrack.setupVpTrack({ gamedatas: gamedatas });
        this.updateCardCounters({ gamedatas: gamedatas });
    };
    ObjectManager.prototype.clearInterface = function () {
        this.discardPile.clearInterface();
        this.favoredSuit.clearInterface();
        this.supply.clearInterface();
        this.tempDiscardPile.clearInterface();
        this.vpTrack.clearInterface();
    };
    ObjectManager.prototype.setupCardCounters = function (_a) {
        var gamedatas = _a.gamedatas;
        this.counters.deck.cards.create('pp_deck_counter');
        this.counters.deck.dominanceCheckCards.create('pp_deck_counter_dominance_check');
        this.counters.discardPile.cards.create('pp_discard_pile_counter');
        this.counters.discardPile.dominanceCheckCards.create('pp_discard_pile_counter_dominance_check');
        this.updateCardCounters({ gamedatas: gamedatas });
    };
    ObjectManager.prototype.updateCardCounters = function (_a) {
        var gamedatas = _a.gamedatas;
        this.counters.deck.cards.setValue(gamedatas.deck.cardCount);
        this.counters.deck.dominanceCheckCards.setValue(gamedatas.deck.dominanceCheckCount);
        this.counters.discardPile.cards.setValue(gamedatas.discardPile.cardCount);
        this.counters.discardPile.dominanceCheckCards.setValue(gamedatas.discardPile.dominanceCheckCount);
    };
    ObjectManager.prototype.incCardCounter = function (_a) {
        var cardId = _a.cardId, location = _a.location;
        var cardInfo = this.game.getCardInfo(cardId);
        var isDominanceCheck = cardInfo.type === EVENT_CARD && cardInfo.discarded.effect === ECE_DOMINANCE_CHECK;
        var increase = location === 'deck' ? -1 : 1;
        this.game.objectManager.counters[location].cards.incValue(increase);
        if (isDominanceCheck) {
            this.game.objectManager.counters[location].dominanceCheckCards.incValue(increase);
        }
    };
    return ObjectManager;
}());
var PPPlayer = (function () {
    function PPPlayer(_a) {
        var game = _a.game, player = _a.player;
        this.gifts = {};
        this.counters = {
            cards: new ebg.counter(),
            cardsTableau: new ebg.counter(),
            courtCount: new ebg.counter(),
            courtLimit: new ebg.counter(),
            cylinders: new ebg.counter(),
            economic: new ebg.counter(),
            handCount: new ebg.counter(),
            handLimit: new ebg.counter(),
            influence: new ebg.counter(),
            intelligence: new ebg.counter(),
            military: new ebg.counter(),
            political: new ebg.counter(),
            rupees: new ebg.counter(),
            rupeesTableau: new ebg.counter(),
        };
        this.game = game;
        var playerId = player.id;
        this.playerId = Number(playerId);
        this.playerName = player.name;
        this.playerColor = player.color;
        this.playerHexColor = player.hexColor;
        var gamedatas = game.gamedatas;
        if (this.playerId === this.game.getPlayerId()) {
            dojo.place(tplPlayerHand({ playerId: this.playerId, playerName: this.playerName }), 'pp_player_tableaus', 1);
        }
        this.setupPlayer({ gamedatas: gamedatas });
    }
    PPPlayer.prototype.updatePlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.paxPamirPlayers[this.playerId];
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupEvents({ playerGamedatas: playerGamedatas });
        this.setupPrizes({ playerGamedatas: playerGamedatas });
        this.setupCylinders({ playerGamedatas: playerGamedatas });
        this.setupGifts({ playerGamedatas: playerGamedatas });
        this.setupRulerTokens({ gamedatas: gamedatas });
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
        if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null') {
            this.updatePlayerLoyalty({ coalition: playerGamedatas.loyalty });
        }
        if (this.game.gameOptions.openHands && this.playerId !== WAKHAN_PLAYER_ID) {
            this.setupHand({ hand: playerGamedatas.hand });
            if (this.modal.isDisplayed()) {
                this.updateModalContent();
            }
        }
    };
    PPPlayer.prototype.setupPlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.paxPamirPlayers[this.playerId];
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupEvents({ playerGamedatas: playerGamedatas });
        if (this.playerId !== WAKHAN_PLAYER_ID) {
            this.setupHand({ hand: playerGamedatas.hand });
        }
        this.setupPrizes({ playerGamedatas: playerGamedatas });
        this.setupCylinders({ playerGamedatas: playerGamedatas });
        this.setupGifts({ playerGamedatas: playerGamedatas });
        this.setupRulerTokens({ gamedatas: gamedatas });
        this.setupPlayerPanel({ playerGamedatas: playerGamedatas });
        if (this.game.gameOptions.openHands && this.playerId !== WAKHAN_PLAYER_ID) {
            this.setupPlayerHandModal();
        }
        if (this.playerId === WAKHAN_PLAYER_ID && gamedatas.wakhanCards) {
            this.setupWakhanDeck({ wakhanCards: gamedatas.wakhanCards });
        }
    };
    PPPlayer.prototype.setupAdjacentPlayerColors = function () {
        var _a, _b;
        var previousPlayerColor = (_a = this.game.playerManager.getPreviousPlayer({ playerId: this.playerId })) === null || _a === void 0 ? void 0 : _a.getColor();
        var nodePrevious = $("pp_player_to_left_of_".concat(this.playerId));
        if (nodePrevious && previousPlayerColor) {
            nodePrevious.childNodes.forEach(function (element) {
                if (element instanceof HTMLElement) {
                    element.dataset.color = previousPlayerColor;
                }
            });
        }
        var nextPlayerColor = (_b = this.game.playerManager.getNextPlayer({ playerId: this.playerId })) === null || _b === void 0 ? void 0 : _b.getColor();
        var nodeNext = $("pp_player_to_right_of_".concat(this.playerId));
        if (nodeNext && nextPlayerColor) {
            nodeNext.childNodes.forEach(function (element) {
                if (element instanceof HTMLElement) {
                    element.dataset.color = nextPlayerColor;
                }
            });
        }
    };
    PPPlayer.prototype.getHandCards = function () {
        return this.handCards;
    };
    PPPlayer.prototype.updateModalContent = function () {
        var _this = this;
        debug('update modal content');
        this.modal.updateContent(tplPlayerHandModal({
            cards: this.handCards,
        }));
        this.handCards.forEach(function (cardId) {
            _this.game.tooltipManager.addTooltipToCard({ cardId: cardId, cardIdSuffix: '_modal' });
        });
    };
    PPPlayer.prototype.updateModalContentAndOpen = function () {
        this.updateModalContent();
        this.modal.show();
    };
    PPPlayer.prototype.setupPlayerHandModal = function () {
        var _this = this;
        if (this.isWakhan()) {
            return;
        }
        this.modal = new Modal("player_hand_".concat(this.playerId), {
            class: 'pp_player_hand_popin',
            closeIcon: 'fa-times',
            openAnimation: true,
            openAnimationTarget: "cards_".concat(this.playerId),
            titleTpl: '<h2 id="popin_${id}_title" class="${class}_title pp_player_background_color_' + this.playerColor + '">${title}</h2>',
            title: dojo.string.substitute(_("${playerName}'s hand"), {
                playerName: this.playerName,
            }),
            contents: tplPlayerHandModal({
                cards: this.handCards,
            }),
            closeAction: 'hide',
            verticalAlign: 'flex-start',
            breakpoint: 1020,
        });
        dojo.connect($("cards_tableau_".concat(this.playerId)), 'onclick', function () { return _this.updateModalContentAndOpen(); });
        dojo.connect($("cards_".concat(this.playerId)), 'onclick', function () { return _this.updateModalContentAndOpen(); });
    };
    PPPlayer.prototype.setupCourt = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.court = new LineStock(this.game.cardManager, document.getElementById("pp_court_player_".concat(this.playerId)), {
                            gap: '8px',
                            sort: sortFunction('state'),
                        });
                        return [4, this.court.addCards(playerGamedatas.court.cards.map(function (data) { return (__assign(__assign({}, data), _this.game.getCardInfo(data.id))); }))];
                    case 1:
                        _b.sent();
                        playerGamedatas.court.cards.map(function (card) { return __awaiter(_this, void 0, void 0, function () {
                            var cardId;
                            var _this = this;
                            return __generator(this, function (_a) {
                                cardId = card.id;
                                this.game.spies[cardId].addCards((playerGamedatas.court.spies[cardId] || []).map(function (token) { return (__assign(__assign({}, token), { color: _this.game.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color })); }));
                                return [2];
                            });
                        }); });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.setupEvents = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.events = new LineStock(this.game.cardManager, document.getElementById("player_tableau_events_".concat(this.playerId)), {
            center: false,
            gap: '8px',
        });
        var node = dojo.byId("pp_player_events_container_".concat(this.playerId));
        if (playerGamedatas.events.length > 0) {
            node.style.marginTop = 'calc(var(--cardScale) * -57px)';
        }
        else {
            node.style.marginTop = 'calc(var(--cardScale) * -209px)';
        }
        this.events.addCards(playerGamedatas.events.map(function (token) { return (__assign(__assign({}, token), _this.game.getCardInfo(token.id))); }));
    };
    PPPlayer.prototype.setupCylinders = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        this.cylinders = new LineStock(this.game.cylinderManager, document.getElementById("pp_cylinders_player_".concat(this.playerId)), {
            center: false,
            gap: '0px',
            sort: sortFunction('state'),
        });
        this.cylinders.addCards(playerGamedatas.cylinders.map(function (cylinder) { return (__assign(__assign({}, cylinder), { color: playerGamedatas.color })); }));
    };
    PPPlayer.prototype.setupGifts = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        ['2', '4', '6'].forEach(function (value) {
            _this.gifts[value] = new LineStock(_this.game.cylinderManager, document.getElementById("pp_gift_".concat(value, "_zone_").concat(_this.playerId)));
        });
        var playerGifts = playerGamedatas.gifts;
        Object.keys(playerGifts).forEach(function (giftValue) {
            Object.keys(playerGifts[giftValue]).forEach(function (cylinderId) {
                _this.gifts[giftValue].addCard(_this.game.getCylinder({
                    id: cylinderId,
                    state: 0,
                    used: 0,
                    location: "gifts_".concat(_this.playerId),
                }));
            });
        });
    };
    PPPlayer.prototype.clearHand = function () {
        this.handCards = [];
        if (this.playerId === this.game.getPlayerId()) {
            this.hand.removeAll();
            this.hand = undefined;
        }
    };
    PPPlayer.prototype.setupHand = function (_a) {
        var _this = this;
        var hand = _a.hand;
        if (this.game.gameOptions.openHands) {
            this.handCards = hand.map(function (token) { return token.id; });
        }
        if (!(this.playerId === this.game.getPlayerId())) {
            return;
        }
        this.hand = new LineStock(this.game.cardManager, document.getElementById('pp_player_hand_cards'), {
            center: false,
        });
        this.hand.addCards(hand.map(function (token) { return (__assign(__assign({}, token), _this.game.getCardInfo(token.id))); }));
    };
    PPPlayer.prototype.setupPlayerPanel = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        var player_board_div = $('player_board_' + this.playerId);
        dojo.place(tplPlayerBoard({ playerId: this.playerId }), player_board_div);
        $("cylinders_".concat(this.playerId)).classList.add("pp_player_color_".concat(this.playerColor));
        if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null') {
            this.updatePlayerLoyalty({ coalition: playerGamedatas.loyalty });
        }
        SUITS.forEach(function (suit) {
            _this.game.tooltipManager.addSuitTooltip({ suit: suit, nodeId: "pp_".concat(suit, "_icon_").concat(_this.playerId) });
        });
        this.counters.cards.create("card_count_".concat(this.playerId, "_counter"));
        this.counters.cardsTableau.create("card_count_tableau_".concat(this.playerId, "_counter"));
        this.counters.courtCount.create("pp_court_count_".concat(this.playerId));
        this.counters.courtLimit.create("pp_court_limit_".concat(this.playerId));
        this.game.tooltipManager.addSuitTooltip({ suit: 'political', nodeId: "pp_player_court_size_".concat(this.playerId) });
        this.counters.cylinders.create("cylinder_count_".concat(this.playerId, "_counter"));
        this.counters.economic.create("economic_".concat(this.playerId, "_counter"));
        this.counters.influence.create("influence_".concat(this.playerId, "_counter"));
        this.counters.intelligence.create("intelligence_".concat(this.playerId, "_counter"));
        this.counters.military.create("military_".concat(this.playerId, "_counter"));
        this.counters.political.create("political_".concat(this.playerId, "_counter"));
        this.counters.rupees.create("rupee_count_".concat(this.playerId, "_counter"));
        this.counters.rupeesTableau.create("rupee_count_tableau_".concat(this.playerId, "_counter"));
        if (this.playerId === this.game.getPlayerId()) {
            this.counters.handCount.create("pp_hand_count_".concat(this.playerId));
            this.counters.handLimit.create("pp_hand_limit_".concat(this.playerId));
            this.game.tooltipManager.addSuitTooltip({ suit: 'intelligence', nodeId: "pp_player_hand_size_".concat(this.playerId) });
        }
        this.game.tooltipManager.addPlayerIconToolTips({ playerId: this.playerId, playerColor: this.playerColor });
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    PPPlayer.prototype.updatePlayerPanel = function (_a) {
        var _b;
        var playerGamedatas = _a.playerGamedatas;
        var counts = playerGamedatas.counts;
        if ((_b = this.game.framework().scoreCtrl) === null || _b === void 0 ? void 0 : _b[this.playerId]) {
            this.game.framework().scoreCtrl[this.playerId].setValue(Number(playerGamedatas.score));
        }
        if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null' && playerGamedatas.counts.influence.type === PLAYER_INFLUENCE) {
            this.counters.influence.setValue(playerGamedatas.counts.influence.value);
        }
        else {
            this.counters.influence.disable();
        }
        this.counters.cylinders.setValue(counts.cylinders);
        this.counters.rupees.setValue(playerGamedatas.rupees);
        this.counters.rupeesTableau.setValue(playerGamedatas.rupees);
        this.counters.cards.setValue(counts.cards);
        this.counters.cardsTableau.setValue(counts.cards);
        this.counters.economic.setValue(counts.suits.economic);
        this.counters.military.setValue(counts.suits.military);
        this.counters.political.setValue(counts.suits.political);
        this.counters.intelligence.setValue(counts.suits.intelligence);
        this.counters.courtLimit.setValue(3 + counts.suits.political);
        this.counters.courtCount.setValue(playerGamedatas.court.cards.length);
        if (this.playerId === this.game.getPlayerId()) {
            this.counters.handLimit.setValue(2 + counts.suits.intelligence);
            this.counters.handCount.setValue(counts.cards);
        }
    };
    PPPlayer.prototype.setupPrizes = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.prizes = new LineStock(this.game.cardManager, document.getElementById("pp_prizes_".concat(this.playerId)), {
            direction: 'column',
            center: false,
            wrap: 'nowrap'
        });
        var numberOfPrizes = playerGamedatas.prizes.length;
        this.updatePrizesStyle({ numberOfPrizes: numberOfPrizes });
        this.prizes.addCards(playerGamedatas.prizes.map(function (token) { return (__assign(__assign({}, token), _this.game.getCardInfo(token.id))); }));
    };
    PPPlayer.prototype.updatePrizesStyle = function (_a) {
        var numberOfPrizes = _a.numberOfPrizes;
        var node = document.getElementById("pp_prizes_".concat(this.playerId));
        var height = 0;
        var marginBottom = 0;
        if (numberOfPrizes > 0) {
            marginBottom = this.playerId === WAKHAN_PLAYER_ID ? -184 : -194;
            height = CARD_HEIGHT + (numberOfPrizes - 1) * 25;
        }
        node.style.marginBottom = "calc(var(--cardScale)* ".concat(marginBottom, "px)");
        node.style.height = "calc(var(--cardScale) * ".concat(height, "px)");
    };
    PPPlayer.prototype.setupRulerTokens = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.rulerTokens = new LineStock(this.game.rulerTokenManager, document.getElementById("pp_ruler_tokens_player_".concat(this.playerId)), {
            center: false,
        });
        Object.keys(gamedatas.map.rulers).forEach(function (region) {
            if (gamedatas.map.rulers[region] === Number(_this.playerId)) {
                _this.rulerTokens.addCard({
                    id: "pp_ruler_token_".concat(region),
                    region: region,
                    state: 0,
                    used: 0,
                    location: "rulerTokens_".concat(_this.playerId),
                });
            }
        });
    };
    PPPlayer.prototype.setupWakhanDeck = function (_a) {
        var wakhanCards = _a.wakhanCards;
        var deckNode = dojo.byId('pp_wakhan_deck');
        deckNode.classList.value = '';
        deckNode.classList.add('pp_wakhan_card');
        if (wakhanCards.deck.topCard !== null) {
            var wakhanCardId = wakhanCards.deck.topCard.id;
            deckNode.classList.add("pp_".concat(wakhanCardId, "_back"));
        }
        else {
            deckNode.style.opacity = '0';
        }
        var discardNode = dojo.byId('pp_wakhan_discard');
        if (wakhanCards.discardPile.topCard) {
            discardNode.classList.value = '';
            discardNode.classList.add('pp_wakhan_card', "pp_".concat(wakhanCards.discardPile.topCard.id, "_front"));
        }
        else {
            discardNode.style.opacity = '0';
        }
        if (wakhanCards.deck.topCard && wakhanCards.discardPile.topCard) {
            this.game.tooltipManager.addWakhanCardTooltip({
                wakhanDeckCardId: wakhanCards.deck.topCard.id,
                wakhanDiscardCardId: wakhanCards.discardPile.topCard.id,
            });
        }
    };
    PPPlayer.prototype.clearInterface = function () {
        var _this = this;
        this.court.removeAll();
        this.court = undefined;
        this.cylinders.removeAll();
        this.cylinders = undefined;
        this.rulerTokens.removeAll();
        this.rulerTokens = undefined;
        ['2', '4', '6'].forEach(function (value) {
            _this.gifts[value].removeAll();
            _this.gifts[value] = undefined;
        });
        this.events.removeAll();
        this.events = undefined;
        this.prizes.removeAll();
        this.prizes = undefined;
        if (this.game.gameOptions.openHands && this.playerId === this.game.getPlayerId()) {
            this.hand.removeAll();
            this.hand = undefined;
        }
    };
    PPPlayer.prototype.getColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.getCourtCards = function () {
        var _this = this;
        var cardsInZone = this.court.getCards();
        return cardsInZone.map(function (_a) {
            var id = _a.id;
            return _this.game.getCardInfo(id);
        });
    };
    PPPlayer.prototype.getCourtZone = function () {
        return this.court;
    };
    PPPlayer.prototype.getEventsZone = function () {
        return this.events;
    };
    PPPlayer.prototype.getHandZone = function () {
        return this.hand;
    };
    PPPlayer.prototype.getHexColor = function () {
        return this.playerHexColor;
    };
    PPPlayer.prototype.getCylinderZone = function () {
        return this.cylinders;
    };
    PPPlayer.prototype.getGiftZone = function (_a) {
        var value = _a.value;
        return this.gifts[value];
    };
    PPPlayer.prototype.getInfluence = function () {
        return this.counters.influence.getValue();
    };
    PPPlayer.prototype.getName = function () {
        return this.playerName;
    };
    PPPlayer.prototype.getPlayerId = function () {
        return this.playerId;
    };
    PPPlayer.prototype.getPrizeZone = function () {
        return this.prizes;
    };
    PPPlayer.prototype.getRupees = function () {
        return this.counters.rupees.getValue();
    };
    PPPlayer.prototype.getRulerTokensZone = function () {
        return this.rulerTokens;
    };
    PPPlayer.prototype.getPlayerColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.getLowestAvailableGift = function () {
        if (this.gifts['2'].getCards().length === 0) {
            return 2;
        }
        if (this.gifts['4'].getCards().length === 0) {
            return 4;
        }
        if (this.gifts['6'].getCards().length === 0) {
            return 6;
        }
        return 0;
    };
    PPPlayer.prototype.getLoyalty = function () {
        return this.loyalty;
    };
    PPPlayer.prototype.getTaxShelter = function () {
        var _this = this;
        return this.court
            .getCards()
            .map(function (_a) {
            var id = _a.id;
            return _this.game.getCardInfo(id);
        })
            .filter(function (card) { return card.suit === ECONOMIC; })
            .reduce(function (total, current) {
            return total + current.rank;
        }, 0);
    };
    PPPlayer.prototype.setCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        switch (counter) {
            case 'cards':
                this.counters.cards.setValue(value);
                this.counters.cardsTableau.setValue(value);
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handCount.setValue(value);
                }
                break;
            case 'intelligence':
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handLimit.setValue(value);
                }
                break;
            case 'rupees':
                this.counters.rupees.setValue(value);
                this.counters.rupeesTableau.setValue(value);
                break;
            case 'political':
                this.counters.political.setValue(value);
                this.counters.courtLimit.setValue(value);
                break;
            default:
                this.counters[counter].setValue(value);
        }
    };
    PPPlayer.prototype.incCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        switch (counter) {
            case 'cards':
                this.counters.cards.incValue(value);
                this.counters.cardsTableau.incValue(value);
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handCount.incValue(value);
                }
                break;
            case 'intelligence':
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handLimit.incValue(value);
                }
                break;
            case 'rupees':
                this.counters.rupees.incValue(value);
                this.counters.rupeesTableau.incValue(value);
                break;
            case 'political':
                this.counters.political.incValue(value);
                this.counters.courtLimit.incValue(value);
                break;
            default:
                this.counters[counter].incValue(value);
        }
    };
    PPPlayer.prototype.toValueCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        switch (counter) {
            case 'cards':
                this.counters.cards.toValue(value);
                this.counters.cardsTableau.toValue(value);
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handCount.toValue(value);
                }
                break;
            case 'intelligence':
                if (this.playerId === this.game.getPlayerId()) {
                    this.counters.handLimit.toValue(value);
                }
                break;
            case 'rupees':
                this.counters.rupees.toValue(value);
                this.counters.rupeesTableau.toValue(value);
                break;
            case 'political':
                this.counters.political.toValue(value);
                this.counters.courtLimit.toValue(value);
                break;
            default:
                this.counters[counter].toValue(value);
        }
    };
    PPPlayer.prototype.elevateTableau = function () {
        var tableau = dojo.byId("pp_player_tableau_container_".concat(this.playerId));
        var originalZIndex = tableau.style.zIndex;
        tableau.style.zIndex = '11';
        return originalZIndex;
    };
    PPPlayer.prototype.removeTableauElevation = function (originalZIndex) {
        var tableau = dojo.byId("pp_player_tableau_container_".concat(this.playerId));
        tableau.style.zIndex = originalZIndex;
    };
    PPPlayer.prototype.createSelect = function (side) {
        return {
            id: "pp_card_select_".concat(side),
            state: side === 'left' ? -1000 : 1000,
            type: 'select',
        };
    };
    PPPlayer.prototype.addSideSelectToCourt = function () {
        this.court.addCards([this.createSelect('left'), this.createSelect('right')]);
    };
    PPPlayer.prototype.checkEventContainerHeight = function () {
        var node = dojo.byId("pp_player_events_container_".concat(this.playerId));
        if (this.events.getCards().length === 0) {
            node.style.marginTop = 'calc(var(--cardScale) * -209px)';
        }
        else {
            node.style.marginTop = 'calc(var(--cardScale) * -57px)';
        }
    };
    PPPlayer.prototype.removeSideSelectFromCourt = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.all([this.court.removeCard(this.createSelect('left')), this.court.removeCard(this.createSelect('right'))])];
                    case 1:
                        _a.sent();
                        return [2, true];
                }
            });
        });
    };
    PPPlayer.prototype.ownsEventCard = function (_a) {
        var cardId = _a.cardId;
        return this.events.getCards().some(function (card) { return card.id === cardId; });
    };
    PPPlayer.prototype.getCourtCardsWithSpecialAbility = function (_a) {
        var specialAbility = _a.specialAbility;
        return this.court
            .getCards()
            .filter(function (card) { return card.type === 'courtCard' && card.specialAbility === specialAbility; });
    };
    PPPlayer.prototype.hasSpecialAbility = function (_a) {
        var specialAbility = _a.specialAbility;
        return this.court.getCards().some(function (card) { return card.specialAbility === specialAbility; });
    };
    PPPlayer.prototype.isWakhan = function () {
        return this.playerId === WAKHAN_PLAYER_ID;
    };
    PPPlayer.prototype.resetHandCards = function () {
        if (!this.game.gameOptions.openHands) {
            return;
        }
        this.handCards = [];
    };
    PPPlayer.prototype.updateHandCards = function (_a) {
        var action = _a.action, cardId = _a.cardId;
        if (!this.game.gameOptions.openHands) {
            return;
        }
        if (action === 'ADD') {
            this.handCards.push(cardId);
        }
        else if (action === 'REMOVE') {
            var index = this.handCards.findIndex(function (item) { return item === cardId; });
            if (index < 0) {
                return;
            }
            this.handCards.splice(index, 1);
        }
        if (this.modal.isDisplayed()) {
            this.updateModalContent();
        }
    };
    PPPlayer.prototype.discardCourtCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            var cardInfo;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cardInfo = this.game.getCardInfo(cardId);
                        this.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
                        this.incCounter({ counter: 'courtCount', value: -1 });
                        if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
                            this.incCounter({ counter: 'influence', value: -1 });
                        }
                        if (!(to === DISCARD)) return [3, 2];
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1:
                        _c.sent();
                        return [3, 4];
                    case 2: return [4, this.game.objectManager.tempDiscardPile
                            .getZone()
                            .addCard(this.game.getCard({ id: cardId, state: 0, used: 0, location: 'tempDiscardPile' }))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    PPPlayer.prototype.discardEventCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            var originalZIndex;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        originalZIndex = this.elevateTableau();
                        if (!(to === TEMP_DISCARD)) return [3, 2];
                        return [4, this.game.objectManager.tempDiscardPile
                                .getZone()
                                .addCard(this.game.getCard({ id: cardId, state: 0, used: 0, location: 'tempDiscardPile' }))];
                    case 1:
                        _c.sent();
                        return [3, 4];
                    case 2: return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        this.removeTableauElevation(originalZIndex);
                        this.checkEventContainerHeight();
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.discardHandCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.incCounter({ counter: 'cards', value: -1 });
                        if (!(this.playerId === this.game.getPlayerId() && to === DISCARD)) return [3, 2];
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1:
                        _c.sent();
                        return [3, 7];
                    case 2:
                        if (!(this.playerId === this.game.getPlayerId() && to === TEMP_DISCARD)) return [3, 3];
                        this.game.objectManager.tempDiscardPile.getZone().addCard(__assign(__assign({}, this.game.getCardInfo(cardId)), { state: 0, used: 0, location: 'temp_discard' }));
                        return [3, 7];
                    case 3:
                        if (!(to === DISCARD)) return [3, 5];
                        return [4, this.game.objectManager.discardPile.discardCardFromLocation({ cardId: cardId, from: "cards_".concat(this.playerId) })];
                    case 4:
                        _c.sent();
                        return [3, 7];
                    case 5:
                        if (!(to === TEMP_DISCARD)) return [3, 7];
                        return [4, this.game.objectManager.tempDiscardPile.getZone().addCard(__assign(__assign({}, this.game.getCardInfo(cardId)), { state: 0, used: 0, location: 'temp_discard' }))];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        this.updateHandCards({ cardId: cardId, action: 'REMOVE' });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.discardPrize = function (_a) {
        var cardId = _a.cardId;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1: return [2, _b.sent()];
                }
            });
        });
    };
    PPPlayer.prototype.payToPlayer = function (_a) {
        var _b;
        var playerId = _a.playerId, rupees = _a.rupees;
        return __awaiter(this, void 0, void 0, function () {
            var element, fromRect;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        element = dojo.place(tplRupee({ rupeeId: 'tempRupee' }), "rupees_".concat(playerId));
                        fromRect = (_b = $("rupees_".concat(this.playerId))) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
                        this.incCounter({ counter: 'rupees', value: -rupees });
                        return [4, this.game.animationManager.play(new BgaSlideAnimation({
                                element: element,
                                transitionTimingFunction: 'linear',
                                fromRect: fromRect,
                            }))];
                    case 1:
                        _c.sent();
                        element.remove();
                        this.game.playerManager.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: rupees });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.playCard = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            var cardInfo, suit, rank;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cardInfo = this.game.getCard(card);
                        suit = cardInfo.suit, rank = cardInfo.rank;
                        this.incCounter({ counter: 'cards', value: -1 });
                        if (!(this.playerId === this.game.getPlayerId())) return [3, 3];
                        return [4, this.removeSideSelectFromCourt()];
                    case 1:
                        _a.sent();
                        return [4, this.court.addCard(cardInfo)];
                    case 2:
                        _a.sent();
                        return [3, 5];
                    case 3: return [4, this.court.addCard(cardInfo, { fromElement: document.getElementById("cards_".concat(this.playerId)) })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        this.incCounter({ counter: suit, value: rank });
                        this.incCounter({ counter: 'courtCount', value: 1 });
                        if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
                            this.incCounter({ counter: 'influence', value: 1 });
                        }
                        this.updateHandCards({ cardId: card.id, action: 'REMOVE' });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.addCardToHand = function (cardToken) {
        return __awaiter(this, void 0, void 0, function () {
            var card, element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = this.game.getCard(cardToken);
                        if (!(this.playerId === this.game.getPlayerId())) return [3, 2];
                        return [4, this.hand.addCard(card)];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2:
                        element = this.game.cardManager.getCardElement(card);
                        return [4, moveToAnimation({
                                game: this.game,
                                element: element,
                                toId: "cards_".concat(this.playerId),
                                remove: true,
                            })];
                    case 3:
                        _a.sent();
                        this.game.cardManager.removeCard(card);
                        _a.label = 4;
                    case 4:
                        this.incCounter({ counter: 'cards', value: 1 });
                        this.updateHandCards({ cardId: card.id, action: 'ADD' });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.addCardToEvents = function (_a) {
        var cardId = _a.cardId;
        return __awaiter(this, void 0, void 0, function () {
            var originalZIndex, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        originalZIndex = this.elevateTableau();
                        if (this.events.getCards().length === 0) {
                            node = dojo.byId("pp_player_events_container_".concat(this.playerId));
                            node.style.marginTop = 'calc(var(--cardScale) * -57px)';
                        }
                        return [4, this.events.addCard(__assign(__assign({}, this.game.getCardInfo(cardId)), { state: 0, used: 0, location: "events_".concat(this.playerId) }))];
                    case 1:
                        _b.sent();
                        this.removeTableauElevation(originalZIndex);
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.removeTaxCounter = function () {
        var taxCounter = dojo.byId("rupees_tableau_".concat(this.playerId, "_tax_counter"));
        if (taxCounter) {
            dojo.destroy(taxCounter.id);
        }
    };
    PPPlayer.prototype.takePrize = function (_a) {
        var cardId = _a.cardId;
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.updatePrizesStyle({ numberOfPrizes: this.prizes.getCards().length + 1 });
                        node = $(cardId);
                        node.style.zIndex = 0;
                        return [4, this.prizes.addCard(this.game.getCard({
                                id: cardId,
                                state: 0,
                                used: 0,
                                location: "prizes_".concat(this.playerId),
                            }))];
                    case 1:
                        _b.sent();
                        this.incCounter({ counter: 'influence', value: 1 });
                        return [2];
                }
            });
        });
    };
    PPPlayer.prototype.updatePlayerLoyalty = function (_a) {
        var coalition = _a.coalition;
        this.loyalty = coalition;
        dojo
            .query("#loyalty_icon_".concat(this.playerId))
            .removeClass('pp_afghan')
            .removeClass('pp_british')
            .removeClass('pp_russian')
            .addClass("pp_".concat(coalition));
        dojo
            .query("#pp_loyalty_dial_".concat(this.playerId))
            .removeClass('pp_afghan')
            .removeClass('pp_british')
            .removeClass('pp_russian')
            .addClass("pp_".concat(coalition));
        this.game.tooltipManager.removeInfluenceCountTooltip({ playerId: this.playerId });
        this.game.tooltipManager.addInfluenceCountTooltip({ playerId: this.playerId, coalition: coalition });
    };
    return PPPlayer;
}());
var PPWakhanPlayer = (function (_super) {
    __extends(PPWakhanPlayer, _super);
    function PPWakhanPlayer(_a) {
        var game = _a.game, player = _a.player;
        return _super.call(this, { game: game, player: player }) || this;
    }
    PPWakhanPlayer.prototype.setupPlayerPanel = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.wakhanInfluence = {
            afghan: new ebg.counter(),
            british: new ebg.counter(),
            russian: new ebg.counter(),
        };
        this.wakhanScore = new ebg.counter();
        var player_board_div = $('player_board_' + this.playerId);
        dojo.place(tplPlayerBoardWakhan({ playerId: this.playerId }), player_board_div);
        $("cylinders_".concat(this.playerId)).classList.add("pp_player_color_".concat(this.playerColor));
        SUITS.forEach(function (suit) {
            _this.game.tooltipManager.addSuitTooltip({ suit: suit, nodeId: "pp_".concat(suit, "_icon_").concat(_this.playerId) });
        });
        this.counters.cylinders.create("cylinder_count_".concat(this.playerId, "_counter"));
        this.counters.economic.create("economic_".concat(this.playerId, "_counter"));
        this.counters.intelligence.create("intelligence_".concat(this.playerId, "_counter"));
        this.counters.military.create("military_".concat(this.playerId, "_counter"));
        this.counters.political.create("political_".concat(this.playerId, "_counter"));
        this.counters.rupees.create("rupee_count_".concat(this.playerId, "_counter"));
        this.counters.rupeesTableau.create("rupee_count_tableau_".concat(this.playerId, "_counter"));
        this.wakhanInfluence.afghan.create("influence_".concat(this.playerId, "_afghan_counter"));
        this.wakhanInfluence['british'].create("influence_".concat(this.playerId, "_british_counter"));
        this.wakhanInfluence.russian.create("influence_".concat(this.playerId, "_russian_counter"));
        this.wakhanScore.create("player_score_".concat(this.playerId));
        this.counters.courtCount.create("pp_court_count_".concat(this.playerId));
        this.counters.courtLimit.create("pp_court_limit_".concat(this.playerId));
        this.game.tooltipManager.addSuitTooltip({ suit: 'political', nodeId: "pp_player_court_size_".concat(this.playerId) });
        this.game.tooltipManager.addPlayerIconToolTips({ playerId: this.playerId, playerColor: this.playerColor });
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    PPWakhanPlayer.prototype.updatePlayerPanel = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        var counts = playerGamedatas.counts;
        this.wakhanScore.setValue(Number(playerGamedatas.score));
        if (playerGamedatas.counts.influence.type === 'wakhanInfluence') {
            this.wakhanInfluence.afghan.setValue(playerGamedatas.counts.influence.influence.afghan);
            this.wakhanInfluence.british.setValue(playerGamedatas.counts.influence.influence.british);
            this.wakhanInfluence.russian.setValue(playerGamedatas.counts.influence.influence.russian);
        }
        this.counters.cylinders.setValue(counts.cylinders);
        this.counters.rupees.setValue(playerGamedatas.rupees);
        this.counters.rupeesTableau.setValue(playerGamedatas.rupees);
        this.counters.economic.setValue(counts.suits.economic);
        this.counters.military.setValue(counts.suits.military);
        this.counters.political.setValue(counts.suits.political);
        this.counters.intelligence.setValue(counts.suits.intelligence);
        this.counters.courtLimit.setValue(3 + counts.suits.political);
        this.counters.courtCount.setValue(playerGamedatas.court.cards.length);
        if (this.game.gamedatas.wakhanPragmaticLoyalty) {
            this.updateLoyaltyIcon({ pragmaticLoyalty: this.game.gamedatas.wakhanPragmaticLoyalty });
        }
    };
    PPWakhanPlayer.prototype.updateLoyaltyIcon = function (_a) {
        var pragmaticLoyalty = _a.pragmaticLoyalty;
        COALITIONS.forEach(function (coalition) {
            var node = dojo.byId("loyalty_icon_1_".concat(coalition));
            if (!node) {
                return;
            }
            if (pragmaticLoyalty === coalition) {
                node.classList.remove('pp_loyalty_icon_black');
                node.classList.add('pp_loyalty_icon');
            }
            else {
                node.classList.remove('pp_loyalty_icon');
                node.classList.add('pp_loyalty_icon_black');
            }
        });
        this.game.tooltipManager.removeWakhanInfluenceCountTooltips();
        this.game.tooltipManager.addWakhanInfluenceCountTooltips({ pragmaticLoyalty: pragmaticLoyalty });
    };
    PPWakhanPlayer.prototype.discardCourtCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            var cardInfo, wakhanInfluence, node;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cardInfo = this.game.getCardInfo(cardId);
                        this.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
                        this.incCounter({ counter: 'courtCount', value: -1 });
                        if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
                            wakhanInfluence = {
                                type: 'wakhanInfluence',
                                influence: (_c = {},
                                    _c[AFGHAN] = 0,
                                    _c[BRITISH] = 0,
                                    _c[RUSSIAN] = 0,
                                    _c),
                            };
                            wakhanInfluence.influence[cardInfo.loyalty] = -1;
                            this.incWakhanInfluence({ wakhanInfluence: wakhanInfluence });
                        }
                        node = dojo.byId(cardId);
                        node.classList.remove('pp_card_in_court', "pp_player_".concat(this.playerId));
                        if (!(to === DISCARD)) return [3, 2];
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1:
                        _d.sent();
                        return [3, 4];
                    case 2: return [4, this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard({
                            id: cardId,
                            state: 0,
                            used: 0,
                            location: to,
                        }))];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    PPWakhanPlayer.prototype.discardHandCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(to === DISCARD)) return [3, 2];
                        return [4, this.game.objectManager.discardPile.discardCardFromLocation({ cardId: cardId, from: "cylinders_".concat(this.playerId) })];
                    case 1:
                        _c.sent();
                        return [3, 4];
                    case 2:
                        if (!(to === TEMP_DISCARD)) return [3, 4];
                        return [4, this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard({
                                id: cardId,
                                state: 0,
                                used: 0,
                                location: "cylinders_".concat(this.playerId),
                            }))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    PPWakhanPlayer.prototype.playCard = function (card) {
        return __awaiter(this, void 0, void 0, function () {
            var cardInfo, suit, rank;
            return __generator(this, function (_a) {
                cardInfo = this.game.getCardInfo(card.id);
                suit = cardInfo.suit, rank = cardInfo.rank;
                this.court.addCard(__assign(__assign({}, card), cardInfo));
                this.incCounter({ counter: suit, value: rank });
                this.incCounter({ counter: 'courtCount', value: 1 });
                if (cardInfo.type === 'courtCard' && cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
                    this.wakhanInfluence[cardInfo.loyalty].incValue(1);
                }
                return [2];
            });
        });
    };
    PPWakhanPlayer.prototype.radicalizeCardWakhan = function (_a) {
        var card = _a.card, from = _a.from;
        return __awaiter(this, void 0, void 0, function () {
            var cardInfo, suit, rank;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cardInfo = this.game.getCardInfo(card.id);
                        suit = cardInfo.suit, rank = cardInfo.rank;
                        return [4, this.court.addCard(__assign(__assign({}, card), cardInfo))];
                    case 1:
                        _b.sent();
                        this.incCounter({ counter: suit, value: rank });
                        this.incCounter({ counter: 'courtCount', value: 1 });
                        if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
                            this.wakhanInfluence[cardInfo.loyalty].incValue(1);
                        }
                        return [2];
                }
            });
        });
    };
    PPWakhanPlayer.prototype.setCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        if (counter === 'influence' || counter === 'cards') {
            return;
        }
        _super.prototype.setCounter.call(this, { counter: counter, value: value });
    };
    PPWakhanPlayer.prototype.incCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        if (counter === 'influence' || counter === 'cards') {
            return;
        }
        _super.prototype.incCounter.call(this, { counter: counter, value: value });
    };
    PPWakhanPlayer.prototype.toValueCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        if (counter === 'influence' || counter === 'cards') {
            return;
        }
        _super.prototype.toValueCounter.call(this, { counter: counter, value: value });
    };
    PPWakhanPlayer.prototype.incWakhanInfluence = function (_a) {
        var wakhanInfluence = _a.wakhanInfluence;
        var influence = wakhanInfluence.influence;
        this.wakhanInfluence.afghan.incValue(influence.afghan);
        this.wakhanInfluence.british.incValue(influence.british);
        this.wakhanInfluence.russian.incValue(influence.russian);
    };
    PPWakhanPlayer.prototype.toValueWakhanInfluence = function (_a) {
        var wakhanInfluence = _a.wakhanInfluence;
        var influence = wakhanInfluence.influence;
        this.wakhanInfluence.afghan.setValue(influence.afghan);
        this.wakhanInfluence.british.setValue(influence.british);
        this.wakhanInfluence.russian.setValue(influence.russian);
    };
    return PPWakhanPlayer;
}(PPPlayer));
var PlayerManager = (function () {
    function PlayerManager(game) {
        var _this = this;
        this.getPlayerOrder = function () {
            return _this.game.playerOrder;
        };
        this.game = game;
        this.players = {};
        for (var playerId in game.gamedatas.paxPamirPlayers) {
            var player = game.gamedatas.paxPamirPlayers[playerId];
            if (Number(playerId) !== 1) {
                this.players[playerId] = new PPPlayer({ player: player, game: this.game });
            }
            else {
                this.players[playerId] = new PPWakhanPlayer({ player: player, game: this.game });
            }
        }
    }
    PlayerManager.prototype.getAllCourtCards = function () {
        var cards = [];
        Object.values(this.players).forEach(function (player) {
            cards = cards.concat(player.getCourtZone().getCards());
        });
        return cards;
    };
    PlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    PlayerManager.prototype.getPlayers = function () {
        return Object.values(this.players);
    };
    PlayerManager.prototype.getPlayerIds = function () {
        return Object.keys(this.players).map(Number);
    };
    PlayerManager.prototype.updatePlayers = function (_a) {
        var gamedatas = _a.gamedatas;
        for (var playerId in gamedatas.paxPamirPlayers) {
            this.players[playerId].updatePlayer({ gamedatas: gamedatas });
        }
    };
    PlayerManager.prototype.setupAdjacentPlayerColors = function () {
        Object.values(this.players).forEach(function (player) {
            player.setupAdjacentPlayerColors();
        });
    };
    PlayerManager.prototype.getNextPlayerId = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === playerOrder.length - 1) {
            return playerOrder[0];
        }
        else {
            return playerOrder[playerIndex + 1];
        }
    };
    PlayerManager.prototype.getPreviousPlayerId = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === 0) {
            return playerOrder[playerOrder.length - 1];
        }
        else {
            return playerOrder[playerIndex - 1];
        }
    };
    PlayerManager.prototype.getNextPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[this.getNextPlayerId({ playerId: playerId })];
    };
    PlayerManager.prototype.getPreviousPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[this.getPreviousPlayerId({ playerId: playerId })];
    };
    PlayerManager.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.players).forEach(function (playerId) {
            _this.players[playerId].clearInterface();
        });
    };
    return PlayerManager;
}());
var Border = (function () {
    function Border(_a) {
        var game = _a.game, border = _a.border;
        this.game = game;
        this.border = border;
        this.setupBorder({ gamedatas: game.gamedatas });
    }
    Border.prototype.setupBorder = function (_a) {
        var gamedatas = _a.gamedatas;
        var borderGamedatas = gamedatas.map.borders[this.border];
        this.createBorderZone();
        this.roadZone.addCards(borderGamedatas.roads.map(function (token) { return (__assign(__assign({}, token), { coalition: token.id.split('_')[1], type: 'road' })); }));
    };
    Border.prototype.clearInterface = function () {
        this.roadZone.removeAll();
        this.roadZone = undefined;
    };
    Border.prototype.createBorderZone = function () {
        var _this = this;
        var border = this.border;
        this.roadZone = new TokenManualPositionStock(this.game.coalitionBlockManager, document.getElementById("pp_".concat(this.border, "_border")), {}, function (element, cards, lastCard, stock) {
            return _this.updateDislay(element, cards, lastCard, stock);
        });
    };
    Border.prototype.getRoadZone = function () {
        return this.roadZone;
    };
    Border.prototype.clearSelectable = function () {
        var borderSelect = document.getElementById("pp_".concat(this.border, "_border_select"));
        if (borderSelect) {
            borderSelect.classList.remove(PP_SELECTABLE, PP_SELECTED);
        }
    };
    Border.prototype.getCustomPattern = function (_a) {
        var border = _a.border;
        switch (border) {
            case HERAT_KABUL:
                return customPatternHeratKabul;
            case HERAT_KANDAHAR:
                return customPatternHeratKandahar;
            case HERAT_PERSIA:
                return customPatternHeratPersia;
            case HERAT_TRANSCASPIA:
                return customPatternHeratTranscaspia;
            case KABUL_KANDAHAR:
                return customPatternKabulKandahar;
            case KABUL_PUNJAB:
                return customPatternKabulPunjab;
            case KABUL_TRANSCASPIA:
                return customPatternKabulTranscaspia;
            case KANDAHAR_PUNJAB:
                return customPatternKandaharPunjab;
            case PERSIA_TRANSCASPIA:
                return customPatternPersiaTranscaspia;
            default:
                return undefined;
        }
    };
    Border.prototype.getCoalitionRoads = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.roadZone
            .getCards()
            .filter(function (_a) {
            var id = _a.id;
            return id.split('_')[1] === coalitionId;
        })
            .map(function (block) { return block.id; });
    };
    Border.prototype.getEnemyRoads = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.roadZone
            .getCards()
            .filter(function (_a) {
            var id = _a.id;
            return id.split('_')[1] !== coalitionId;
        })
            .map(function (block) { return block.id; });
    };
    Border.prototype.createTempRoad = function (coalition, index) {
        var id = "temp_road_".concat(index);
        return {
            id: id,
            state: 0,
            coalition: coalition,
            location: this.border,
            used: 0,
            type: 'road',
        };
    };
    Border.prototype.addTempRoad = function (_a) {
        var coalition = _a.coalition, index = _a.index;
        this.roadZone.addCard(this.createTempRoad(coalition, index));
    };
    Border.prototype.removeTempRoad = function (_a) {
        var index = _a.index;
        this.roadZone.removeCard(this.createTempRoad('afghan', index));
    };
    Border.prototype.updateDislay = function (element, blocks, lastCard, stock) {
        var pattern = this.getCustomPattern({ border: this.border });
        var itemCount = blocks.length;
        blocks.forEach(function (block, index) {
            var _a = pattern({ index: index, itemCount: itemCount }), left = _a.x, top = _a.y;
            var div = stock.getCardElement(block);
            div.style.top = "calc(var(--tokenScale) * ".concat(top, "px)");
            div.style.left = "calc(var(--tokenScale) * ".concat(left, "px)");
        });
    };
    return Border;
}());
var updateZoneDislay = function (pattern, element, blocks, lastCard, stock) {
    var itemCount = blocks.length;
    blocks.forEach(function (block, index) {
        var _a = pattern({ index: index, itemCount: itemCount }), left = _a.x, top = _a.y;
        var div = stock.getCardElement(block);
        div.style.top = "calc(var(--tokenScale) * ".concat(top, "px)");
        div.style.left = "calc(var(--tokenScale) * ".concat(left, "px)");
    });
};
var defaultPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 5);
    var mod = i % 5;
    return { x: mod * 22, y: multiplier * 15, w: 40, h: 27 };
};
var armiesHeratPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 11) {
        switch (i) {
            case 0:
                return { x: 1, y: -43, w: 25, h: 40 };
            case 1:
                return { x: 22, y: -5, w: 25, h: 40 };
            case 2:
                return { x: 6, y: 46, w: 25, h: 40 };
            case 3:
                return { x: 40, y: 48, w: 25, h: 40 };
            case 4:
                return { x: 68, y: 56, w: 25, h: 40 };
            case 5:
                return { x: 163, y: -47, w: 25, h: 40 };
            case 6:
                return { x: 98, y: 46, w: 25, h: 40 };
            case 7:
                return { x: 151, y: 5, w: 25, h: 40 };
            case 8:
                return { x: 177, y: 14, w: 25, h: 40 };
            case 9:
                return { x: 125, y: 46, w: 25, h: 40 };
            case 10:
                return { x: 152, y: 55, w: 25, h: 40 };
        }
    }
    else if (i <= 7) {
        switch (i) {
            case 0:
                return { x: 0, y: -20, w: 25, h: 40 };
            case 1:
                return { x: 22, y: -20, w: 25, h: 40 };
            case 2:
                return { x: 1, y: 5, w: 25, h: 40 };
            case 3:
                return { x: 23, y: 5, w: 25, h: 40 };
            case 4:
                return { x: 151, y: -16, w: 25, h: 40 };
            case 5:
                return { x: 173, y: -16, w: 25, h: 40 };
            case 6:
                return { x: 151, y: 6, w: 25, h: 40 };
            case 7:
                return { x: 173, y: 6, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor((i - 8) / 8);
        var mod = (i - 8) % 8;
        return { x: 3 + mod * 22, y: 46 + multiplier * 16, w: 25, h: 40 };
    }
};
var armiesKabulPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (i <= 23) {
        switch (i) {
            case 0:
                return { x: 1, y: -43, w: 25, h: 40 };
            case 1:
                return { x: 22, y: -5, w: 25, h: 40 };
            case 2:
                return { x: 6, y: 46, w: 25, h: 40 };
            case 3:
                return { x: 40, y: 48, w: 25, h: 40 };
            case 4:
                return { x: 68, y: 56, w: 25, h: 40 };
            case 5:
                return { x: 163, y: -47, w: 25, h: 40 };
            case 6:
                return { x: 98, y: 46, w: 25, h: 40 };
            case 7:
                return { x: 151, y: 5, w: 25, h: 40 };
            case 8:
                return { x: 177, y: 14, w: 25, h: 40 };
            case 9:
                return { x: 125, y: 46, w: 25, h: 40 };
            case 10:
                return { x: 152, y: 55, w: 25, h: 40 };
            case 11:
                return { x: 12, y: -89, w: 25, h: 40 };
            case 12:
                return { x: -22, y: -74, w: 25, h: 40 };
            case 13:
                return { x: -50, y: -79, w: 25, h: 40 };
            case 14:
                return { x: -47, y: -35, w: 25, h: 40 };
            case 15:
                return { x: -12, y: 2, w: 25, h: 40 };
            case 16:
                return { x: -42, y: 11, w: 25, h: 40 };
            case 17:
                return { x: 178, y: -89, w: 25, h: 40 };
            case 18:
                return { x: 207, y: -84, w: 25, h: 40 };
            case 19:
                return { x: 194, y: -35, w: 25, h: 40 };
            case 20:
                return { x: 226, y: -43, w: 25, h: 40 };
            case 21:
                return { x: 242, y: -86, w: 25, h: 40 };
            case 22:
                return { x: 207, y: 10, w: 25, h: 40 };
            case 23:
                return { x: 184, y: 56, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor((i - 24) / 8);
        var mod = (i - 24) % 8;
        return { x: 3 + mod * 22, y: 46 + multiplier * 16, w: 25, h: 40 };
    }
};
var armiesKandaharPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 6) {
        switch (i) {
            case 0:
                return { x: 1, y: -43, w: 25, h: 40 };
            case 1:
                return { x: 22, y: -5, w: 25, h: 40 };
            case 2:
                return { x: -8, y: 5, w: 25, h: 40 };
            case 3:
                return { x: 144, y: -7, w: 25, h: 40 };
            case 4:
                return { x: 160, y: 29, w: 25, h: 40 };
            case 5:
                return { x: 12, y: -86, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor(i / 8);
        var mod = i % 8;
        return { x: -11 + mod * 22, y: 26 + multiplier * 16, w: 25, h: 40 };
    }
};
var armiesPersiaPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 8) {
        switch (i) {
            case 0:
                return { x: 1, y: -43, w: 25, h: 40 };
            case 1:
                return { x: 24, y: -19, w: 25, h: 40 };
            case 2:
                return { x: -8, y: 5, w: 25, h: 40 };
            case 3:
                return { x: 139, y: -12, w: 25, h: 40 };
            case 4:
                return { x: 125, y: 29, w: 25, h: 40 };
            case 5:
                return { x: 12, y: -86, w: 25, h: 40 };
            case 6:
                return { x: 147, y: 29, w: 25, h: 40 };
            case 7:
                return { x: 13, y: 31, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor(i / 8);
        var mod = i % 8;
        return { x: -9 + mod * 22, y: 18 + multiplier * 16, w: 25, h: 40 };
    }
};
var armiesPunjabPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (i <= 15) {
        switch (i) {
            case 0:
                return { x: 30, y: -122, w: 25, h: 40 };
            case 1:
                return { x: 57, y: -122, w: 25, h: 40 };
            case 2:
                return { x: -22, y: 2, w: 25, h: 40 };
            case 3:
                return { x: 1, y: 53, w: 25, h: 40 };
            case 4:
                return { x: 65, y: -164, w: 25, h: 40 };
            case 5:
                return { x: 75, y: -208, w: 25, h: 40 };
            case 6:
                return { x: 85, y: -117, w: 25, h: 40 };
            case 7:
                return { x: 28, y: 54, w: 25, h: 40 };
            case 8:
                return { x: 55, y: 56, w: 25, h: 40 };
            case 9:
                return { x: 85, y: 52, w: 25, h: 40 };
            case 10:
                return { x: 13, y: 97, w: 25, h: 40 };
            case 11:
                return { x: 41, y: 99, w: 25, h: 40 };
            case 12:
                return { x: 70, y: 96, w: 25, h: 40 };
            case 13:
                return { x: 25, y: 141, w: 25, h: 40 };
            case 14:
                return { x: 53, y: 142, w: 25, h: 40 };
            case 15:
                return { x: 81, y: 140, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor((i - 16) / 5);
        var mod = (i - 16) % 5;
        return { x: -9 + mod * 22, y: 18 + multiplier * 16, w: 25, h: 40 };
    }
};
var armiesTranscaspiaPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (i <= 13) {
        switch (i) {
            case 0:
                return { x: -3, y: -126, w: 25, h: 40 };
            case 1:
                return { x: 25, y: -122, w: 25, h: 40 };
            case 2:
                return { x: -6, y: -76, w: 25, h: 40 };
            case 3:
                return { x: 22, y: -75, w: 25, h: 40 };
            case 4:
                return { x: 199, y: -127, w: 25, h: 40 };
            case 5:
                return { x: 229, y: -126, w: 25, h: 40 };
            case 6:
                return { x: 260, y: -128, w: 25, h: 40 };
            case 7:
                return { x: 198, y: -81, w: 25, h: 40 };
            case 8:
                return { x: 226, y: -81, w: 25, h: 40 };
            case 9:
                return { x: 252, y: -79, w: 25, h: 40 };
            case 10:
                return { x: -5, y: -33, w: 25, h: 40 };
            case 11:
                return { x: 23, y: -32, w: 25, h: 40 };
            case 12:
                return { x: 209, y: -36, w: 25, h: 40 };
            case 13:
                return { x: 237, y: -36, w: 25, h: 40 };
        }
    }
    else {
        var multiplier = Math.floor((i - 14) / 9);
        var mod = (i - 14) % 9;
        return { x: -5 + mod * 22, y: 13 + multiplier * 16, w: 25, h: 40 };
    }
};
var customPatternHeratKabul = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 2) {
        switch (i) {
            case 0:
                return { x: 24, y: 13, w: 40, h: 27 };
            case 1:
                return { x: 62, y: 40, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 4) {
        switch (i) {
            case 0:
                return { x: 0, y: -3, w: 40, h: 27 };
            case 1:
                return { x: 29, y: 17, w: 40, h: 27 };
            case 2:
                return { x: 58, y: 37, w: 40, h: 27 };
            case 3:
                return { x: 82, y: 55, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 7;
        switch (mod) {
            case 0:
                return { x: 0, y: -3, w: 40, h: 27 };
            case 1:
                return { x: 16, y: 6, w: 40, h: 27 };
            case 2:
                return { x: 30, y: 16, w: 40, h: 27 };
            case 3:
                return { x: 45, y: 25, w: 40, h: 27 };
            case 4:
                return { x: 58, y: 35, w: 40, h: 27 };
            case 5:
                return { x: 69, y: 43, w: 40, h: 27 };
            case 6:
                return { x: 84, y: 51, w: 40, h: 27 };
        }
    }
};
var customPatternHeratKandahar = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 3) {
        switch (i) {
            case 0:
                return { x: 7, y: 27, w: 40, h: 27 };
            case 1:
                return { x: 5, y: 54, w: 40, h: 27 };
            case 2:
                return { x: 2, y: 81, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 5) {
        switch (i) {
            case 0:
                return { x: 7, y: -7, w: 40, h: 27 };
            case 1:
                return { x: 6, y: 21, w: 40, h: 27 };
            case 2:
                return { x: 4, y: 51, w: 40, h: 27 };
            case 3:
                return { x: 2, y: 81, w: 40, h: 27 };
            case 4:
                return { x: -3, y: 112, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 12;
        switch (mod) {
            case 0:
                return { x: 7, y: -17, w: 40, h: 27 };
            case 1:
                return { x: 7, y: -5, w: 40, h: 27 };
            case 2:
                return { x: 8, y: 7, w: 40, h: 27 };
            case 3:
                return { x: 8, y: 19, w: 40, h: 27 };
            case 4:
                return { x: 8, y: 30, w: 40, h: 27 };
            case 5:
                return { x: 6, y: 41, w: 40, h: 27 };
            case 6:
                return { x: 5, y: 53, w: 40, h: 27 };
            case 7:
                return { x: 5, y: 64, w: 40, h: 27 };
            case 8:
                return { x: 3, y: 75, w: 40, h: 27 };
            case 9:
                return { x: 2, y: 88, w: 40, h: 27 };
            case 10:
                return { x: 0, y: 100, w: 40, h: 27 };
            case 11:
                return { x: -3, y: 112, w: 40, h: 27 };
        }
    }
};
var customPatternHeratPersia = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 3) {
        switch (i) {
            case 0:
                return { x: -2, y: 32, w: 40, h: 27 };
            case 1:
                return { x: -1, y: 60, w: 40, h: 27 };
            case 2:
                return { x: 3, y: 87, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 5) {
        switch (i) {
            case 0:
                return { x: -2, y: 0, w: 40, h: 27 };
            case 1:
                return { x: -2, y: 27, w: 40, h: 27 };
            case 2:
                return { x: -1, y: 57, w: 40, h: 27 };
            case 3:
                return { x: 2, y: 87, w: 40, h: 27 };
            case 4:
                return { x: 4, y: 117, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 11;
        switch (mod) {
            case 0:
                return { x: -2, y: -2, w: 40, h: 27 };
            case 1:
                return { x: -2, y: 9, w: 40, h: 27 };
            case 2:
                return { x: -2, y: 21, w: 40, h: 27 };
            case 3:
                return { x: -2, y: 32, w: 40, h: 27 };
            case 4:
                return { x: -1, y: 44, w: 40, h: 27 };
            case 5:
                return { x: 0, y: 57, w: 40, h: 27 };
            case 6:
                return { x: 1, y: 70, w: 40, h: 27 };
            case 7:
                return { x: 3, y: 82, w: 40, h: 27 };
            case 8:
                return { x: 4, y: 95, w: 40, h: 27 };
            case 9:
                return { x: 4, y: 108, w: 40, h: 27 };
            case 10:
                return { x: 4, y: 121, w: 40, h: 27 };
        }
    }
};
var customPatternHeratTranscaspia = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 2) {
        switch (i) {
            case 0:
                return { x: 65, y: 12, w: 40, h: 27 };
            case 1:
                return { x: 27, y: 39, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 4) {
        switch (i) {
            case 0:
                return { x: 85, y: 2, w: 40, h: 27 };
            case 1:
                return { x: 58, y: 19, w: 40, h: 27 };
            case 2:
                return { x: 32, y: 37, w: 40, h: 27 };
            case 3:
                return { x: 10, y: 56, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 8;
        switch (mod) {
            case 0:
                return { x: 90, y: -5, w: 40, h: 27 };
            case 1:
                return { x: 81, y: 5, w: 40, h: 27 };
            case 2:
                return { x: 65, y: 15, w: 40, h: 27 };
            case 3:
                return { x: 49, y: 26, w: 40, h: 27 };
            case 4:
                return { x: 38, y: 36, w: 40, h: 27 };
            case 5:
                return { x: 28, y: 45, w: 40, h: 27 };
            case 6:
                return { x: 16, y: 57, w: 40, h: 27 };
            case 7:
                return { x: 8, y: 67, w: 40, h: 27 };
        }
    }
};
var customPatternKabulKandahar = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 2) {
        switch (i) {
            case 0:
                return { x: 40, y: 10, w: 40, h: 27 };
            case 1:
                return { x: 86, y: 19, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 4) {
        switch (i) {
            case 0:
                return { x: -4, y: 0, w: 40, h: 27 };
            case 1:
                return { x: 36, y: 8, w: 40, h: 27 };
            case 2:
                return { x: 77, y: 15, w: 40, h: 27 };
            case 3:
                return { x: 120, y: 11, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 8;
        switch (mod) {
            case 0:
                return { x: -8, y: -2, w: 40, h: 27 };
            case 1:
                return { x: 12, y: 4, w: 40, h: 27 };
            case 2:
                return { x: 32, y: 9, w: 40, h: 27 };
            case 3:
                return { x: 48, y: 14, w: 40, h: 27 };
            case 4:
                return { x: 69, y: 17, w: 40, h: 27 };
            case 5:
                return { x: 84, y: 19, w: 40, h: 27 };
            case 6:
                return { x: 104, y: 17, w: 40, h: 27 };
            case 7:
                return { x: 124, y: 13, w: 40, h: 27 };
        }
    }
};
var customPatternKabulTranscaspia = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 2) {
        switch (i) {
            case 0:
                return { x: 11, y: 32, w: 40, h: 27 };
            case 1:
                return { x: 6, y: 64, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 4) {
        switch (i) {
            case 0:
                return { x: 11, y: 10, w: 40, h: 27 };
            case 1:
                return { x: 10, y: 40, w: 40, h: 27 };
            case 2:
                return { x: 5, y: 70, w: 40, h: 27 };
            case 3:
                return { x: -3, y: 100, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 9;
        switch (mod) {
            case 0:
                return { x: 12, y: -2, w: 40, h: 27 };
            case 1:
                return { x: 13, y: 12, w: 40, h: 27 };
            case 2:
                return { x: 12, y: 25, w: 40, h: 27 };
            case 3:
                return { x: 11, y: 37, w: 40, h: 27 };
            case 4:
                return { x: 10, y: 49, w: 40, h: 27 };
            case 5:
                return { x: 9, y: 61, w: 40, h: 27 };
            case 6:
                return { x: 6, y: 74, w: 40, h: 27 };
            case 7:
                return { x: 2, y: 86, w: 40, h: 27 };
            case 8:
                return { x: -3, y: 100, w: 40, h: 27 };
        }
    }
};
var customPatternKabulPunjab = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 3) {
        switch (i) {
            case 0:
                return { x: 23, y: 61, w: 40, h: 27 };
            case 1:
                return { x: 7, y: 93, w: 40, h: 27 };
            case 2:
                return { x: -4, y: 123, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 7) {
        switch (i) {
            case 0:
                return { x: 56, y: 0, w: 40, h: 27 };
            case 1:
                return { x: 43, y: 33, w: 40, h: 27 };
            case 2:
                return { x: 22, y: 63, w: 40, h: 27 };
            case 3:
                return { x: 7, y: 90, w: 40, h: 27 };
            case 4:
                return { x: -2, y: 116, w: 40, h: 27 };
            case 5:
                return { x: -13, y: 145, w: 40, h: 27 };
            case 6:
                return { x: -32, y: 175, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 12;
        switch (mod) {
            case 0:
                return { x: 59, y: -7, w: 40, h: 27 };
            case 1:
                return { x: 54, y: 8, w: 40, h: 27 };
            case 2:
                return { x: 48, y: 23, w: 40, h: 27 };
            case 3:
                return { x: 38, y: 39, w: 40, h: 27 };
            case 4:
                return { x: 28, y: 55, w: 40, h: 27 };
            case 5:
                return { x: 17, y: 72, w: 40, h: 27 };
            case 6:
                return { x: 10, y: 90, w: 40, h: 27 };
            case 7:
                return { x: 2, y: 108, w: 40, h: 27 };
            case 8:
                return { x: -4, y: 125, w: 40, h: 27 };
            case 9:
                return { x: -12, y: 141, w: 40, h: 27 };
            case 10:
                return { x: -22, y: 163, w: 40, h: 27 };
            case 11:
                return { x: -35, y: 178, w: 40, h: 27 };
        }
    }
};
var customPatternKandaharPunjab = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 3) {
        switch (i) {
            case 0:
                return { x: -2, y: 16, w: 40, h: 27 };
            case 1:
                return { x: 8, y: 45, w: 40, h: 27 };
            case 2:
                return { x: 17, y: 75, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 6) {
        switch (i) {
            case 0:
                return { x: -26, y: -36, w: 40, h: 27 };
            case 1:
                return { x: -12, y: -9, w: 40, h: 27 };
            case 2:
                return { x: -3, y: 15, w: 40, h: 27 };
            case 3:
                return { x: 5, y: 40, w: 40, h: 27 };
            case 4:
                return { x: 15, y: 70, w: 40, h: 27 };
            case 5:
                return { x: 22, y: 97, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 12;
        switch (mod) {
            case 0:
                return { x: -25, y: -40, w: 40, h: 27 };
            case 1:
                return { x: -20, y: -29, w: 40, h: 27 };
            case 2:
                return { x: -14, y: -17, w: 40, h: 27 };
            case 3:
                return { x: -8, y: -5, w: 40, h: 27 };
            case 4:
                return { x: -4, y: 6, w: 40, h: 27 };
            case 5:
                return { x: 0, y: 19, w: 40, h: 27 };
            case 6:
                return { x: 2, y: 30, w: 40, h: 27 };
            case 7:
                return { x: 10, y: 42, w: 40, h: 27 };
            case 8:
                return { x: 12, y: 55, w: 40, h: 27 };
            case 9:
                return { x: 16, y: 70, w: 40, h: 27 };
            case 10:
                return { x: 21, y: 85, w: 40, h: 27 };
            case 11:
                return { x: 24, y: 100, w: 40, h: 27 };
        }
    }
};
var customPatternPersiaTranscaspia = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    if (numberOfItems <= 2) {
        switch (i) {
            case 0:
                return { x: 41, y: -2, w: 40, h: 27 };
            case 1:
                return { x: 88, y: 5, w: 40, h: 27 };
        }
    }
    else if (numberOfItems <= 4) {
        switch (i) {
            case 0:
                return { x: -2, y: -2, w: 40, h: 27 };
            case 1:
                return { x: 38, y: -2, w: 40, h: 27 };
            case 2:
                return { x: 78, y: 1, w: 40, h: 27 };
            case 3:
                return { x: 115, y: 9, w: 40, h: 27 };
        }
    }
    else {
        var mod = i % 9;
        switch (mod) {
            case 0:
                return { x: -8, y: -2, w: 40, h: 27 };
            case 1:
                return { x: 9, y: -1, w: 40, h: 27 };
            case 2:
                return { x: 26, y: 0, w: 40, h: 27 };
            case 3:
                return { x: 45, y: 0, w: 40, h: 27 };
            case 4:
                return { x: 67, y: 2, w: 40, h: 27 };
            case 5:
                return { x: 89, y: 4, w: 40, h: 27 };
            case 6:
                return { x: 109, y: 8, w: 40, h: 27 };
            case 7:
                return { x: 126, y: 13, w: 40, h: 27 };
            case 8:
                return { x: 141, y: 20, w: 40, h: 27 };
        }
    }
};
var tribesHeratPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: 39 + multiplier * 12, y: 10 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 53 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 85 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 117 + multiplier * 12, y: -18 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 129 + multiplier * 12, y: 13 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 115 + multiplier * 12, y: 44 + multiplier * 18, w: 30, h: 30 };
    }
};
var tribesKabulPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: 39 + multiplier * 12, y: 26 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 53 + multiplier * 12, y: -5 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 85 + multiplier * 12, y: -15 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 117 + multiplier * 12, y: -3 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 129 + multiplier * 12, y: 28 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 115 + multiplier * 12, y: 59 + multiplier * 18, w: 30, h: 30 };
    }
};
var tribesKandaharPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: 33 + multiplier * 12, y: 20 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 47 + multiplier * 12, y: -11 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 79 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 111 + multiplier * 12, y: -8 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 123 + multiplier * 12, y: 23 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 109 + multiplier * 12, y: 54 + multiplier * 18, w: 30, h: 30 };
    }
};
var tribesPersiaPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: 27 + multiplier * 12, y: 10 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 41 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 73 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 105 + multiplier * 12, y: -18 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 117 + multiplier * 12, y: 13 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 103 + multiplier * 12, y: 44 + multiplier * 18, w: 30, h: 30 };
    }
};
var tribesPunjabPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: -5 + multiplier * 12, y: 20 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 9 + multiplier * 12, y: -11 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 41 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 73 + multiplier * 12, y: -8 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 84 + multiplier * 12, y: 23 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 71 + multiplier * 12, y: 54 + multiplier * 18, w: 30, h: 30 };
    }
};
var tribesTranscaspiaPattern = function (_a) {
    var i = _a.index, numberOfItems = _a.itemCount;
    var multiplier = Math.floor(i / 6);
    var mod = i % 6;
    switch (mod) {
        case 0:
            return { x: 72 + multiplier * 12, y: 0 + multiplier * 18, w: 30, h: 30 };
        case 1:
            return { x: 86 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
        case 2:
            return { x: 118 + multiplier * 12, y: -41 + multiplier * 18, w: 30, h: 30 };
        case 3:
            return { x: 150 + multiplier * 12, y: -28 + multiplier * 18, w: 30, h: 30 };
        case 4:
            return { x: 162 + multiplier * 12, y: 3 + multiplier * 18, w: 30, h: 30 };
        case 5:
            return { x: 148 + multiplier * 12, y: 34 + multiplier * 18, w: 30, h: 30 };
    }
};
var Region = (function () {
    function Region(_a) {
        var game = _a.game, region = _a.region;
        this.game = game;
        this.region = region;
        this.setupRegion({ gamedatas: game.gamedatas });
    }
    Region.prototype.setupRegion = function (_a) {
        var gamedatas = _a.gamedatas;
        var regionGamedatas = gamedatas.map.regions[this.region];
        this.name = regionGamedatas.name;
        this.borders = regionGamedatas.borders;
        this.setupArmyZone({ regionGamedatas: regionGamedatas });
        this.setupTribeZone({ regionGamedatas: regionGamedatas });
        this.setupRulerZone({ gamedatas: gamedatas });
    };
    Region.prototype.setupArmyZone = function (_a) {
        var _this = this;
        var regionGamedatas = _a.regionGamedatas;
        this.armyZone = new TokenManualPositionStock(this.game.coalitionBlockManager, document.getElementById("pp_".concat(this.region, "_armies")), {}, function (element, cards, lastCard, stock) {
            return updateZoneDislay(_this.getPatternForArmyZone(), element, cards, lastCard, stock);
        });
        this.armyZone.addCards(regionGamedatas.armies.map(function (token) { return (__assign(__assign({}, token), { coalition: token.id.split('_')[1], type: 'army' })); }));
    };
    Region.prototype.createRuleToken = function () {
        return {
            id: "pp_ruler_token_".concat(this.region),
            region: this.region,
            state: 0,
            used: 0,
            location: this.region,
        };
    };
    Region.prototype.setupRulerZone = function (_a) {
        var gamedatas = _a.gamedatas;
        this.rulerZone = new LineStock(this.game.rulerTokenManager, document.getElementById("pp_position_ruler_token_".concat(this.region)), {
            center: false,
        });
        this.ruler = gamedatas.map.rulers[this.region];
        if (this.ruler === null) {
            this.rulerZone.addCard(this.createRuleToken());
        }
    };
    Region.prototype.setupTribeZone = function (_a) {
        var _this = this;
        var regionGamedatas = _a.regionGamedatas;
        this.tribeZone = new TokenManualPositionStock(this.game.cylinderManager, document.getElementById("pp_".concat(this.region, "_tribes")), {}, function (element, cards, lastCard, stock) {
            return updateZoneDislay(_this.getPatternForTribeZone(), element, cards, lastCard, stock);
        });
        this.tribeZone.addCards(regionGamedatas.tribes.map(function (token) { return (__assign(__assign({}, token), { color: _this.game.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color })); }));
    };
    Region.prototype.clearInterface = function () {
        this.armyZone.removeAll();
        this.armyZone = undefined;
        this.rulerZone.removeAll();
        this.rulerZone = undefined;
        this.tribeZone.removeAll();
        this.tribeZone = undefined;
    };
    Region.prototype.getArmyZone = function () {
        return this.armyZone;
    };
    Region.prototype.getRuler = function () {
        return this.ruler;
    };
    Region.prototype.getRulerTribes = function () {
        var _this = this;
        if (this.ruler) {
            return this.getTribeZone()
                .getCards()
                .filter(function (_a) {
                var id = _a.id;
                return Number(id.split('_')[1]) === _this.ruler;
            })
                .map(function (_a) {
                var id = _a.id;
                return id;
            });
        }
        return [];
    };
    Region.prototype.setRuler = function (_a) {
        var playerId = _a.playerId;
        this.ruler = playerId;
    };
    Region.prototype.getRulerZone = function () {
        return this.rulerZone;
    };
    Region.prototype.getTribeZone = function () {
        return this.tribeZone;
    };
    Region.prototype.getPatternForArmyZone = function () {
        switch (this.region) {
            case HERAT:
                return armiesHeratPattern;
            case KABUL:
                return armiesKabulPattern;
            case KANDAHAR:
                return armiesKandaharPattern;
            case PERSIA:
                return armiesPersiaPattern;
            case PUNJAB:
                return armiesPunjabPattern;
            case TRANSCASPIA:
                return armiesTranscaspiaPattern;
        }
    };
    Region.prototype.getPatternForTribeZone = function () {
        switch (this.region) {
            case HERAT:
                return tribesHeratPattern;
            case KABUL:
                return tribesKabulPattern;
            case KANDAHAR:
                return tribesKandaharPattern;
            case PERSIA:
                return tribesPersiaPattern;
            case PUNJAB:
                return tribesPunjabPattern;
            case TRANSCASPIA:
                return tribesTranscaspiaPattern;
        }
    };
    Region.prototype.removeAllArmies = function (armies) {
        if (armies === void 0) { armies = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.all(__spreadArray([], Object.entries(armies).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    return [2, this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: key }).addCards(value.map(function (block) { return ({
                                            id: block.tokenId,
                                            state: block.weight,
                                            used: 0,
                                            location: "supply_".concat(key),
                                            coalition: key,
                                            type: 'supply',
                                        }); }))];
                                });
                            });
                        }), true))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Region.prototype.removeAllTribes = function (tribes) {
        if (tribes === void 0) { tribes = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.all(__spreadArray(__spreadArray([], Object.entries(tribes).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return __awaiter(_this, void 0, void 0, function () {
                                var player;
                                var _this = this;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            player = this.game.playerManager.getPlayer({ playerId: Number(key) });
                                            return [4, player.getCylinderZone().addCards(value.map(function (_a) {
                                                    var tokenId = _a.tokenId, weight = _a.weight;
                                                    return _this.game.getCylinder({
                                                        id: tokenId,
                                                        state: weight,
                                                        used: 0,
                                                        location: "cylinders_".concat(player.getPlayerId()),
                                                    });
                                                }))];
                                        case 1:
                                            _b.sent();
                                            player.incCounter({ counter: 'cylinders', value: -value.length });
                                            return [2];
                                    }
                                });
                            });
                        }), true), [
                            this.getTribeZone().removeAll(),
                        ], false))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Region.prototype.createTempArmy = function (coalition, index) {
        var id = "temp_army_".concat(index);
        return {
            id: id,
            state: 1000,
            location: this.region,
            coalition: coalition,
            type: 'army',
            used: 0,
        };
    };
    Region.prototype.addTempArmy = function (_a) {
        var coalition = _a.coalition, index = _a.index;
        this.armyZone.addCard(this.createTempArmy(coalition, index));
    };
    Region.prototype.getCoalitionArmies = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.armyZone
            .getCards()
            .filter(function (block) { return block.id.split('_')[1] === coalitionId; })
            .map(function (block) { return block.id; });
    };
    Region.prototype.getEnemyArmies = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.armyZone
            .getCards()
            .filter(function (block) { return block.id.split('_')[1] !== coalitionId; })
            .map(function (block) { return block.id; });
    };
    Region.prototype.getEnemyPieces = function (args) {
        return __spreadArray(__spreadArray(__spreadArray([], this.getEnemyArmies(args), true), this.getEnemyRoads(args), true), this.getEnemyTribes(args), true);
    };
    Region.prototype.getEnemyRoads = function (_a) {
        var _this = this;
        var coalitionId = _a.coalitionId;
        var roads = [];
        this.borders.forEach(function (border) {
            var enemyRoads = _this.game.map.getBorder({ border: border }).getEnemyRoads({ coalitionId: coalitionId });
            roads = roads.concat(enemyRoads);
        });
        return roads;
    };
    Region.prototype.getEnemyTribes = function (_a) {
        var _this = this;
        var coalitionId = _a.coalitionId;
        return this.tribeZone
            .getCards()
            .filter(function (cylinder) {
            var playerId = Number(cylinder.id.split('_')[1]);
            return coalitionId !== _this.game.playerManager.getPlayer({ playerId: playerId }).getLoyalty();
        })
            .map(extractId);
    };
    Region.prototype.getPlayerTribes = function (_a) {
        var playerId = _a.playerId;
        return this.tribeZone
            .getCards()
            .filter(function (cylinder) {
            var cylinderPlayerId = Number(cylinder.id.split('_')[1]);
            return cylinderPlayerId === playerId;
        })
            .map(extractId);
    };
    Region.prototype.removeTempArmy = function (_a) {
        var index = _a.index;
        this.armyZone.removeCard(this.createTempArmy('afghan', index));
    };
    Region.prototype.setSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        var element = document.getElementById("pp_region_".concat(this.region));
        if (element) {
            element.classList.add('pp_selectable');
            this.game._connections.push(dojo.connect(element, 'onclick', this, function () { return callback({ regionId: _this.region }); }));
        }
    };
    Region.prototype.clearSelectable = function () {
        var element = document.getElementById("pp_region_".concat(this.region));
        if (element) {
            element.classList.remove(PP_SELECTABLE, PP_SELECTED);
        }
        var armySelect = document.getElementById("pp_".concat(this.region, "_armies_select"));
        if (armySelect) {
            armySelect.classList.remove(PP_SELECTABLE, PP_SELECTED);
        }
    };
    return Region;
}());
var PPMap = (function () {
    function PPMap(game) {
        var _this = this;
        this.game = game;
        this.borders = {};
        this.regions = {};
        REGIONS.forEach(function (region) {
            _this.regions[region] = new Region({ region: region, game: game });
        });
        BORDERS.forEach(function (border) {
            _this.borders[border] = new Border({ border: border, game: game });
        });
    }
    PPMap.prototype.clearInterface = function () {
        Object.values(this.borders).forEach(function (border) {
            border.clearInterface();
        });
        Object.values(this.regions).forEach(function (region) {
            region.clearInterface();
        });
    };
    PPMap.prototype.updateMap = function (_a) {
        var gamedatas = _a.gamedatas;
        Object.values(this.borders).forEach(function (border) {
            border.setupBorder({ gamedatas: gamedatas });
        });
        Object.values(this.regions).forEach(function (region) {
            region.setupRegion({ gamedatas: gamedatas });
        });
    };
    PPMap.prototype.getBorder = function (_a) {
        var border = _a.border;
        return this.borders[border];
    };
    PPMap.prototype.getRegion = function (_a) {
        var region = _a.region;
        return this.regions[region];
    };
    PPMap.prototype.setSelectable = function () {
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
    };
    PPMap.prototype.clearSelectable = function () {
        var _this = this;
        REGIONS.forEach(function (region) {
            _this.regions[region].clearSelectable();
        });
        BORDERS.forEach(function (border) {
            _this.borders[border].clearSelectable();
        });
        var mapArea = document.getElementById('pp_map_areas');
        if (mapArea) {
            mapArea.classList.remove(PP_SELECTABLE);
        }
        var armyRoadSelect = document.getElementById('pp_map_areas_borders_regions');
        if (armyRoadSelect) {
            armyRoadSelect.classList.remove(PP_SELECTABLE);
        }
    };
    return PPMap;
}());
var Market = (function () {
    function Market(game) {
        this.game = game;
        this.marketCards = [];
        this.marketRupees = [];
        var gamedatas = game.gamedatas;
        this.setupMarket({ gamedatas: gamedatas });
        this.setupDeck();
    }
    Market.prototype.setupDeck = function () {
        this.deck = new LineStock(this.game.cardManager, document.getElementById('pp_market_deck_stock'));
    };
    Market.prototype.setupMarket = function (_a) {
        var gamedatas = _a.gamedatas;
        for (var row = 0; row <= 1; row++) {
            if (!this.marketCards[row]) {
                this.marketCards[row] = [];
            }
            if (!this.marketRupees[row]) {
                this.marketRupees[row] = [];
            }
            for (var column = 0; column <= 5; column++) {
                this.setupMarketCardZone({ row: row, column: column, gamedatas: gamedatas });
                this.setupMarketRupeeZone({ row: row, column: column, gamedatas: gamedatas });
            }
        }
    };
    Market.prototype.setupMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        var containerId = "pp_market_".concat(row, "_").concat(column);
        dojo.place("<div id=\"pp_market_".concat(row, "_").concat(column, "_rupees\" class=\"pp_market_rupees\"></div>"), containerId);
        this.marketCards[row][column] = new LineStock(this.game.cardManager, document.getElementById("pp_market_".concat(row, "_").concat(column)));
        var cardInMarket = gamedatas.market.cards[row][column];
        if (cardInMarket) {
            this.marketCards[row][column].addCard(cardInMarket);
        }
    };
    Market.prototype.setupMarketRupeeZone = function (_a) {
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        var rupeeContainerId = "pp_market_".concat(row, "_").concat(column, "_rupees");
        this.marketRupees[row][column] = new LineStock(this.game.rupeeManager, document.getElementById(rupeeContainerId), {
            center: false,
            gap: "calc(var(--tokenScale) * -30px)",
        });
        var rupees = gamedatas.market.rupees.filter(function (rupee) { return rupee.location === "market_".concat(row, "_").concat(column, "_rupees"); });
        this.marketRupees[row][column].addCards(rupees);
    };
    Market.prototype.clearInterface = function () {
        for (var row = 0; row <= 1; row++) {
            for (var column = 0; column <= 5; column++) {
                this.marketCards[row][column].removeAll();
                this.marketRupees[row][column].removeAll();
                this.marketCards[row][column] = undefined;
                this.marketRupees[row][column] = undefined;
            }
        }
        this.deck.removeAll();
    };
    Market.prototype.getMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketCards[row][column];
    };
    Market.prototype.getMarketRupeesZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketRupees[row][column];
    };
    Market.prototype.setMilitarySuitIndicatorVisible = function (_a) {
        var visible = _a.visible;
        var node = document.getElementById('pp_market_board_military_suit_icon');
        if (!node) {
            return;
        }
        if (visible) {
            node.style.opacity = '1';
            this.game.tooltipManager.addMiltiarySuitIndicatorMarketTooltip();
        }
        else {
            node.style.opacity = '0';
            this.game.tooltipManager.removeMiltiarySuitIndicatorMarketTooltip();
        }
    };
    Market.prototype.removeSingleRupeeFromCard = function (_a) {
        var row = _a.row, column = _a.column, to = _a.to, rupeeId = _a.rupeeId, index = _a.index;
        return __awaiter(this, void 0, void 0, function () {
            var element;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.game.framework().wait(index * ANIMATION_WAIT_MS)];
                    case 1:
                        _b.sent();
                        element = document.getElementById(rupeeId);
                        return [4, moveToAnimation({
                                game: this.game,
                                element: element,
                                toId: to,
                                remove: true,
                            })];
                    case 2:
                        _b.sent();
                        return [4, this.marketRupees[row][column].removeCard({ id: rupeeId, state: 0, used: 0, location: '' })];
                    case 3:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    Market.prototype.removeRupeesFromCard = function (_a) {
        var row = _a.row, column = _a.column, to = _a.to;
        return __awaiter(this, void 0, void 0, function () {
            var rupees;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        rupees = this.marketRupees[row][column].getCards().reverse();
                        return [4, Promise.all(rupees.map(function (rupee, index) { return _this.removeSingleRupeeFromCard({ row: row, column: column, to: to, rupeeId: rupee.id, index: index }); }))];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    Market.prototype.placeRupeeOnCard = function (_a) {
        var row = _a.row, column = _a.column, rupeeId = _a.rupeeId, fromDiv = _a.fromDiv, cardId = _a.cardId, _b = _a.index, index = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var rupee;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        rupee = {
                            id: rupeeId,
                            state: 0,
                            used: 0,
                            location: '',
                        };
                        return [4, this.game.framework().wait(index * ANIMATION_WAIT_MS)];
                    case 1:
                        _c.sent();
                        return [4, this.marketRupees[row][column].addCard(rupee, { fromElement: document.getElementById(fromDiv) })];
                    case 2:
                        _c.sent();
                        if (!(cardId === ECE_PUBLIC_WITHDRAWAL_CARD_ID)) return [3, 4];
                        return [4, this.marketRupees[row][column].removeCard(rupee)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    Market.prototype.addCardFromDeck = function (_a) {
        var cardInfo = _a.card, to = _a.to;
        return __awaiter(this, void 0, void 0, function () {
            var card;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        card = __assign(__assign({}, cardInfo), { state: 0, used: 0, location: 'deck' });
                        return [4, this.deck.addCard(card)];
                    case 1:
                        _b.sent();
                        card.location = "market_".concat(to.row, "_").concat(to.column);
                        return [4, this.getMarketCardZone({ row: to.row, column: to.column }).addCard(card)];
                    case 2:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    Market.prototype.moveCard = function (_a) {
        var card = _a.card, from = _a.from, to = _a.to;
        return __awaiter(this, void 0, void 0, function () {
            var rupeesToMove, movePromises;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        rupeesToMove = this.getMarketRupeesZone({ row: from.row, column: from.column }).getCards();
                        movePromises = [
                            this.getMarketCardZone({ row: to.row, column: to.column }).addCard(__assign(__assign({}, card), { state: 0, used: 0, location: "market_".concat(to.row, "_").concat(to.column) })),
                        ];
                        if (rupeesToMove.length > 0) {
                            movePromises.push(this.getMarketRupeesZone({ row: to.row, column: to.column }).addCards(rupeesToMove));
                        }
                        return [4, Promise.all(movePromises)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    Market.prototype.discardCard = function (_a) {
        var cardId = _a.cardId, row = _a.row, column = _a.column, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                if (to === TEMP_DISCARD) {
                    this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard({
                        id: cardId,
                        state: 0,
                        used: 0,
                        location: "market_".concat(row, "_").concat(column),
                    }));
                }
                else {
                    this.game.objectManager.discardPile.discardCardFromZone(cardId);
                }
                return [2];
            });
        });
    };
    return Market;
}());
var getSettingsConfig = function () {
    var _a, _b;
    return ({
        layout: {
            id: 'layout',
            config: (_a = {},
                _a[PREF_TWO_COLUMNS_LAYOUT] = {
                    id: PREF_TWO_COLUMNS_LAYOUT,
                    onChangeInSetup: true,
                    defaultValue: 'disabled',
                    label: _('Two column layout'),
                    type: 'select',
                    options: [
                        {
                            label: _('Enabled'),
                            value: 'enabled',
                        },
                        {
                            label: _('Disabled (single column)'),
                            value: 'disabled',
                        },
                    ],
                },
                _a.columnSizes = {
                    id: 'columnSizes',
                    onChangeInSetup: true,
                    label: _('Column sizes'),
                    defaultValue: 50,
                    visibleCondition: {
                        id: 'twoColumnsLayout',
                        values: [PREF_ENABLED],
                    },
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 30,
                            max: 70,
                        },
                    },
                    type: 'slider',
                },
                _a[PREF_SINGLE_COLUMN_MAP_SIZE] = {
                    id: PREF_SINGLE_COLUMN_MAP_SIZE,
                    onChangeInSetup: true,
                    label: _("Map size"),
                    defaultValue: 100,
                    visibleCondition: {
                        id: "twoColumnsLayout",
                        values: [PREF_DISABLED],
                    },
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 30,
                            max: 100,
                        },
                    },
                    type: "slider",
                },
                _a[PREF_CARD_SIZE_IN_LOG] = {
                    id: PREF_CARD_SIZE_IN_LOG,
                    onChangeInSetup: true,
                    label: _('Size of cards in log'),
                    defaultValue: 100,
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 0,
                            max: 150,
                        },
                    },
                    type: 'slider',
                },
                _a[PREF_CARD_SIZE_IN_COURT] = {
                    id: PREF_CARD_SIZE_IN_COURT,
                    onChangeInSetup: true,
                    label: _("Size of cards in court"),
                    defaultValue: 100,
                    sliderConfig: {
                        step: 5,
                        padding: 0,
                        range: {
                            min: 50,
                            max: 200,
                        },
                    },
                    type: "slider",
                },
                _a),
        },
        gameplay: {
            id: 'gameplay',
            config: (_b = {},
                _b[PREF_SHOW_ANIMATIONS] = {
                    id: PREF_SHOW_ANIMATIONS,
                    onChangeInSetup: false,
                    defaultValue: PREF_ENABLED,
                    label: _('Show animations'),
                    type: 'select',
                    options: [
                        {
                            label: _('Enabled'),
                            value: PREF_ENABLED,
                        },
                        {
                            label: _('Disabled'),
                            value: PREF_DISABLED,
                        },
                    ],
                },
                _b[PREF_ANIMATION_SPEED] = {
                    id: PREF_ANIMATION_SPEED,
                    onChangeInSetup: false,
                    label: _('Animation speed'),
                    defaultValue: 1600,
                    visibleCondition: {
                        id: PREF_SHOW_ANIMATIONS,
                        values: [PREF_ENABLED],
                    },
                    sliderConfig: {
                        step: 100,
                        padding: 0,
                        range: {
                            min: 100,
                            max: 2000,
                        },
                    },
                    type: 'slider',
                },
                _b),
        },
    });
};
var Settings = (function () {
    function Settings(game) {
        this.ROOT = document.documentElement;
        this.settings = {};
        this.selectedTab = 'layout';
        this.tabs = [
            {
                id: 'layout',
                name: _('Layout'),
            },
            {
                id: 'gameplay',
                name: _('Gameplay'),
            },
        ];
        this.game = game;
        var gamedatas = game.gamedatas;
        this.setup({ gamedatas: gamedatas });
    }
    Settings.prototype.clearInterface = function () { };
    Settings.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
    };
    Settings.prototype.addButton = function (_a) {
        var gamedatas = _a.gamedatas;
        var configPanel = document.getElementById('info_panel_buttons');
        if (configPanel) {
            configPanel.insertAdjacentHTML('beforeend', tplSettingsButton());
        }
    };
    Settings.prototype.setupModal = function (_a) {
        var gamedatas = _a.gamedatas;
        this.modal = new Modal("settings_modal", {
            class: 'settings_modal',
            closeIcon: 'fa-times',
            titleTpl: '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',
            title: _('Settings'),
            contents: tplSettingsModalContent({
                tabs: this.tabs,
            }),
            closeAction: 'hide',
            verticalAlign: 'flex-start',
            breakpoint: 740,
        });
    };
    Settings.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.addButton({ gamedatas: gamedatas });
        this.setupModal({ gamedatas: gamedatas });
        this.setupModalContent();
        this.changeTab({ id: this.selectedTab });
        dojo.connect($("show_settings_menu"), 'onclick', function () { return _this.open(); });
        this.tabs.forEach(function (_a) {
            var id = _a.id;
            dojo.connect($("settings_modal_tab_".concat(id)), 'onclick', function () {
                return _this.changeTab({ id: id });
            });
        });
    };
    Settings.prototype.setupModalContent = function () {
        var _this = this;
        var config = getSettingsConfig();
        var node = document.getElementById('setting_modal_content');
        if (!node) {
            return;
        }
        Object.entries(config).forEach(function (_a) {
            var tabId = _a[0], tabConfig = _a[1];
            node.insertAdjacentHTML('beforeend', tplSettingsModalTabContent({ id: tabId }));
            var tabContentNode = document.getElementById("settings_modal_tab_content_".concat(tabId));
            if (!tabContentNode) {
                return;
            }
            Object.values(tabConfig.config).forEach(function (setting) {
                var id = setting.id, type = setting.type, defaultValue = setting.defaultValue, visibleCondition = setting.visibleCondition;
                var localValue = localStorage.getItem(_this.getLocalStorageKey({ id: id }));
                _this.settings[id] = localValue || defaultValue;
                var methodName = _this.getMethodName({ id: id });
                if (setting.onChangeInSetup && _this[methodName]) {
                    _this[methodName](localValue ? localValue : setting.defaultValue);
                }
                if (setting.type === 'select') {
                    var visible = !visibleCondition ||
                        (visibleCondition &&
                            visibleCondition.values.includes(_this.settings[visibleCondition.id]));
                    tabContentNode.insertAdjacentHTML('beforeend', tplPlayerPrefenceSelectRow({
                        setting: setting,
                        currentValue: _this.settings[setting.id],
                        visible: visible,
                    }));
                    var controlId_1 = "setting_".concat(setting.id);
                    $(controlId_1).addEventListener('change', function () {
                        var value = $(controlId_1).value;
                        _this.changeSetting({ id: setting.id, value: value });
                    });
                }
                else if (setting.type === 'slider') {
                    var visible = !visibleCondition ||
                        (visibleCondition &&
                            visibleCondition.values.includes(_this.settings[visibleCondition.id]));
                    tabContentNode.insertAdjacentHTML('beforeend', tplPlayerPrefenceSliderRow({
                        id: setting.id,
                        label: setting.label,
                        visible: visible,
                    }));
                    var sliderConfig = __assign(__assign({}, setting.sliderConfig), { start: _this.settings[setting.id] });
                    noUiSlider.create($('setting_' + setting.id), sliderConfig);
                    $('setting_' + setting.id).noUiSlider.on('slide', function (arg) {
                        return _this.changeSetting({ id: setting.id, value: arg[0] });
                    });
                }
            });
        });
    };
    Settings.prototype.changeSetting = function (_a) {
        var id = _a.id, value = _a.value;
        var suffix = this.getSuffix({ id: id });
        this.settings[id] = value;
        localStorage.setItem(this.getLocalStorageKey({ id: id }), value);
        var methodName = this.getMethodName({ id: id });
        if (this[methodName]) {
            this[methodName](value);
        }
    };
    Settings.prototype.onChangeTwoColumnsLayoutSetting = function (value) {
        this.checkColumnSizesVisisble();
        var node = document.getElementById('play_area_container');
        if (node) {
            node.setAttribute('data-two-columns', value);
        }
        this.game.updateLayout();
    };
    Settings.prototype.onChangeColumnSizesSetting = function (value) {
        this.game.updateLayout();
    };
    Settings.prototype.onChangeSingleColumnMapSizeSetting = function (value) {
        this.game.updateLayout();
    };
    Settings.prototype.onChangeCardSizeInLogSetting = function (value) {
        var ROOT = document.documentElement;
        ROOT.style.setProperty('--logCardScale', "".concat(Number(value) / 100));
    };
    Settings.prototype.onChangeCardSizeInCourtSetting = function (value) {
        var node = document.getElementById("pp_player_tableaus");
        if (node) {
            node.style.setProperty("--cardInCourtScale", "".concat(Number(value) / 100));
        }
    };
    Settings.prototype.onChangeAnimationSpeedSetting = function (value) {
        var duration = 2100 - value;
        debug('onChangeAnimationSpeedSetting', duration);
        this.game.animationManager.getSettings().duration = duration;
    };
    Settings.prototype.onChangeShowAnimationsSetting = function (value) {
        if (value === PREF_ENABLED) {
            this.game.animationManager.getSettings().duration = Number(this.settings[PREF_ANIMATION_SPEED]);
        }
        else {
            this.game.animationManager.getSettings().duration = 0;
        }
        this.checkAnmimationSpeedVisisble();
    };
    Settings.prototype.onChangeCardInfoInTooltipSetting = function (value) {
    };
    Settings.prototype.changeTab = function (_a) {
        var id = _a.id;
        var currentTab = document.getElementById("settings_modal_tab_".concat(this.selectedTab));
        var currentTabContent = document.getElementById("settings_modal_tab_content_".concat(this.selectedTab));
        currentTab.removeAttribute('data-state');
        if (currentTabContent) {
            currentTabContent.style.display = 'none';
        }
        this.selectedTab = id;
        var tab = document.getElementById("settings_modal_tab_".concat(id));
        var tabContent = document.getElementById("settings_modal_tab_content_".concat(this.selectedTab));
        tab.setAttribute('data-state', 'selected');
        if (tabContent) {
            tabContent.style.display = '';
        }
    };
    Settings.prototype.checkAnmimationSpeedVisisble = function () {
        var sliderNode = document.getElementById('setting_row_animationSpeed');
        if (!sliderNode) {
            return;
        }
        if (this.settings[PREF_SHOW_ANIMATIONS] === PREF_ENABLED) {
            sliderNode.style.display = '';
        }
        else {
            sliderNode.style.display = 'none';
        }
    };
    Settings.prototype.checkColumnSizesVisisble = function () {
        var sliderNode = document.getElementById('setting_row_columnSizes');
        var mapSizeSliderNode = document.getElementById('setting_row_singleColumnMapSize');
        if (!(sliderNode && mapSizeSliderNode)) {
            return;
        }
        if (this.settings['twoColumnsLayout'] === PREF_ENABLED) {
            sliderNode.style.display = '';
            mapSizeSliderNode.style.display = 'none';
        }
        else {
            sliderNode.style.display = 'none';
            mapSizeSliderNode.style.display = '';
        }
    };
    Settings.prototype.getMethodName = function (_a) {
        var id = _a.id;
        return "onChange".concat(this.getSuffix({ id: id }), "Setting");
    };
    Settings.prototype.get = function (_a) {
        var id = _a.id;
        return this.settings[id] || null;
    };
    Settings.prototype.getSuffix = function (_a) {
        var id = _a.id;
        return id.charAt(0).toUpperCase() + id.slice(1);
    };
    Settings.prototype.getLocalStorageKey = function (_a) {
        var id = _a.id;
        return "".concat(this.game.framework().game_name, "-").concat(this.getSuffix({ id: id }));
    };
    Settings.prototype.open = function () {
        this.modal.show();
    };
    return Settings;
}());
var tplSettingsButton = function () {
    return "<div id=\"show_settings_menu\">\n  <svg  xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 512\">\n    <g>\n      <path class=\"fa-secondary\" fill=\"currentColor\" d=\"M638.41 387a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4L602 335a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6 12.36 12.36 0 0 0-15.1 5.4l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 44.9c-29.6-38.5 14.3-82.4 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79zm136.8-343.8a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4l8.2-14.3a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6A12.36 12.36 0 0 0 552 7.19l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 45c-29.6-38.5 14.3-82.5 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79z\" opacity=\"0.4\"></path>\n      <path class=\"fa-primary\" fill=\"currentColor\" d=\"M420 303.79L386.31 287a173.78 173.78 0 0 0 0-63.5l33.7-16.8c10.1-5.9 14-18.2 10-29.1-8.9-24.2-25.9-46.4-42.1-65.8a23.93 23.93 0 0 0-30.3-5.3l-29.1 16.8a173.66 173.66 0 0 0-54.9-31.7V58a24 24 0 0 0-20-23.6 228.06 228.06 0 0 0-76 .1A23.82 23.82 0 0 0 158 58v33.7a171.78 171.78 0 0 0-54.9 31.7L74 106.59a23.91 23.91 0 0 0-30.3 5.3c-16.2 19.4-33.3 41.6-42.2 65.8a23.84 23.84 0 0 0 10.5 29l33.3 16.9a173.24 173.24 0 0 0 0 63.4L12 303.79a24.13 24.13 0 0 0-10.5 29.1c8.9 24.1 26 46.3 42.2 65.7a23.93 23.93 0 0 0 30.3 5.3l29.1-16.7a173.66 173.66 0 0 0 54.9 31.7v33.6a24 24 0 0 0 20 23.6 224.88 224.88 0 0 0 75.9 0 23.93 23.93 0 0 0 19.7-23.6v-33.6a171.78 171.78 0 0 0 54.9-31.7l29.1 16.8a23.91 23.91 0 0 0 30.3-5.3c16.2-19.4 33.7-41.6 42.6-65.8a24 24 0 0 0-10.5-29.1zm-151.3 4.3c-77 59.2-164.9-28.7-105.7-105.7 77-59.2 164.91 28.7 105.71 105.7z\"></path>\n    </g>\n  </svg>\n</div>";
};
var tplPlayerPrefenceSelectRow = function (_a) {
    var setting = _a.setting, currentValue = _a.currentValue, _b = _a.visible, visible = _b === void 0 ? true : _b;
    var values = setting.options
        .map(function (option) {
        return "<option value='".concat(option.value, "' ").concat(option.value === currentValue ? 'selected="selected"' : "", ">").concat(_(option.label), "</option>");
    })
        .join("");
    return "\n    <div id=\"setting_row_".concat(setting.id, "\" class=\"player_preference_row\"").concat(!visible ? " style=\"display: none;\"" : '', ">\n      <div class=\"player_preference_row_label\">").concat(_(setting.label), "</div>\n      <div class=\"player_preference_row_value\">\n        <select id=\"setting_").concat(setting.id, "\" class=\"\" style=\"display: block;\">\n        ").concat(values, "\n        </select>\n      </div>\n    </div>\n  ");
};
var tplSettingsModalTabContent = function (_a) {
    var id = _a.id;
    return "\n  <div id=\"settings_modal_tab_content_".concat(id, "\" style=\"display: none;\"></div>");
};
var tplSettingsModalTab = function (_a) {
    var id = _a.id, name = _a.name;
    return "\n  <div id=\"settings_modal_tab_".concat(id, "\" class=\"settings_modal_tab\">\n    <span>").concat(_(name), "</span>\n  </div>");
};
var tplSettingsModalContent = function (_a) {
    var tabs = _a.tabs;
    return "<div id=\"setting_modal_content\">\n    <div class=\"settings_modal_tabs\">\n  ".concat(tabs
        .map(function (_a) {
        var id = _a.id, name = _a.name;
        return tplSettingsModalTab({ id: id, name: name });
    })
        .join(""), "\n    </div>\n  </div>");
};
var tplPlayerPrefenceSliderRow = function (_a) {
    var label = _a.label, id = _a.id, _b = _a.visible, visible = _b === void 0 ? true : _b;
    return "\n  <div id=\"setting_row_".concat(id, "\" class=\"player_preference_row\"").concat(!visible ? " style=\"display: none;\"" : '', ">\n    <div class=\"player_preference_row_label\">").concat(_(label), "</div>\n    <div class=\"player_preference_row_value slider\">\n      <div id=\"setting_").concat(id, "\"></div>\n    </div>\n  </div>\n  ");
};
var AcceptPrizeState = (function () {
    function AcceptPrizeState(game) {
        this.game = game;
    }
    AcceptPrizeState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    AcceptPrizeState.prototype.onLeavingState = function () { };
    AcceptPrizeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        this.game.addPrimaryActionButton({
            id: 'accept_prize_btn',
            text: _('Accept prize'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'acceptPrize',
                    data: {
                        accept: true,
                    },
                });
            },
        });
        this.game.addSecondaryActionButton({
            id: 'no_prize_btn',
            text: _('Decline prize'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'acceptPrize',
                    data: {
                        accept: false,
                    },
                });
            },
        });
    };
    AcceptPrizeState.prototype.updatePageTitle = function () {
        var card = this.game.getCardInfo(this.cardId);
        var playerLoyalty = this.game.getCurrentPlayer().getLoyalty();
        if (card.prize !== playerLoyalty) {
            this.game.clientUpdatePageTitle({
                text: _('Accept ${cardName} as a prize and change loyalty to ${tkn_coalition} ?'),
                args: {
                    cardName: _(card.name),
                    tkn_coalition: card.prize,
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('Accept ${cardName} as a prize?'),
                args: {
                    cardName: _(card.name),
                },
            });
        }
    };
    return AcceptPrizeState;
}());
var ClientCardActionBattleState = (function () {
    function ClientCardActionBattleState(game) {
        this.game = game;
    }
    ClientCardActionBattleState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.bribe = bribe;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBattleState.prototype.onLeavingState = function () { };
    ClientCardActionBattleState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a region or court card to start a battle in'),
            args: {
                you: '${you}',
            },
        });
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
        this.setLocationsSelectable();
    };
    ClientCardActionBattleState.prototype.updateInterfaceSelectPiecesInRegion = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        this.game.clearPossible();
        this.location = regionId;
        var region = this.game.map.getRegion({ region: regionId });
        var coalitionId = this.game.getCurrentPlayer().getLoyalty();
        var enemyPieces = region.getEnemyPieces({ coalitionId: coalitionId }).filter(function (pieceId) { return _this.checkForCitadel({ pieceId: pieceId, region: regionId }); });
        debug('enemyPieces', enemyPieces);
        var cardInfo = this.game.getCardInfo(this.cardId);
        var cardRank = cardInfo.rank;
        this.maxNumberToSelect = Math.min(cardRank, this.getNumberOfFriendlyArmiesInRegion({ region: region, coalitionId: coalitionId }));
        this.numberSelected = 0;
        this.updatePageTitle('region');
        this.setPiecesSelectable({ pieces: enemyPieces });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmBattle(); },
        });
        dojo.addClass('confirm_btn', 'disabled');
        this.game.addCancelButton();
    };
    ClientCardActionBattleState.prototype.updateInterfaceSelectPiecesOnCard = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.location = cardId;
        var cardInfo = this.game.getCardInfo(this.cardId);
        var cardRank = cardInfo.rank;
        var _b = this.getSpies({ cardId: cardId }), enemy = _b.enemy, own = _b.own;
        this.maxNumberToSelect = Math.min(cardRank, own.length);
        this.numberSelected = 0;
        this.updatePageTitle('card');
        this.setPiecesSelectable({ pieces: enemy.filter(function (cylinderId) { return _this.checkForIndispensableAdvisors({ cylinderId: cylinderId }); }) });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmBattle(); },
        });
        dojo.addClass('confirm_btn', 'disabled');
        this.game.addCancelButton();
    };
    ClientCardActionBattleState.prototype.checkForCitadel = function (_a) {
        var pieceId = _a.pieceId, region = _a.region;
        if (!pieceId.startsWith('cylinder')) {
            return true;
        }
        if (region === KABUL &&
            this.game.playerManager.getPlayer({ playerId: Number(pieceId.split('_')[1]) }).hasSpecialAbility({ specialAbility: SA_CITADEL_KABUL })) {
            return false;
        }
        if (region === TRANSCASPIA &&
            this.game.playerManager
                .getPlayer({ playerId: Number(pieceId.split('_')[1]) })
                .hasSpecialAbility({ specialAbility: SA_CITADEL_TRANSCASPIA })) {
            return false;
        }
        return true;
    };
    ClientCardActionBattleState.prototype.checkForIndispensableAdvisors = function (_a) {
        var cylinderId = _a.cylinderId;
        return !this.game.playerManager
            .getPlayer({ playerId: Number(cylinderId.split('_')[1]) })
            .hasSpecialAbility({ specialAbility: SA_INDISPENSABLE_ADVISORS });
    };
    ClientCardActionBattleState.prototype.getNumberOfFriendlyArmiesInRegion = function (_a) {
        var coalitionId = _a.coalitionId, region = _a.region;
        var coalitionArmies = region.getCoalitionArmies({ coalitionId: coalitionId });
        var player = this.game.getCurrentPlayer();
        var tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
            ? region.getPlayerTribes({ playerId: player.getPlayerId() }).length
            : 0;
        return coalitionArmies.length + tribesNationalism;
    };
    ClientCardActionBattleState.prototype.confirmBattle = function () {
        var _a, _b;
        debug('confirmBattle');
        var pieces = [];
        dojo.query('.pp_selected').forEach(function (node) { return pieces.push(node.id); });
        debug('pieces', pieces);
        var numberOfPieces = pieces.length;
        if (numberOfPieces <= this.maxNumberToSelect && numberOfPieces > 0) {
            this.game.takeAction({
                action: 'battle',
                data: {
                    removedPieces: pieces.join(' '),
                    location: this.location,
                    cardId: this.cardId,
                    bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
                },
            });
        }
    };
    ClientCardActionBattleState.prototype.getCourtCardBattleSites = function () {
        var _this = this;
        var battleSites = [];
        this.game.playerManager.getPlayers().forEach(function (player) {
            var courtCards = player.getCourtCards();
            courtCards.forEach(function (card) {
                var _a = _this.getSpies({ cardId: card.id }), enemy = _a.enemy, own = _a.own;
                if (enemy.filter(function (cylinderId) { return _this.checkForIndispensableAdvisors({ cylinderId: cylinderId }); }).length > 0 && own.length > 0) {
                    battleSites.push(card.id);
                }
            });
        });
        return battleSites;
    };
    ClientCardActionBattleState.prototype.getRegionBattleSites = function () {
        var _this = this;
        return REGIONS.filter(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var coalitionId = _this.game.getCurrentPlayer().getLoyalty();
            var enemyPieces = region.getEnemyPieces({ coalitionId: coalitionId }).filter(function (pieceId) { return _this.checkForCitadel({ pieceId: pieceId, region: regionId }); });
            if (enemyPieces.length === 0 || _this.getNumberOfFriendlyArmiesInRegion({ region: region, coalitionId: coalitionId }) === 0) {
                return false;
            }
            return true;
        });
    };
    ClientCardActionBattleState.prototype.getSpies = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return {
                enemy: [],
                own: [],
            };
        }
        var cylinderIds = spyZone.getCards().map(extractId);
        return {
            enemy: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId(); }),
            own: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) === _this.game.getPlayerId(); }),
        };
    };
    ClientCardActionBattleState.prototype.handlePieceClicked = function (_a) {
        var pieceId = _a.pieceId;
        debug('Piece clicked', pieceId);
        dojo.query("#".concat(pieceId)).toggleClass('pp_selected').toggleClass('pp_selectable');
        this.numberSelected = dojo.query('.pp_selected').length;
        if (this.numberSelected > 0 && this.numberSelected <= this.maxNumberToSelect) {
            dojo.removeClass('confirm_btn', 'disabled');
        }
        else {
            dojo.addClass('confirm_btn', 'disabled');
        }
        this.updatePageTitle(this.location.startsWith('card') ? 'card' : 'region');
    };
    ClientCardActionBattleState.prototype.setPiecesSelectable = function (_a) {
        var _this = this;
        var pieces = _a.pieces;
        pieces.forEach(function (pieceId) {
            dojo.query("#".concat(pieceId)).forEach(function (node, index) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.handlePieceClicked({ pieceId: pieceId }); }));
            });
        });
    };
    ClientCardActionBattleState.prototype.setLocationsSelectable = function () {
        var _this = this;
        debug('setLocationsSelectable');
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
        this.getRegionBattleSites().forEach(function (regionId) {
            var element = document.getElementById("pp_region_".concat(regionId));
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceSelectPiecesInRegion({ regionId: regionId }); }));
            }
        });
        var courtBattleSites = this.getCourtCardBattleSites();
        courtBattleSites.forEach(function (cardId) {
            dojo.query("#".concat(cardId)).forEach(function (node, index) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    _this.updateInterfaceSelectPiecesOnCard({ cardId: cardId });
                }));
            });
        });
    };
    ClientCardActionBattleState.prototype.updatePageTitle = function (location) {
        var mainText = {
            card: _('${you} may select spies to remove'),
            region: _('${you} may select tribes, roads or armies to remove'),
        };
        this.game.clientUpdatePageTitle({
            text: mainText[location] + _(' (${remaining} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberToSelect,
                remaining: this.maxNumberToSelect - this.numberSelected,
            },
        });
    };
    return ClientCardActionBattleState;
}());
var ClientCardActionBetrayState = (function () {
    function ClientCardActionBetrayState(game) {
        this.game = game;
    }
    ClientCardActionBetrayState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.bribe = bribe;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBetrayState.prototype.onLeavingState = function () { };
    ClientCardActionBetrayState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a court card to betray'),
            args: {
                you: '${you}',
            },
        });
        this.setCourtCardsSelectable();
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
    };
    ClientCardActionBetrayState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var betrayedCardId = _a.betrayedCardId;
        this.game.clearPossible();
        var card = this.game.getCardInfo(betrayedCardId);
        var node = dojo.byId(betrayedCardId);
        dojo.addClass(node, 'pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Betray ${cardName}?'),
            args: {
                cardName: _(card.name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.handleConfirm({ betrayedCardId: betrayedCardId }); },
        });
        this.game.addCancelButton();
    };
    ClientCardActionBetrayState.prototype.getSpies = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return {
                enemy: [],
                own: [],
            };
        }
        var cylinderIds = spyZone.getCards().map(extractId);
        return {
            enemy: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId(); }),
            own: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) === _this.game.getPlayerId(); }),
        };
    };
    ClientCardActionBetrayState.prototype.handleConfirm = function (_a) {
        var _b, _c;
        var betrayedCardId = _a.betrayedCardId;
        debug('handleConfirm', betrayedCardId);
        this.game.takeAction({
            action: 'betray',
            data: {
                cardId: this.cardId,
                betrayedCardId: betrayedCardId,
                bribeAmount: (_c = (_b = this.bribe) === null || _b === void 0 ? void 0 : _b.amount) !== null && _c !== void 0 ? _c : null,
            },
        });
    };
    ClientCardActionBetrayState.prototype.getCourtCardsToBetray = function () {
        var _this = this;
        var courtCards = [];
        this.game.playerManager.getPlayers().forEach(function (player) {
            player.getCourtCards().forEach(function (card) {
                var _a = _this.getSpies({ cardId: card.id }), enemy = _a.enemy, own = _a.own;
                if (own.length === 0) {
                    return;
                }
                if (card.suit === POLITICAL && player.hasSpecialAbility({ specialAbility: SA_BODYGUARDS })) {
                    return;
                }
                courtCards.push(card);
            });
        });
        return courtCards;
    };
    ClientCardActionBetrayState.prototype.setCourtCardsSelectable = function () {
        var _this = this;
        var cardsToBetray = this.getCourtCardsToBetray();
        cardsToBetray.forEach(function (card) {
            var node = dojo.byId(card.id);
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfaceConfirm({ betrayedCardId: card.id });
            }));
        });
    };
    return ClientCardActionBetrayState;
}());
var ClientCardActionBuildState = (function () {
    function ClientCardActionBuildState(game, specialAbilityInfrastructure) {
        this.game = game;
        this.isSpecialAbilityInfrastructure = specialAbilityInfrastructure;
    }
    ClientCardActionBuildState.prototype.onEnteringState = function (props) {
        this.cardId = (props === null || props === void 0 ? void 0 : props.cardId) ? props.cardId : null;
        this.bribe = props === null || props === void 0 ? void 0 : props.bribe;
        this.tempTokens = [];
        this.setMaxNumberToPlace();
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBuildState.prototype.onLeavingState = function () { };
    ClientCardActionBuildState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.updatePageTitle();
        this.setLocationsSelectable();
        this.updateActionButtons();
    };
    ClientCardActionBuildState.prototype.createTokenLog = function () {
        var log = '';
        var args = {};
        var coalition = this.game.getCurrentPlayer().getLoyalty();
        this.tempTokens.forEach(function (tempToken, index) {
            var key = "tkn_".concat(tempToken.type, "_").concat(index);
            args[key] = "".concat(coalition, "_").concat(tempToken.type);
            log += '${' + key + '}';
        });
        return {
            log: log,
            args: args,
        };
    };
    ClientCardActionBuildState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        var amount = this.isSpecialAbilityInfrastructure ? 0 : Math.ceil(this.tempTokens.length / (this.playerHasNationBuilding ? 2 : 1)) * 2;
        this.game.clientUpdatePageTitle({
            text: _('Place ${tokens} for a cost of ${amount} ${tkn_rupee} ?'),
            args: {
                amount: amount,
                tokens: this.createTokenLog(),
                tkn_rupee: _('rupee(s)'),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.onConfirm(); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.onCancel(); },
        });
    };
    ClientCardActionBuildState.prototype.onLocationClick = function (_a) {
        var id = _a.id, type = _a.type;
        if (this.maxNumberToPlace - this.tempTokens.length <= 0) {
            return;
        }
        debug('onLocationClick', location);
        var player = this.game.getCurrentPlayer();
        var coalition = player.getLoyalty();
        if (type === 'army') {
            var region = this.game.map.getRegion({ region: id });
            region.addTempArmy({ coalition: coalition, index: this.tempTokens.length });
            this.tempTokens.push({
                location: id,
                type: 'army',
            });
        }
        else if (type === 'road') {
            var border = this.game.map.getBorder({ border: id });
            border.addTempRoad({ coalition: coalition, index: this.tempTokens.length });
            this.tempTokens.push({
                location: id,
                type: 'road',
            });
        }
        this.updatePageTitle();
        this.updateActionButtons();
    };
    ClientCardActionBuildState.prototype.onCancel = function () {
        this.clearTemporaryTokens();
        this.game.onCancel();
    };
    ClientCardActionBuildState.prototype.onConfirm = function () {
        var _a, _b;
        debug('handleConfirm');
        if (this.tempTokens.length > 0) {
            this.game.takeAction({
                action: this.isSpecialAbilityInfrastructure ? 'specialAbilityInfrastructure' : 'build',
                data: { cardId: this.cardId || undefined, locations: JSON.stringify(this.tempTokens), bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null },
            });
            this.clearTemporaryTokens();
        }
    };
    ClientCardActionBuildState.prototype.setMaxNumberToPlace = function () {
        var _a;
        var player = this.game.getCurrentPlayer();
        if (this.isSpecialAbilityInfrastructure) {
            this.maxNumberToPlace = 1;
            return;
        }
        var playerRupees = player.getRupees();
        this.playerHasNationBuilding = player.ownsEventCard({ cardId: ECE_NATION_BUILDING_CARD_ID });
        var multiplier = this.playerHasNationBuilding ? 2 : 1;
        var bribe = ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) || 0;
        var maxAffordable = Math.floor((playerRupees - bribe) / 2);
        this.maxNumberToPlace = Math.min(maxAffordable, 3) * multiplier;
    };
    ClientCardActionBuildState.prototype.clearTemporaryTokens = function () {
        var _this = this;
        debug('inside clearTemporaryTokens');
        this.tempTokens.forEach(function (token, index) {
            var location = token.location, type = token.type;
            if (type === 'army') {
                _this.game.map.getRegion({ region: location }).removeTempArmy({ index: index });
            }
            else if (type === 'road') {
                _this.game.map.getBorder({ border: location }).removeTempRoad({ index: index });
            }
        });
        this.tempTokens = [];
    };
    ClientCardActionBuildState.prototype.getRegionsToBuild = function () {
        var _this = this;
        return REGIONS.filter(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var ruler = region.getRuler();
            return ruler === _this.game.getPlayerId();
        });
    };
    ClientCardActionBuildState.prototype.setLocationsSelectable = function () {
        var _this = this;
        debug('setRegionsSelectable');
        var container = document.getElementById("pp_map_areas_borders_regions");
        container.classList.add('pp_selectable');
        this.getRegionsToBuild().forEach(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var armyLocation = "pp_".concat(regionId, "_armies_select");
            var element = document.getElementById(armyLocation);
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.onLocationClick({ id: regionId, type: 'army' }); }));
            }
            region.borders.forEach(function (borderId) {
                var borderLocation = "pp_".concat(borderId, "_border_select");
                var element = document.getElementById(borderLocation);
                if (element && !element.classList.contains('pp_selectable')) {
                    element.classList.add('pp_selectable');
                    _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.onLocationClick({ id: borderId, type: 'road' }); }));
                }
            });
        });
    };
    ClientCardActionBuildState.prototype.updatePageTitle = function () {
        if (this.isSpecialAbilityInfrastructure) {
            this.game.clientUpdatePageTitle({
                text: _('${you} may place one additional block'),
                args: {
                    you: '${you}',
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('${you} must select regions to place ${tkn_army} and/or ${tkn_road} (up to ${number} remaining)'),
                args: {
                    you: '${you}',
                    number: this.maxNumberToPlace - this.tempTokens.length,
                    tkn_army: "".concat(this.game.getCurrentPlayer().getLoyalty(), "_army"),
                    tkn_road: "".concat(this.game.getCurrentPlayer().getLoyalty(), "_road"),
                },
            });
        }
    };
    ClientCardActionBuildState.prototype.updateActionButtons = function () {
        var _this = this;
        var _a;
        this.game.framework().removeActionButtons();
        dojo.empty('customActions');
        this.game.addPrimaryActionButton({
            id: 'done_button',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        if (this.tempTokens.length === 0) {
            dojo.addClass('done_button', 'disabled');
        }
        if (this.isSpecialAbilityInfrastructure) {
            this.game.addDangerActionButton({
                id: 'skip_btn',
                text: _('Skip'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilityInfrastructure', data: { skip: true } }); },
            });
        }
        else if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && this.tempTokens.length === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.clearTemporaryTokens();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () { return _this.onCancel(); },
            });
        }
    };
    return ClientCardActionBuildState;
}());
var ClientCardActionGiftState = (function () {
    function ClientCardActionGiftState(game) {
        this.game = game;
    }
    ClientCardActionGiftState.prototype.onEnteringState = function (args) {
        this.bribe = args.bribe;
        this.updateInterfaceInitialStep(args);
    };
    ClientCardActionGiftState.prototype.onLeavingState = function () { };
    ClientCardActionGiftState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var _b;
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a gift to purchase'),
            args: {
                you: '${you}',
            },
        });
        this.setGiftsSelectable({ cardId: cardId });
        if ((_b = this.bribe) === null || _b === void 0 ? void 0 : _b.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
    };
    ClientCardActionGiftState.prototype.updateInterfaceConfirmSelectGift = function (_a) {
        var _this = this;
        var value = _a.value, cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query("#pp_gift_".concat(value, "_").concat(this.game.getPlayerId())).addClass('pp_selected');
        this.game.clientUpdatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + value } });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                var _a, _b;
                return _this.game.takeAction({
                    action: 'purchaseGift',
                    data: { value: value, cardId: cardId, bribeAmount: (_b = (_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null, },
                });
            },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.game.onCancel();
            },
        });
    };
    ClientCardActionGiftState.prototype.setGiftsSelectable = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var playerId = this.game.getPlayerId();
        [2, 4, 6].forEach(function (giftValue) {
            var _a;
            var hasGift = _this.game.playerManager
                .getPlayer({ playerId: playerId })
                .getGiftZone({
                value: giftValue,
            })
                .getCards().length > 0;
            if (!hasGift && giftValue <= _this.game.getCurrentPlayer().getRupees() - (((_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.amount) || 0)) {
                dojo.query("#pp_gift_".concat(giftValue, "_").concat(playerId)).forEach(function (node) {
                    dojo.addClass(node, 'pp_selectable');
                    _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmSelectGift({ value: giftValue, cardId: cardId }); }));
                });
            }
        });
    };
    return ClientCardActionGiftState;
}());
var ClientCardActionMoveState = (function () {
    function ClientCardActionMoveState(game) {
        var _this = this;
        this.getPlayerOrder = function () {
            return _this.game.playerOrder;
        };
        this.game = game;
    }
    ClientCardActionMoveState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.game.clearPossible();
        this.cardId = cardId;
        this.bribe = bribe;
        var cardInfo = this.game.getCardInfo(cardId);
        this.maxNumberOfMoves = cardInfo.rank;
        this.moves = {};
        this.updateInterfaceInitialStep();
    };
    ClientCardActionMoveState.prototype.onLeavingState = function () { };
    ClientCardActionMoveState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.updatePageTitle();
        this.setArmiesSelectable();
        this.setSpiesSelectable();
        if (this.totalNumberOfMoves() > 0) {
            this.game.addPrimaryActionButton({
                id: 'confirm_btn',
                text: _('Confirm'),
                callback: function () { return _this.onConfirm(); },
            });
        }
        if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && Object.keys(this.moves).length === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.returnPiecesToOriginalPosition();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.addCancelButton();
        }
    };
    ClientCardActionMoveState.prototype.updateInterfaceArmySelected = function (_a) {
        var pieceId = _a.pieceId, regionId = _a.regionId;
        this.game.clearPossible();
        dojo.query("#".concat(pieceId)).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
        this.setDestinationRegionsSelectable({ pieceId: pieceId, regionId: regionId });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select the region to move the army to'),
            args: {
                you: '${you}',
            },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.updateIntefaceSpySelected = function (_a) {
        var pieceId = _a.pieceId, cardId = _a.cardId;
        debug('updateIntefaceSpySelected', pieceId, cardId);
        this.game.clearPossible();
        dojo.query("#".concat(pieceId)).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
        this.setDestinationCardsSelectable({ pieceId: pieceId, cardId: cardId });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select the card to move the spy to'),
            args: {
                you: '${you}',
            },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.updateInterfaceConfirmMoves = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm moves?'),
            args: {},
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.onConfirm(); },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.onCardClick = function (_a) {
        var toCardId = _a.toCardId, fromCardId = _a.fromCardId, pieceId = _a.pieceId;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        debug('onCardClick', pieceId, fromCardId, toCardId);
                        this.game.clearPossible();
                        this.addMove({ from: fromCardId, to: toCardId, pieceId: pieceId });
                        return [4, this.game.spies[toCardId].addCard(this.game.getCylinder({
                                id: pieceId,
                                location: "spies_".concat(toCardId),
                                state: 0,
                                used: 0,
                            }))];
                    case 1:
                        _b.sent();
                        this.nextStepAfterMove();
                        return [2];
                }
            });
        });
    };
    ClientCardActionMoveState.prototype.onConfirm = function () {
        var _a, _b;
        if (this.totalNumberOfMoves() > 0) {
            this.game.takeAction({
                action: 'move',
                data: {
                    cardId: this.cardId,
                    moves: JSON.stringify(this.moves),
                    bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
                },
            });
        }
    };
    ClientCardActionMoveState.prototype.onRegionClick = function (_a) {
        var fromRegionId = _a.fromRegionId, toRegionId = _a.toRegionId, pieceId = _a.pieceId;
        return __awaiter(this, void 0, void 0, function () {
            var fromRegion, toRegion, isPieceArmy;
            return __generator(this, function (_b) {
                debug('onRegionClick', fromRegionId, toRegionId, pieceId);
                this.game.clearPossible();
                fromRegion = this.game.map.getRegion({ region: fromRegionId });
                toRegion = this.game.map.getRegion({ region: toRegionId });
                isPieceArmy = pieceId.startsWith('block');
                this.addMove({ from: fromRegionId, to: toRegionId, pieceId: pieceId });
                if (isPieceArmy) {
                    toRegion.getArmyZone().addCard(getArmy({
                        id: pieceId,
                        location: "armies_".concat(toRegionId),
                        state: 0,
                        used: 0,
                    }));
                }
                else {
                    toRegion.getTribeZone().addCard(this.game.getCylinder({
                        id: pieceId,
                        location: "tribes_".concat(toRegionId),
                        state: 0,
                        used: 0,
                    }));
                }
                this.nextStepAfterMove();
                return [2];
            });
        });
    };
    ClientCardActionMoveState.prototype.nextStepAfterMove = function () {
        if (this.maxNumberOfMoves > this.totalNumberOfMoves()) {
            this.updateInterfaceInitialStep();
        }
        else {
            this.updateInterfaceConfirmMoves();
        }
    };
    ClientCardActionMoveState.prototype.addMove = function (_a) {
        var pieceId = _a.pieceId, from = _a.from, to = _a.to;
        if (this.moves[pieceId]) {
            this.moves[pieceId].push({
                from: from,
                to: to,
            });
        }
        else {
            this.moves[pieceId] = [
                {
                    from: from,
                    to: to,
                },
            ];
        }
    };
    ClientCardActionMoveState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.returnPiecesToOriginalPosition();
                _this.game.onCancel();
            },
        });
    };
    ClientCardActionMoveState.prototype.getNextCardId = function (_a) {
        var _b;
        var cardId = _a.cardId;
        var node = dojo.byId(cardId);
        var playerId = Number((_b = node.closest('.pp_court')) === null || _b === void 0 ? void 0 : _b.id.split('_')[3]);
        var cardIds = this.game.playerManager
            .getPlayer({ playerId: playerId })
            .getCourtZone()
            .getCards()
            .map(function (card) { return card.id; });
        var index = cardIds.indexOf(cardId);
        if (index !== cardIds.length - 1) {
            return cardIds[index + 1];
        }
        var currentPlayerId = playerId;
        while (true) {
            var nextPlayerId = this.getNextPlayer({ playerId: currentPlayerId });
            var nextPlayerCardsIds = this.game.playerManager
                .getPlayer({ playerId: nextPlayerId })
                .getCourtZone()
                .getCards()
                .map(function (card) { return card.id; });
            if (nextPlayerCardsIds.length > 0) {
                return nextPlayerCardsIds[0];
            }
            else {
                currentPlayerId = nextPlayerId;
            }
        }
    };
    ClientCardActionMoveState.prototype.getPreviousCardId = function (_a) {
        var _b;
        var cardId = _a.cardId;
        var node = dojo.byId(cardId);
        var playerId = Number((_b = node.closest('.pp_court')) === null || _b === void 0 ? void 0 : _b.id.split('_')[3]);
        var cardIds = this.game.playerManager
            .getPlayer({ playerId: playerId })
            .getCourtZone()
            .getCards()
            .map(function (card) { return card.id; });
        var index = cardIds.indexOf(cardId);
        if (index !== 0) {
            return cardIds[index - 1];
        }
        var currentPlayerId = playerId;
        while (true) {
            var previousPlayerId = this.getPreviousPlayer({ playerId: currentPlayerId });
            var previousPlayerCardIds = this.game.playerManager
                .getPlayer({ playerId: previousPlayerId })
                .getCourtZone()
                .getCards()
                .map(function (card) { return card.id; });
            if (previousPlayerCardIds.length > 0) {
                return previousPlayerCardIds[previousPlayerCardIds.length - 1];
            }
            else {
                currentPlayerId = previousPlayerId;
            }
        }
    };
    ClientCardActionMoveState.prototype.getNextPlayer = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === playerOrder.length - 1) {
            return playerOrder[0];
        }
        else {
            return playerOrder[playerIndex + 1];
        }
    };
    ClientCardActionMoveState.prototype.getPreviousPlayer = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === 0) {
            return playerOrder[playerOrder.length - 1];
        }
        else {
            return playerOrder[playerIndex - 1];
        }
    };
    ClientCardActionMoveState.prototype.returnPiecesToOriginalPosition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, record, key, value, from, to;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        debug('returnPiecesToOriginalPosition');
                        _i = 0, _a = Object.entries(this.moves);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 7];
                        record = _a[_i];
                        key = record[0], value = record[1];
                        if (value.length === 0) {
                            return [2];
                        }
                        debug('returnPiecesToOriginalPosition', key, value);
                        from = value[value.length - 1].to;
                        to = value[0].from;
                        if (from === to) {
                            return [2];
                        }
                        if (!key.includes('block')) return [3, 3];
                        return [4, this.game.map
                                .getRegion({ region: to })
                                .getArmyZone()
                                .addCard(getArmy({
                                id: key,
                                location: "armies_".concat(to),
                                state: 0,
                                used: 0,
                            }))];
                    case 2:
                        _b.sent();
                        return [3, 6];
                    case 3:
                        if (!(key.includes('cylinder') && !from.startsWith('card'))) return [3, 4];
                        this.game.map
                            .getRegion({ region: to })
                            .getTribeZone()
                            .addCard(this.game.getCylinder({ id: key, location: "tribes_".concat(to), state: 0, used: 0 }));
                        return [3, 6];
                    case 4:
                        if (!key.includes('cylinder')) return [3, 6];
                        return [4, this.game.spies[to].addCard(this.game.getCylinder({
                                id: key,
                                location: "spies_".concat(to),
                                state: 0,
                                used: 0,
                            }))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3, 1];
                    case 7: return [2];
                }
            });
        });
    };
    ClientCardActionMoveState.prototype.getArmiesToMove = function () {
        var _this = this;
        var pieceIds = [];
        var player = this.game.getCurrentPlayer();
        var coalitionId = player.getLoyalty();
        REGIONS.forEach(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var coalitionArmies = region.getCoalitionArmies({ coalitionId: coalitionId });
            var tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
                ? region.getPlayerTribes({ playerId: player.getPlayerId() })
                : [];
            if (coalitionArmies.length + tribesNationalism.length === 0) {
                return;
            }
            var hasIndianSupplies = player.hasSpecialAbility({ specialAbility: SA_INDIAN_SUPPLIES });
            var hasCoalitionRoads = hasIndianSupplies ||
                region.borders.some(function (borderId) {
                    var border = _this.game.map.getBorder({ border: borderId });
                    return border.getCoalitionRoads({ coalitionId: coalitionId }).length > 0;
                });
            if (!hasCoalitionRoads) {
                return;
            }
            var pieces = coalitionArmies.concat(tribesNationalism);
            pieces.forEach(function (pieceId) {
                pieceIds.push({ pieceId: pieceId, regionId: regionId });
            });
        });
        return pieceIds;
    };
    ClientCardActionMoveState.prototype.setArmiesSelectable = function () {
        var _this = this;
        this.getArmiesToMove().forEach(function (_a) {
            var pieceId = _a.pieceId, regionId = _a.regionId;
            var element = dojo.byId(pieceId);
            element.classList.add('pp_selectable');
            _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceArmySelected({ pieceId: pieceId, regionId: regionId }); }));
        });
    };
    ClientCardActionMoveState.prototype.getSingleMoveDestinationsForSpy = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo(cardId);
        var destinationCards = [];
        destinationCards.push(this.getNextCardId({ cardId: cardId }));
        var previousCardId = this.getPreviousCardId({ cardId: cardId });
        if (!destinationCards.includes(previousCardId)) {
            destinationCards.push(previousCardId);
        }
        var player = this.game.getCurrentPlayer();
        if (player.hasSpecialAbility({ specialAbility: SA_STRANGE_BEDFELLOWS })) {
            dojo.query(".pp_court .pp_card.pp_".concat(cardInfo.region)).forEach(function (node) {
                var nodeId = node.id;
                if (!destinationCards.includes(nodeId)) {
                    destinationCards.push(nodeId);
                }
            });
        }
        return destinationCards;
    };
    ClientCardActionMoveState.prototype.setDestinationCardsSelectable = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId, inputCardId = _a.cardId;
        debug('setDestinationCardsSelectable', pieceId, inputCardId);
        var destinationCards = this.getSingleMoveDestinationsForSpy({ cardId: inputCardId });
        var player = this.game.getCurrentPlayer();
        if (player.hasSpecialAbility({ specialAbility: SA_WELL_CONNECTED })) {
            __spreadArray([], destinationCards, true).forEach(function (cardId) {
                destinationCards.push.apply(destinationCards, _this.getSingleMoveDestinationsForSpy({ cardId: cardId }));
            });
        }
        var uniqueDestinations = [];
        destinationCards.forEach(function (cardId) {
            if (!uniqueDestinations.includes(cardId)) {
                uniqueDestinations.push(cardId);
            }
        });
        uniqueDestinations
            .filter(function (id) { return id !== inputCardId; })
            .forEach(function (toCardId) {
            var destinationCardNode = dojo.byId(toCardId);
            destinationCardNode.classList.add(PP_SELECTABLE);
            _this.game._connections.push(dojo.connect(destinationCardNode, 'onclick', _this, function () { return _this.onCardClick({ toCardId: toCardId, fromCardId: inputCardId, pieceId: pieceId }); }));
        });
    };
    ClientCardActionMoveState.prototype.setDestinationRegionsSelectable = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId, regionId = _a.regionId;
        debug('setDestinationRegionsSelectable', pieceId, regionId);
        this.game.map.setSelectable();
        var region = this.game.map.getRegion({ region: regionId });
        var coalitionId = this.game.getCurrentPlayer().getLoyalty();
        var hasIndianSupplies = this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_INDIAN_SUPPLIES });
        region.borders.forEach(function (borderId) {
            var border = _this.game.map.getBorder({ border: borderId });
            if (hasIndianSupplies || border.getCoalitionRoads({ coalitionId: coalitionId }).length > 0) {
                var toRegionId_1 = borderId.split('_').filter(function (borderRegionId) { return borderRegionId !== regionId; })[0];
                _this.game.map
                    .getRegion({ region: toRegionId_1 })
                    .setSelectable({ callback: function () { return _this.onRegionClick({ fromRegionId: regionId, toRegionId: toRegionId_1, pieceId: pieceId }); } });
            }
        });
    };
    ClientCardActionMoveState.prototype.getSpiesToMove = function () {
        var _this = this;
        if (this.game.playerManager
            .getPlayers()
            .map(function (player) { return player.getCourtCards(); })
            .flat().length <= 1) {
            return [];
        }
        var spies = [];
        Object.entries(this.game.spies).forEach(function (_a) {
            var cardId = _a[0], zone = _a[1];
            if (!zone) {
                return;
            }
            zone.getCards().forEach(function (_a) {
                var cylinderId = _a.id;
                if (Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId()) {
                    return;
                }
                spies.push({
                    cylinderId: cylinderId,
                    cardId: cardId,
                });
            });
        });
        return spies;
    };
    ClientCardActionMoveState.prototype.setSpiesSelectable = function () {
        var _this = this;
        this.getSpiesToMove().forEach(function (_a) {
            var cardId = _a.cardId, cylinderId = _a.cylinderId;
            var node = dojo.byId(cylinderId);
            node.classList.add(PP_SELECTABLE);
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateIntefaceSpySelected({ pieceId: cylinderId, cardId: cardId }); }));
        });
    };
    ClientCardActionMoveState.prototype.totalNumberOfMoves = function () {
        var total = 0;
        Object.values(this.moves).forEach(function (movesForSinglePiece) {
            total += movesForSinglePiece.length;
        });
        return total;
    };
    ClientCardActionMoveState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} must select an army or spy to move (${number} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberOfMoves - this.totalNumberOfMoves(),
            },
        });
    };
    return ClientCardActionMoveState;
}());
var ClientCardActionTaxState = (function () {
    function ClientCardActionTaxState(game) {
        this.game = game;
        this.maxPerPlayer = {};
    }
    ClientCardActionTaxState.prototype.onEnteringState = function (args) {
        this.cardId = args.cardId;
        this.bribe = args.bribe;
        var cardInfo = this.game.getCardInfo(args.cardId);
        this.maxNumberToSelect = cardInfo.rank;
        this.numberSelected = 0;
        this.maxPerPlayer = {};
        this.updateInterfaceInitialStep();
    };
    ClientCardActionTaxState.prototype.onLeavingState = function () { };
    ClientCardActionTaxState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.updatePageTitle();
        this.updateActionButtons();
        this.setRupeesSelectable();
    };
    ClientCardActionTaxState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                Object.keys(_this.maxPerPlayer).forEach(function (playerId) {
                    _this.game.playerManager.getPlayer({ playerId: Number(playerId) }).removeTaxCounter();
                });
                _this.game.onCancel();
            },
        });
    };
    ClientCardActionTaxState.prototype.confirmTax = function () {
        var _a, _b;
        var marketRupees = [];
        var playerRupees = [];
        dojo.query('.pp_selected').forEach(function (node) {
            if (!node.id.startsWith('rupees_tableau')) {
                marketRupees.push(node.id);
            }
        });
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            if (taxCounter) {
                playerRupees.push("".concat(playerId, "_").concat(Number(taxCounter.innerText)));
            }
        });
        this.game.takeAction({
            action: 'tax',
            data: {
                cardId: this.cardId,
                market: marketRupees.join(' '),
                players: playerRupees.join(' '),
                bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
            },
        });
    };
    ClientCardActionTaxState.prototype.handleMarketRupeeClicked = function (_a) {
        var rupeeId = _a.rupeeId;
        var node = dojo.byId("".concat(rupeeId));
        var hasSelectableClass = node.classList.contains('pp_selectable');
        if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect) {
            debug('max selected reached');
            return;
        }
        this.toggleSelected(node);
        this.updateNumberSelected();
        this.updatePageTitle();
        this.updateActionButtons();
        this.updateSelectableStatePlayers();
    };
    ClientCardActionTaxState.prototype.handlePlayerRupeeClicked = function (_a) {
        var rupeeId = _a.rupeeId;
        var node = dojo.byId("".concat(rupeeId));
        var taxCounter = dojo.byId("".concat(node.id, "_tax_counter"));
        var hasSelectableClass = node.classList.contains('pp_selectable');
        if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect && !taxCounter) {
            debug('max selected reached');
            return;
        }
        if (!taxCounter) {
            dojo.place("<span id=\"".concat(node.id, "_tax_counter\" class=\"pp_tax_counter\">1</span>"), node);
        }
        else {
            var playerId = Number(node.id.split('_')[2]);
            var currentValue = Number(taxCounter.innerText);
            if (this.numberSelected >= this.maxNumberToSelect ||
                currentValue >= this.maxNumberToSelect ||
                currentValue >= this.maxPerPlayer[playerId]) {
                dojo.destroy("".concat(node.id, "_tax_counter"));
            }
            else {
                taxCounter.innerText = "".concat(currentValue + 1);
            }
        }
        this.updateNumberSelected();
        this.updatePageTitle();
        this.updateActionButtons();
        this.updateSelectableStatePlayers();
    };
    ClientCardActionTaxState.prototype.toggleSelected = function (node) {
        node.classList.toggle('pp_selected');
        node.classList.toggle('pp_selectable');
    };
    ClientCardActionTaxState.prototype.getMarketRupeesToTax = function () {
        var rupees = [];
        dojo.query('.pp_rupee').forEach(function (node) {
            var parentId = node.parentElement.id;
            if (parentId.startsWith('pp_market')) {
                rupees.push(node.id);
            }
        });
        return rupees;
    };
    ClientCardActionTaxState.prototype.getPlayersToTax = function () {
        var _this = this;
        var hasClaimOfAncientLineage = this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CLAIM_OF_ANCIENT_LINEAGE });
        return this.game.playerManager.getPlayerIds().filter(function (playerId) {
            if (playerId === _this.game.getPlayerId()) {
                return false;
            }
            var player = _this.game.playerManager.getPlayer({ playerId: playerId });
            if (!hasClaimOfAncientLineage) {
                var hasCardRuledByPlayer = player
                    .getCourtZone()
                    .getCards()
                    .some(function (_a) {
                    var cardRegion = _a.region;
                    if (_this.game.map.getRegion({ region: cardRegion }).getRuler() === _this.game.getPlayerId()) {
                        return true;
                    }
                });
                if (!hasCardRuledByPlayer) {
                    return false;
                }
            }
            else if (hasClaimOfAncientLineage && player.getCourtZone().getCards().length === 0) {
                return false;
            }
            var taxShelter = player.getTaxShelter();
            var playerRupees = player.getRupees();
            if (playerRupees <= taxShelter) {
                return false;
            }
            _this.maxPerPlayer[playerId] = playerRupees - taxShelter;
            return true;
        });
    };
    ClientCardActionTaxState.prototype.setRupeesSelectable = function () {
        var _this = this;
        this.getMarketRupeesToTax().forEach(function (rupeeId) {
            var node = dojo.byId(rupeeId);
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function (event) {
                event.stopPropagation();
                _this.handleMarketRupeeClicked({ rupeeId: node.id });
            }));
        });
        this.getPlayersToTax().forEach(function (playerId) {
            var node = dojo.byId("rupees_tableau_".concat(playerId));
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function (event) {
                event.stopPropagation();
                _this.handlePlayerRupeeClicked({ rupeeId: node.id });
            }));
        });
    };
    ClientCardActionTaxState.prototype.updateNumberSelected = function () {
        var numberSelected = 0;
        dojo.query('.pp_selected').forEach(function (node) {
            if (!node.id.startsWith('rupees_tableau')) {
                numberSelected += 1;
            }
        });
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            if (taxCounter) {
                numberSelected += Number(taxCounter.innerText);
            }
        });
        this.numberSelected = numberSelected;
    };
    ClientCardActionTaxState.prototype.updateActionButtons = function () {
        var _this = this;
        var _a;
        this.game.framework().removeActionButtons();
        dojo.empty('customActions');
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmTax(); },
        });
        if (this.numberSelected === 0) {
            dojo.addClass('confirm_btn', 'disabled');
        }
        if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && this.numberSelected === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.addCancelButton();
        }
    };
    ClientCardActionTaxState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} may take ${number} ${tkn_rupee} (${remaining} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberToSelect,
                remaining: this.maxNumberToSelect - this.numberSelected,
                tkn_rupee: _('rupee(s)')
            },
        });
    };
    ClientCardActionTaxState.prototype.updateSelectableStatePlayers = function () {
        var _this = this;
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            var rupeeNode = dojo.byId("rupees_tableau_".concat(playerId));
            var hasSelectableClass = rupeeNode.classList.contains('pp_selectable');
            if (!taxCounter && !hasSelectableClass) {
                _this.toggleSelected(rupeeNode);
            }
            if (!taxCounter) {
                return;
            }
            var currentValue = taxCounter ? Number(taxCounter.innerText) : 0;
            var playerMax = _this.maxPerPlayer[playerId];
            if (hasSelectableClass && (_this.maxNumberToSelect <= _this.numberSelected || currentValue >= playerMax)) {
                _this.toggleSelected(rupeeNode);
            }
            else if (!hasSelectableClass && _this.maxNumberToSelect > _this.numberSelected && currentValue < playerMax) {
                _this.toggleSelected(rupeeNode);
            }
        });
    };
    return ClientCardActionTaxState;
}());
var ClientInitialBribeCheckState = (function () {
    function ClientInitialBribeCheckState(game) {
        this.game = game;
    }
    ClientInitialBribeCheckState.prototype.onEnteringState = function (args) {
        this.action = args.action;
        this.cardId = args.cardId;
        this.checkBribe(args);
    };
    ClientInitialBribeCheckState.prototype.onLeavingState = function () { };
    ClientInitialBribeCheckState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var bribeLimitReached = _a.bribeLimitReached, bribeeId = _a.bribeeId, amount = _a.amount, next = _a.next;
        this.game.clearPossible();
        this.game.activeStates.playerActions.setCardActionSelected({ cardId: this.cardId, action: this.action });
        var bribee = this.game.playerManager.getPlayer({ playerId: bribeeId });
        if (bribeLimitReached) {
            this.game.clientUpdatePageTitle({
                text: _('${you} must pay a bribe of ${amount} ${tkn_rupee} to ${tkn_playerName}. ${you} have reached your limit of declined bribes and cannot start a new bribe negotiation this turn'),
                args: {
                    amount: amount,
                    tkn_playerName: bribee.getName(),
                    tkn_rupee: _('rupee(s)'),
                    you: '${you}',
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('${you} must pay a bribe of ${amount} ${tkn_rupee} to ${tkn_playerName} or ask to waive'),
                args: {
                    amount: amount,
                    tkn_playerName: bribee.getName(),
                    tkn_rupee: _('rupee(s)'),
                    you: '${you}',
                },
            });
        }
        var minActionCost = this.game.getMinimumActionCost({ action: this.action }) || 0;
        var maxAvailableRupees = this.game.getCurrentPlayer().getRupees() - minActionCost;
        if (amount <= maxAvailableRupees) {
            this.game.addPrimaryActionButton({
                id: "pay_bribe_btn",
                text: _('Pay bribe'),
                callback: function () { return next({ bribe: { amount: amount } }); },
            });
        }
        var _loop_3 = function (i) {
            if (i > maxAvailableRupees || bribee.isWakhan() || bribeLimitReached) {
                return "continue";
            }
            this_1.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(i, "_btn"),
                text: dojo.string.substitute(_('Offer ${i} rupee(s)'), { i: i }),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'startBribeNegotiation',
                        data: {
                            cardId: _this.cardId,
                            useFor: _this.action,
                            amount: i,
                        },
                    });
                },
            });
        };
        var this_1 = this;
        for (var i = amount - 1; i >= 1; i--) {
            _loop_3(i);
        }
        if (this.game.getCurrentPlayer().ownsEventCard({ cardId: 'card_107' })) {
            this.game.addPrimaryActionButton({
                id: "do_not_pay_btn",
                text: _('Do not pay'),
                callback: function () { return next({ bribe: null }); },
            });
        }
        else if (!bribee.isWakhan() && !bribeLimitReached) {
            this.game.addPrimaryActionButton({
                id: "ask_waive_btn",
                text: _('Ask to waive'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'startBribeNegotiation',
                        data: {
                            cardId: _this.cardId,
                            useFor: _this.action,
                            amount: 0,
                        },
                    });
                },
            });
        }
        this.game.addCancelButton();
    };
    ClientInitialBribeCheckState.prototype.calulateBribe = function (_a) {
        var cardId = _a.cardId, action = _a.action;
        var disregardForCustomsActive = this.game.activeEvents.hasCard({ cardId: 'card_107' });
        var charismaticCourtiersAcitve = action === 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CHARISMATIC_COURTIERS });
        var civilServiceReformsActive = action !== 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CIVIL_SERVICE_REFORMS });
        if (disregardForCustomsActive || charismaticCourtiersAcitve || civilServiceReformsActive) {
            return null;
        }
        var bribe = action === 'playCard' ? this.checkBribePlayCard({ cardId: cardId }) : this.checkBribeCardAction({ cardId: cardId });
        return bribe;
    };
    ClientInitialBribeCheckState.prototype.checkBribe = function (_a) {
        var cardId = _a.cardId, action = _a.action, next = _a.next, bribeLimitReached = _a.bribeLimitReached;
        var bribe = this.calulateBribe({ cardId: cardId, action: action });
        if (bribe === null) {
            next({ bribe: null });
        }
        else {
            this.updateInterfaceInitialStep(__assign(__assign({}, bribe), { next: next, bribeLimitReached: bribeLimitReached }));
        }
    };
    ClientInitialBribeCheckState.prototype.checkBribeCardAction = function (_a) {
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return null;
        }
        var cylinderIds = spyZone.getCards().map(extractId);
        var totals = {};
        cylinderIds.forEach(function (cylinderId) {
            var playerId = cylinderId.split('_')[1];
            if (totals[playerId]) {
                totals[playerId] += 1;
            }
            else {
                totals[playerId] = 1;
            }
        });
        var sortedTotals = Object.entries(totals)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                playerId: Number(key),
                numberOfSpies: value,
            });
        })
            .sort(function (a, b) { return b.numberOfSpies - a.numberOfSpies; });
        var currentPlayerId = this.game.getPlayerId();
        var numberOfPlayersWithSpies = sortedTotals.length;
        if (numberOfPlayersWithSpies === 1 && sortedTotals[0].playerId !== currentPlayerId) {
            var _b = sortedTotals[0], playerId = _b.playerId, numberOfSpies = _b.numberOfSpies;
            return {
                bribeeId: playerId,
                amount: numberOfSpies,
            };
        }
        else if (numberOfPlayersWithSpies > 1 &&
            sortedTotals[0].numberOfSpies > sortedTotals[1].numberOfSpies &&
            sortedTotals[0].playerId !== currentPlayerId) {
            var _c = sortedTotals[0], playerId = _c.playerId, numberOfSpies = _c.numberOfSpies;
            return {
                bribeeId: playerId,
                amount: numberOfSpies,
            };
        }
        else {
            return null;
        }
    };
    ClientInitialBribeCheckState.prototype.checkBribePlayCard = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo(cardId);
        var region = cardInfo.region;
        var rulerId = this.game.map.getRegion({ region: region }).getRuler();
        var playerId = this.game.getPlayerId();
        if (rulerId !== null && rulerId !== playerId) {
            var amount = this.game.map.getRegion({ region: region }).getRulerTribes().length;
            return { bribeeId: rulerId, amount: amount };
        }
        else {
            return null;
        }
    };
    return ClientInitialBribeCheckState;
}());
var ClientPlayCardState = (function () {
    function ClientPlayCardState(game) {
        this.game = game;
    }
    ClientPlayCardState.prototype.onEnteringState = function (_a) {
        var bribe = _a.bribe, cardId = _a.cardId;
        this.cardId = cardId;
        this.bribe = bribe;
        this.playCardNextStep();
    };
    ClientPlayCardState.prototype.onLeavingState = function () { };
    ClientPlayCardState.prototype.updateInterfacePlayCardConfirm = function (_a) {
        var _this = this;
        var _b;
        var side = _a.side, firstCard = _a.firstCard;
        this.game.clearPossible();
        dojo.query("#pp_card_select_".concat(side)).addClass('pp_selected');
        document.getElementById(this.cardId).classList.add(PP_SELECTED);
        this.updatePageTitleConfirmPurchase({ side: side, firstCard: firstCard });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'playCard',
                    data: {
                        cardId: _this.cardId,
                        side: side,
                        bribeAmount: _this.bribe ? _this.bribe.amount : null,
                    },
                });
            },
        });
        if (((_b = this.bribe) === null || _b === void 0 ? void 0 : _b.negotiated) && firstCard) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () {
                    var _a;
                    _this.removeSideSelectable();
                    setTimeout(function () {
                        _this.game.onCancel();
                    }, ((_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) ? 20 : 0);
                },
            });
        }
    };
    ClientPlayCardState.prototype.updateInterfacePlayCardSelectSide = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        document.getElementById(this.cardId).classList.add(PP_SELECTED);
        this.game.clientUpdatePageTitle({
            text: _("Select which end of court to play ${name}"),
            args: {
                name: _(this.game.getCardInfo(this.cardId).name),
            },
        });
        this.setSideSelectable();
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.onCancel();
                },
            });
        }
    };
    ClientPlayCardState.prototype.updatePageTitleConfirmPurchase = function (_a) {
        var side = _a.side, firstCard = _a.firstCard;
        var playedCardLoyalty = this.game.getCardInfo(this.cardId).loyalty;
        var willChangeLoyalty = playedCardLoyalty !== null && playedCardLoyalty !== this.game.getCurrentPlayer().getLoyalty();
        debug('willChangeLoyalty', willChangeLoyalty);
        var text;
        var args;
        if (firstCard && willChangeLoyalty) {
            text = _("Play ${name} to court and change loyalty to ${tkn_coalition} ?");
            args = {
                name: _(this.game.getCardInfo(this.cardId).name),
                tkn_coalition: playedCardLoyalty,
            };
        }
        else if (firstCard) {
            text = _("Play ${name} to court?");
            args = {
                name: _(this.game.getCardInfo(this.cardId).name),
            };
        }
        else if (!firstCard && willChangeLoyalty) {
            text = _("Play ${name} to ${side} end of court and change loyalty to ${tkn_coalition} ?");
            args = {
                name: _(this.game.getCardInfo(this.cardId).name),
                side: _(side),
                tkn_coalition: playedCardLoyalty,
            };
        }
        else {
            text = _("Play ${name} to ${side} end of court?");
            args = {
                name: _(this.game.getCardInfo(this.cardId).name),
                side: _(side),
            };
        }
        this.game.clientUpdatePageTitle({
            text: text,
            args: args,
        });
    };
    ClientPlayCardState.prototype.playCardNextStep = function () {
        var numberOfCardsInCourt = this.game.playerManager
            .getPlayer({ playerId: this.game.getPlayerId() })
            .getCourtZone()
            .getCards().length;
        if (numberOfCardsInCourt === 0) {
            this.updateInterfacePlayCardConfirm({ firstCard: true, side: 'left' });
        }
        else {
            this.updateInterfacePlayCardSelectSide();
        }
    };
    ClientPlayCardState.prototype.removeSideSelectable = function () {
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
    };
    ClientPlayCardState.prototype.setSideSelectable = function () {
        var _this = this;
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
        dojo.query('#pp_card_select_left').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'left' });
            });
        });
        dojo.query('#pp_card_select_right').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'right' });
            });
        });
    };
    return ClientPlayCardState;
}());
var ClientPurchaseCardState = (function () {
    function ClientPurchaseCardState(game) {
        this.game = game;
    }
    ClientPurchaseCardState.prototype.onEnteringState = function (args) {
        this.updateInterfaceInitialStep(args);
    };
    ClientPurchaseCardState.prototype.onLeavingState = function () { };
    ClientPurchaseCardState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var cardId = _a.cardId, cost = _a.cost;
        this.game.clearPossible();
        var cardInfo = this.game.getCardInfo(cardId);
        var name = cardInfo.type === COURT_CARD ? cardInfo.name : cardInfo.purchased.title;
        var node = document.getElementById("".concat(cardId));
        node.classList.add(PP_SELECTED);
        this.game.clientUpdatePageTitle({
            text: _("Purchase ${name} for ${cost} ${tkn_rupee}?"),
            args: {
                name: _(name),
                cost: cost,
                tkn_rupee: _('rupee(s)')
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'purchaseCard', data: { cardId: cardId } }); },
        });
        this.game.addCancelButton();
    };
    return ClientPurchaseCardState;
}());
var ConfirmPartialTurnState = (function () {
    function ConfirmPartialTurnState(game) {
        this.game = game;
    }
    ConfirmPartialTurnState.prototype.onEnteringState = function (args) {
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    ConfirmPartialTurnState.prototype.onLeavingState = function () { };
    ConfirmPartialTurnState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must confirm the switch of active player. You will not be able to restart your turn'),
            args: {
                you: '${you}',
            }
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'actConfirmPartialTurn',
                });
            },
        });
        this.game.addUndoButton({ undoPossible: this.args.undoPossible });
    };
    return ConfirmPartialTurnState;
}());
var DiscardState = (function () {
    function DiscardState(game) {
        this.game = game;
    }
    DiscardState.prototype.onEnteringState = function (_a) {
        var from = _a.from, loyalty = _a.loyalty, region = _a.region, suit = _a.suit, undoPossible = _a.undoPossible;
        this.from = from;
        this.loyalty = loyalty;
        this.region = region;
        this.suit = suit;
        this.undoPossible = undoPossible;
        this.updateInterfaceInitialStep();
    };
    DiscardState.prototype.onLeavingState = function () { };
    DiscardState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        this.game.addUndoButton({ undoPossible: this.undoPossible });
        if (this.from.includes(COURT)) {
            this.game.setCourtCardsSelectable({
                callback: function (_a) {
                    var cardId = _a.cardId;
                    return _this.updateInterfaceConfirm({ cardId: cardId, from: 'court' });
                },
                loyalty: this.loyalty,
                region: this.region,
                suit: this.suit,
            });
        }
        if (this.from.includes(HAND)) {
            this.game.setHandCardsSelectable({
                callback: function (_a) {
                    var cardId = _a.cardId;
                    return _this.updateInterfaceConfirm({ cardId: cardId, from: 'hand' });
                },
            });
        }
    };
    DiscardState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var cardId = _a.cardId, from = _a.from;
        this.game.clearPossible();
        dojo.query("#".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Discard ${name}?'),
            args: {
                name: _(this.game.getCardInfo(cardId).name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'discard',
                    data: {
                        cardId: cardId,
                        from: from,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    DiscardState.prototype.updatePageTitle = function () {
        var text = _('${you} must discard a card');
        var fromCourt = this.from.length === 1 && this.from[0] === COURT;
        var fromHand = this.from.length === 1 && this.from[0] === HAND;
        if (fromCourt && this.loyalty) {
            text = _('${you} must discard a patriot from court');
        }
        else if (fromCourt) {
            text = _('${you} must discard a card from court');
        }
        else if (fromHand) {
            text = _('${you} must discard a card from hand');
        }
        this.game.clientUpdatePageTitle({
            text: text,
            args: {
                you: '${you}',
            },
        });
    };
    return DiscardState;
}());
var EndGameCheckState = (function () {
    function EndGameCheckState(game) {
        this.game = game;
    }
    EndGameCheckState.prototype.onEnteringState = function (args) {
        this.args = args;
        this.updateInterfaceInitialStep();
    };
    EndGameCheckState.prototype.onLeavingState = function () { };
    EndGameCheckState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may end the game or undo'),
            args: {
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'end_game_btn',
            text: _('End game'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'endGame',
                });
            },
        });
        this.game.addUndoButton({ undoPossible: this.args.undoPossible });
    };
    return EndGameCheckState;
}());
var NegotiateBribeState = (function () {
    function NegotiateBribeState(game) {
        this.game = game;
    }
    NegotiateBribeState.prototype.onEnteringState = function (_a) {
        var bribee = _a.bribee, briber = _a.briber, maxAmount = _a.maxAmount, action = _a.action;
        this.action = action;
        this.isBribee = this.game.getPlayerId() === bribee.playerId;
        this.bribee = bribee;
        this.briber = briber;
        this.maxAmount = maxAmount;
        this.updateInterfaceInitialStep();
    };
    NegotiateBribeState.prototype.onLeavingState = function () { };
    NegotiateBribeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must accept or decline bribe of ${amount} rupee(s)'),
            args: {
                amount: this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount,
                you: '${you}',
            },
        });
        this.addBribeButtons();
        this.game.addSecondaryActionButton({
            id: 'decline_btn',
            text: _('Decline'),
            callback: function () { return _this.game.takeAction({ action: 'declineBribe' }); },
        });
    };
    NegotiateBribeState.prototype.addBribeButtons = function () {
        var _this = this;
        var currentOffer = this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount;
        if (this.isBribee || (!this.isBribee && currentOffer <= (this.game.getCurrentPlayer().getRupees() - this.game.getMinimumActionCost({ action: this.action })))) {
            this.game.addPrimaryActionButton({
                id: 'accept_btn',
                text: _('Accept'),
                callback: function () { return _this.game.takeAction({ action: 'negotiateBribe', data: {
                        amount: currentOffer,
                    }, }); },
            });
        }
        var _loop_4 = function (i) {
            var isLowerThanOfferedByBriber = i < this_2.briber.currentAmount;
            var isHigherThanDemandedByBribee = i > (this_2.bribee.currentAmount || this_2.maxAmount);
            var isCurrentOffer = i === currentOffer;
            var briberCannotAfford = !this_2.isBribee && i > (this_2.game.getCurrentPlayer().getRupees() - this_2.game.getMinimumActionCost({ action: this_2.action }));
            if (isLowerThanOfferedByBriber || isHigherThanDemandedByBribee || isCurrentOffer || briberCannotAfford) {
                return "continue";
            }
            this_2.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(i, "_btn"),
                text: this_2.isBribee
                    ? dojo.string.substitute(_('Demand ${i} rupee(s)'), { i: i })
                    : dojo.string.substitute(_('Offer ${i} rupee(s)'), { i: i }),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'negotiateBribe',
                        data: {
                            amount: i,
                        },
                    });
                },
            });
        };
        var this_2 = this;
        for (var i = this.maxAmount; i >= 0; i--) {
            _loop_4(i);
        }
    };
    return NegotiateBribeState;
}());
var PlaceRoadState = (function () {
    function PlaceRoadState(game) {
        this.game = game;
    }
    PlaceRoadState.prototype.onEnteringState = function (_a) {
        var region = _a.region;
        this.updateInterfaceInitialStep({ borders: region.borders });
    };
    PlaceRoadState.prototype.onLeavingState = function () { };
    PlaceRoadState.prototype.updateInterfaceInitialStep = function (_a) {
        var borders = _a.borders;
        this.game.clearPossible();
        this.setBordersSelectable({ borders: borders });
    };
    PlaceRoadState.prototype.setBordersSelectable = function (_a) {
        var _this = this;
        var borders = _a.borders;
        var container = document.getElementById("pp_map_areas_borders_regions");
        container.classList.add('pp_selectable');
        borders.forEach(function (border) {
            var element = document.getElementById("pp_".concat(border, "_border_select"));
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () {
                    _this.game.clearPossible();
                    _this.game.takeAction({ action: 'placeRoad', data: { border: border } });
                }));
            }
        });
    };
    return PlaceRoadState;
}());
var PlaceSpyState = (function () {
    function PlaceSpyState(game) {
        this.game = game;
    }
    PlaceSpyState.prototype.onEnteringState = function (_a) {
        var regionId = _a.regionId, selectedPiece = _a.selectedPiece;
        this.selectedPiece = selectedPiece;
        this.updateInterfaceInitialStep({ regionId: regionId });
    };
    PlaceSpyState.prototype.onLeavingState = function () { };
    PlaceSpyState.prototype.updateInterfaceInitialStep = function (_a) {
        var regionId = _a.regionId;
        this.game.clearPossible();
        if (this.selectedPiece) {
            this.setPieceSelected();
        }
        this.setPlaceSpyCardsSelectable({ regionId: regionId });
    };
    PlaceSpyState.prototype.updateInterfaceConfirmPlaceSpy = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        document.getElementById(cardId).classList.add('pp_selected');
        if (this.selectedPiece) {
            this.setPieceSelected();
        }
        this.game.clientUpdatePageTitle({
            text: _('Place a spy on ${cardName}'),
            args: {
                cardName: _(this.game.getCardInfo(cardId).name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'placeSpy', data: { cardId: cardId } }); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.game.onCancel(); },
        });
    };
    PlaceSpyState.prototype.setPieceSelected = function () {
        var node = dojo.byId(this.selectedPiece);
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
    };
    PlaceSpyState.prototype.setPlaceSpyCardsSelectable = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        dojo.query(".pp_court .pp_card.pp_".concat(regionId)).forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmPlaceSpy({ cardId: cardId }); }));
        });
    };
    return PlaceSpyState;
}());
var PlayerActionsState = (function () {
    function PlayerActionsState(game) {
        this.game = game;
    }
    PlayerActionsState.prototype.onEnteringState = function (args) {
        var _this = this;
        this.game.updateLocalState(args);
        if (args.bribe !== null) {
            this.handleNegotiatedBribe(args.bribe);
            return;
        }
        this.game
            .framework()
            .wait(1)
            .then(function () { return _this.updateInterfaceInitialStep(); });
    };
    PlayerActionsState.prototype.onLeavingState = function () {
        debug('Leaving PlayerActionsState');
    };
    PlayerActionsState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.setupCardActions();
        this.updateMainTitleTextActions();
        if (this.activePlayerHasActions()) {
            this.game.addSecondaryActionButton({
                id: 'pass_btn',
                text: _('End Turn'),
                callback: function () { return _this.onPass(); },
            });
            this.setMarketCardsSelectable();
            this.setHandCardsSelectable();
        }
        else {
            this.game.addPrimaryActionButton({
                id: 'pass_btn',
                text: _('End Turn'),
                callback: function () { return _this.onPass(); },
            });
        }
        this.setCardActionsSelectable();
        this.game.addUndoButton({ undoPossible: this.game.localState.undoPossible });
    };
    PlayerActionsState.prototype.updateInterfacePass = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({ text: _('Confirm to your end turn'), args: {} });
        this.game.addDangerActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'pass' }); },
        });
        this.game.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.game.onCancel(); } });
    };
    PlayerActionsState.prototype.isCardFavoredSuit = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo(cardId);
        if (cardInfo.suit === this.game.objectManager.favoredSuit.get()) {
            return true;
        }
        if (cardInfo.specialAbility === SA_SAVVY_OPERATOR || cardInfo.specialAbility === SA_IRREGULARS) {
            return true;
        }
        var player = this.game.getCurrentPlayer();
        if (cardInfo.suit === MILITARY &&
            player
                .getEventsZone()
                .getCards()
                .some(function (card) { return card.id === 'card_105'; })) {
            return true;
        }
        return false;
    };
    PlayerActionsState.prototype.updateMainTitleTextActions = function () {
        var remainingActions = this.game.localState.remainingActions;
        var hasCardActions = this.availableCardActions.length > 0;
        var hasHandCards = this.currentPlayerHasHandCards();
        var titleText = '';
        if (remainingActions > 0 && !hasHandCards && !hasCardActions) {
            titleText = _('${you} may purchase a card');
        }
        else if (remainingActions > 0 && hasHandCards && !hasCardActions) {
            titleText = _('${you} may purchase a card or play a card');
        }
        else if (remainingActions > 0 && !hasHandCards && hasCardActions) {
            titleText = _('${you} may purchase a card or perform a card action');
        }
        else if (remainingActions > 0 && hasHandCards && hasCardActions) {
            titleText = _('${you} may purchase a card, play a card or perform a card action');
        }
        else if (remainingActions === 0 && hasCardActions) {
            titleText = _('${you} may perform a bonus action');
        }
        else if (remainingActions === 0 && !hasCardActions) {
            titleText = _('${you} have no actions remaining');
        }
        if (remainingActions === 1) {
            titleText += _(' (1 action remaining)');
        }
        else if (remainingActions === 2) {
            titleText += _(' (2 actions remaining)');
        }
        this.game.gamedatas.gamestate.descriptionmyturn = titleText;
        this.game.framework().updatePageTitle();
    };
    PlayerActionsState.prototype.activePlayerHasActions = function () {
        return this.game.localState.remainingActions > 0 || false;
    };
    PlayerActionsState.prototype.playerCanPerformCardAction = function (_a) {
        var action = _a.action, cardId = _a.cardId, rupees = _a.rupees;
        switch (action) {
            case BATTLE:
                return (this.game.activeStates.clientCardActionBattle.getRegionBattleSites().length > 0 ||
                    this.game.activeStates.clientCardActionBattle.getCourtCardBattleSites().length > 0);
            case BETRAY:
                return this.game.activeStates.clientCardActionBetray.getCourtCardsToBetray().length > 0;
            case BUILD:
                return this.game.activeStates.clientCardActionBuild.getRegionsToBuild().length > 0;
            case GIFT:
                return this.game.getCurrentPlayer().getLowestAvailableGift() > 0;
            case MOVE:
                var hasArmiesToMove = this.game.activeStates.clientCardActionMove.getArmiesToMove().length > 0;
                var hasSpiesToMove = this.game.activeStates.clientCardActionMove.getSpiesToMove().length > 0;
                return hasArmiesToMove || hasSpiesToMove;
            case TAX:
                return (this.game.activeStates.clientCardActionTax.getMarketRupeesToTax().length > 0 ||
                    this.game.activeStates.clientCardActionTax.getPlayersToTax().length > 0);
        }
        return false;
    };
    PlayerActionsState.prototype.setupCardActions = function () {
        var _this = this;
        this.availableCardActions = [];
        var player = this.game.getCurrentPlayer();
        var rupees = player.getRupees();
        var courtCards = player.getCourtCards();
        courtCards.forEach(function (_a) {
            var actions = _a.actions, id = _a.id;
            var cardHasBeenUsed = _this.game.localState.usedCards.includes(id);
            var noActionsLeft = _this.game.localState.remainingActions === 0 && !_this.isCardFavoredSuit({ cardId: id });
            Object.keys(actions).forEach(function (action) {
                var nodeId = "".concat(action, "_").concat(id);
                _this.game.tooltipManager.removeTooltip(nodeId);
                if (cardHasBeenUsed) {
                    _this.game.tooltipManager.addTextToolTip({ nodeId: nodeId, text: _('This card has been used') });
                    return;
                }
                if (noActionsLeft) {
                    _this.game.tooltipManager.addTextToolTip({ nodeId: nodeId, text: _('You do not have actions left to perform this') });
                    return;
                }
                var minActionCost = _this.game.getMinimumActionCost({ action: action });
                if (_this.game.gameOptions.wakhanEnabled) {
                    var bribe = _this.game.activeStates.clientInitialBribeCheck.calulateBribe({ cardId: id, action: action });
                    minActionCost =
                        minActionCost +
                            (bribe !== null && bribe.bribeeId === WAKHAN_PLAYER_ID && !player.ownsEventCard({ cardId: ECE_COURTLY_MANNERS_CARD_ID })
                                ? bribe.amount
                                : 0);
                }
                if (rupees < minActionCost) {
                    _this.game.tooltipManager.addTextToolTip({ nodeId: nodeId, text: _('You do not have enough rupees to pay for this') });
                    return;
                }
                var canPerformAction = _this.playerCanPerformCardAction({ action: action, cardId: id, rupees: rupees });
                if (!canPerformAction) {
                    _this.game.tooltipManager.addTextToolTip({ nodeId: nodeId, text: _('You do not meet the requirements to perform this action') });
                    return;
                }
                else {
                    _this.availableCardActions.push({
                        cardId: id,
                        action: action,
                    });
                }
            });
        });
    };
    PlayerActionsState.prototype.currentPlayerHasHandCards = function () {
        return this.game.getCurrentPlayer().getHandZone().getCards().length > 0;
    };
    PlayerActionsState.prototype.handleNegotiatedBribe = function (_a) {
        var action = _a.action, cardId = _a.cardId, briber = _a.briber;
        var bribe = {
            amount: briber.currentAmount,
            negotiated: true,
        };
        if (action === 'playCard') {
            this.game.framework().setClientState(CLIENT_PLAY_CARD, { args: { cardId: cardId, bribe: bribe } });
        }
        else if (Object.keys(cardActionClientStateMap).includes(action)) {
            this.game.framework().setClientState(cardActionClientStateMap[action], {
                args: {
                    cardId: cardId,
                    bribe: bribe,
                },
            });
        }
    };
    PlayerActionsState.prototype.setCardActionsSelectable = function () {
        var _this = this;
        this.availableCardActions.forEach(function (_a) {
            var cardId = _a.cardId, action = _a.action;
            var node = dojo.byId("".concat(action, "_").concat(cardId));
            if (node === null) {
                return;
            }
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function (event) {
                event.preventDefault();
                event.stopPropagation();
                _this.game.framework().setClientState(CLIENT_INITIAL_BRIBE_CHECK, {
                    args: {
                        bribeLimitReached: _this.game.localState.bribeLimitReached,
                        cardId: cardId,
                        action: action,
                        next: function (_a) {
                            var bribe = _a.bribe;
                            return _this.game
                                .framework()
                                .setClientState(cardActionClientStateMap[action], { args: { cardId: cardId, bribe: bribe } });
                        },
                    },
                });
            }));
        });
    };
    PlayerActionsState.prototype.getCardCost = function (_a) {
        var cardId = _a.cardId, column = _a.column;
        var baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
        var player = this.game.getCurrentPlayer();
        var cardInfo = this.game.getCardInfo(cardId);
        if (cardInfo.type === 'courtCard' && cardInfo.region === HERAT && player.hasSpecialAbility({ specialAbility: SA_HERAT_INFLUENCE })) {
            return 0;
        }
        if (cardInfo.type === 'courtCard' && cardInfo.region === PERSIA && player.hasSpecialAbility({ specialAbility: SA_PERSIAN_INFLUENCE })) {
            return 0;
        }
        if (cardInfo.type === 'courtCard' &&
            cardInfo.loyalty === RUSSIAN &&
            player.hasSpecialAbility({ specialAbility: SA_RUSSIAN_INFLUENCE })) {
            return 0;
        }
        return column * baseCardCost;
    };
    PlayerActionsState.prototype.setHandCardsSelectable = function () {
        var _this = this;
        this.game.setHandCardsSelectable({
            callback: function (_a) {
                var cardId = _a.cardId;
                debug('callback triggered', cardId);
                _this.game.framework().setClientState(CLIENT_INITIAL_BRIBE_CHECK, {
                    args: {
                        bribeLimitReached: _this.game.localState.bribeLimitReached,
                        cardId: cardId,
                        action: 'playCard',
                        next: function (_a) {
                            var bribe = _a.bribe;
                            return _this.game.framework().setClientState(CLIENT_PLAY_CARD, { args: { cardId: cardId, bribe: bribe } });
                        },
                    },
                });
            },
        });
    };
    PlayerActionsState.prototype.setMarketCardsSelectable = function () {
        var _this = this;
        dojo.query('.pp_market .pp_card').forEach(function (node) {
            var cardId = node.id;
            var cardInfo = _this.game.getCardInfo(cardId);
            if (cardInfo.type === 'eventCard' && cardInfo.purchased.effect === ECE_PUBLIC_WITHDRAWAL) {
                return;
            }
            var cost = _this.getCardCost({ cardId: cardId, column: Number(node.parentElement.id.split('_')[3]) });
            if (cost <= _this.game.getCurrentPlayer().getRupees() && !_this.game.localState.usedCards.includes(cardId)) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    return _this.game.framework().setClientState(CLIENT_PURCHASE_CARD, { args: { cardId: cardId, cost: cost } });
                }));
            }
        });
    };
    PlayerActionsState.prototype.setCardActionSelected = function (_a) {
        var cardId = _a.cardId, action = _a.action;
        var node = dojo.byId("".concat(action, "_").concat(cardId));
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
    };
    PlayerActionsState.prototype.addDebugButton = function () {
        console.log('addDebugButton');
    };
    PlayerActionsState.prototype.onPass = function () {
        if (!this.game.framework().checkAction('pass') || !this.game.framework().isCurrentPlayerActive())
            return;
        if (Number(this.game.localState.remainingActions) > 0) {
            this.updateInterfacePass();
            return;
        }
        this.game.takeAction({ action: 'pass' });
    };
    return PlayerActionsState;
}());
var ResolveEventOtherPersuasiveMethodsState = (function () {
    function ResolveEventOtherPersuasiveMethodsState(game) {
        this.game = game;
    }
    ResolveEventOtherPersuasiveMethodsState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventOtherPersuasiveMethodsState.prototype.onLeavingState = function () { };
    ResolveEventOtherPersuasiveMethodsState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a player to exchange your hand with'),
            args: {
                you: '${you}',
            },
        });
        var players = this.game.playerManager.getPlayers();
        players
            .filter(function (player) { return player.getPlayerId() !== _this.game.getPlayerId(); })
            .forEach(function (player) {
            _this.game.addPlayerButton({
                callback: function () { return _this.updateInterfaceConfirmPlayer({ player: player }); },
                player: player,
            });
        });
    };
    ResolveEventOtherPersuasiveMethodsState.prototype.updateInterfaceConfirmPlayer = function (_a) {
        var _this = this;
        var player = _a.player;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Choose ${tkn_playerName}?'),
            args: {
                tkn_playerName: player.getName(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardOtherPersuasiveMethods',
                    data: {
                        playerId: player.getPlayerId(),
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventOtherPersuasiveMethodsState;
}());
var ResolveEventPashtunwaliValuesState = (function () {
    function ResolveEventPashtunwaliValuesState(game) {
        this.game = game;
    }
    ResolveEventPashtunwaliValuesState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventPashtunwaliValuesState.prototype.onLeavingState = function () { };
    ResolveEventPashtunwaliValuesState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a suit to favor'),
            args: {
                you: '${you}',
            },
        });
        SUITS.forEach(function (suit) {
            var name = _this.game.gamedatas.staticData.suits[suit].name;
            _this.game.addPrimaryActionButton({
                id: "".concat(suit, "_btn"),
                text: _(name),
                callback: function () { return _this.updateInterfaceConfirmSuit({ suit: suit, name: name }); },
            });
        });
    };
    ResolveEventPashtunwaliValuesState.prototype.updateInterfaceConfirmSuit = function (_a) {
        var _this = this;
        var suit = _a.suit, name = _a.name;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Choose ${suitName}?'),
            args: {
                suitName: name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardPashtunwaliValues',
                    data: {
                        suit: suit,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventPashtunwaliValuesState;
}());
var ResolveEventRebukeState = (function () {
    function ResolveEventRebukeState(game) {
        this.game = game;
    }
    ResolveEventRebukeState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventRebukeState.prototype.onLeavingState = function () { };
    ResolveEventRebukeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a region'),
            args: {
                you: '${you}',
            },
        });
        this.game.map.setSelectable();
        REGIONS.forEach(function (regionId) {
            var element = document.getElementById("pp_region_".concat(regionId));
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceRegionSelected({ regionId: regionId }); }));
            }
        });
    };
    ResolveEventRebukeState.prototype.updateInterfaceRegionSelected = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        this.game.clearPossible();
        this.game.map.setSelectable();
        var element = document.getElementById("pp_region_".concat(regionId));
        if (element) {
            element.classList.add(PP_SELECTED);
        }
        this.game.clientUpdatePageTitle({
            text: _('Remove all tribes and armies from ${regionName}?'),
            args: {
                regionName: _(this.game.gamedatas.staticData.regions[regionId].name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardRebuke',
                    data: {
                        regionId: regionId,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventRebukeState;
}());
var ResolveEventRumor = (function () {
    function ResolveEventRumor(game) {
        this.game = game;
    }
    ResolveEventRumor.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventRumor.prototype.onLeavingState = function () { };
    ResolveEventRumor.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a player'),
            args: {
                you: '${you}',
            },
        });
        var players = this.game.playerManager.getPlayers();
        players.forEach(function (player) {
            _this.game.addPlayerButton({
                callback: function () { return _this.updateInterfaceConfirmPlayer({ player: player }); },
                player: player,
            });
        });
    };
    ResolveEventRumor.prototype.updateInterfaceConfirmPlayer = function (_a) {
        var _this = this;
        var player = _a.player;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Choose ${tkn_playerName}?'),
            args: {
                tkn_playerName: player.getName(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardRumor',
                    data: {
                        playerId: player.getPlayerId(),
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventRumor;
}());
var SASafeHouseState = (function () {
    function SASafeHouseState(game) {
        this.game = game;
    }
    SASafeHouseState.prototype.onEnteringState = function (props) {
        debug('safeHouseProps', props);
        this.updateInterfaceInitialStep();
    };
    SASafeHouseState.prototype.onLeavingState = function () { };
    SASafeHouseState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        var player = this.game.getCurrentPlayer();
        var safeHouseCards = player.getCourtCardsWithSpecialAbility({ specialAbility: SA_SAFE_HOUSE });
        if (safeHouseCards.length === 1) {
            this.updateInterfaceConfirmSafeHouse({ card: safeHouseCards[0], showCancelButton: false });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('${you} may select a card to place a spy on'),
                args: {
                    you: '${you}',
                },
            });
            safeHouseCards.forEach(function (card) {
                var node = dojo.byId(card.id);
                dojo.addClass(node, PP_SELECTABLE);
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmSafeHouse({ card: card, showCancelButton: true }); }));
            });
            this.game.addDangerActionButton({
                id: 'do_not_place_btn',
                text: _('Do not place spy'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }); },
            });
        }
    };
    SASafeHouseState.prototype.updateInterfaceConfirmSafeHouse = function (_a) {
        var _this = this;
        var card = _a.card, showCancelButton = _a.showCancelButton;
        this.game.clearPossible();
        var node = dojo.byId(card.id);
        dojo.addClass(node, PP_SELECTED);
        this.game.clientUpdatePageTitle({
            text: _('Place spy on ${cardName}?'),
            args: {
                cardName: _(card.name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: card.id } }); },
        });
        if (showCancelButton) {
            this.game.addCancelButton();
        }
        else {
            this.game.addDangerActionButton({
                id: 'do_not_place_btn',
                text: _('Do not place spy'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }); },
            });
        }
    };
    return SASafeHouseState;
}());
var SelectPieceState = (function () {
    function SelectPieceState(game) {
        this.game = game;
    }
    SelectPieceState.prototype.onEnteringState = function (_a) {
        var availablePieces = _a.availablePieces;
        this.availablePieces = availablePieces;
        this.updateInterfaceInitialStep();
    };
    SelectPieceState.prototype.onLeavingState = function () { };
    SelectPieceState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.setPiecesSelectable();
    };
    SelectPieceState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId;
        this.game.clearPossible();
        var node = dojo.byId(pieceId);
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'selectPiece', data: { pieceId: pieceId } }); },
        });
        this.game.addCancelButton();
    };
    SelectPieceState.prototype.setPiecesSelectable = function () {
        var _this = this;
        this.availablePieces.forEach(function (pieceId) {
            var node = dojo.byId(pieceId);
            if (node) {
                dojo.addClass(node, PP_SELECTABLE);
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirm({ pieceId: pieceId }); }));
            }
        });
    };
    return SelectPieceState;
}());
var SetupState = (function () {
    function SetupState(game) {
        this.game = game;
    }
    SetupState.prototype.onEnteringState = function () {
        this.updateInterfaceInitialStep();
        console.log('onEntering setup');
    };
    SetupState.prototype.onLeavingState = function () { };
    SetupState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.addPrimaryActionButton({
            id: 'afghan_button',
            text: _('Afghan'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: AFGHAN } }); },
            extraClasses: 'loyalty_button',
        });
        this.game.addPrimaryActionButton({
            id: 'british_button',
            text: _('British'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: BRITISH } }); },
            extraClasses: 'loyalty_button',
        });
        this.game.addPrimaryActionButton({
            id: 'russian_button',
            text: _('Russian'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: RUSSIAN } }); },
            extraClasses: 'loyalty_button',
        });
    };
    return SetupState;
}());
var StartOfTurnAbilitiesState = (function () {
    function StartOfTurnAbilitiesState(game) {
        this.game = game;
    }
    StartOfTurnAbilitiesState.prototype.onEnteringState = function (args) {
        var _this = this;
        debug('Entering StartOfTurnAbilitiesState', args);
        var specialAbility = args.specialAbility;
        this.specialAbility = specialAbility;
        this.game
            .framework()
            .wait(1)
            .then(function () { return _this.updateInterfaceInitialStep(); });
    };
    StartOfTurnAbilitiesState.prototype.onLeavingState = function () {
        debug('Leaving StartOfTurnAbilitiesState');
    };
    StartOfTurnAbilitiesState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may place a spy on any ${regionName} court card without a spy'),
            args: {
                you: '${you}',
                regionName: this.getRegionNameForSpecialAbility(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'skip_btn',
            text: _('Skip'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { skip: true } }); },
        });
        this.setCourtCardsSelectable();
    };
    StartOfTurnAbilitiesState.prototype.updateInterfaceConfirmPlaceSpy = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        document.getElementById(cardId).classList.add('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Place a spy on ${cardName}?'),
            args: {
                cardName: _(this.game.getCardInfo(cardId).name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { cardId: cardId } }); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.game.onCancel(); },
        });
    };
    StartOfTurnAbilitiesState.prototype.getRegionNameForSpecialAbility = function () {
        switch (this.specialAbility) {
            case SA_BLACKMAIL_HERAT:
                return this.game.gamedatas.staticData.regions[HERAT].name;
            case SA_BLACKMAIL_KANDAHAR:
                return this.game.gamedatas.staticData.regions[KANDAHAR].name;
            default:
                return '';
        }
    };
    StartOfTurnAbilitiesState.prototype.setCourtCardsSelectable = function () {
        var _this = this;
        var region = this.specialAbility === SA_BLACKMAIL_HERAT ? HERAT : KANDAHAR;
        this.game.playerManager.getAllCourtCards().forEach(function (_a) {
            var _b;
            var cardId = _a.id, cardRegion = _a.region;
            if (cardRegion === region && (((_b = _this.game.spies[cardId]) === null || _b === void 0 ? void 0 : _b.getCards()) || []).length === 0) {
                dojo.addClass($(cardId), 'pp_selectable');
                _this.game._connections.push(dojo.connect($(cardId), 'onclick', _this, function () { return _this.updateInterfaceConfirmPlaceSpy({ cardId: cardId }); }));
            }
        });
    };
    return StartOfTurnAbilitiesState;
}());
var WakhanPauseState = (function () {
    function WakhanPauseState(game) {
        this.game = game;
    }
    WakhanPauseState.prototype.onEnteringState = function (args) {
        this.updateInterfaceInitialStep();
    };
    WakhanPauseState.prototype.onLeavingState = function () { };
    WakhanPauseState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must click next to let Wakhan continue her turn'),
            args: {
                you: '${you}',
            }
        });
        this.game.addPrimaryActionButton({
            id: 'wakhan_next_button',
            text: _('Next'),
            callback: function () { return _this.game.takeAction({ action: 'wakhanNext' }); }
        });
    };
    return WakhanPauseState;
}());
var MIN_NOTIFICATION_MS = 1000;
var NotificationManager = (function () {
    function NotificationManager(game) {
        this.game = game;
        this.subscriptions = [];
    }
    NotificationManager.prototype.setupNotifications = function () {
        var _this = this;
        console.log('notifications subscriptions setup');
        var notifs = [
            'log',
            'battle',
            'changeLoyalty',
            'changeFavoredSuit',
            'changeRuler',
            'clearTurn',
            'declinePrize',
            'discard',
            'discardFromMarket',
            'discardPrizes',
            'dominanceCheckScores',
            'dominanceCheckReturnCoalitionBlocks',
            'drawMarketCard',
            'exchangeHand',
            'moveCard',
            'moveToken',
            'payBribe',
            'payRupeesToMarket',
            'placeArmy',
            'placeCylinder',
            'placeRoad',
            'playCard',
            'publicWithdrawal',
            'purchaseCard',
            'purchaseGift',
            'replaceHand',
            'returnAllSpies',
            'returnAllToSupply',
            'returnCoalitionBlock',
            'returnCylinder',
            'returnRupeesToSupply',
            'shiftMarket',
            'smallRefreshHand',
            'smallRefreshInterface',
            'takePrize',
            'takeRupeesFromSupply',
            'taxMarket',
            'taxPlayer',
            'updateInfluence',
            'wakhanDrawCard',
            'wakhanRadicalize',
            'wakhanReshuffleDeck',
            'wakhanUpdatePragmaticLoyalty',
        ];
        notifs.forEach(function (notifName) {
            _this.subscriptions.push(dojo.subscribe(notifName, _this, function (notifDetails) {
                debug("notif_".concat(notifName), notifDetails);
                var promise = _this["notif_".concat(notifName)](notifDetails);
                var promises = promise ? [promise] : [];
                var minDuration = 1;
                var msg = _this.game.format_string_recursive(notifDetails.log, notifDetails.args);
                _this.game.clearPossible();
                if (msg != '' && notifName !== 'dominanceCheckScores') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';
                    minDuration = MIN_NOTIFICATION_MS;
                }
                if (_this.game.animationManager.animationsActive()) {
                    Promise.all(__spreadArray(__spreadArray([], promises, true), [_this.game.framework().wait(minDuration)], false)).then(function () {
                        return _this.game.framework().notifqueue.onSynchronousNotificationEnd();
                    });
                }
                else {
                    _this.game.framework().notifqueue.setSynchronousDuration(0);
                }
            }));
            _this.game.framework().notifqueue.setSynchronous(notifName, undefined);
        });
    };
    NotificationManager.prototype.notif_battle = function (notif) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    NotificationManager.prototype.notif_purchaseGift = function (notif) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    NotificationManager.prototype.notif_log = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                debug('notif_log', notif.args);
                return [2, Promise.resolve()];
            });
        });
    };
    NotificationManager.prototype.notif_payRupeesToMarket = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, rupeesOnCards, removedRupees;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, playerId = _a.playerId, rupeesOnCards = _a.rupeesOnCards, removedRupees = _a.removedRupees;
                        return [4, Promise.all((rupeesOnCards || []).map(function (item, index) { return __awaiter(_this, void 0, void 0, function () {
                                var row, column, rupeeId, cardId;
                                return __generator(this, function (_a) {
                                    row = item.row, column = item.column, rupeeId = item.rupeeId, cardId = item.cardId;
                                    this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
                                    this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId), cardId: cardId, index: index });
                                    return [2];
                                });
                            }); }))];
                    case 1:
                        _b.sent();
                        if (removedRupees > 0) {
                            this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -removedRupees });
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_changeLoyalty = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, argsPlayerId, coalition, playerId, player;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, argsPlayerId = _a.playerId, coalition = _a.coalition;
                        playerId = Number(argsPlayerId);
                        player = this.getPlayer({ playerId: playerId });
                        player.updatePlayerLoyalty({ coalition: coalition });
                        if (player.getInfluence() === 0) {
                            player.setCounter({ counter: 'influence', value: 1 });
                        }
                        return [4, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_changeFavoredSuit = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var to;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        to = notif.args.to;
                        return [4, this.game.objectManager.favoredSuit.changeTo({ suit: to })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_changeRuler = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, newRuler, region, to;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, newRuler = _a.newRuler, region = _a.region;
                        to = newRuler === null
                            ? this.game.map.getRegion({ region: region }).getRulerZone()
                            : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
                        this.game.map.getRegion({ region: region }).setRuler({ playerId: newRuler });
                        return [4, to.addCard({
                                id: "pp_ruler_token_".concat(region),
                                state: 0,
                                used: 0,
                                location: newRuler ? "rulerTokens_".concat(newRuler) : "rulerTokens_".concat(region),
                                region: region,
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_clearTurn = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var args, notifIds;
            return __generator(this, function (_a) {
                args = notif.args;
                notifIds = args.notifIds;
                this.game.cancelLogs(notifIds);
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_declinePrize = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var cardId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.game.clearPossible();
                        cardId = notif.args.cardId;
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_discard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cardId, from, playerId, to, player;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, cardId = _a.cardId, from = _a.from, playerId = _a.playerId, to = _a.to;
                        player = this.getPlayer({ playerId: playerId });
                        if (!(from === COURT)) return [3, 2];
                        return [4, player.discardCourtCard({ cardId: cardId, to: to })];
                    case 1:
                        _b.sent();
                        return [3, 8];
                    case 2:
                        if (!(from === HAND)) return [3, 4];
                        return [4, player.discardHandCard({ cardId: cardId, to: to })];
                    case 3:
                        _b.sent();
                        return [3, 8];
                    case 4:
                        if (!(from === ACTIVE_EVENTS)) return [3, 6];
                        return [4, this.game.activeEvents.discardCard({ cardId: cardId })];
                    case 5:
                        _b.sent();
                        return [3, 8];
                    case 6:
                        if (!from.startsWith('events_')) return [3, 8];
                        return [4, player.discardEventCard({ cardId: cardId })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [4, Promise.resolve()];
                    case 9: return [2, _b.sent()];
                }
            });
        });
    };
    NotificationManager.prototype.notif_discardFromMarket = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, from, cardId, to, splitFrom, row, column;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, from = _a.from, cardId = _a.cardId, to = _a.to;
                        splitFrom = from.split('_');
                        row = Number(splitFrom[1]);
                        column = Number(splitFrom[2]);
                        if (!(to === DISCARD || to === TEMP_DISCARD)) return [3, 2];
                        return [4, this.game.market.discardCard({ cardId: cardId, row: row, column: column, to: to })];
                    case 1:
                        _b.sent();
                        return [3, 4];
                    case 2:
                        if (!(to === ACTIVE_EVENTS)) return [3, 4];
                        return [4, this.game.activeEvents.addCardFromMarket({ cardId: cardId, row: row, column: column })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_discardPrizes = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, prizes, player, _i, prizes_1, prize;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, playerId = _a.playerId, prizes = _a.prizes;
                        player = this.getPlayer({ playerId: playerId });
                        _i = 0, prizes_1 = prizes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < prizes_1.length)) return [3, 4];
                        prize = prizes_1[_i];
                        return [4, player.discardPrize({ cardId: prize.id })];
                    case 2:
                        _b.sent();
                        player.incCounter({ counter: 'influence', value: -1 });
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_exchangeHand = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, newHandCounts, newHandCards;
            var _this = this;
            return __generator(this, function (_b) {
                _a = notif.args, newHandCounts = _a.newHandCounts, newHandCards = _a.newHandCards;
                Object.entries(newHandCounts).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var playerId = Number(key);
                    if (playerId === _this.game.getPlayerId() || playerId === WAKHAN_PLAYER_ID) {
                        return;
                    }
                    var player = _this.getPlayer({ playerId: Number(key) });
                    player.toValueCounter({ counter: 'cards', value: value });
                });
                if (newHandCards === null) {
                    return [2];
                }
                Object.entries(newHandCards).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var playerId = Number(key);
                    if (playerId === WAKHAN_PLAYER_ID) {
                        return;
                    }
                    var player = _this.getPlayer({ playerId: playerId });
                    player.resetHandCards();
                    value.forEach(function (card) { return player.updateHandCards({ cardId: card.id, action: 'ADD' }); });
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_dominanceCheckScores = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var scores, _i, _a, playerId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        scores = notif.args.scores;
                        _i = 0, _a = Object.keys(scores);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 4];
                        playerId = _a[_i];
                        if (Number(playerId) === WAKHAN_PLAYER_ID) {
                            this.game.playerManager.getPlayer({ playerId: Number(playerId) }).wakhanScore.toValue(scores[playerId].newScore);
                        }
                        else {
                            this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
                        }
                        return [4, this.game.objectManager.vpTrack.getZone("".concat(scores[playerId].newScore)).addCard({
                                id: "vp_cylinder_".concat(playerId),
                                color: this.game.gamedatas.paxPamirPlayers[playerId].color,
                                state: 0,
                                used: 0,
                                location: "vp_track_".concat(scores[playerId].newScore),
                            })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_dominanceCheckReturnCoalitionBlocks = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, blocks, fromLocations;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, blocks = _a.blocks, fromLocations = _a.fromLocations;
                        return [4, Promise.all(COALITIONS.map(function (coalition) {
                                return _this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: coalition }).addCards(blocks[coalition].map(function (_a) {
                                    var id = _a.id, weight = _a.weight;
                                    return ({
                                        id: id,
                                        state: weight,
                                        used: 0,
                                        location: "supply_".concat(coalition),
                                        coalition: coalition,
                                        type: 'supply',
                                    });
                                }));
                            }))];
                    case 1:
                        _b.sent();
                        this.game.objectManager.supply.checkDominantCoalition();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_drawMarketCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cardId, to, row, column;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, cardId = _a.cardId, to = _a.to;
                        row = Number(to.split('_')[1]);
                        column = Number(to.split('_')[2]);
                        this.game.objectManager.incCardCounter({ cardId: cardId, location: 'deck' });
                        return [4, this.game.market.addCardFromDeck({
                                to: {
                                    row: row,
                                    column: column,
                                },
                                card: this.game.getCardInfo(cardId),
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, move, action, cardId, from, to, fromZone, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = notif.args, move = _a.move, action = _a.action;
                        if (move === null) {
                            return [2];
                        }
                        cardId = move.id, from = move.from, to = move.to;
                        fromZone = this.game.getZoneForLocation({ location: from });
                        _b = action;
                        switch (_b) {
                            case 'MOVE_EVENT': return [3, 1];
                        }
                        return [3, 3];
                    case 1: return [4, Promise.all([
                            this.game.playerManager.getPlayer({ playerId: Number(to.split('_')[1]) }).addCardToEvents({ cardId: cardId }),
                            this.game.playerManager.getPlayer({ playerId: Number(from.split('_')[1]) }).checkEventContainerHeight(),
                        ])];
                    case 2:
                        _c.sent();
                        return [3, 4];
                    case 3:
                        debug('unknown action for moveCard');
                        _c.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_moveToken = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var move;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        move = notif.args.move;
                        return [4, this.performTokenMove({ move: move })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_payBribe = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, briberId, rulerId, rupees;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, briberId = _a.briberId, rulerId = _a.rulerId, rupees = _a.rupees;
                        return [4, this.getPlayer({ playerId: briberId }).payToPlayer({ playerId: rulerId, rupees: rupees })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_playCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, card, player;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, playerId = _a.playerId, card = _a.card;
                        player = this.getPlayer({ playerId: playerId });
                        return [4, player.playCard(card)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_placeArmy = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tokenId, to, weight, region, coalition;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args.move, tokenId = _a.tokenId, to = _a.to, weight = _a.weight;
                        region = to.split('_')[1];
                        coalition = getCoalitionForBlock(tokenId);
                        return [4, this.game.map
                                .getRegion({ region: region })
                                .getArmyZone()
                                .addCard({
                                id: tokenId,
                                state: weight,
                                used: 0,
                                coalition: coalition,
                                type: 'army',
                                location: "armies_".concat(region),
                            })];
                    case 1:
                        _b.sent();
                        this.game.objectManager.supply.checkDominantCoalition();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.getCylinderZone = function (location) {
        var splitLocation = location.split('_');
        switch (splitLocation[0]) {
            case 'cylinders':
                return this.game.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getCylinderZone();
            case 'gift':
                return this.game.playerManager.getPlayer({ playerId: Number(splitLocation[2]) }).getGiftZone({ value: Number(splitLocation[1]) });
            case 'spies':
                var cardId = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.game.spies[cardId];
            case 'tribes':
                return this.game.map.getRegion({ region: splitLocation[1] }).getTribeZone();
            default:
                debug('cannot find zone for cylinder');
                break;
        }
    };
    NotificationManager.prototype.notif_placeCylinder = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var move, to, from, tokenId, weight, toZone, playerId, player, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        move = notif.args.move;
                        to = move.to, from = move.from, tokenId = move.tokenId, weight = move.weight;
                        toZone = this.getCylinderZone(to);
                        if (!(from !== to)) return [3, 2];
                        return [4, toZone.addCard(this.game.getCylinder({
                                id: tokenId,
                                state: weight,
                                used: 0,
                                location: to,
                            }))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        playerId = Number(move.tokenId.split('_')[1]);
                        player = this.getPlayer({ playerId: playerId });
                        if (move.from.startsWith('cylinders_') && !move.to.startsWith('cylinders_')) {
                            player.incCounter({ counter: 'cylinders', value: 1 });
                        }
                        if (move.to.startsWith('gift_') && !move.from.startsWith('gift_')) {
                            value = 1;
                            if (this.game.activeEvents.hasCard({ cardId: 'card_106' })) {
                                value = 0;
                            }
                            else if (player.ownsEventCard({ cardId: ECE_KOH_I_NOOR_RECOVERED_CARD_ID })) {
                                value = 2;
                            }
                            if (playerId === WAKHAN_PLAYER_ID) {
                                player.incWakhanInfluence({
                                    wakhanInfluence: {
                                        type: 'wakhanInfluence',
                                        influence: {
                                            afghan: value,
                                            british: value,
                                            russian: value,
                                        },
                                    },
                                });
                            }
                            else {
                                player.incCounter({ counter: 'influence', value: value });
                            }
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_placeRoad = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, from, to, tokenId, weight, _b, type, region1, region2, border;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = notif.args.move, from = _a.from, to = _a.to, tokenId = _a.tokenId, weight = _a.weight;
                        _b = notif.args.move.to.split('_'), type = _b[0], region1 = _b[1], region2 = _b[2];
                        border = "".concat(region1, "_").concat(region2);
                        if (!(from !== to)) return [3, 2];
                        return [4, this.game.map
                                .getBorder({ border: border })
                                .getRoadZone()
                                .addCard({
                                id: tokenId,
                                state: weight,
                                used: 0,
                                location: to,
                                type: 'road',
                                coalition: getCoalitionForBlock(tokenId),
                            })];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        this.game.objectManager.supply.checkDominantCoalition();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_publicWithdrawal = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var marketLocation, row, column;
            return __generator(this, function (_a) {
                marketLocation = notif.args.marketLocation;
                row = Number(marketLocation.split('_')[1]);
                column = Number(marketLocation.split('_')[2]);
                this.game.market.getMarketRupeesZone({ row: row, column: column }).removeAll({ destroy: true });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_purchaseCard = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, marketLocation, newLocation, rupeesOnCards, playerId, receivedRupees, row, col, cardId;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, marketLocation = _a.marketLocation, newLocation = _a.newLocation, rupeesOnCards = _a.rupeesOnCards, playerId = _a.playerId, receivedRupees = _a.receivedRupees;
                        this.game.clearPossible();
                        row = Number(marketLocation.split('_')[1]);
                        col = Number(marketLocation.split('_')[2]);
                        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -rupeesOnCards.length });
                        return [4, Promise.all(rupeesOnCards
                                .reverse()
                                .map(function (_a, index) {
                                var row = _a.row, column = _a.column, rupeeId = _a.rupeeId, cardId = _a.cardId;
                                return _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId), cardId: cardId, index: index });
                            }))];
                    case 1:
                        _b.sent();
                        return [4, this.game.market.removeRupeesFromCard({ row: row, column: col, to: "rupees_".concat(playerId) })];
                    case 2:
                        _b.sent();
                        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: receivedRupees });
                        cardId = notif.args.card.id;
                        if (!newLocation.startsWith('events_')) return [3, 4];
                        return [4, this.getPlayer({ playerId: playerId }).addCardToEvents({ cardId: cardId })];
                    case 3:
                        _b.sent();
                        if (cardId === 'card_109') {
                            this.game.objectManager.supply.checkDominantCoalition();
                        }
                        return [3, 10];
                    case 4:
                        if (!(newLocation === DISCARD)) return [3, 6];
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 5:
                        _b.sent();
                        return [3, 10];
                    case 6:
                        if (!(newLocation === TEMP_DISCARD)) return [3, 8];
                        return [4, this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard(notif.args.card))];
                    case 7:
                        _b.sent();
                        return [3, 10];
                    case 8: return [4, this.getPlayer({ playerId: playerId }).addCardToHand(notif.args.card)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_replaceHand = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var hand, player;
            return __generator(this, function (_a) {
                hand = notif.args.hand;
                player = this.game.getCurrentPlayer();
                player.clearHand();
                player.setupHand({ hand: hand });
                player.toValueCounter({ counter: 'cards', value: hand.length });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_returnAllSpies = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, spies, cardId;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, spies = _a.spies, cardId = _a.cardId;
                        return [4, Promise.all(__spreadArray([], Object.entries(spies).map(function (_a) {
                                var key = _a[0], value = _a[1];
                                return __awaiter(_this, void 0, void 0, function () {
                                    var player;
                                    var _this = this;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                player = this.getPlayer({ playerId: Number(key) });
                                                return [4, player.getCylinderZone().addCards(value.map(function (_a) {
                                                        var tokenId = _a.tokenId, weight = _a.weight;
                                                        return _this.game.getCylinder({
                                                            id: tokenId,
                                                            state: weight,
                                                            used: 0,
                                                            location: "cylinders_".concat(player.getPlayerId()),
                                                        });
                                                    }))];
                                            case 1:
                                                _b.sent();
                                                player.incCounter({ counter: 'cylinders', value: -value.length });
                                                return [2];
                                        }
                                    });
                                });
                            }), true))];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnAllToSupply = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, armies, tribes, regionId, region;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, armies = _a.armies, tribes = _a.tribes, regionId = _a.regionId;
                        region = this.game.map.getRegion({ region: regionId });
                        return [4, Promise.all([region.removeAllArmies(armies), region.removeAllTribes(tribes)])];
                    case 1:
                        _b.sent();
                        this.game.objectManager.supply.checkDominantCoalition();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnCoalitionBlock = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, blockId, weight, coalition, toZone;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, blockId = _a.blockId, weight = _a.weight, coalition = _a.coalition;
                        toZone = this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: coalition });
                        return [4, toZone.addCard({
                                id: blockId,
                                state: weight,
                                used: 0,
                                location: "blocks_".concat(coalition),
                                type: 'supply',
                                coalition: coalition,
                            })];
                    case 1:
                        _b.sent();
                        this.game.objectManager.supply.checkDominantCoalition();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnCylinder = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, from, cylinderId, weight, playerId, player, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, from = _a.from, cylinderId = _a.cylinderId, weight = _a.weight;
                        playerId = Number(cylinderId.split('_')[1]);
                        player = this.getPlayer({ playerId: playerId });
                        return [4, player.getCylinderZone().addCard(this.game.getCylinder({
                                id: cylinderId,
                                state: weight,
                                used: 0,
                                location: "cylinders_".concat(player.getPlayerId()),
                            }))];
                    case 1:
                        _b.sent();
                        player.incCounter({ counter: 'cylinders', value: -1 });
                        if (from.startsWith('gift_')) {
                            value = this.game.activeEvents.hasCard({ cardId: 'card_106' }) ? 0 : -1;
                            player.incCounter({ counter: 'influence', value: value });
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_returnRupeesToSupply = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, amount;
            return __generator(this, function (_b) {
                _a = notif.args, playerId = _a.playerId, amount = _a.amount;
                this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -amount });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_shiftMarket = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var move, animationDurationBefore, fromRow, fromCol, toRow, toCol;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.game.clearPossible();
                        move = notif.args.move;
                        animationDurationBefore = this.game.animationManager.getSettings().duration;
                        fromRow = Number(move.from.split('_')[1]);
                        fromCol = Number(move.from.split('_')[2]);
                        toRow = Number(move.to.split('_')[1]);
                        toCol = Number(move.to.split('_')[2]);
                        this.game.animationManager.getSettings().duration = animationDurationBefore / 2;
                        return [4, this.game.market.moveCard({
                                card: this.game.getCardInfo(move.cardId),
                                from: {
                                    row: fromRow,
                                    column: fromCol,
                                },
                                to: {
                                    row: toRow,
                                    column: toCol,
                                },
                            })];
                    case 1:
                        _a.sent();
                        if (!(move.cardId === ECE_PUBLIC_WITHDRAWAL_CARD_ID && toCol === 0)) return [3, 3];
                        return [4, this.game.market.getMarketRupeesZone({ row: toRow, column: toCol }).removeAll({ destroy: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.game.animationManager.getSettings().duration = animationDurationBefore;
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_smallRefreshHand = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, hand, playerId, player;
            return __generator(this, function (_b) {
                _a = notif.args, hand = _a.hand, playerId = _a.playerId;
                player = this.getPlayer({ playerId: playerId });
                player.clearHand();
                player.setupHand({ hand: hand });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_smallRefreshInterface = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedGamedatas;
            return __generator(this, function (_a) {
                updatedGamedatas = __assign(__assign({}, this.game.gamedatas), notif.args);
                this.game.clearInterface();
                this.game.gamedatas = updatedGamedatas;
                this.game.activeEvents.setupActiveEvents({ gamedatas: updatedGamedatas });
                this.game.market.setupMarket({ gamedatas: updatedGamedatas });
                this.game.playerManager.updatePlayers({ gamedatas: updatedGamedatas });
                this.game.map.updateMap({ gamedatas: updatedGamedatas });
                this.game.objectManager.updateInterface({ gamedatas: updatedGamedatas });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_takePrize = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cardId, playerId, loyaltyDial, zIndexBefore;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.game.clearPossible();
                        _a = notif.args, cardId = _a.cardId, playerId = _a.playerId;
                        loyaltyDial = document.getElementById("pp_loyalty_dial_container_".concat(playerId));
                        zIndexBefore = (loyaltyDial === null || loyaltyDial === void 0 ? void 0 : loyaltyDial.style.zIndex) || null;
                        if (loyaltyDial) {
                            loyaltyDial.style.zIndex = "".concat(11);
                        }
                        return [4, this.game.playerManager.getPlayer({ playerId: playerId }).takePrize({ cardId: cardId })];
                    case 1:
                        _b.sent();
                        if (loyaltyDial) {
                            loyaltyDial.style.zIndex = zIndexBefore;
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_takeRupeesFromSupply = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, amount;
            return __generator(this, function (_b) {
                _a = notif.args, playerId = _a.playerId, amount = _a.amount;
                this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: amount });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_taxPlayer = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, playerId, taxedPlayerId, amount, player;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, playerId = _a.playerId, taxedPlayerId = _a.taxedPlayerId, amount = _a.amount;
                        player = this.getPlayer({ playerId: taxedPlayerId });
                        player.removeTaxCounter();
                        return [4, player.payToPlayer({ playerId: playerId, rupees: amount })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_taxMarket = function (notif) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, selectedRupees, playerId, amount;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = notif.args, selectedRupees = _a.selectedRupees, playerId = _a.playerId, amount = _a.amount;
                        return [4, Promise.all(selectedRupees.map(function (rupee, index) { return __awaiter(_this, void 0, void 0, function () {
                                var row, column, rupeeId;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            row = rupee.row, column = rupee.column, rupeeId = rupee.rupeeId;
                                            return [4, this.game.market.removeSingleRupeeFromCard({ row: row, column: column, rupeeId: rupeeId, to: "rupees_".concat(playerId), index: index })];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); }))];
                    case 1:
                        _b.sent();
                        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: amount });
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_updateInfluence = function (_a) {
        var args = _a.args;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                args.updates.forEach(function (update) {
                    if (update.type === 'playerInfluence') {
                        var playerId = update.playerId, value = update.value;
                        _this.getPlayer({ playerId: Number(playerId) }).toValueCounter({ counter: 'influence', value: value });
                    }
                    else if (update.type === 'wakhanInfluence') {
                        _this.getPlayer({ playerId: WAKHAN_PLAYER_ID }).toValueWakhanInfluence({ wakhanInfluence: update });
                    }
                });
                return [2];
            });
        });
    };
    NotificationManager.prototype.notif_wakhanDrawCard = function (_a) {
        var _b;
        var args = _a.args;
        return __awaiter(this, void 0, void 0, function () {
            var deck, discardPile, deckNode, discardNode, element, fromRect;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        deck = args.deck, discardPile = args.discardPile;
                        this.game.framework().removeTooltip('pp_wakhan_deck');
                        this.game.framework().removeTooltip('pp_wakhan_discard');
                        deckNode = dojo.byId('pp_wakhan_deck');
                        discardNode = dojo.byId('pp_wakhan_discard');
                        element = !discardPile.from
                            ? discardNode
                            : dojo.place("<div id=\"temp_wakhan_card\" class=\"pp_wakhan_card pp_".concat(discardPile.to, "_front\"></div>"), "pp_wakhan_discard");
                        fromRect = (_b = $("pp_wakhan_deck")) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
                        deckNode.classList.remove("pp_".concat(deck.from, "_back"));
                        if (deck.to !== null) {
                            deckNode.classList.add("pp_".concat(deck.to, "_back"));
                        }
                        else {
                            deckNode.style.opacity = '0';
                        }
                        if (!discardPile.from) {
                            discardNode.classList.add("pp_".concat(discardPile.to, "_front"));
                            discardNode.style.opacity = '1';
                        }
                        return [4, this.game.animationManager.play(new BgaSlideAnimation({
                                element: element,
                                transitionTimingFunction: 'linear',
                                fromRect: fromRect,
                            }))];
                    case 1:
                        _c.sent();
                        if (discardPile.from) {
                            discardNode.classList.replace("pp_".concat(discardPile.from, "_front"), "pp_".concat(discardPile.to, "_front"));
                            element.remove();
                        }
                        if (deck.to && discardPile.to) {
                            this.game.tooltipManager.addWakhanCardTooltip({ wakhanDeckCardId: deck.to, wakhanDiscardCardId: discardPile.to });
                        }
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_wakhanRadicalize = function (_a) {
        var args = _a.args;
        return __awaiter(this, void 0, void 0, function () {
            var marketLocation, newLocation, rupeesOnCards, receivedRupees, card, playerId, row, col, cardId, player;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        marketLocation = args.marketLocation, newLocation = args.newLocation, rupeesOnCards = args.rupeesOnCards, receivedRupees = args.receivedRupees, card = args.card;
                        playerId = WAKHAN_PLAYER_ID;
                        this.game.clearPossible();
                        row = Number(marketLocation.split('_')[1]);
                        col = Number(marketLocation.split('_')[2]);
                        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -rupeesOnCards.length });
                        return [4, Promise.all(rupeesOnCards.map(function (_a) {
                                var row = _a.row, column = _a.column, rupeeId = _a.rupeeId, cardId = _a.cardId;
                                return _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId), cardId: cardId });
                            }))];
                    case 1:
                        _b.sent();
                        return [4, this.game.market.removeRupeesFromCard({ row: row, column: col, to: "rupees_".concat(playerId) })];
                    case 2:
                        _b.sent();
                        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: receivedRupees });
                        cardId = card.id;
                        if (!newLocation.startsWith('events_')) return [3, 4];
                        return [4, this.getPlayer({ playerId: playerId }).addCardToEvents({ cardId: cardId })];
                    case 3:
                        _b.sent();
                        if (cardId === 'card_109') {
                            this.game.objectManager.supply.checkDominantCoalition();
                        }
                        return [3, 10];
                    case 4:
                        if (!(newLocation === DISCARD)) return [3, 6];
                        return [4, this.game.objectManager.discardPile.discardCardFromZone(cardId)];
                    case 5:
                        _b.sent();
                        return [3, 10];
                    case 6:
                        if (!(newLocation === TEMP_DISCARD)) return [3, 8];
                        return [4, this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard(card))];
                    case 7:
                        _b.sent();
                        return [3, 10];
                    case 8:
                        player = this.getPlayer({ playerId: playerId });
                        if (!(player instanceof PPWakhanPlayer)) return [3, 10];
                        return [4, player.radicalizeCardWakhan({
                                card: card,
                                from: this.game.market.getMarketCardZone({ row: row, column: col }),
                            })];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_wakhanReshuffleDeck = function (_a) {
        var _b;
        var args = _a.args;
        return __awaiter(this, void 0, void 0, function () {
            var topOfDiscardPile, topOfDeck, deckNode, discardNode, fromRect;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 1:
                        _c.sent();
                        topOfDiscardPile = args.topOfDiscardPile, topOfDeck = args.topOfDeck;
                        deckNode = dojo.byId("pp_wakhan_deck");
                        discardNode = dojo.byId('pp_wakhan_discard');
                        deckNode.classList.add("pp_".concat(topOfDeck, "_back"));
                        fromRect = (_b = $("pp_wakhan_discard")) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
                        discardNode.style.opacity = '0';
                        deckNode.style.opacity = '1';
                        return [4, this.game.animationManager.play(new BgaSlideAnimation({
                                element: deckNode,
                                transitionTimingFunction: 'linear',
                                fromRect: fromRect,
                            }))];
                    case 2:
                        _c.sent();
                        discardNode.classList.remove("pp_".concat(topOfDiscardPile, "_front"));
                        return [4, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 3:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    NotificationManager.prototype.notif_wakhanUpdatePragmaticLoyalty = function (_a) {
        var args = _a.args;
        return __awaiter(this, void 0, void 0, function () {
            var pragmaticLoyalty;
            return __generator(this, function (_b) {
                pragmaticLoyalty = args.pragmaticLoyalty;
                if (pragmaticLoyalty !== null) {
                    this.getPlayer({ playerId: WAKHAN_PLAYER_ID }).updateLoyaltyIcon({ pragmaticLoyalty: pragmaticLoyalty });
                }
                return [2];
            });
        });
    };
    NotificationManager.prototype.destroy = function () {
        dojo.forEach(this.subscriptions, dojo.unsubscribe);
    };
    NotificationManager.prototype.discardTempCard = function (_a) {
        var cardId = _a.cardId;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2];
        }); });
    };
    NotificationManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.game.playerManager.getPlayer({ playerId: playerId });
    };
    NotificationManager.prototype.performTokenMove = function (_a) {
        var move = _a.move;
        return __awaiter(this, void 0, void 0, function () {
            var tokenId, from, to, weight, toZone, token, zoneType;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenId = move.tokenId, from = move.from, to = move.to, weight = move.weight;
                        if (from === to) {
                            return [2];
                        }
                        toZone = this.game.getZoneForLocation({ location: to });
                        if (this.game.framework().isCurrentPlayerActive() &&
                            toZone.getCards().some(function (item) { return item.id === tokenId; })) {
                            debug('no need to execute move');
                            return [2];
                        }
                        token = {
                            id: tokenId,
                            state: weight,
                            used: 0,
                            location: to,
                        };
                        zoneType = to.split('_')[0];
                        switch (zoneType) {
                            case 'armies':
                                token['type'] = 'army';
                                token['coalition'] = getCoalitionForBlock(tokenId);
                                break;
                            case 'roads':
                                token['type'] = 'road';
                                token['coalition'] = getCoalitionForBlock(tokenId);
                                break;
                            case 'blocks':
                                token['type'] = 'supply';
                                token['coalition'] = getCoalitionForBlock(tokenId);
                                break;
                            case 'gift':
                            case 'tribes':
                            case 'spies':
                                token = this.game.getCylinder(token);
                                break;
                        }
                        return [4, toZone.addCard(token)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    return NotificationManager;
}());
var PaxPamir = (function () {
    function PaxPamir() {
        this.defaultWeightZone = 0;
        this.spies = {};
        this.playerCounts = {};
        this._notif_uid_to_log_id = {};
        this._last_notif = null;
        console.log('paxpamir constructor');
    }
    PaxPamir.prototype.setup = function (gamedatas) {
        var _a;
        var _this = this;
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        this.setAlwaysFixTopActions();
        this.gamedatas = gamedatas;
        this.gameOptions = gamedatas.gameOptions;
        debug('gamedatas', gamedatas);
        this.setupPlayerOrder({ paxPamirPlayerOrder: gamedatas.paxPamirPlayerOrder });
        if (this.gameOptions.wakhanEnabled) {
            dojo.place(tplWakhanPlayerPanel({ name: _('Wakhan') }), 'player_boards', 0);
        }
        this.playerOrder.forEach(function (playerId) {
            var player = gamedatas.paxPamirPlayers[playerId];
            if (playerId === 1) {
                dojo.place(tplWakhanTableau({ playerId: playerId, playerName: player.name, playerColor: player.color }), 'pp_player_tableaus');
            }
            else {
                dojo.place(tplPlayerTableau({ playerId: playerId, playerName: player.name, playerColor: player.color }), 'pp_player_tableaus');
            }
        });
        this._connections = [];
        this.localState = gamedatas.localState;
        this.activeStates = (_a = {},
            _a[CLIENT_CARD_ACTION_BATTLE] = new ClientCardActionBattleState(this),
            _a[CLIENT_CARD_ACTION_BETRAY] = new ClientCardActionBetrayState(this),
            _a[CLIENT_CARD_ACTION_BUILD] = new ClientCardActionBuildState(this, false),
            _a[CLIENT_CARD_ACTION_GIFT] = new ClientCardActionGiftState(this),
            _a[CLIENT_CARD_ACTION_MOVE] = new ClientCardActionMoveState(this),
            _a[CLIENT_CARD_ACTION_TAX] = new ClientCardActionTaxState(this),
            _a[CLIENT_INITIAL_BRIBE_CHECK] = new ClientInitialBribeCheckState(this),
            _a[CLIENT_PLAY_CARD] = new ClientPlayCardState(this),
            _a[CLIENT_PURCHASE_CARD] = new ClientPurchaseCardState(this),
            _a.acceptPrize = new AcceptPrizeState(this),
            _a.confirmPartialTurn = new ConfirmPartialTurnState(this),
            _a.discard = new DiscardState(this),
            _a.endGameCheck = new EndGameCheckState(this),
            _a.eventCardPashtunwaliValues = new ResolveEventPashtunwaliValuesState(this),
            _a.eventCardOtherPersuasiveMethods = new ResolveEventOtherPersuasiveMethodsState(this),
            _a.eventCardRumor = new ResolveEventRumor(this),
            _a.eventCardRebuke = new ResolveEventRebukeState(this),
            _a.negotiateBribe = new NegotiateBribeState(this),
            _a.placeRoad = new PlaceRoadState(this),
            _a.placeSpy = new PlaceSpyState(this),
            _a.playerActions = new PlayerActionsState(this),
            _a.setup = new SetupState(this),
            _a.selectPiece = new SelectPieceState(this),
            _a.specialAbilityInfrastructure = new ClientCardActionBuildState(this, true),
            _a.specialAbilitySafeHouse = new SASafeHouseState(this),
            _a.startOfTurnAbilities = new StartOfTurnAbilitiesState(this),
            _a.wakhanPause = new WakhanPauseState(this),
            _a);
        this.infoPanel = new InfoPanel(this);
        this.settings = new Settings(this);
        this.animationManager = new AnimationManager(this, {
            duration: this.settings.get({ id: PREF_SHOW_ANIMATIONS }) === PREF_DISABLED
                ? 0
                : 2100 - this.settings.get({ id: PREF_ANIMATION_SPEED }),
        });
        this.tooltipManager = new PPTooltipManager(this);
        this.cylinderManager = new CylinderManager(this);
        this.favoredSuitMarkerManager = new FavoredSuitMarkerManager(this);
        this.cardManager = new PPCardManager(this);
        this.coalitionBlockManager = new CoalitionBlockManager(this);
        this.rulerTokenManager = new RulerTokenManager(this);
        this.rupeeManager = new RupeeManager(this);
        this.activeEvents = new PPActiveEvents(this);
        this.playerManager = new PlayerManager(this);
        this.playerManager.setupAdjacentPlayerColors();
        this.map = new PPMap(this);
        this.market = new Market(this);
        this.objectManager = new ObjectManager(this);
        if (this.notificationManager != undefined) {
            this.notificationManager.destroy();
        }
        this.notificationManager = new NotificationManager(this);
        this.notificationManager.setupNotifications();
        dojo.connect(this.framework().notifqueue, 'addToLog', function () {
            _this.checkLogCancel(_this._last_notif == null ? null : _this._last_notif.msg.uid);
            _this.addLogClass();
            _this.tooltipManager.checkLogTooltip(_this._last_notif);
        });
        this.tooltipManager.setupTooltips();
        debug('Ending game setup');
    };
    PaxPamir.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args);
        if (this.framework().isCurrentPlayerActive() && this.activeStates[stateName]) {
            this.activeStates[stateName].onEnteringState(args.args);
        }
    };
    PaxPamir.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.clearPossible();
    };
    PaxPamir.prototype.onUpdateActionButtons = function (stateName, args) {
    };
    PaxPamir.prototype.addActionButtonClient = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses, _b = _a.color, color = _b === void 0 ? 'none' : _b;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, color);
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addCancelButton = function () {
        var _this = this;
        this.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.onCancel(); },
        });
    };
    PaxPamir.prototype.addUndoButton = function (_a) {
        var _this = this;
        var undoPossible = _a.undoPossible;
        if (undoPossible) {
            this.addDangerActionButton({
                id: 'undo_btn',
                text: _('Undo'),
                callback: function () { return _this.takeAction({ action: 'restart' }); },
            });
        }
    };
    PaxPamir.prototype.addPrimaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addSecondaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addDangerActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addPlayerButton = function (_a) {
        var player = _a.player, callback = _a.callback;
        this.addPrimaryActionButton({
            id: "select_".concat(player.getPlayerId()),
            text: player.getName(),
            callback: callback,
            extraClasses: "pp_player_button pp_player_color_".concat(player.getColor()),
        });
    };
    PaxPamir.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.spies).forEach(function (key) {
            if (_this.spies[key]) {
                _this.spies[key].removeAll();
            }
            _this.spies[key] = undefined;
        });
        this.activeEvents.clearInterface();
        this.market.clearInterface();
        this.playerManager.clearInterface();
        this.map.clearInterface();
        this.objectManager.clearInterface();
    };
    PaxPamir.prototype.clearPossible = function () {
        this.framework().removeActionButtons();
        dojo.empty('customActions');
        dojo.forEach(this._connections, dojo.disconnect);
        this._connections = [];
        dojo.query('.pp_selectable').removeClass('pp_selectable');
        dojo.query('.pp_selected').removeClass('pp_selected');
        this.map.clearSelectable();
    };
    PaxPamir.prototype.getCard = function (token) {
        return __assign(__assign({}, token), this.getCardInfo(token.id));
    };
    PaxPamir.prototype.getCylinder = function (token) {
        return __assign(__assign({}, token), { color: this.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color });
    };
    PaxPamir.prototype.getCardInfo = function (cardId) {
        return this.gamedatas.staticData.cards[cardId];
    };
    PaxPamir.prototype.getWakhanCardInfo = function (_a) {
        var wakhanCardId = _a.wakhanCardId;
        return this.gamedatas.staticData.wakhanCards[wakhanCardId];
    };
    PaxPamir.prototype.getPlayerId = function () {
        return Number(this.framework().player_id);
    };
    PaxPamir.prototype.getCurrentPlayer = function () {
        return this.playerManager.getPlayer({ playerId: this.getPlayerId() });
    };
    PaxPamir.prototype.getMinimumActionCost = function (_a) {
        var action = _a.action;
        if ([BATTLE, MOVE, TAX, PLAY_CARD].includes(action)) {
            return 0;
        }
        else if ([BETRAY, BUILD].includes(action)) {
            return 2;
        }
        else {
            return this.getCurrentPlayer().getLowestAvailableGift();
        }
    };
    PaxPamir.prototype.framework = function () {
        return this;
    };
    PaxPamir.prototype.onCancel = function () {
        this.clearPossible();
        this.framework().restoreServerGameState();
    };
    PaxPamir.prototype.updateLocalState = function (updates) {
        this.localState = __assign(__assign({}, this.localState), updates);
    };
    PaxPamir.prototype.setCourtCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback, loyalty = _a.loyalty, region = _a.region, suit = _a.suit;
        debug('setCourtCardsSelectable', loyalty, region, suit);
        var playerId = this.getPlayerId();
        dojo.query(".pp_court.pp_court_player_".concat(playerId, " .pp_card")).forEach(function (node, index) {
            var cardId = 'card_' + node.id.split('_')[1];
            var card = _this.getCardInfo(cardId);
            var loyaltyFilter = !loyalty || card.loyalty === loyalty;
            var regionFilter = !region || card.region === region;
            var suitFilter = !suit || card.suit === suit;
            if (loyaltyFilter && regionFilter && suitFilter) {
                dojo.addClass(node, 'pp_selectable');
                _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
            }
        });
    };
    PaxPamir.prototype.setHandCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        debug('setHandCardsSelectable');
        document.querySelectorAll('.pp_player_hand_cards .pp_card').forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
        });
    };
    PaxPamir.prototype.setupPlayerOrder = function (_a) {
        var paxPamirPlayerOrder = _a.paxPamirPlayerOrder;
        var currentPlayerId = this.getPlayerId();
        var isInGame = paxPamirPlayerOrder.includes(currentPlayerId);
        if (isInGame) {
            while (paxPamirPlayerOrder[0] !== currentPlayerId) {
                var firstItem = paxPamirPlayerOrder.shift();
                paxPamirPlayerOrder.push(firstItem);
            }
        }
        this.playerOrder = paxPamirPlayerOrder;
    };
    PaxPamir.prototype.clientUpdatePageTitle = function (_a) {
        var text = _a.text, args = _a.args;
        this.gamedatas.gamestate.descriptionmyturn = this.format_string_recursive(_(text), args);
        this.framework().updatePageTitle();
    };
    PaxPamir.prototype.clientUpdatePageTitleOtherPlayers = function (_a) {
        var text = _a.text, args = _a.args;
        this.gamedatas.gamestate.description = dojo.string.substitute(_(text), args);
        this.framework().updatePageTitle();
    };
    PaxPamir.prototype.updateLayout = function () {
        if (!this.settings) {
            return;
        }
        $('play_area_container').setAttribute('data-two-columns', this.settings.get({ id: 'twoColumnsLayout' }));
        var ROOT = document.documentElement;
        var WIDTH = $('play_area_container').getBoundingClientRect()['width'] - 8;
        var LEFT_COLUMN = 1000;
        var RIGHT_COLUMN = 1000;
        if (this.settings.get({ id: 'twoColumnsLayout' }) === PREF_ENABLED) {
            WIDTH = WIDTH - 8;
            var size = Number(this.settings.get({ id: 'columnSizes' }));
            var proportions = [size, 100 - size];
            var LEFT_SIZE = (proportions[0] * WIDTH) / 100;
            var leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
            ROOT.style.setProperty('--leftColumnScale', "".concat(leftColumnScale));
            ROOT.style.setProperty('--mapSizeMultiplier', '1');
            var RIGHT_SIZE = (proportions[1] * WIDTH) / 100;
            var rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
            ROOT.style.setProperty('--rightColumnScale', "".concat(rightColumnScale));
            $('play_area_container').style.gridTemplateColumns = "".concat(LEFT_SIZE, "px ").concat(RIGHT_SIZE, "px");
        }
        else {
            var LEFT_SIZE = WIDTH;
            var leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
            ROOT.style.setProperty('--leftColumnScale', "".concat(leftColumnScale));
            ROOT.style.setProperty('--mapSizeMultiplier', "".concat(Number(this.settings.get({ id: PREF_SINGLE_COLUMN_MAP_SIZE })) / 100));
            var RIGHT_SIZE = WIDTH;
            var rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
            ROOT.style.setProperty('--rightColumnScale', "".concat(rightColumnScale));
        }
    };
    PaxPamir.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                Object.entries(args).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (key.startsWith('logToken')) {
                        args[key] = getLogTokenDiv({ logToken: value, game: _this });
                    }
                    else if (key.startsWith('tkn_')) {
                        args[key] = getTokenDiv({ key: key, value: value, game: _this });
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return this.inherited(arguments);
    };
    PaxPamir.prototype.onPlaceLogOnChannel = function (msg) {
        var currentLogId = this.framework().notifqueue.next_log_id;
        var res = this.framework().inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._last_notif = {
            logId: currentLogId,
            msg: msg,
        };
        return res;
    };
    PaxPamir.prototype.checkLogCancel = function (notifId) {
        if (this.gamedatas.canceledNotifIds != null && this.gamedatas.canceledNotifIds.includes(notifId)) {
            this.cancelLogs([notifId]);
        }
    };
    PaxPamir.prototype.onScreenWidthChange = function () {
        this.updateLayout();
    };
    PaxPamir.prototype.cancelLogs = function (notifIds) {
        var _this = this;
        notifIds.forEach(function (uid) {
            if (_this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                var logId = _this._notif_uid_to_log_id[uid];
                if ($('log_' + logId))
                    dojo.addClass('log_' + logId, 'cancel');
            }
        });
    };
    PaxPamir.prototype.addLogClass = function () {
        if (this._last_notif == null)
            return;
        var notif = this._last_notif;
        if ($('log_' + notif.logId)) {
            var type = notif.msg.type;
            if (type == 'history_history')
                type = notif.msg.args.originalType;
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
        }
    };
    PaxPamir.prototype.setLoader = function (value, max) {
        this.framework().inherited(arguments);
        if (!this.framework().isLoadingComplete && value >= 100) {
            this.framework().isLoadingComplete = true;
            this.onLoadingComplete();
        }
    };
    PaxPamir.prototype.onLoadingComplete = function () {
        this.cancelLogs(this.gamedatas.canceledNotifIds);
    };
    PaxPamir.prototype.updatePlayerOrdering = function () {
        this.playerOrder.forEach(function (playerId, index) {
            dojo.place('overall_player_board_' + playerId, 'player_boards', index);
        });
        var container = document.getElementById('player_boards');
        var infoPanel = document.getElementById('info_panel');
        if (!container) {
            return;
        }
        container.insertAdjacentElement('afterbegin', infoPanel);
    };
    PaxPamir.prototype.setAlwaysFixTopActions = function (alwaysFixed, maximum) {
        if (alwaysFixed === void 0) { alwaysFixed = true; }
        if (maximum === void 0) { maximum = 30; }
        this.alwaysFixTopActions = alwaysFixed;
        this.alwaysFixTopActionsMaximum = maximum;
        this.adaptStatusBar();
    };
    PaxPamir.prototype.adaptStatusBar = function () {
        this.inherited(arguments);
        if (this.alwaysFixTopActions) {
            var afterTitleElem = document.getElementById('after-page-title');
            var titleElem = document.getElementById('page-title');
            var zoom = getComputedStyle(titleElem).zoom;
            if (!zoom) {
                zoom = 1;
            }
            var titleRect = afterTitleElem.getBoundingClientRect();
            if (titleRect.top < 0 &&
                titleElem.offsetHeight <
                    (window.innerHeight * this.alwaysFixTopActionsMaximum) / 100) {
                var afterTitleRect = afterTitleElem.getBoundingClientRect();
                titleElem.classList.add('fixed-page-title');
                titleElem.style.width = (afterTitleRect.width - 10) / zoom + 'px';
                afterTitleElem.style.height = titleRect.height + 'px';
            }
            else {
                titleElem.classList.remove('fixed-page-title');
                titleElem.style.width = 'auto';
                afterTitleElem.style.height = '0px';
            }
        }
    };
    PaxPamir.prototype.getZoneForLocation = function (_a) {
        var location = _a.location;
        var splitLocation = location.split('_');
        switch (splitLocation[0]) {
            case 'armies':
                return this.map.getRegion({ region: splitLocation[1] }).getArmyZone();
            case 'blocks':
                return this.objectManager.supply.getCoalitionBlocksZone({
                    coalition: splitLocation[1],
                });
            case 'cylinders':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getCylinderZone();
            case 'events':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getEventsZone();
            case 'gift':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[2]) }).getGiftZone({ value: Number(splitLocation[1]) });
            case 'favored':
                return this.objectManager.favoredSuit.getFavoredSuitZone({
                    suit: splitLocation[2],
                });
            case 'roads':
                var border = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.map.getBorder({ border: border }).getRoadZone();
            case 'spies':
                var cardId = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.spies[cardId];
            case 'tribes':
                return this.map.getRegion({ region: splitLocation[1] }).getTribeZone();
            default:
                debug('no zone determined');
                break;
        }
    };
    PaxPamir.prototype.updateCard = function (_a) {
        var _b;
        var location = _a.location, id = _a.id, order = _a.order;
        location.changeItemsWeight((_b = {}, _b[id] = order, _b));
    };
    PaxPamir.prototype.actionError = function (actionName) {
        this.framework().showMessage("cannot take ".concat(actionName, " action"), 'error');
    };
    PaxPamir.prototype.takeAction = function (_a) {
        var action = _a.action, _b = _a.data, data = _b === void 0 ? {} : _b;
        if (!this.framework().checkAction(action)) {
            this.actionError(action);
            return;
        }
        data.lock = true;
        var gameName = this.framework().game_name;
        this.framework().ajaxcall("/".concat(gameName, "/").concat(gameName, "/").concat(action, ".html"), data, this, function () { });
    };
    return PaxPamir;
}());
define([
    'dojo',
    'dojo/_base/declare',
    g_gamethemeurl + 'modules/js/vendor/nouislider.min.js',
    'dojo/fx',
    'dojox/fx/ext-dojo/complex',
    'ebg/core/gamegui',
    'ebg/counter',
    'ebg/stock',
    'ebg/zone',
], function (dojo, declare, noUiSliderDefined) {
    if (noUiSliderDefined) {
        noUiSlider = noUiSliderDefined;
    }
    return declare('bgagame.paxpamir', ebg.core.gamegui, new PaxPamir());
});
