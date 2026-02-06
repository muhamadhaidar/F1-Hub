import { F1Race } from '@/types/f1';

export const MOCK_RACES: F1Race[] = [
    {
        id: '1',
        round: 1,
        name: 'Bahrain Grand Prix',
        circuit: { name: 'Bahrain International Circuit', city: 'Sakhir', country: 'Bahrain' },
        date: '2026-03-05T15:00:00Z',
        time: '15:00:00Z',
        sessions: { gp: '2026-03-05T15:00:00Z' }
    },
    {
        id: '2',
        round: 2,
        name: 'Saudi Arabian Grand Prix',
        circuit: { name: 'Jeddah Corniche Circuit', city: 'Jeddah', country: 'Saudi Arabia' },
        date: '2026-03-12T17:00:00Z',
        time: '17:00:00Z',
        sessions: { gp: '2026-03-12T17:00:00Z' }
    },
    {
        id: '3',
        round: 3,
        name: 'Australian Grand Prix',
        circuit: { name: 'Albert Park Circuit', city: 'Melbourne', country: 'Australia' },
        date: '2026-03-26T06:00:00Z', // Local time conversion needed
        time: '06:00:00Z',
        sessions: { gp: '2026-03-26T06:00:00Z' }
    },
    {
        id: '4',
        round: 4,
        name: 'Japanese Grand Prix',
        circuit: { name: 'Suzuka Circuit', city: 'Suzuka', country: 'Japan' },
        date: '2026-04-09T05:00:00Z',
        time: '05:00:00Z',
        sessions: { gp: '2026-04-09T05:00:00Z' }
    },
    // Add more as needed
    {
        id: '5',
        round: 5,
        name: 'Chinese Grand Prix',
        circuit: { name: 'Shanghai International Circuit', city: 'Shanghai', country: 'China' },
        date: '2026-04-23T07:00:00Z',
        time: '07:00:00Z',
        sessions: { gp: '2026-04-23T07:00:00Z' }
    },
    {
        id: '6',
        round: 6,
        name: 'Miami Grand Prix',
        circuit: { name: 'Miami International Autodrome', city: 'Miami', country: 'USA' },
        date: '2026-05-07T19:30:00Z',
        time: '19:30:00Z',
        sessions: { gp: '2026-05-07T19:30:00Z' }
    },
];
