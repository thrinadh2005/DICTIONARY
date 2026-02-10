import { useState, useEffect } from 'react';
import axios from 'axios';
import * as dbUtils from '../utils/dbUtils';

export const useWordDefinition = (word) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!word || word.trim() === '') {
      setData(null);
      setError(null);
      return;
    }

    const fetchWordDefinition = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API first
        const response = await axios.get(`/api/define/${word}`);
        const result = response.data;

        // Save to IndexedDB for offline use
        await dbUtils.saveDefinition(word, result);

        setData(result);
      } catch (err) {
        // If API fails, try to get from cache
        const cachedData = await dbUtils.getDefinition(word);
        if (cachedData) {
          setData(cachedData);
          setError('Using cached data (offline mode)');
        } else {
          setError(err.response?.data?.error || 'Word not found');
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWordDefinition();
  }, [word]);

  return { data, loading, error, isOffline };
};

export const useSynonyms = (word) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!word || word.trim() === '') {
      setData([]);
      return;
    }

    const fetchSynonyms = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/synonyms/${word}`);
        const result = response.data.slice(0, 5).map(item => item.word);

        await dbUtils.saveSynonyms(word, result);
        setData(result);
      } catch (err) {
        const cachedData = await dbUtils.getSynonyms(word);
        if (cachedData) {
          setData(cachedData);
        } else {
          setError('Could not fetch synonyms');
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSynonyms();
  }, [word]);

  return { data, loading, error };
};

export const useAntonyms = (word) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!word || word.trim() === '') {
      setData([]);
      return;
    }

    const fetchAntonyms = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/antonyms/${word}`);
        const result = response.data.slice(0, 5).map(item => item.word);

        await dbUtils.saveAntonyms(word, result);
        setData(result);
      } catch (err) {
        const cachedData = await dbUtils.getAntonyms(word);
        if (cachedData) {
          setData(cachedData);
        } else {
          setError('Could not fetch antonyms');
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAntonyms();
  }, [word]);

  return { data, loading, error };
};
