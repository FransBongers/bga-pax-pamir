interface PlayerPreferenceOption {
  label: string;
  value: string;
  backgroundColor?: string;
  textColor?: string;
}

interface PlayerPreferenceConfigBase {
  id: string;
  onChangeInSetup: boolean;
  label: string;
  visibleCondition?: {
    id: string;
    values: (string | number)[];
  };
}

interface PlayerPreferenceSelectConfig extends PlayerPreferenceConfigBase {
  defaultValue: string;
  options: PlayerPreferenceOption[];
  type: 'select';
}

interface PlayerPreferenceSliderConfig extends PlayerPreferenceConfigBase {
  defaultValue: number;
  sliderConfig: {
    step: number;
    padding: number;
    range: {
      min: number;
      max: number;
    };
  };
  type: 'slider';
}

type PlayerPreferenceConfig =
  | PlayerPreferenceSelectConfig
  | PlayerPreferenceSliderConfig;

interface PlayerPreferenceTab {
  id: string;
  config: Record<string, PlayerPreferenceConfig>;
}

const getSettingsConfig = (): Record<string, PlayerPreferenceTab> => ({
  layout: {
    id: 'layout',
    config: {
      [PREF_TWO_COLUMNS_LAYOUT]: {
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
      columnSizes: {
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
      [PREF_SINGLE_COLUMN_MAP_SIZE]: {
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
      [PREF_CARD_SIZE_IN_LOG]: {
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
      [PREF_CARD_SIZE_IN_COURT]: {
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
      // [PREF_CARD_INFO_IN_TOOLTIP]: {
      //   id: PREF_CARD_INFO_IN_TOOLTIP,
      //   onChangeInSetup: false,
      //   defaultValue: PREF_DISABLED,
      //   label: _('Show card info in tooltip'),
      //   type: 'select',
      //   options: [
      //     {
      //       label: _('Enabled'),
      //       value: PREF_ENABLED,
      //     },
      //     {
      //       label: _('Disabled (card image only)'),
      //       value: PREF_DISABLED,
      //     },
      //   ],
      // },
    },
  },
  gameplay: {
    id: 'gameplay',
    config: {
      // [PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY]: {
      //   id: PREF_CONFIRM_END_OF_TURN_AND_PLAYER_SWITCH_ONLY,
      //   onChangeInSetup: false,
      //   defaultValue: PREF_DISABLED,
      //   label: _('Confirm end of turn and player switch only'),
      //   type: 'select',
      //   options: [
      //     {
      //       label: _('Enabled'),
      //       value: PREF_ENABLED,
      //     },
      //     {
      //       label: _('Disabled (confirm every move)'),
      //       value: PREF_DISABLED,
      //     },
      //   ],
      // },
      [PREF_SHOW_ANIMATIONS]: {
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
      [PREF_ANIMATION_SPEED]: {
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
      [PREF_SHOW_UNDO_LOGS]: {
        id: PREF_SHOW_UNDO_LOGS,
        onChangeInSetup: false,
        defaultValue: PREF_DISABLED,
        label: _('Show undone logs'),
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
    },
  },
});
