import { getDriverImageUrl } from '../imageMap';

describe('imageMap', () => {
    it('returns the correct official url for verstsappen', () => {
        const image = getDriverImageUrl('verstappen');
        expect(typeof image).toBe('string');
        expect(image).toContain('https://media.formula1.com');
    });

    it('returns the correct official url for max_verstappen', () => {
        const image = getDriverImageUrl('max_verstappen');
        expect(typeof image).toBe('string');
        expect(image).toContain('https://media.formula1.com');
    });

    it('returns the default image for unknown driver', () => {
        const image = getDriverImageUrl('unknown_driver');
        expect(image).toContain('Default_pfp.jpg');
    });

    it('returns url string for perez', () => {
        const image = getDriverImageUrl('perez');
        expect(typeof image).toBe('string');
        expect(image).toContain('http');
    });
});
