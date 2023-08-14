/*
 * Modal component that works like popin dialog
 * To have the same styling as the BGA ones, use the style at the end of this file
 * TS version of Tisaac's modal component: https://github.com/Syarwin/bga-barrage/blob/master/modules/js/Core/modal.js
 * To use make sure to enable following Dojo modules:
 * - 'dojo/fx',
 * - 'dojox/fx/ext-dojo/complex',
 */

class Modal {
  private id: string;
  private isClosing: boolean;
  private isOpening: boolean;
  private open: boolean = false;
  private resizeListener: unknown; // listener: return value of dojo.connect
  private runningAnimation: DojoAnimation;
  // config
  private container: string = 'ebd-body';
  private class: string = 'custom_popin';
  private autoShow: boolean = false;

  private modalTpl: string = `
    <div id='popin_\${id}_container' class="\${class}_container">
      <div id='popin_\${id}_underlay' class="\${class}_underlay"></div>
      <div id='popin_\${id}_wrapper' class="\${class}_wrapper">
        <div id="popin_\${id}" class="\${class}">
          \${titleTpl}
          \${closeIconTpl}
          \${helpIconTpl}
          \${contentsTpl}
        </div>
      </div>
    </div>
  `;

  private closeIcon: string | null = 'fa-times-circle';
  private closeIconTpl: string =
    '<a id="popin_${id}_close" class="${class}_closeicon"><i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i></a>';
    // private closeIconTpl: string =
    // '<a href="#" id="popin_${id}_close" class="${class}_closeicon"><i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i></a>';
  private closeAction: 'destroy' | 'hide' = 'destroy';
  private closeWhenClickOnUnderlay: boolean = true;

  private helpIcon: string | null = null;
  private helpLink: string = '#';
  private helpIconTpl: string =
    '<a href="${helpLink}" target="_blank" id="popin_${id}_help" class="${class}_helpicon"><i class="fa ${helpIcon} fa-2x" aria-hidden="true"></i></a>';

  private title: string | null = null; // Set to null if you don't want a title
  private titleTpl: string = '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>';

  private contentsTpl: string = `
      <div id="popin_\${id}_contents" class="\${class}_contents">
        \${contents}
      </div>`;
  private contents: string = '';
  private verticalAlign: string = 'center';
  private animationDuration: number = 500;
  private fadeIn: boolean = true;
  private fadeOut: boolean = true;
  private openAnimation: boolean = false;
  private openAnimationTarget: string | null = null;
  private openAnimationDelta: number = 200;
  private onShow: () => void | null = null;
  private onHide: () => void | null = null;
  private statusElt: string | null = null;
  private scale: number = 1;
  private breakpoint: number | null = null;

  constructor(id: string, config: ModalConfig) {
    if (id === undefined) {
      console.error('You need an ID to create a modal');
      throw 'You need an ID to create a modal';
    }
    this.id = id;

    // Load other parameters
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        this[key] = value;
      }
    });

    // Create the DOM elements
    this.create();
    if (this.autoShow) this.show();
  }

  isDisplayed() {
    return this.open;
  }

  isCreated() {
    return this.id != null;
  }

  /*
   * Create : create underlay and modal div, and contents
   */
  create() {
    dojo.destroy('popin_' + this.id + '_container');
    let titleTpl = this.title == null ? '' : dojo.string.substitute(this.titleTpl, this);
    let closeIconTpl = this.closeIcon == null ? '' : dojo.string.substitute(this.closeIconTpl, this);
    let helpIconTpl = this.helpIcon == null ? '' : dojo.string.substitute(this.helpIconTpl, this);
    let contentsTpl = dojo.string.substitute(this.contentsTpl, this);

    let modalTpl = dojo.string.substitute(this.modalTpl, {
      id: this.id,
      class: this.class,
      titleTpl,
      closeIconTpl,
      helpIconTpl,
      contentsTpl,
    });

    dojo.place(modalTpl, this.container);

    // Basic styling
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
      // position: 'absolute',
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
    this.resizeListener = dojo.connect(window, 'resize', () => this.adjustSize());

    // Connect events
    if (this.closeIcon != null && $('popin_' + this.id + '_close')) {
      dojo.connect($('popin_' + this.id + '_close'), 'click', () => this[this.closeAction]());
    }
    if (this.closeWhenClickOnUnderlay) {
      dojo.connect($('popin_' + this.id + '_underlay'), 'click', () => this[this.closeAction]());
      dojo.connect($('popin_' + this.id + '_wrapper'), 'click', () => this[this.closeAction]());
      dojo.connect($('popin_' + this.id), 'click', (evt) => evt.stopPropagation());
    }
  }

  updateContent(newContent: string) {
    const contentContainerId = `popin_${this.id}_contents`;
    dojo.empty(contentContainerId);
    dojo.place(newContent, contentContainerId);
  }

  adjustSize() {
    let bdy = dojo.position(this.container);
    dojo.style('popin_' + this.id + '_container', {
      width: bdy.w + 'px',
      height: bdy.h + 'px',
    });

    if (this.breakpoint != null) {
      let newModalWidth = bdy.w * this.scale;
      let modalScale = newModalWidth / this.breakpoint;
      if (modalScale > 1) modalScale = 1;
      dojo.style('popin_' + this.id, {
        transform: `scale(${modalScale})`,
        transformOrigin: this.verticalAlign == 'center' ? 'center center' : 'top center',
      });
    }
  }

  getOpeningTargetCenter() {
    let startTop: number, startLeft: number;
    if (this.openAnimationTarget == null) {
      startLeft = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2;
      startTop = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2;
    } else {
      let target = dojo.position(this.openAnimationTarget);
      startLeft = target.x + target.w / 2;
      startTop = target.y + target.h / 2;
    }

    return {
      x: startLeft,
      y: startTop,
    };
  }

  /*
   * Fadein promise
   */
  fadeInAnimation() {
    return new Promise<void>((resolve, reject) => {
      let containerId = 'popin_' + this.id + '_container';
      if (!$(containerId)) reject();

      if (this.runningAnimation) this.runningAnimation.stop();
      let duration = this.fadeIn ? this.animationDuration : 0;
      var animations = [];

      // Modals fade in
      animations.push(
        dojo.fadeIn({
          node: 'popin_' + this.id + '_wrapper',
          duration: duration,
        })
      );
      // Underlay fade in background
      animations.push(
        dojo.animateProperty({
          node: 'popin_' + this.id + '_underlay',
          duration: duration,
          properties: { opacity: { start: 0, end: 0.7 } },
        })
      );

      // Opening animation
      if (this.openAnimation) {
        var pos = this.getOpeningTargetCenter();
        animations.push(
          dojo.animateProperty({
            node: 'popin_' + this.id + '_wrapper',
            properties: {
              transform: { start: 'scale(0)', end: 'scale(1)' },
              top: { start: pos.y, end: 0 },
              left: { start: pos.x, end: 0 },
            },
            duration: this.animationDuration + this.openAnimationDelta,
          })
        );
      }

      // Create the overall animation
      this.runningAnimation = dojo.fx.combine(animations);
      dojo.connect(this.runningAnimation, 'onEnd', () => resolve());
      this.runningAnimation.play();
      setTimeout(() => {
        if ($('popin_' + this.id + '_container')) dojo.style('popin_' + this.id + '_container', 'display', 'block');
      }, 10);
    });
  }

  show() {
    if (this.isOpening || this.open) return;

    if (this.statusElt !== null) {
      dojo.addClass(this.statusElt, 'opened');
    }

    this.adjustSize();
    this.isOpening = true;
    this.isClosing = false;
    this.fadeInAnimation().then(() => {
      if (!this.isOpening) return;

      this.isOpening = false;
      this.open = true;
      if (this.onShow !== null) {
        this.onShow();
      }
    });
  }

  /*
   * Fadeout promise
   */
  fadeOutAnimation() {
    return new Promise<void>((resolve, reject) => {
      let containerId = 'popin_' + this.id + '_container';
      if (!$(containerId)) reject();
      if (this.runningAnimation) this.runningAnimation.stop();

      let duration = this.fadeOut ? this.animationDuration + (this.openAnimation ? this.openAnimationDelta : 0) : 0;
      var animations = [];

      // Modals fade out
      animations.push(
        dojo.fadeOut({
          node: 'popin_' + this.id + '_wrapper',
          duration: duration,
        })
      );
      // Underlay fade out background
      animations.push(
        dojo.animateProperty({
          node: 'popin_' + this.id + '_underlay',
          duration: duration,
          properties: { opacity: { start: 0.7, end: 0 } },
        })
      );

      // Closing animation
      if (this.openAnimation) {
        var pos = this.getOpeningTargetCenter();
        animations.push(
          dojo.animateProperty({
            node: 'popin_' + this.id + '_wrapper',
            properties: {
              transform: { start: 'scale(1)', end: 'scale(0)' },
              top: { start: 0, end: pos.y },
              left: { start: 0, end: pos.x },
            },
            duration: this.animationDuration,
          })
        );
      }

      // Create the overall animation
      this.runningAnimation = dojo.fx.combine(animations);
      dojo.connect(this.runningAnimation, 'onEnd', () => resolve());
      this.runningAnimation.play();
    });
  }

  /*
   * Hide : hide the modal without destroying it
   */
  hide() {
    if (this.isClosing) return;

    this.isClosing = true;
    this.isOpening = false;
    this.fadeOutAnimation().then(() => {
      if (!this.isClosing || this.isOpening) return;
      this.isClosing = false;
      this.open = false;

      dojo.style('popin_' + this.id + '_container', 'display', 'none');

      if (this.onHide !== null) {
        this.onHide();
      }

      if (this.statusElt !== null) {
        dojo.removeClass(this.statusElt, 'opened');
      }
    });
  }

  /*
   * Destroy : destroy the object and all DOM elements
   */
  destroy() {
    if (this.isClosing) return;

    this.isOpening = false;
    this.isClosing = true;
    this.fadeOutAnimation().then(() => {
      if (!this.isClosing || this.isOpening) return;
      this.isClosing = false;
      this.open = false;

      this.kill();
    });
  }

  /*
   * Kill : destroy the object and all DOM elements
   */
  kill() {
    if (this.runningAnimation) this.runningAnimation.stop();
    let underlayId = 'popin_' + this.id + '_container';
    dojo.destroy(underlayId);

    dojo.disconnect(this.resizeListener);
    this.id = null;

    if (this.statusElt !== null) {
      dojo.removeClass(this.statusElt, 'opened');
    }
  }
}

/*

.custom_popin {
  position:relative;
  max-width: 1000px;
  min-width: 300px;
//  width: auto;
  width:70%;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #f8f8f8, #e7e9e8);
  border: 2px black solid;
  border-radius: 8px;
  padding: 1%;
}
.mobile_version .custom_popin {
 padding: 10px;
}

.custom_popin_title {
 font-size: 150%;
 padding-right: 90px;
}
.mobile_version .custom_popin_title {
 font-size: 120%;
}


.custom_popin_closeicon,
.custom_popin_helpicon {
 position: absolute;
 top: 5px;
 color: black !important;
 right: 8px;
 font-size: 134%;
}
.custom_popin_helpicon {
 right: 47px;
}
.notouch-device .custom_popin_closeicon:hover,
.notouch-device .custom_popin_helpicon:hover {
 color: #555555 !important;
}
*/
