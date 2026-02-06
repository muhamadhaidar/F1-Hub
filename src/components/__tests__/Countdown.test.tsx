import renderer from 'react-test-renderer';
import { Countdown } from '../Countdown';

describe('Countdown', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<Countdown targetDate="2026-03-05T15:00:00Z" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
