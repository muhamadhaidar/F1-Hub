import { DRIVER_IMAGES, getDriverImageUrl } from '../imageMap';

describe('imageMap', () => {
    it('returns the correct local asset for verstsappen', () => {
        const image = getDriverImageUrl('verstappen');
        expect(image).toBe(DRIVER_IMAGES['verstappen']);
    });

    it('returns the correct local asset for max_verstappen', () => {
        const image = getDriverImageUrl('max_verstappen');
        expect(image).toBe(DRIVER_IMAGES['max_verstappen']);
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
