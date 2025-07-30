
import { DictionaryLookupEntry, getDictionary, PARSED_DICTIONARY_ENTRIES } from '../dictionaryData';

export const loadDictionary = async (): Promise<void> => {
  try {
    await getDictionary();
  } catch (error) {
    console.error("Failed to load dictionary", error);
    throw new Error("Could not load dictionary data.");
  }
};

const POS_PREFIXES_FOR_CLEANING = [
  "adj. ", "s. ", "v. ", "adv. ", "pron. ", "prep. ", "conj. ", "interj. ", "num. ", "art. ",
  "s.m. ", "s.f. ", "s.n. ", 
  "s., adj. ", "adj., s. ", 
  "v.i. ", "v.t. ", "v.r. ", "v.t.ind. ", "v.t.d. ",
  "loc. adj. ", "loc. adv. ", "loc. s. ", "loc. v. ", "loc. prep. ", "loc. conj. ",
  "I. ", "II. ", "III. ", "IV. ", "V. "
];


const cleanDefinition = (def: string): string => {
    let currentDef = def.toLowerCase().trim();
    if (currentDef.endsWith('.')) {
        currentDef = currentDef.slice(0, -1);
    }
    
    for (const prefix of POS_PREFIXES_FOR_CLEANING) {
        if (currentDef.startsWith(prefix)) {
        currentDef = currentDef.substring(prefix.length).trim();
        break; 
        }
    }
    
    const annotationRegexStart = /^\s*\([a-zçşğıöüâîA-ZÇŞĞİÖÜÂÎ0-9.,\s-]+\)\s*/;
    currentDef = currentDef.replace(annotationRegexStart, '').trim();

    return currentDef;
}

export const searchDictionary = (
  searchTerm: string,
  direction: 'crh-ro-to-ro' | 'ro-to-crh-ro'
): DictionaryLookupEntry[] => {
  const cleanedSearchTerm = searchTerm.trim().toLowerCase();
  if (!cleanedSearchTerm) {
    return [];
  }

  if (direction === 'crh-ro-to-ro') {
    // Exact and partial matches for Crimean Tatar -> Romanian
    const exactMatches = PARSED_DICTIONARY_ENTRIES.filter(
      entry => entry.term.toLowerCase() === cleanedSearchTerm
    );
    const partialMatches = PARSED_DICTIONARY_ENTRIES.filter(
      entry => entry.term.toLowerCase().startsWith(cleanedSearchTerm) && !exactMatches.includes(entry)
    );
    return [...exactMatches, ...partialMatches];
  } else { // ro-to-crh-ro
    const results: DictionaryLookupEntry[] = [];
    const addedTerms = new Set<string>();

    for (const entry of PARSED_DICTIONARY_ENTRIES) {
      const definitionPart = entry.details.split('//')[0].trim();
      const definitions = definitionPart.split(';').map(d => d.trim());
      
      for (const def of definitions) {
        if (!def) continue;

        const finalCleanedDef = cleanDefinition(def);
        
        if (finalCleanedDef === cleanedSearchTerm && !addedTerms.has(entry.term)) {
          results.push(entry);
          addedTerms.add(entry.term);
          break; // Found an exact match in this entry, move to the next entry
        }
      }
    }
     // Add partial matches if no exact matches found
    if(results.length === 0){
       for (const entry of PARSED_DICTIONARY_ENTRIES) {
         if (addedTerms.has(entry.term)) continue;

         const definitionPart = entry.details.split('//')[0].trim();
         const definitions = definitionPart.split(';').map(d => d.trim());
         
         for (const def of definitions) {
           if (!def) continue;

           const finalCleanedDef = cleanDefinition(def);

           if (finalCleanedDef.startsWith(cleanedSearchTerm)) {
             results.push(entry);
             addedTerms.add(entry.term);
             break;
           }
         }
       }
    }

    return results;
  }
};
