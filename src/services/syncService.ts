import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Platform } from 'react-native';
import { getFavorites } from './database';
import { auth, db } from './firebaseConfig';

export const syncFavorites = async () => {
    if (Platform.OS === 'web') return; // Skip sync on web for now as SQLite is mocked

    const user = auth.currentUser;
    if (!user) return;

    try {
        // 1. Get Local Data
        const localFavorites = await getFavorites();

        // 2. Get Remote Data
        const favoritesRef = collection(db, 'users', user.uid, 'favorites');
        const snapshot = await getDocs(favoritesRef);
        const remoteFavorites = snapshot.docs.map(doc => doc.data());

        // 3. Simple Merge Strategy: Remote wins if conflict, but here we just additive merge
        // Ideally you check timestamps.
        // For MVP: Push local to remote
        const batch = writeBatch(db);

        localFavorites.forEach(fav => {
            // Use composite key or just itemId if unique enough?
            // Since itemId might accidentally collide across types (unlikely but possible), 
            // let's use a composite ID for the document: type_itemId
            const docId = `${fav.type}_${fav.itemId}`;
            const ref = doc(db, 'users', user.uid, 'favorites', docId);
            batch.set(ref, fav);
        });

        await batch.commit();
        console.log('Sync to Cloud Complete');

    } catch (error) {
        console.error('Sync failed:', error);
    }
};
