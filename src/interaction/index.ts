class Interaction {
  private static instance: Interaction;
  public game: GameAlias;

  constructor(game: GameAlias) {
    this.game = game;
  }

  public static create(game: GameAlias) {
    Interaction.instance = new Interaction(game);
  }

  public static use() {
    return Interaction.instance;
  }

  // public addPlayerButton({
  //   id,
  //   text,
  //   playerId,
  //   callback,
  //   extraClasses,
  // }: {
  //   id: string;
  //   text: string;
  //   playerId: number;
  //   callback: Function;
  //   extraClasses?: string;
  // }) {
  //   this.addSecondaryActionButton({
  //     id,
  //     text,
  //     callback,
  //     extraClasses: `player-button ${extraClasses}`,
  //   });
  //   const elt = document.getElementById(id);
  //   const playerColor = PlayerManager.getInstance()
  //     .getPlayer(playerId)
  //     .getColor();
  //   // TODO: use classes so hover effect does not break?
  //   elt!.style.backgroundColor = '#' + playerColor;
  // }

  public addPrimaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }

    this.game.bga.statusBar.addActionButton(text, callback, {
      id,
      color: 'primary',
      destination: document.getElementById('customActions')!,
      classes: extraClasses ?? '',
    });
  }

  addSecondaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }

    this.game.bga.statusBar.addActionButton(text, callback, {
      id,
      color: 'secondary',
      destination: document.getElementById('customActions')!,
      classes: extraClasses ?? '',
    });
  }

  addCancelButton({
    callback,
    extraClasses,
  }: { callback?: Function; extraClasses?: string } = {}) {
    this.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        if (callback) {
          callback();
        }
        this.game.onCancel();
      },
      extraClasses,
    });
  }

  public addConfirmButton(callback: Function) {
    this.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback,
    });
  }

  public addDangerActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }

    this.game.bga.statusBar.addActionButton(text, callback, {
      id,
      color: 'alert',
      destination: document.getElementById('customActions')!,
      classes: extraClasses ?? '',
    });
  }

  public addPassButton(optionalAction: boolean, text?: string) {
    if (optionalAction) {
      this.addSecondaryActionButton({
        id: 'pass_btn',
        text: text ? _(text) : _('Pass'),
        callback: () =>
          this.game.bga.actions.performAction('actPassOptionalAction'),
      });
    }
  }

  // public addUndoButtons({
  //   previousSteps,
  //   previousEngineChoices,
  // }: CommonStateArgs) {
  //   const lastStep = Math.max(0, ...previousSteps);
  //   if (lastStep > 0) {
  //     // this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), () => this.undoToStep(lastStep), 'restartAction');
  //     this.addDangerActionButton({
  //       id: 'undo_last_step_btn',
  //       text: _('Undo last step'),
  //       callback: () => {
  //         this.game.bga.actions.performAction('actUndoToStep', {
  //           stepId: lastStep,
  //         });
  //       },
  //     });
  //   }

  //   if (previousEngineChoices > 0) {
  //     this.addDangerActionButton({
  //       id: 'restart_btn',
  //       text: _('Undo all'),
  //       callback: () => {
  //         this.game.bga.actions.performAction('actRestart');
  //         // this.takeAction({ action: 'actRestart', atomicAction: false }),
  //       },
  //     });
  //   }
  // }

  public clearPossible() {
    this.game.clearPossible();
  }

  public clientUpdatePageTitle(
    text: string,
    args: Record<string, string | number | unknown>,
  ) {
    this.game.bga.statusBar.setTitle(text, args);
  }

  public formatStringRecursive(
    log: string,
    args: Record<string, unknown>,
  ): string {
    // return this.game.format_string_recursive(log, args);
    return this.game.bga.gameui.format_string_recursive(log, args);
    // return this.game.bga.gameui.bgaFormatText(log, args) as unknown as string;
  }

  // public onClick(node: HTMLElement, callback: Function, temporary = true) {
  //   this.game.onClick(node, callback, temporary);
  // }

  public setSelected(node: HTMLElement) {
    if (!node) {
      return;
    }
    node.classList.add('selected');
  }

  public performAction(actionName: string, args: Record<string, unknown>) {
    this.game.bga.actions.performAction(
      'actTakeAtomicAction',
      {
        actionName,
        args: JSON.stringify(args),
      },
      //  {lock: true, checkAction: false}
    );
  }

  public async wait(ms: number) {
    return await this.game.bga.gameui.wait(ms);
  }
}
