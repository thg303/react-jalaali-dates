import React, { PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment-jalaali';
import cx from 'classnames';
import { addEventListener, removeEventListener } from 'consolidated-events';

import CalendarMonth from './CalendarMonth';

import isTransitionEndSupported from '../utils/isTransitionEndSupported';
import getTransformStyles from '../utils/getTransformStyles';

import ScrollableOrientationShape from '../shapes/ScrollableOrientationShape';

import {
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
} from '../../constants';

const propTypes = {
  enableOutsideDays: PropTypes.bool,
  firstVisibleMonthIndex: PropTypes.number,
  initialMonth: momentPropTypes.momentObj,
  isAnimating: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  modifiers: PropTypes.object,
  orientation: ScrollableOrientationShape,
  onDayClick: PropTypes.func,
  onDayMouseEnter: PropTypes.func,
  onDayMouseLeave: PropTypes.func,
  onMonthTransitionEnd: PropTypes.func,
  renderDay: PropTypes.func,
  transformValue: PropTypes.string,

  // i18n
  monthFormat: PropTypes.string,
  inFarsi: PropTypes.bool,
};

const defaultProps = {
  enableOutsideDays: false,
  firstVisibleMonthIndex: 0,
  initialMonth: moment(),
  isAnimating: false,
  numberOfMonths: 1,
  modifiers: {},
  orientation: HORIZONTAL_ORIENTATION,
  onDayClick() {},
  onDayMouseEnter() {},
  onDayMouseLeave() {},
  onMonthTransitionEnd() {},
  renderDay: null,
  transformValue: 'none',

  // i18n
  monthFormat: 'MMMM YYYY', // english locale
  inFarsi: true,
};

function getMonths(initialMonth, numberOfMonths) {
  let month = initialMonth.clone().subtract(1, 'month');

  const months = [];
  for (let i = 0; i < numberOfMonths + 2; i += 1) {
    months.push(month);
    month = month.clone().add(1, 'month');
  }

  return months;
}

export default class CalendarMonthGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      months: getMonths(props.initialMonth, props.numberOfMonths),
    };

    this.isTransitionEndSupported = isTransitionEndSupported();
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
  }

  componentDidMount() {
    this.eventHandle = addEventListener(
      this.container,
      'transitionend',
      this.onTransitionEnd,
    );
  }

  componentWillReceiveProps(nextProps) {
    const { initialMonth, numberOfMonths } = nextProps;
    const { months } = this.state;

    const hasMonthChanged = !this.props.initialMonth.isSame(initialMonth, 'month');
    const hasNumberOfMonthsChanged = this.props.numberOfMonths !== numberOfMonths;
    let newMonths = months;

    if (hasMonthChanged && !hasNumberOfMonthsChanged) {
      if (initialMonth.isAfter(this.props.initialMonth)) {
        newMonths = months.slice(1);
        newMonths.push(months[months.length - 1].clone().add(1, 'month'));
      } else {
        newMonths = months.slice(0, months.length - 1);
        newMonths.unshift(months[0].clone().subtract(1, 'month'));
      }
    }

    if (hasNumberOfMonthsChanged) {
      newMonths = getMonths(initialMonth, numberOfMonths);
    }

    this.setState({
      months: newMonths,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentDidUpdate() {
    const { isAnimating, onMonthTransitionEnd } = this.props;

    // For IE9, immediately call onMonthTransitionEnd instead of
    // waiting for the animation to complete
    if (!this.isTransitionEndSupported && isAnimating) {
      onMonthTransitionEnd();
    }
  }

  componentWillUnmount() {
    removeEventListener(this.eventHandle);
  }

  onTransitionEnd() {
    this.props.onMonthTransitionEnd();
  }

  render() {
    const {
      enableOutsideDays,
      firstVisibleMonthIndex,
      isAnimating,
      modifiers,
      numberOfMonths,
      monthFormat,
      orientation,
      transformValue,
      onDayMouseEnter,
      onDayMouseLeave,
      onDayClick,
      renderDay,
      onMonthTransitionEnd,
      inFarsi,
    } = this.props;


    const { months } = this.state;

    const className = cx('CalendarMonthGrid', {
      'CalendarMonthGrid--horizontal': orientation === HORIZONTAL_ORIENTATION,
      'CalendarMonthGrid--vertical': orientation === VERTICAL_ORIENTATION,
      'CalendarMonthGrid--vertical-scrollable': orientation === VERTICAL_SCROLLABLE,
      'CalendarMonthGrid--animating': isAnimating,
    });

    return (
      <div
        ref={(ref) => { this.container = ref; }}
        className={className}
        style={{ ...getTransformStyles(transformValue), direction: inFarsi ? 'rtl' : 'ltr' }}
        onTransitionEnd={onMonthTransitionEnd}
      >
        {months.map((month, i) => {
          const isVisible =
            (i >= firstVisibleMonthIndex) && (i < firstVisibleMonthIndex + numberOfMonths);
          return (
            <CalendarMonth
              key={month.format('YYYY-MM')}
              month={month}
              isVisible={isVisible}
              enableOutsideDays={enableOutsideDays}
              modifiers={modifiers}
              monthFormat={monthFormat}
              orientation={orientation}
              onDayMouseEnter={onDayMouseEnter}
              onDayMouseLeave={onDayMouseLeave}
              onDayClick={onDayClick}
              renderDay={renderDay}
            />
          );
        })}
      </div>
    );
  }
}

CalendarMonthGrid.propTypes = propTypes;
CalendarMonthGrid.defaultProps = defaultProps;
