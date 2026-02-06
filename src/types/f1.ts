export interface F1Race {
    id: string;
    round: number;
    name: string;
    circuit: {
        name: string;
        city: string;
        country: string;
        image?: string;
    };
    date: string; // ISO string
    time: string; // UTC time
    sessions: {
        fp1?: string;
        fp2?: string;
        fp3?: string;
        qualifying?: string;
        sprint?: string;
        gp: string;
    };
}

export interface RaceResult {
    position: string;
    driver: string;
    team: string;
    time: string;
    points: string;
}
