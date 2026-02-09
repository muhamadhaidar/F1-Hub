import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mocked instance for api
const mockedApiInstance = {
    get: jest.fn(),
};
(axios.create as jest.Mock).mockReturnValue(mockedApiInstance);

// Import after mock
const { f1Api, getRaceImage } = require('../api');

describe('F1 API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRaceImage', () => {
        it('returns correct image URL for known countries', () => {
            const url = getRaceImage('Australia');
            expect(url).toContain('Australia');
        });

        it('returns default image URL (Abu Dhabi) for unknown countries', () => {
            const url = getRaceImage('Atlantis');
            expect(url).toContain('Abu%20Dhabi');
        });

        it('handles USA mapping to Miami', () => {
            const url = getRaceImage('USA');
            expect(url).toContain('Miami');
        });
    });

    describe('f1Api.getNextRace', () => {
        it('successfully fetches and transforms next race data', async () => {
            const mockApiData = {
                data: {
                    MRData: {
                        RaceTable: {
                            Races: [{
                                round: '1',
                                raceName: 'Mock GP',
                                Circuit: {
                                    circuitName: 'Mock Circuit',
                                    Location: {
                                        locality: 'Mock City',
                                        country: 'Mock Country'
                                    }
                                },
                                date: '2025-03-01',
                                time: '10:00:00Z'
                            }]
                        }
                    }
                }
            };

            mockedApiInstance.get.mockResolvedValueOnce(mockApiData);

            const result = await f1Api.getNextRace();

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Mock GP');
            expect(result?.round).toBe(1);
            expect(result?.circuit.country).toBe('Mock Country');
        });

        it('returns null if no race data is found', async () => {
            const mockEmptyData = {
                data: {
                    MRData: {
                        RaceTable: {
                            Races: []
                        }
                    }
                }
            };
            mockedApiInstance.get.mockResolvedValueOnce(mockEmptyData);

            const result = await f1Api.getNextRace();
            expect(result).toBeNull();
        });

        it('returns null on API error', async () => {
            mockedApiInstance.get.mockRejectedValueOnce(new Error('API Failure'));
            const result = await f1Api.getNextRace();
            expect(result).toBeNull();
        });
    });

    describe('f1Api.getDriverStandings', () => {
        it('fetches and limits driver standings', async () => {
            const mockStandingsData = {
                data: {
                    MRData: {
                        StandingsTable: {
                            StandingsLists: [{
                                DriverStandings: [
                                    {
                                        position: '1',
                                        points: '25',
                                        Driver: { givenName: 'Max', familyName: 'Verstappen', driverId: 'max_v' },
                                        Constructors: [{ name: 'Red Bull', constructorId: 'red_bull' }]
                                    },
                                    {
                                        position: '2',
                                        points: '18',
                                        Driver: { givenName: 'Lando', familyName: 'Norris', driverId: 'norris' },
                                        Constructors: [{ name: 'McLaren', constructorId: 'mclaren' }]
                                    }
                                ]
                            }]
                        }
                    }
                }
            };

            mockedApiInstance.get.mockResolvedValueOnce(mockStandingsData);

            const result = await f1Api.getDriverStandings('current', 1);

            expect(result).toHaveLength(1);
            expect(result[0].driver).toBe('M. Verstappen');
            expect(result[0].points).toBe('25');
        });
    });
});
