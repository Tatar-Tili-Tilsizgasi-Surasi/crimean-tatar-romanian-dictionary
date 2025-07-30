// dictionaryData.ts
import { DICTIONARY_RAW_TEXT } from './dictionaryRawData';

export interface DictionaryLookupEntry {
  term: string;
  details: string;
}

export let PARSED_DICTIONARY_ENTRIES: DictionaryLookupEntry[] = [];

let dictionaryLoaded = false;

function parseDictionary(text: string): DictionaryLookupEntry[] {
  const lines = text.split('\n');
  return lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return null;
    }
    const firstSpaceIndex = trimmedLine.indexOf(' ');

    if (firstSpaceIndex === -1) {
      return { term: trimmedLine, details: '' };
    }
    return {
      term: trimmedLine.substring(0, firstSpaceIndex),
      details: trimmedLine.substring(firstSpaceIndex + 1).trim(),
    };
  }).filter((entry): entry is DictionaryLookupEntry => entry !== null && !!entry.term);
}

export const getDictionary = (): Promise<DictionaryLookupEntry[]> => {
  return new Promise((resolve) => {
    if (dictionaryLoaded) {
      resolve(PARSED_DICTIONARY_ENTRIES);
      return;
    }
    
    // Use a setTimeout to simulate async loading and prevent blocking the main thread,
    // even though parsing is now synchronous. This keeps the loading spinner behavior.
    setTimeout(() => {
      PARSED_DICTIONARY_ENTRIES = parseDictionary(DICTIONARY_RAW_TEXT);
      dictionaryLoaded = true;
      resolve(PARSED_DICTIONARY_ENTRIES);
    }, 0);
  });
};
