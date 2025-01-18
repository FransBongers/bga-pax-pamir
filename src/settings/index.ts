class Settings {
  protected game: PaxPamirGame;

  private modal: Modal;
  private ROOT: HTMLElement = document.documentElement;
  public settings: Record<string, string | number> = {};

  private selectedTab: SettingsTabId = 'layout';
  private tabs: { id: SettingsTabId; name: string }[] = [
    {
      id: 'layout',
      name: _('Layout'),
    },
    {
      id: 'gameplay',
      name: _('Gameplay'),
    },
  ];

  constructor(game: PaxPamirGame) {
    this.game = game;
    const gamedatas = game.gamedatas;

    this.setup({ gamedatas });
  }

  // .##.....##.##....##.########...#######.
  // .##.....##.###...##.##.....##.##.....##
  // .##.....##.####..##.##.....##.##.....##
  // .##.....##.##.##.##.##.....##.##.....##
  // .##.....##.##..####.##.....##.##.....##
  // .##.....##.##...###.##.....##.##.....##
  // ..#######..##....##.########...#######.

  clearInterface() {}

  updateInterface({
    gamedatas,
  }: {
    gamedatas: PaxPamirGamedatas;
  }) {}

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  private addButton({
    gamedatas,
  }: {
    gamedatas: PaxPamirGamedatas;
  }) {
    const configPanel = document.getElementById('info_panel_buttons');
    if (configPanel) {
      configPanel.insertAdjacentHTML('beforeend', tplSettingsButton());
    }
  }

  private setupModal({
    gamedatas,
  }: {
    gamedatas: PaxPamirGamedatas;
  }) {
    this.modal = new Modal(`settings_modal`, {
      class: 'settings_modal',
      closeIcon: 'fa-times',
      titleTpl:
        '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',
      title: _('Settings'),
      contents: tplSettingsModalContent({
        tabs: this.tabs,
      }),
      closeAction: 'hide',
      verticalAlign: 'flex-start',
      breakpoint: 740,
    });
  }

  // Setup functions
  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.addButton({ gamedatas });
    this.setupModal({ gamedatas });
    this.setupModalContent();
    this.changeTab({ id: this.selectedTab });

    dojo.connect($(`show_settings_menu`), 'onclick', () => this.open());
    this.tabs.forEach(({ id }) => {
      dojo.connect($(`settings_modal_tab_${id}`), 'onclick', () =>
        this.changeTab({ id })
      );
    });
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  // ..######...#######..##....##.########.########.##....##.########
  // .##....##.##.....##.###...##....##....##.......###...##....##...
  // .##.......##.....##.####..##....##....##.......####..##....##...
  // .##.......##.....##.##.##.##....##....######...##.##.##....##...
  // .##.......##.....##.##..####....##....##.......##..####....##...
  // .##....##.##.....##.##...###....##....##.......##...###....##...
  // ..######...#######..##....##....##....########.##....##....##...

  private setupModalContent() {
    const config = getSettingsConfig();
    const node = document.getElementById('setting_modal_content');
    if (!node) {
      return;
    }

    Object.entries(config).forEach(([tabId, tabConfig]) => {
      node.insertAdjacentHTML(
        'beforeend',
        tplSettingsModalTabContent({ id: tabId })
      );

      const tabContentNode = document.getElementById(
        `settings_modal_tab_content_${tabId}`
      );
      if (!tabContentNode) {
        return;
      }

      Object.values(tabConfig.config).forEach((setting) => {
        const { id, type, defaultValue, visibleCondition } = setting;

        // Set current value (local storage value or default)
        const localValue = localStorage.getItem(
          this.getLocalStorageKey({ id })
        );
        this.settings[id] = localValue || defaultValue;

        // Call change method to update interface based on current value
        const methodName = this.getMethodName({ id });
        if (setting.onChangeInSetup && this[methodName]) {
          this[methodName](localValue ? localValue : setting.defaultValue);
        }

        // Add content to modal
        if (setting.type === 'select') {
          const visible =
            !visibleCondition ||
            (visibleCondition &&
              visibleCondition.values.includes(
                this.settings[visibleCondition.id]
              ));

          tabContentNode.insertAdjacentHTML(
            'beforeend',
            tplPlayerPrefenceSelectRow({
              setting,
              currentValue: this.settings[setting.id] as string,
              visible,
            })
          );
          const controlId = `setting_${setting.id}`;
          $(controlId).addEventListener('change', () => {
            const value = $(controlId).value;
            this.changeSetting({ id: setting.id, value });
          });
        } else if (setting.type === 'slider') {
          const visible =
            !visibleCondition ||
            (visibleCondition &&
              visibleCondition.values.includes(
                this.settings[visibleCondition.id]
              ));

          tabContentNode.insertAdjacentHTML(
            'beforeend',
            tplPlayerPrefenceSliderRow({
              id: setting.id,
              label: setting.label,
              visible,
            })
          );
          const sliderConfig = {
            ...setting.sliderConfig,
            start: this.settings[setting.id],
          };

          noUiSlider.create($('setting_' + setting.id), sliderConfig);
          $('setting_' + setting.id).noUiSlider.on('slide', (arg) =>
            this.changeSetting({ id: setting.id, value: arg[0] as string })
          );
        }
      });
    });
  }

  // ..#######..##....##.....######..##.....##....###....##....##..######...########
  // .##.....##.###...##....##....##.##.....##...##.##...###...##.##....##..##......
  // .##.....##.####..##....##.......##.....##..##...##..####..##.##........##......
  // .##.....##.##.##.##....##.......#########.##.....##.##.##.##.##...####.######..
  // .##.....##.##..####....##.......##.....##.#########.##..####.##....##..##......
  // .##.....##.##...###....##....##.##.....##.##.....##.##...###.##....##..##......
  // ..#######..##....##.....######..##.....##.##.....##.##....##..######...########

  private changeSetting({ id, value }: { id: string; value: string }) {
    const suffix = this.getSuffix({ id });
    this.settings[id] = value;
    localStorage.setItem(this.getLocalStorageKey({ id }), value);
    const methodName = this.getMethodName({ id });

    if (this[methodName]) {
      this[methodName](value);
    }
  }

  public onChangeTwoColumnsLayoutSetting(value: string) {
    this.checkColumnSizesVisisble();
    const node = document.getElementById('play_area_container');
    if (node) {
      node.setAttribute('data-two-columns', value);
    }
    this.game.updateLayout();
    // document.documentElement.setAttribute("data-background-pref", value);
  }

  public onChangeColumnSizesSetting(value: string) {
    this.game.updateLayout();
  }

  public onChangeSingleColumnMapSizeSetting(value: string) {
    this.game.updateLayout();
  }

  public onChangeCardSizeInLogSetting(value: number) {
    const ROOT = document.documentElement;
    ROOT.style.setProperty('--logCardScale', `${Number(value) / 100}`);
  }

  public onChangeCardSizeInCourtSetting(value: number) {
    const node = document.getElementById("pp_player_tableaus");
    if (node) {
      node.style.setProperty(
        "--cardInCourtScale",
        `${Number(value) / 100}`
      );
    }
  }

  public onChangeAnimationSpeedSetting(value: number) {
    const duration = 2100 - value;
    debug('onChangeAnimationSpeedSetting', duration);
    this.game.animationManager.getSettings().duration = duration;
  }

  public onChangeShowAnimationsSetting(value: string) {
    if (value === PREF_ENABLED) {
      this.game.animationManager.getSettings().duration = Number(
        this.settings[PREF_ANIMATION_SPEED]
      );
    } else {
      this.game.animationManager.getSettings().duration = 0;
    }
    this.checkAnmimationSpeedVisisble();
  }



  // public onChangeCardInfoInTooltipSetting(value: string) {
  //   this.game.market.updateMarketCardTooltips();
  //   this.game.playerManager.updateCardTooltips();
  //   this.game.tableauCardManager.updateCardTooltips();
  //   this.game.victoryCardManager.updateCardTooltips();
  //   this.game.updateLogTooltips();
  // }
  public onChangeCardInfoInTooltipSetting(value: string) {
    // if (this.game.hand) {
    //   this.game.hand.updateCardTooltips();
    //   this.game.cardsInPlay.updateCardTooltips();
    // }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private changeTab({ id }: { id: SettingsTabId }) {
    const currentTab = document.getElementById(
      `settings_modal_tab_${this.selectedTab}`
    );
    const currentTabContent = document.getElementById(
      `settings_modal_tab_content_${this.selectedTab}`
    );
    currentTab.removeAttribute('data-state');
    if (currentTabContent) {
      currentTabContent.style.display = 'none';
    }

    this.selectedTab = id;
    const tab = document.getElementById(`settings_modal_tab_${id}`);
    const tabContent = document.getElementById(
      `settings_modal_tab_content_${this.selectedTab}`
    );
    tab.setAttribute('data-state', 'selected');
    if (tabContent) {
      tabContent.style.display = '';
    }
  }

  private checkAnmimationSpeedVisisble() {
    const sliderNode = document.getElementById('setting_row_animationSpeed');
    if (!sliderNode) {
      return;
    }
    if (this.settings[PREF_SHOW_ANIMATIONS] === PREF_ENABLED) {
      sliderNode.style.display = '';
    } else {
      sliderNode.style.display = 'none';
    }
  }

  private checkColumnSizesVisisble() {
    const sliderNode = document.getElementById('setting_row_columnSizes');
    const mapSizeSliderNode = document.getElementById(
      'setting_row_singleColumnMapSize'
    );

    if (!(sliderNode && mapSizeSliderNode)) {
      return;
    }
    if (this.settings['twoColumnsLayout'] === PREF_ENABLED) {
      sliderNode.style.display = '';
      mapSizeSliderNode.style.display = 'none';
    } else {
      sliderNode.style.display = 'none';
      mapSizeSliderNode.style.display = '';
    }
  }

  private getMethodName({ id }: { id: string }) {
    return `onChange${this.getSuffix({ id })}Setting`;
  }

  public get({ id }: { id: string }): string | number | null {
    return this.settings[id] || null;
  }

  private getSuffix({ id }: { id: string }) {
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  private getLocalStorageKey({ id }: { id: string }) {
    return `${this.game.framework().game_name}-${this.getSuffix({ id })}`;
  }

  public open() {
    this.modal.show();
  }
}
