import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon-sandbox';

import SingleDatePickerInput from '../../src/components/SingleDatePickerInput';

describe('SingleDatePickerInput', () => {
  describe('#render', () => {
    it('is .SingleDatePickerInput class', () => {
      const wrapper = shallow(<SingleDatePickerInput id="date" />);
      expect(wrapper.is('.SingleDatePickerInput')).to.equal(true);
    });
  });

  describe('clear date', () => {
    describe('props.showClearDate is falsey', () => {
      it('does not have .SingleDatePickerInput__clear-date class', () => {
        const wrapper = shallow(<SingleDatePickerInput showClearDate={false} />);
        expect(wrapper.find('.SingleDatePickerInput__clear-date')).to.have.lengthOf(0);
      });
    });

    describe('props.showClearDate is truthy', () => {
      it('has .SingleDatePickerInput__clear-date class', () => {
        const wrapper = shallow(<SingleDatePickerInput showClearDate />);
        expect(wrapper.find('.SingleDatePickerInput__clear-date')).to.have.lengthOf(1);
      });

      it('has .SingleDatePickerInput__clear-date--hover class if state.isClearDateHovered',
        () => {
          const wrapper = shallow(<SingleDatePickerInput showClearDate />);
          wrapper.setState({ isClearDateHovered: true });
          expect(wrapper.find('.SingleDatePickerInput__clear-date--hover')).to.have.lengthOf(1);
        });

      it('no .SingleDatePickerInput__clear-date--hover class if !state.isClearDateHovered',
        () => {
          const wrapper = shallow(<SingleDatePickerInput showClearDate />);
          wrapper.setState({ isClearDateHovered: false });
          expect(wrapper.find('.SingleDatePickerInput__clear-date--hover')).to.have.lengthOf(0);
        });

      it('has .SingleDatePickerInput__clear-date--hide class if there is no date',
        () => {
          const wrapper = shallow(<SingleDatePickerInput showClearDate displayValue={null} />);
          expect(wrapper.find('.SingleDatePickerInput__clear-date--hide')).to.have.lengthOf(1);
        });

      it('does not have .SingleDatePickerInput__clear-date--hide class if there is a date',
        () => {
          const wrapper =
            shallow(<SingleDatePickerInput showClearDate displayValue="2016-07-13" />);
          expect(wrapper.find('.SingleDatePickerInput__clear-date--hide')).to.have.lengthOf(0);
        });
    });
  });

  describe('#onClearDateMouseEnter', () => {
    it('sets state.isClearDateHovered to true', () => {
      const wrapper = shallow(<SingleDatePickerInput />);
      wrapper.setState({ isClearDateHovered: false });
      wrapper.instance().onClearDateMouseEnter();
      expect(wrapper.state().isClearDateHovered).to.equal(true);
    });
  });

  describe('#onClearDateMouseLeave', () => {
    it('sets state.isClearDateHovered to false', () => {
      const wrapper = shallow(<SingleDatePickerInput />);
      wrapper.setState({ isClearDateHovered: true });
      wrapper.instance().onClearDateMouseLeave();
      expect(wrapper.state().isClearDateHovered).to.equal(false);
    });
  });

  describe('clear date interactions', () => {
    describe('onClick', () => {
      it('props.onClearDate gets triggered', () => {
        const onClearDateSpy = sinon.spy();
        const wrapper = shallow(
          <SingleDatePickerInput
            onClearDate={onClearDateSpy}
            showClearDate
          />,
        );
        const clearDateWrapper = wrapper.find('.SingleDatePickerInput__clear-date');
        clearDateWrapper.simulate('click');
        expect(onClearDateSpy.called).to.equal(true);
      });
    });

    describe('onMouseEnter', () => {
      it('onClearDateMouseEnter gets triggered', () => {
        const onClearDateMouseEnterSpy = sinon.spy(
          SingleDatePickerInput.prototype,
          'onClearDateMouseEnter',
        );
        const wrapper = shallow(<SingleDatePickerInput showClearDate />);
        const clearDateWrapper = wrapper.find('.SingleDatePickerInput__clear-date');

        clearDateWrapper.simulate('mouseEnter');

        expect(onClearDateMouseEnterSpy.called).to.equal(true);
      });
    });

    describe('onMouseLeave', () => {
      it('onClearDateMouseLeave gets triggered', () => {
        const onClearDateMouseLeaveSpy = sinon.spy(
          SingleDatePickerInput.prototype,
          'onClearDateMouseLeave',
        );
        const wrapper = shallow(<SingleDatePickerInput showClearDate />);
        const clearDateWrapper = wrapper.find('.SingleDatePickerInput__clear-date');

        clearDateWrapper.simulate('mouseLeave');

        expect(onClearDateMouseLeaveSpy.called).to.equal(true);
      });
    });
  });
});
