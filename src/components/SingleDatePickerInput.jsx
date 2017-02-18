import React, { PropTypes } from 'react';
import { forbidExtraProps } from 'airbnb-prop-types';
import cx from 'classnames';

import DateInput from './DateInput';
import CloseButton from '../svg/close.svg';

const propTypes = forbidExtraProps({
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string, // also used as label
  displayValue: PropTypes.string,
  inputValue: PropTypes.string,
  screenReaderMessage: PropTypes.string,
  focused: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  showCaret: PropTypes.bool,
  showClearDate: PropTypes.bool,

  onChange: PropTypes.func,
  onClearDate: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDownShiftTab: PropTypes.func,
  onKeyDownTab: PropTypes.func,

  // i18n
  phrases: PropTypes.shape({
    clearDate: PropTypes.node,
  }),
});

const defaultProps = {
  placeholder: 'Select Date',
  displayValue: '',
  inputValue: '',
  screenReaderMessage: '',
  focused: false,
  disabled: false,
  required: false,
  showCaret: false,
  showClearDate: false,

  onChange() {},
  onClearDate() {},
  onFocus() {},
  onKeyDownShiftTab() {},
  onKeyDownTab() {},

  // i18n
  phrases: {
    clearDate: 'Clear Date',
  },
};

export default class SingleDatePickerInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isClearDateHovered: false,
    };

    this.onClearDateMouseEnter = this.onClearDateMouseEnter.bind(this);
    this.onClearDateMouseLeave = this.onClearDateMouseLeave.bind(this);
  }

  onClearDateMouseEnter() {
    this.setState({
      isClearDateHovered: true,
    });
  }

  onClearDateMouseLeave() {
    this.setState({
      isClearDateHovered: false,
    });
  }

  render() {
    const { isClearDateHovered } = this.state;
    const {
      id,
      placeholder,
      displayValue,
      inputValue,
      focused,
      disabled,
      required,
      showCaret,
      showClearDate,
      phrases,
      onClearDate,
      onChange,
      onFocus,
      onKeyDownShiftTab,
      onKeyDownTab,
      screenReaderMessage,
    } = this.props;

    return (
      <div className="SingleDatePickerInput">
        <DateInput
          id={id}
          placeholder={placeholder} // also used as label
          displayValue={displayValue}
          inputValue={inputValue}
          screenReaderMessage={screenReaderMessage}
          focused={focused}
          disabled={disabled}
          required={required}
          showCaret={showCaret}

          onChange={onChange}
          onFocus={onFocus}
          onKeyDownShiftTab={onKeyDownShiftTab}
          onKeyDownTab={onKeyDownTab}
        />

        {showClearDate &&
          <button
            type="button"
            className={cx('SingleDatePickerInput__clear-date', {
              'SingleDatePickerInput__clear-date--hide': !displayValue,
              'SingleDatePickerInput__clear-date--hover': isClearDateHovered,
            })}
            onMouseEnter={this.onClearDateMouseEnter}
            onMouseLeave={this.onClearDateMouseLeave}
            onClick={onClearDate}
          >
            <span className="screen-reader-only">
              {phrases.clearDate}
            </span>
            <CloseButton />
          </button>
        }
      </div>
    );
  }
}

SingleDatePickerInput.propTypes = propTypes;
SingleDatePickerInput.defaultProps = defaultProps;
