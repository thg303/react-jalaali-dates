import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { mount, shallow } from 'enzyme';
import wrap from 'mocha-wrap';

import DayPicker, { calculateDimension } from '../../src/components/DayPicker';
import CalendarMonthGrid from '../../src/components/CalendarMonthGrid';
import DayPickerNavigation from '../../src/components/DayPickerNavigation';
import {
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
} from '../../constants';

describe('DayPicker', () => {
  describe('#render', () => {
    describe('renderWeekHeader', () => {
      it('there are 7 elements on each .DayPicker__week-header class', () => {
        const wrapper = shallow(<DayPicker />);
        const weekHeaders = wrapper.find('.DayPicker__week-header');
        weekHeaders.forEach((weekHeader) => {
          expect(weekHeader.find('li')).to.have.lengthOf(7);
        });
      });

      describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
        it('props.numberOfMonths .DayPicker__week-header elements exists', () => {
          const NUM_OF_MONTHS = 3;
          const wrapper = shallow(
            <DayPicker orientation={HORIZONTAL_ORIENTATION} numberOfMonths={NUM_OF_MONTHS} />,
          );
          expect(wrapper.find('.DayPicker__week-header')).to.have.lengthOf(NUM_OF_MONTHS);
        });
      });

      describe('props.orientation === VERTICAL_ORIENTATION', () => {
        it('1 .DayPicker__week-header element exists', () => {
          const wrapper = shallow(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          expect(wrapper.find('.DayPicker__week-header')).to.have.lengthOf(1);
        });
      });
    });

    describe('transitionContainer', () => {
      it('.transition-container class exists', () => {
        const wrapper = shallow(<DayPicker />);
        expect(wrapper.find('.transition-container')).to.have.lengthOf(1);
      });

      describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
        it('.transition-container--horizontal class exists', () => {
          const wrapper = shallow(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          expect(wrapper.find('.transition-container--horizontal')).to.have.lengthOf(1);
        });
      });

      describe('props.orientation === VERTICAL_ORIENTATION', () => {
        it('.transition-container--vertical class exists', () => {
          const wrapper = shallow(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          expect(wrapper.find('.transition-container--vertical')).to.have.lengthOf(1);
        });
      });
    });

    describe('CalendarMonthGrid', () => {
      it('component exists', () => {
        const wrapper = shallow(<DayPicker />);
        expect(wrapper.find(CalendarMonthGrid)).to.have.lengthOf(1);
      });

      describe('prop.isAnimating', () => {
        beforeEach(() => {
          sinon.stub(DayPicker.prototype, 'adjustDayPickerHeight');
          sinon.stub(DayPicker.prototype, 'updateStateAfterMonthTransition');
        });

        afterEach(() => {
          sinon.restore();
        });

        it('is true if state.monthTransition is truthy', () => {
          const wrapper = shallow(<DayPicker />);
          wrapper.setState({ monthTransition: 'foo' });
          const CalendarMonthGridComponent = wrapper.find(CalendarMonthGrid);
          expect(CalendarMonthGridComponent.prop('isAnimating')).to.equal(true);
        });

        it('is false if state.monthTransition is falsey', () => {
          const wrapper = shallow(<DayPicker />);
          wrapper.setState({ monthTransition: null });
          const CalendarMonthGridComponent = wrapper.find(CalendarMonthGrid);
          expect(CalendarMonthGridComponent.prop('isAnimating')).to.equal(false);
        });
      });
    });
  });

  describe('#isHorizontal', () => {
    it('returns true if props.orientation === HORIZONTAL_ORIENTATION', () => {
      const wrapper = shallow(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
      expect(wrapper.instance().isHorizontal()).to.equal(true);
    });

    it('returns false if props.orientation === VERTICAL_ORIENTATION', () => {
      const wrapper = shallow(<DayPicker orientation={VERTICAL_ORIENTATION} />);
      expect(wrapper.instance().isHorizontal()).to.equal(false);
    });
  });

  describe('#isVertical', () => {
    it('returns true if props.orientation === VERTICAL_ORIENTATION', () => {
      const wrapper = shallow(<DayPicker orientation={VERTICAL_ORIENTATION} />);
      expect(wrapper.instance().isVertical()).to.equal(true);
    });

    it('returns false if props.orientation === HORIZONTAL_ORIENTATION', () => {
      const wrapper = shallow(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
      expect(wrapper.instance().isVertical()).to.equal(false);
    });
  });

  describe('props.orientation === VERTICAL_SCROLLABLE', () => {
    it('uses multiplyScrollableMonths instead of onNextMonthClick', () => {
      const wrapper = shallow(<DayPicker orientation={VERTICAL_SCROLLABLE} />);
      const nav = wrapper.find(DayPickerNavigation);
      expect(nav.prop('onNextMonthClick')).to.equal(wrapper.instance().multiplyScrollableMonths);
    });
  });

  describe('#onPrevMonthClick', () => {
    let translateFirstDayPickerForAnimationSpy;
    beforeEach(() => {
      translateFirstDayPickerForAnimationSpy =
        sinon.stub(DayPicker.prototype, 'translateFirstDayPickerForAnimation');
      sinon.stub(DayPicker.prototype, 'adjustDayPickerHeight');
      sinon.stub(DayPicker.prototype, 'updateStateAfterMonthTransition');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('calls props.onPrevMonthClick', () => {
      const onPrevMonthClickSpy = sinon.stub();
      const wrapper = shallow(<DayPicker onPrevMonthClick={onPrevMonthClickSpy} />);
      wrapper.instance().onPrevMonthClick();
      expect(onPrevMonthClickSpy).to.have.property('callCount', 1);
    });

    it('calls translateFirstDayPickerForAnimation', () => {
      const wrapper = shallow(<DayPicker />);
      wrapper.instance().onPrevMonthClick();
      expect(translateFirstDayPickerForAnimationSpy).to.have.property('callCount', 1);
    });

    it('sets state.monthTransition to "prev"', () => {
      const wrapper = shallow(<DayPicker />);
      wrapper.instance().onPrevMonthClick();
      expect(wrapper.state().monthTransition).to.equal('prev');
    });
  });

  describe('#onNextMonthClick', () => {
    beforeEach(() => {
      sinon.stub(DayPicker.prototype, 'adjustDayPickerHeight');
      sinon.stub(DayPicker.prototype, 'updateStateAfterMonthTransition');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('calls props.onNextMonthClick', () => {
      const onNextMonthClickSpy = sinon.stub();
      const wrapper = shallow(<DayPicker onNextMonthClick={onNextMonthClickSpy} />);
      wrapper.instance().onNextMonthClick();
      expect(onNextMonthClickSpy).to.have.property('callCount', 1);
    });

    it('sets state.monthTransition to "next"', () => {
      const wrapper = shallow(<DayPicker />);
      wrapper.instance().onNextMonthClick();
      expect(wrapper.state().monthTransition).to.equal('next');
    });
  });

  describe('#multiplyScrollableMonths', () => {
    it('increments scrollableMonthMultiple', () => {
      const wrapper = shallow(<DayPicker />);
      wrapper.instance().multiplyScrollableMonths();
      expect(wrapper.state().scrollableMonthMultiple).to.equal(2);
    });
  });

  const windowWrap = wrap().withGlobal('window', () => ({ getComputedStyle() { return {}; } }));
  const maybeWindowWrap = typeof window === 'undefined' ? windowWrap : global;
  maybeWindowWrap.describe('#initializeDayPickerWidth()', () => {
    beforeEach(() => {
      sinon.stub(ReactDOM, 'findDOMNode').returns({ querySelector() {} });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('executes', () => {
      const wrapper = shallow(<DayPicker />);
      wrapper.instance().initializeDayPickerWidth();
    });
  });

  describe.skip('life cycle methods', () => {
    let adjustDayPickerHeightSpy;
    let initializeDayPickerWidthSpy;
    beforeEach(() => {
      adjustDayPickerHeightSpy = sinon.stub(DayPicker.prototype, 'adjustDayPickerHeight');
      initializeDayPickerWidthSpy = sinon.stub(DayPicker.prototype, 'initializeDayPickerWidth');
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('#componentDidMount', () => {
      describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
        it('calls adjustDayPickerHeight', () => {
          mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          expect(adjustDayPickerHeightSpy).to.have.property('callCount', 1);
        });

        it('calls initializeDayPickerWidth', () => {
          mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          expect(initializeDayPickerWidthSpy).to.have.property('callCount', 1);
        });
      });

      describe('props.orientation === VERTICAL_ORIENTATION', () => {
        it('does not call adjustDayPickerHeight', () => {
          mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          expect(adjustDayPickerHeightSpy.called).to.equal(false);
        });

        it('does not call initializeDayPickerWidth', () => {
          mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          expect(initializeDayPickerWidthSpy.called).to.equal(false);
        });
      });
    });

    describe('#componentDidUpdate', () => {
      let updateStateAfterMonthTransitionSpy;
      beforeEach(() => {
        updateStateAfterMonthTransitionSpy = sinon.stub(
          DayPicker.prototype,
          'updateStateAfterMonthTransition',
        );
      });

      describe('props.orientation === HORIZONTAL_ORIENTATION', () => {
        it('calls adjustDayPickerHeight if state.monthTransition is truthy', () => {
          const wrapper = mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: 'foo',
          });
          expect(adjustDayPickerHeightSpy).to.have.property('callCount', 2);
        });

        it('does not call adjustDayPickerHeight if state.monthTransition is falsey', () => {
          const wrapper = mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: null,
          });
          expect(adjustDayPickerHeightSpy.calledTwice).to.equal(false);
        });

        it('calls updateStateAfterMonthTransition if state.monthTransition is truthy', () => {
          const wrapper = mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: 'foo',
          });
          expect(updateStateAfterMonthTransitionSpy).to.have.property('callCount', 1);
        });

        it('does not call updateStateAfterMonthTransition if state.monthTransition is falsey', () => {
          const wrapper = mount(<DayPicker orientation={HORIZONTAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: null,
          });
          expect(updateStateAfterMonthTransitionSpy.calledOnce).to.equal(false);
        });
      });

      describe('props.orientation === VERTICAL_ORIENTATION', () => {
        it('does not call adjustDayPickerHeight if state.monthTransition is truthy', () => {
          const wrapper = mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: 'foo',
          });
          expect(adjustDayPickerHeightSpy.called).to.equal(false);
        });

        it('does not call adjustDayPickerHeight if state.monthTransition is falsey', () => {
          const wrapper = mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: null,
          });
          expect(adjustDayPickerHeightSpy.called).to.equal(false);
        });

        it('calls updateStateAfterMonthTransition if state.monthTransition is truthy', () => {
          const wrapper = mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: 'foo',
          });
          expect(updateStateAfterMonthTransitionSpy).to.have.property('callCount', 1);
        });

        it('does not call updateStateAfterMonthTransition if state.monthTransition is falsey', () => {
          const wrapper = mount(<DayPicker orientation={VERTICAL_ORIENTATION} />);
          wrapper.setState({
            monthTransition: null,
          });
          expect(updateStateAfterMonthTransitionSpy.calledOnce).to.equal(false);
        });
      });
    });
  });

  /* Requires a DOM */
  describe.skip('calculateDimension()', () => {
    let testElement = null;

    beforeEach(() => {
      testElement = document.createElement('div');

      testElement.style.width = '100px';
      testElement.style.height = '250px';
      testElement.style.padding = '15px 10px';
      testElement.style.border = '1px solid red';
      testElement.style.margin = '3px 6px 5px 2px';
      testElement.boxSizing = 'border-box';
    });

    it('returns 0 for an empty element', () => {
      expect(calculateDimension(null, 'width')).to.equal(0);
    });

    it('calculates border-box height', () => {
      expect(calculateDimension(testElement, 'height', true)).to.equal(282);
    });

    it('calculates border-box height with margin', () => {
      expect(calculateDimension(testElement, 'height', true, true)).to.equal(290);
    });

    it('calculates border-box width', () => {
      expect(calculateDimension(testElement, 'width', true)).to.equal(122);
    });

    it('calculates border-box width with margin', () => {
      expect(calculateDimension(testElement, 'width', true, true)).to.equal(130);
    });

    it('calculates content-box height', () => {
      expect(calculateDimension(testElement, 'height')).to.equal(250);
    });

    it('calculates content-box height with margin', () => {
      expect(calculateDimension(testElement, 'height', false, true)).to.equal(258);
    });

    it('calculates content-box width', () => {
      expect(calculateDimension(testElement, 'width')).to.equal(100);
    });

    it('calculates content-box width with margin', () => {
      expect(calculateDimension(testElement, 'width', false, true)).to.equal(108);
    });
  });
});
