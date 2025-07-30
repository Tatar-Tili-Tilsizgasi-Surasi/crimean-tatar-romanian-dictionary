
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import IconButton from './components/IconButton';
import { SwapIcon, ClearIcon, LoadingSpinner, SearchIcon, BookIcon } from './components/Icons';
import { loadDictionary, searchDictionary } from './services/translationService';
import { DictionaryLookupEntry } from './dictionaryData';

type SearchDirection = 'crh-ro-to-ro' | 'ro-to-crh-ro';

const SearchResultCard: React.FC<{ entry: DictionaryLookupEntry }> = ({ entry }) => {
  const { term, details } = entry;
  
  const formattedDetails = useMemo(() => {
    const parts = details.split('//');
    const mainPart = parts[0].trim();
    const examplesPart = parts.length > 1 ? parts[1].replace(/●/g, '').trim() : null;

    const definitions = mainPart.split(';').map((def, index) => (
      <span key={index} className="block md:inline-block md:after:content-[';_'] last:after:content-[''] md:mr-1">{def.trim()}</span>
    ));

    return { definitions, examplesPart };
  }, [details]);


  return (
    <div className="bg-slate-700/40 p-4 sm:p-5 rounded-lg shadow-lg ring-1 ring-slate-700 transition-all duration-300 ease-in-out hover:bg-slate-700/60 hover:ring-sky-500/50">
      <h3 className="text-xl sm:text-2xl font-bold text-sky-400 font-serif">{term}</h3>
      <div className="mt-2 text-slate-300 space-y-2">
        <div>
          <p className="text-sm font-semibold text-sky-300/80 mb-1">Definitions</p>
          <div className="text-base">{formattedDetails.definitions}</div>
        </div>
        {formattedDetails.examplesPart && (
           <div>
             <p className="text-sm font-semibold text-sky-300/80 mb-1">Examples</p>
             <p className="text-base italic text-slate-400">{formattedDetails.examplesPart}</p>
           </div>
        )}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [searchDirection, setSearchDirection] = useState<SearchDirection>('crh-ro-to-ro');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DictionaryLookupEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionaryLoaded, setDictionaryLoaded] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        setIsLoading(true);
        await loadDictionary();
        setDictionaryLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim() || !dictionaryLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = searchDictionary(searchTerm, searchDirection);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, searchDirection, dictionaryLoaded]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSwapDirection = useCallback(() => {
    setSearchDirection(prev => prev === 'crh-ro-to-ro' ? 'ro-to-crh-ro' : 'crh-ro-to-ro');
    setSearchTerm('');
    setSearchResults(null);
    setError(null);
  }, []);
  
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSearchResults(null);
    setError(null);
  }, []);

  const fromLang = searchDirection === 'crh-ro-to-ro' ? 'Crimean Tatar (RO)' : 'Romanian';
  const toLang = searchDirection === 'crh-ro-to-ro' ? 'Romanian' : 'Crimean Tatar (RO)';

  const renderResults = () => {
    if (isLoading && !dictionaryLoaded) {
      return (
        <div className="text-center p-8 text-slate-400 flex flex-col items-center">
          <LoadingSpinner className="w-8 h-8 mb-4"/>
          <p>Loading dictionary...</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="mt-4 p-3.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md text-sm text-center shadow">
          <strong>Error:</strong> {error}
        </div>
       )
    }
    if (searchResults) {
      if (searchResults.length > 0) {
        return (
          <div className="space-y-4">
             {searchResults.map((entry, index) => <SearchResultCard key={`${entry.term}-${index}`} entry={entry} />)}
          </div>
        );
      }
      return (
         <div className="text-center p-8 text-slate-400">
          <p>No results found for "<strong>{searchTerm}</strong>".</p>
        </div>
      );
    }
    
    return (
       <div className="text-center p-8 text-slate-500">
        <p>Enter a word above to search the dictionary.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-200 p-4 sm:p-8 flex flex-col items-center font-['Inter']">
      <main className="container mx-auto max-w-3xl w-full bg-slate-800/70 backdrop-blur-lg shadow-2xl rounded-xl p-6 sm:p-10">
        <header className="mb-8 text-center flex flex-col items-center">
            <BookIcon className="w-12 h-12 text-sky-400 mb-2"/>
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-400 tracking-tight">
            Crimean Tatar (RO) Dictionary
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
             A project of Tatar Tílí Tílsîzgasî Şurasî.
          </p>
        </header>

        <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-2 sm:gap-4 p-2 bg-slate-900/50 rounded-lg ring-1 ring-slate-700">
                <div className="flex-shrink-0 px-3 py-2 text-center">
                    <span className="text-xs text-slate-400">From</span>
                    <p className="font-semibold text-sky-300">{fromLang}</p>
                </div>

                <IconButton
                    onClick={handleSwapDirection}
                    icon={<SwapIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                    ariaLabel="Swap search direction"
                    title="Swap Direction"
                    className="bg-sky-600 hover:bg-sky-700 active:bg-sky-800 flex-shrink-0"
                    disabled={!dictionaryLoaded}
                />
                
                 <div className="flex-shrink-0 px-3 py-2 text-center">
                    <span className="text-xs text-slate-400">To</span>
                    <p className="font-semibold text-sky-300">{toLang}</p>
                </div>
            </div>


          <div className="relative flex items-center gap-2">
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search in ${fromLang}...`}
                disabled={!dictionaryLoaded}
                className="w-full p-3 pl-4 pr-10 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-white placeholder-slate-400 transition duration-150 ease-in-out disabled:opacity-50"
            />
            {searchTerm && (
                <IconButton 
                    onClick={handleClear} 
                    icon={<ClearIcon className="w-5 h-5"/>} 
                    ariaLabel="Clear search"
                    className="absolute right-[88px] sm:right-[100px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                />
            )}
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchTerm.trim() || !dictionaryLoaded}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
            >
              {isLoading && dictionaryLoaded ? <LoadingSpinner className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
          
          <div className="p-1 min-h-[200px]">
            {renderResults()}
          </div>

        </div>
      </main>
      <footer className="text-center text-slate-500 mt-10 text-xs sm:text-sm">
        <p>Powered by a community-curated dictionary. UI by AI.</p>
      </footer>
    </div>
  );
};

export default App;
