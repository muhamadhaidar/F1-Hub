import { render } from '@testing-library/react-native';
import React from 'react';
import { Countdown } from '../Countdown';

describe('Countdown', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // Set a stable date: 2026-02-01T12:00:00Z
        jest.setSystemTime(new Date('2026-02-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { toJSON } = render(<Countdown targetDate="2026-03-05T15:00:00Z" />);
        expect(toJSON()).toMatchSnapshot();
    });
});
