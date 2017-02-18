import React from 'react';
import ReactDOM from 'react-dom';
import shallowCompare from 'react-addons-shallow-compare';
import moment from 'moment-jalaali';
import cx from 'classnames';
import Portal from 'react-portal';
import { addEventListener, removeEventListener } from 'consolidated-events';

import OutsideClickHandler from './OutsideClickHandler';
import getResponsiveContainerStyles from '../utils/getResponsiveContainerStyles';

import isInclusivelyAfterDay from '../utils/isInclusivelyAfterDay';

import DateRangePickerInputController from './DateRangePickerInputController';
import DayPickerRangeController from './DayPickerRangeController';

import CloseButton from '../svg/close.svg';

import DateRangePickerShape from '../shapes/DateRangePickerShape';

import {
  START_DATE,
  END_DATE,
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
  ANCHOR_LEFT,
  ANCHOR_RIGHT,
} from '../../constants';

const propTypes = DateRangePickerShape;

const defaultProps = {
  startDateId: START_DATE,
  endDateId: END_DATE,
  focusedInput: null,
  screenReaderInputMessage: '',
  minimumNights: 1,
  isDayBlocked: () => false,
  isDayHighlighted: () => false,
  isOutsideRange: day => !isInclusivelyAfterDay(day, moment()),
  enableOutsideDays: false,
  numberOfMonths: 2,
  showClearDates: false,
  showDefaultInputIcon: false,
  customInputIcon: null,
  customArrowIcon: null,
  disabled: false,
  required: false,
  reopenPickerOnClearDates: false,
  keepOpenOnDateSelect: false,
  initialVisibleMonth: null,
  navPrev: null,
  navNext: null,

  orientation: HORIZONTAL_ORIENTATION,
  anchorDirection: ANCHOR_LEFT,
  horizontalMargin: 0,
  withPortal: false,
  withFullScreenPortal: false,

  onDatesChange() {},
  onFocusChange() {},
  onPrevMonthClick() {},
  onNextMonthClick() {},

  renderDay: null,

  // i18n
  displayFormat: () => moment.localeData().longDateFormat('L'),
  monthFormat: 'jMMMM jYYYY',
  inFarsi: true,
  phrases: {
    closeDatePicker: 'بستن',
    clearDates: 'پاک کردن',
  },
};

export default class DateRangePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dayPickerContainerStyles: {},
    };

    this.onOutsideClick = this.onOutsideClick.bind(this);

    this.responsivizePickerPosition = this.responsivizePickerPosition.bind(this);
  }

  componentDidMount() {
    this.resizeHandle = addEventListener(
      window,
      'resize',
      this.responsivizePickerPosition,
      { passive: true },
    );
    this.responsivizePickerPosition();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.focusedInput && this.props.focusedInput && this.isOpened()) {
      // The date picker just changed from being closed to being open.
      this.responsivizePickerPosition();
    }
  }

  componentWillUnmount() {
    removeEventListener(this.resizeHandle);
  }

  onOutsideClick() {
    const { onFocusChange } = this.props;
    if (!this.isOpened()) return;

    onFocusChange(null);
  }

  getDayPickerContainerClasses() {
    const {
      orientation,
      withPortal,
      withFullScreenPortal,
      anchorDirection,
    } = this.props;
    const dayPickerClassName = cx('DateRangePicker__picker', {
      'DateRangePicker__picker--direction-left': anchorDirection === ANCHOR_LEFT,
      'DateRangePicker__picker--direction-right': anchorDirection === ANCHOR_RIGHT,
      'DateRangePicker__picker--horizontal': orientation === HORIZONTAL_ORIENTATION,
      'DateRangePicker__picker--vertical': orientation === VERTICAL_ORIENTATION,
      'DateRangePicker__picker--portal': withPortal || withFullScreenPortal,
      'DateRangePicker__picker--full-screen-portal': withFullScreenPortal,
    });

    return dayPickerClassName;
  }

  getDayPickerDOMNode() {
    return ReactDOM.findDOMNode(this.dayPicker); // eslint-disable-line react/no-find-dom-node
  }

  isOpened() {
    const { focusedInput } = this.props;
    return focusedInput === START_DATE || focusedInput === END_DATE;
  }

  responsivizePickerPosition() {
    if (!this.isOpened()) {
      return;
    }

    const { anchorDirection, horizontalMargin, withPortal, withFullScreenPortal } = this.props;
    const { dayPickerContainerStyles } = this.state;

    const isAnchoredLeft = anchorDirection === ANCHOR_LEFT;
    if (!withPortal && !withFullScreenPortal) {
      const containerRect = this.dayPickerContainer.getBoundingClientRect();
      const currentOffset = dayPickerContainerStyles[anchorDirection] || 0;
      const containerEdge =
        isAnchoredLeft ? containerRect[ANCHOR_RIGHT] : containerRect[ANCHOR_LEFT];

      this.setState({
        dayPickerContainerStyles: getResponsiveContainerStyles(
          anchorDirection,
          currentOffset,
          containerEdge,
          horizontalMargin,
        ),
      });
    }
  }

  maybeRenderDayPickerWithPortal() {
    const { withPortal, withFullScreenPortal } = this.props;

    if (!this.isOpened()) {
      return null;
    }

    if (withPortal || withFullScreenPortal) {
      return (
        <Portal isOpened>
          {this.renderDayPicker()}
        </Portal>
      );
    }

    return this.renderDayPicker();
  }

  renderDayPicker() {
    const {
      isDayBlocked,
      isDayHighlighted,
      isOutsideRange,
      numberOfMonths,
      orientation,
      monthFormat,
      navPrev,
      navNext,
      onPrevMonthClick,
      onNextMonthClick,
      onDatesChange,
      onFocusChange,
      withPortal,
      withFullScreenPortal,
      enableOutsideDays,
      focusedInput,
      startDate,
      endDate,
      minimumNights,
      keepOpenOnDateSelect,
      renderDay,
      initialVisibleMonth,
    } = this.props;
    const { dayPickerContainerStyles } = this.state;

    const onOutsideClick = (!withFullScreenPortal && withPortal)
      ? this.onOutsideClick
      : undefined;
    const initialVisibleMonthThunk =
      initialVisibleMonth || (() => (startDate || endDate || moment()));

    return (
      <div
        ref={(ref) => { this.dayPickerContainer = ref; }}
        className={this.getDayPickerContainerClasses()}
        style={dayPickerContainerStyles}
      >
        <DayPickerRangeController
          ref={(ref) => { this.dayPicker = ref; }}
          orientation={orientation}
          enableOutsideDays={enableOutsideDays}
          numberOfMonths={numberOfMonths}
          onPrevMonthClick={onPrevMonthClick}
          onNextMonthClick={onNextMonthClick}
          onDatesChange={onDatesChange}
          onFocusChange={onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
          monthFormat={monthFormat}
          withPortal={withPortal || withFullScreenPortal}
          initialVisibleMonth={initialVisibleMonthThunk}
          onOutsideClick={onOutsideClick}
          navPrev={navPrev}
          navNext={navNext}
          minimumNights={minimumNights}
          isOutsideRange={isOutsideRange}
          isDayHighlighted={isDayHighlighted}
          isDayBlocked={isDayBlocked}
          keepOpenOnDateSelect={keepOpenOnDateSelect}
          renderDay={renderDay}
        />

        {withFullScreenPortal &&
          <button
            className="DateRangePicker__close"
            type="button"
            onClick={this.onOutsideClick}
          >
            <span className="screen-reader-only">
              {this.props.phrases.closeDatePicker}
            </span>
            <CloseButton />
          </button>
        }
      </div>
    );
  }

  render() {
    const {
      startDate,
      startDateId,
      startDatePlaceholderText,
      endDate,
      endDateId,
      endDatePlaceholderText,
      focusedInput,
      screenReaderInputMessage,
      showClearDates,
      showDefaultInputIcon,
      customInputIcon,
      customArrowIcon,
      disabled,
      required,
      phrases,
      isOutsideRange,
      withPortal,
      withFullScreenPortal,
      displayFormat,
      reopenPickerOnClearDates,
      keepOpenOnDateSelect,
      onDatesChange,
      onFocusChange,
      renderDay,
    } = this.props;

    const onOutsideClick = (!withPortal && !withFullScreenPortal) ? this.onOutsideClick : undefined;

    return (
      <div className="DateRangePicker">
        <OutsideClickHandler onOutsideClick={onOutsideClick}>
          <DateRangePickerInputController
            startDate={startDate}
            startDateId={startDateId}
            startDatePlaceholderText={startDatePlaceholderText}
            isStartDateFocused={focusedInput === START_DATE}
            endDate={endDate}
            endDateId={endDateId}
            endDatePlaceholderText={endDatePlaceholderText}
            isEndDateFocused={focusedInput === END_DATE}
            displayFormat={displayFormat}
            showClearDates={showClearDates}
            showCaret={!withPortal && !withFullScreenPortal}
            showDefaultInputIcon={showDefaultInputIcon}
            customInputIcon={customInputIcon}
            customArrowIcon={customArrowIcon}
            disabled={disabled}
            required={required}
            reopenPickerOnClearDates={reopenPickerOnClearDates}
            keepOpenOnDateSelect={keepOpenOnDateSelect}
            isOutsideRange={isOutsideRange}
            withFullScreenPortal={withFullScreenPortal}
            onDatesChange={onDatesChange}
            onFocusChange={onFocusChange}
            renderDay={renderDay}
            phrases={phrases}
            screenReaderMessage={screenReaderInputMessage}
          />

          {this.maybeRenderDayPickerWithPortal()}
        </OutsideClickHandler>
      </div>
    );
  }
}

DateRangePicker.propTypes = propTypes;
DateRangePicker.defaultProps = defaultProps;
