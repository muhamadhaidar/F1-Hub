// Mapping of Driver IDs to High-Quality Image URLs
// Using stable Wikimedia/F1.com sources where possible
export const DRIVER_IMAGES: { [key: string]: any } = {
    // Top Drivers - Handpicked Wikimedia Commons High-Res Potraits
    'verstappen': require('../../assets/Driver/maxverstaphen.png'),
    'max_verstappen': require('../../assets/Driver/maxverstaphen.png'),
    'checo_perez': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Sergio_Perez_2019_Singapore_GP.jpg/800px-Sergio_Perez_2019_Singapore_GP.jpg',
    'perez': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Sergio_Perez_2019_Singapore_GP.jpg/800px-Sergio_Perez_2019_Singapore_GP.jpg',
    'hamilton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/800px-Lewis_Hamilton_2016_Malaysia_2.jpg',
    'russell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/George_Russell_2019_Singapore_GP_2.jpg/800px-George_Russell_2019_Singapore_GP_2.jpg',
    'leclerc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Charles_Leclerc_2019_Singapore_GP.jpg/800px-Charles_Leclerc_2019_Singapore_GP.jpg',
    'sainz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Carlos_Sainz_Jr._2019_Singapore_GP_1.jpg/800px-Carlos_Sainz_Jr._2019_Singapore_GP_1.jpg',
    'norris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lando_Norris_2019_Singapore_GP_2.jpg/800px-Lando_Norris_2019_Singapore_GP_2.jpg',
    'piastri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Oscar_Piastri_2022_F2_Austria_Sprint.jpg/800px-Oscar_Piastri_2022_F2_Austria_Sprint.jpg',
    'alonso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Fernando_Alonso_2016_Malaysia_2.jpg/800px-Fernando_Alonso_2016_Malaysia_2.jpg',
    'stroll': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Lance_Stroll_2019_Singapore_GP_2.jpg/800px-Lance_Stroll_2019_Singapore_GP_2.jpg',
    'gasly': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pierre_Gasly_2019_Singapore_GP_2.jpg/800px-Pierre_Gasly_2019_Singapore_GP_2.jpg',
    'ocon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Esteban_Ocon_2017_Malaysia_2.jpg/800px-Esteban_Ocon_2017_Malaysia_2.jpg',
    'albon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Alexander_Albon_2019_Singapore_GP_2.jpg/800px-Alexander_Albon_2019_Singapore_GP_2.jpg',
    'sargeant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Logan_Sargeant_2022_F2_Austria_Sprint.jpg/800px-Logan_Sargeant_2022_F2_Austria_Sprint.jpg',
    'colapinto': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Franco_Colapinto_2022_F3_Spielberg.jpg',
    'tsunoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Yuki_Tsunoda_2022_Austria.jpg/800px-Yuki_Tsunoda_2022_Austria.jpg',
    'ricciardo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Daniel_Ricciardo_2019_Singapore_GP_1.jpg/800px-Daniel_Ricciardo_2019_Singapore_GP_1.jpg',
    'lawson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Liam_Lawson_2022_F2_Austria_Feature.jpg/800px-Liam_Lawson_2022_F2_Austria_Feature.jpg',
    'bottas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Valtteri_Bottas_2019_Singapore_GP_2.jpg/800px-Valtteri_Bottas_2019_Singapore_GP_2.jpg',
    'zhou': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Guanyu_Zhou_2022_Austria.jpg/800px-Guanyu_Zhou_2022_Austria.jpg',
    'hulkenberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nico_Hulkenberg_2019_Singapore_GP_1.jpg/800px-Nico_Hulkenberg_2019_Singapore_GP_1.jpg',
    'magnussen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Kevin_Magnussen_2019_Singapore_GP_1.jpg/800px-Kevin_Magnussen_2019_Singapore_GP_1.jpg',
    'bearman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Oliver_Bearman_2022_F3_Spielberg.jpg/800px-Oliver_Bearman_2022_F3_Spielberg.jpg',
};

// Using require for local assets where available, falling back to remote strings
export const TEAM_LOGOS: { [key: string]: any } = {
    'red_bull': require('../../assets/TeamLogo/REDBULL.jpg'),
    'mercedes': require('../../assets/TeamLogo/Mercedes.jpg'),
    'ferrari': require('../../assets/TeamLogo/ferrari.avif'),
    'mclaren': require('../../assets/TeamLogo/Mclaren.png'),
    'aston_martin': require('../../assets/TeamLogo/AstonMartin.jpg'),
    'alpine': require('../../assets/TeamLogo/Alpine.png'),
    'williams': require('../../assets/TeamLogo/williams.jpg'),
    'rb': require('../../assets/TeamLogo/vcarb.jpg'),
    'sauber': require('../../assets/TeamLogo/sauber.png'),
    'haas': require('../../assets/TeamLogo/haastgr.png'),
    // 'cadillac': require('../../assets/TeamLogo/cadilac.jpg'), // Future proofing if needed
};

// Fallbacks
const DEFAULT_DRIVER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/600px-Default_pfp.jpg';
const DEFAULT_TEAM_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/1200px-F1.svg.png';

export const getDriverImageUrl = (driverId: string): any => {
    return DRIVER_IMAGES[driverId] || DEFAULT_DRIVER_IMAGE;
};

export const getTeamLogoUrl = (teamId: string): any => {
    const normalizedId = teamId.toLowerCase().replace(/\s+/g, '_');
    // Try explicit map, then fuzzy match, then default
    return TEAM_LOGOS[normalizedId] || TEAM_LOGOS[Object.keys(TEAM_LOGOS).find(k => normalizedId.includes(k)) || ''] || DEFAULT_TEAM_LOGO;
};
