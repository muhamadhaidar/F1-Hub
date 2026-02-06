export interface F1Driver {
    driverId: string;
    permanentNumber: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}

export interface F1Team {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
}

export interface F1Standing {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: F1Driver;
    Constructors: F1Team[];
}
