import { F1Race } from '@/types/f1';
import axios from 'axios';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Helper to transform API race object to our F1Race interface
const transformRaceData = (race: any): F1Race => {
    // Construct simplified session times (Ergast/Jolpica structure varies slightly)
    const gpTime = race.time ? `${race.date}T${race.time}` : `${race.date}T00:00:00Z`;

    return {
        id: race.round, // Use round as ID for now, or race.season + race.round
        round: parseInt(race.round),
        name: race.raceName,
        circuit: {
            name: race.Circuit.circuitName,
            city: race.Circuit.Location.locality,
            country: race.Circuit.Location.country,
            // Images would need to be mapped manually or fetched from another source
        },
        date: race.date,
        time: race.time || '00:00:00Z',
        sessions: {
            gp: gpTime,
            // Jolpica/Ergast provides FirstPractice, SecondPractice etc.
            fp1: race.FirstPractice ? `${race.FirstPractice.date}T${race.FirstPractice.time}` : undefined,
            fp2: race.SecondPractice ? `${race.SecondPractice.date}T${race.SecondPractice.time}` : undefined,
            fp3: race.ThirdPractice ? `${race.ThirdPractice.date}T${race.ThirdPractice.time}` : undefined,
            qualifying: race.Qualifying ? `${race.Qualifying.date}T${race.Qualifying.time}` : undefined,
            sprint: race.Sprint ? `${race.Sprint.date}T${race.Sprint.time}` : undefined,
        }
    };
};

// Helper to get race image based on country
export const getRaceImage = (country: string): string => {
    const countryMap: { [key: string]: string } = {
        'Bahrain': 'Bahrain',
        'Saudi Arabia': 'Saudi%20Arabia',
        'Australia': 'Australia',
        'Japan': 'Japan',
        'China': 'China',
        'USA': 'Miami', // Miami GP
        'United States': 'USA', // Austin (often separate)
        'Italy': 'Italy', // Imola/Monza
        'Monaco': 'Monaco',
        'Canada': 'Canada',
        'Spain': 'Spain',
        'Austria': 'Austria',
        'UK': 'Great%20Britain',
        'Great Britain': 'Great%20Britain',
        'Hungary': 'Hungary',
        'Belgium': 'Belgium',
        'Netherlands': 'Netherlands',
        'Azerbaijan': 'Azerbaijan',
        'Singapore': 'Singapore',
        'Mexico': 'Mexico',
        'Brazil': 'Brazil',
        'Qatar': 'Qatar',
        'UAE': 'Abu%20Dhabi',
    };

    const key = countryMap[country] || 'Abu%20Dhabi'; // Default to something cool if missing
    return `https://media.formula1.com/image/upload/f_auto,c_limit,w_1440,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/${key}`;
};

export const f1Api = {
    getNextRace: async (): Promise<F1Race | null> => {
        try {
            const response = await api.get('/current/next.json');
            const raceData = response.data.MRData.RaceTable.Races[0];
            if (!raceData) return null;
            return transformRaceData(raceData);
        } catch (error) {
            console.error('Error fetching next race:', error);
            return null;
        }
    },

    getSeasonSchedule: async (year: string = 'current'): Promise<F1Race[]> => {
        try {
            const response = await api.get(`/${year}.json`);
            const races = response.data.MRData.RaceTable.Races;
            return races.map(transformRaceData);
        } catch (error) {
            console.error('Error fetching season schedule:', error);
            return [];
        }
    },

    getLastRaceResults: async (year: string = 'current'): Promise<{ raceName: string, date: string, results: any[] } | null> => {
        try {
            const response = await api.get(`/${year}/last/results.json`);
            const raceData = response.data.MRData.RaceTable.Races[0];

            if (!raceData) return null;

            const results = raceData.Results.slice(0, 3).map((result: any) => ({
                pos: parseInt(result.position),
                driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
                team: result.Constructor.name,
                time: result.Time ? result.Time.time : (result.status !== 'Finished' ? result.status : '+Gap'),
                pts: result.points
            }));

            return {
                raceName: raceData.raceName,
                date: raceData.date,
                results
            };
        } catch (error) {
            console.error('Error fetching race results:', error);
            return null;
        }
    },

    getRaceResults: async (year: string, round: string): Promise<any[]> => {
        try {
            const response = await api.get(`/${year}/${round}/results.json`);
            const raceData = response.data.MRData.RaceTable.Races[0];

            if (!raceData) return [];

            return raceData.Results.map((result: any) => ({
                pos: parseInt(result.position),
                driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
                team: result.Constructor.name,
                time: result.Time ? result.Time.time : (result.status !== 'Finished' ? result.status : '+Gap'),
                pts: result.points
            }));
        } catch (error) {
            console.error('Error fetching specific race results:', error);
            return [];
        }
    },

    getDriverStandings: async (year: string = 'current', limit: number = 3): Promise<any[]> => {
        try {
            const response = await api.get(`/${year}/driverStandings.json`);
            const standingsList = response.data.MRData.StandingsTable.StandingsLists[0];

            if (!standingsList) return [];

            const standings = standingsList.DriverStandings;

            const sliceLimit = limit === 0 ? standings.length : limit;
            return standings.slice(0, sliceLimit).map((driver: any) => ({
                position: driver.position,
                driver: `${driver.Driver.givenName.charAt(0)}. ${driver.Driver.familyName}`,
                driverId: driver.Driver.driverId,
                team: driver.Constructors[0].name,
                teamId: driver.Constructors[0].constructorId, // Assuming api returns this
                points: driver.points
            }));
        } catch (error) {
            console.error('Error fetching driver standings:', error);
            return [];
        }
    },

    getConstructorStandings: async (year: string = 'current', limit: number = 3): Promise<any[]> => {
        try {
            const response = await api.get(`/${year}/constructorStandings.json`);
            const standingsList = response.data.MRData.StandingsTable.StandingsLists[0];

            if (!standingsList) return [];

            const standings = standingsList.ConstructorStandings;

            const sliceLimit = limit === 0 ? standings.length : limit;
            return standings.slice(0, sliceLimit).map((team: any) => ({
                position: team.position,
                team: team.Constructor.name,
                teamId: team.Constructor.constructorId,
                points: team.points,
                wins: team.wins
            }));
        } catch (error) {
            console.error('Error fetching constructor standings:', error);
            console.error(error)
            return [];
        }
    }
};
