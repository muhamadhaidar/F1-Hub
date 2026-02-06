import { useAuth } from '@/context/AuthContext';
import { FavoriteItem, getFavorites, toggleFavorite } from '@/services/database';
import { useCallback, useEffect, useState } from 'react';

export const useFavorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadFavorites = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggle = async (type: 'driver' | 'team' | 'race', itemId: string, data: any = {}) => {
        if (!user) return; // Or show login prompt
        try {
            const isNowFavorited = await toggleFavorite(type, itemId, data);
            await loadFavorites(); // Reload list
            return isNowFavorited;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    };

    const isFavorite = (type: string, itemId: string) => {
        return favorites.some(f => f.type === type && f.itemId === itemId);
    };

    return { favorites, toggle, isFavorite, loading, refresh: loadFavorites };
};
