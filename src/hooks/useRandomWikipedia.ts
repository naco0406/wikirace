import { WikipediaAPI } from '@/service/WikipediaService';
import { useState, useEffect, useCallback } from 'react';
import { formatPageTitle } from './useWikipedia';

interface RandomTitleHook {
    title: string | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<string | null>;
}

export const useRandomWikipediaTitle = (): RandomTitleHook => {
    const [title, setTitle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRandomTitle = useCallback(async (): Promise<string | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await WikipediaAPI.GET_page_random.method('title');
            const data = response.data;
            if (data && data.items && data.items.length > 0) {
                const newTitle = formatPageTitle(data.items[0].title);
                setTitle(newTitle);
                return newTitle;
            } else {
                throw new Error('No title found in the response');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching the title'));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { title, isLoading, error, refetch: fetchRandomTitle };
};