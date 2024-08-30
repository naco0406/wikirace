import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { debounce } from 'lodash';

interface WikipediaResult {
    pageid: number;
    title: string;
    description?: string;
    thumbnail?: {
        source: string;
    };
}

interface AutocompleteWikipediaInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const AutocompleteWikipediaInput: React.FC<AutocompleteWikipediaInputProps> = ({ value, onChange, placeholder = "위키피디아 검색..." }) => {
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<WikipediaResult[]>([]);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchWikipediaSuggestions = async (search: string) => {
        if (!search.trim()) {
            setSuggestions([]);
            return;
        }

        const apiUrl = `https://ko.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=120&pilimit=6&gpssearch=${encodeURIComponent(search)}&gpsnamespace=0&gpslimit=6&origin=*`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.query && data.query.pages) {
                const results = Object.values(data.query.pages) as WikipediaResult[];
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching Wikipedia suggestions:', error);
            setSuggestions([]);
        }
    };

    const debouncedFetch = useCallback(
        debounce((search: string) => fetchWikipediaSuggestions(search), 300),
        []
    );

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (inputValue) {
            debouncedFetch(inputValue);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, debouncedFetch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
        setOpen(true);
    };

    const handleSuggestionClick = (suggestion: WikipediaResult) => {
        setInputValue(suggestion.title);
        onChange(suggestion.title);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={inputRef}>
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                className="w-full"
            />
            {open && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full z-10 bg-white rounded-lg border shadow-md mt-1 max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.pageid}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <div className="flex items-center space-x-2">
                                {suggestion.thumbnail && (
                                    <img
                                        src={suggestion.thumbnail.source}
                                        alt={suggestion.title}
                                        className="w-8 h-8 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <div className="font-medium">{suggestion.title}</div>
                                    {suggestion.description && (
                                        <div className="text-sm text-gray-500">{suggestion.description}</div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteWikipediaInput;