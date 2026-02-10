// IndexedDB utility for offline data storage
const DB_NAME = 'DictionaryDB';
const DB_VERSION = 1;
const STORE_DEFINITIONS = 'definitions';
const STORE_SYNONYMS = 'synonyms';
const STORE_ANTONYMS = 'antonyms';

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database failed to open');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_DEFINITIONS)) {
        db.createObjectStore(STORE_DEFINITIONS, { keyPath: 'word' });
      }
      if (!db.objectStoreNames.contains(STORE_SYNONYMS)) {
        db.createObjectStore(STORE_SYNONYMS, { keyPath: 'word' });
      }
      if (!db.objectStoreNames.contains(STORE_ANTONYMS)) {
        db.createObjectStore(STORE_ANTONYMS, { keyPath: 'word' });
      }
    };
  });
};

export const saveDefinition = async (word, data) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_DEFINITIONS], 'readwrite');
    const store = transaction.objectStore(STORE_DEFINITIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        word: word.toLowerCase(),
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving definition:', error);
    throw error;
  }
};

export const getDefinition = async (word) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_DEFINITIONS], 'readonly');
    const store = transaction.objectStore(STORE_DEFINITIONS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(word.toLowerCase());
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting definition:', error);
    return null;
  }
};

export const saveSynonyms = async (word, data) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_SYNONYMS], 'readwrite');
    const store = transaction.objectStore(STORE_SYNONYMS);
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        word: word.toLowerCase(),
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving synonyms:', error);
    throw error;
  }
};

export const getSynonyms = async (word) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_SYNONYMS], 'readonly');
    const store = transaction.objectStore(STORE_SYNONYMS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(word.toLowerCase());
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting synonyms:', error);
    return null;
  }
};

export const saveAntonyms = async (word, data) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_ANTONYMS], 'readwrite');
    const store = transaction.objectStore(STORE_ANTONYMS);
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        word: word.toLowerCase(),
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving antonyms:', error);
    throw error;
  }
};

export const getAntonyms = async (word) => {
  try {
    await initDB();
    const transaction = db.transaction([STORE_ANTONYMS], 'readonly');
    const store = transaction.objectStore(STORE_ANTONYMS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(word.toLowerCase());
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting antonyms:', error);
    return null;
  }
};

export const clearAllData = async () => {
  try {
    await initDB();
    const stores = [STORE_DEFINITIONS, STORE_SYNONYMS, STORE_ANTONYMS];
    
    return Promise.all(
      stores.map(storeName => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
