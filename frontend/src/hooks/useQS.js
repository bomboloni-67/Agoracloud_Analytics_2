/**
 * @file useQS.js
 * @description Custom hook to handle API communication, data categorization,
 * and state management for the AiQ.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { TOPIC_CONFIGS, API_GATEWAY_URL, TABS } from '../constants/appConstants';

export const useQS = (userEmail, activeTab) => {
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedType, setEmbedType] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentLoadedId, setCurrentLoadedId] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableDashboards, setAvailableDashboards] = useState([]); 
  const [suggestionData, setSuggestionData] = useState({ 
    keys: TOPIC_CONFIGS['DEFAULT'].categories,
    grouped: { What: [], Why: [], Who: [], When: [], Other: [] } 
  });
  const requestIdRef = useRef(0);

  // --- INTERNAL HELPER: AUTH TOKEN ---
  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens.idToken.toString();
    } catch (err) {
      console.error("Auth Token Error:", err);
      return null;
    }
  };

  // --- INTERNAL HELPER: CATEGORIZATION ---
  const categorizeQuestions = useCallback((rawQuestions, topicId) => {
    const config = TOPIC_CONFIGS[topicId] || TOPIC_CONFIGS['DEFAULT'];
    const grouped = {};
    config.categories.forEach(cat => { grouped[cat] = []; });

    rawQuestions.forEach((q) => {
      const lowerQ = typeof q === 'string' ? q.toLowerCase() : "";
      const matchedRule = config.rules.filter(rule => 
        rule.keywords.some(keyword => lowerQ.includes(keyword))
      );
      
      if (matchedRule.length > 0) {
        matchedRule.forEach(rule => {
          if (grouped[rule.key]) grouped[rule.key].push(q);
        });
      } else {
        if (grouped[config.defaultCategory]) grouped[config.defaultCategory].push(q);
      }
    });
    return { keys: Object.keys(grouped), grouped };
  }, []);

  // --- API: DISCOVERY ---
  const fetchDiscoveryData = async (mode) => {
    try {
      const token = await getAuthToken();
      if (!token || !userEmail) return;

      const res = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=default&user_id=${userEmail}`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      
      if (res.ok) {
        if (mode === TABS.DASHBOARDS && data.available_dashboards) setAvailableDashboards(data.available_dashboards);
        if (mode === TABS.TOPICS && data.available_topics) setAvailableTopics(data.available_topics);
      }
    } catch (error) {
      console.error(`Discovery Error (${mode}):`, error);
    }
  };
    // 2. Add this Internal Effect to handle the "Auto-Discovery"
    useEffect(() => {
    if (userEmail) {
        setIsLoading(true);
        Promise.all(
            [
                fetchDiscoveryData(TABS.TOPICS)            
            ]
        ).finally( 
            () => setIsLoading(false)
        )
    }
    }, [userEmail]);

  // --- API: EMBEDDING HANDLER ---
  const handleSend = async (question, selectedId) => {
    const targetId = selectedId || currentLoadedId || 'default';
    const requestId = ++requestIdRef.current;

    console.log("handleSend called");
    console.log("selectedId", selectedId);

    if (
      question &&
      targetId === currentLoadedId &&
      activeTab === TABS.TOPICS
    ) {
      setCurrentQuestion(question);
      return;
    }

    setEmbedUrl('');
    setIsLoading(true);

    try {
      const mode = activeTab;

      setEmbedType(mode);

      const fetchEmbedData = async (retries = 5) => {
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const token = await getAuthToken();
            console.log(
              `Fetching embed URL (${attempt}/${retries})`
            );

            const response = await fetch(
              `${API_GATEWAY_URL}?type=${mode}&id=${targetId}&user_id=${userEmail}`,
              {
                headers: {
                  Authorization: token
                }
              }
            );

            const responseData = await response.json();

            console.log("RESPONSE");
            console.log(responseData);
            console.log(
              "Returned embed URL:",
              responseData.embed_url
            );

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${
                  responseData?.message || "Unknown Error"
                }`
              );
            }

            if (!responseData.embed_url) {
              throw new Error(
                "Lambda returned empty embed_url"
              );
            }

            return {
              response,
              responseData
            };

          } catch (err) {
            lastError = err;

            console.warn(
              `Attempt ${attempt}/${retries} failed`,
              err
            );

            if (attempt < retries) {
              await new Promise(resolve =>
                setTimeout(resolve, 1000)
              );
            }
          }
        }

        throw lastError;
      };

      const {
        response: res,
        responseData: data
      } = await fetchEmbedData();

      if (requestId !== requestIdRef.current) {
        console.log(
          "Ignoring stale request",
          requestId
        );
        return;
      }

      const finalEmbedUrl = data.embed_url;

      if (res.ok) {
        setEmbedUrl(finalEmbedUrl);

        console.log(
          "EMBED URL RETURNED:",
          finalEmbedUrl
        );

        setAvailableDashboards(
          data.available_dashboards || []
        );

        setAvailableTopics(
          data.available_topics || []
        );

        setSuggestionData(
          categorizeQuestions(
            data.suggestions || [],
            targetId
          )
        );

        setCurrentQuestion(question || '');

        if (
          targetId &&
          targetId !== 'default'
        ) {
          setCurrentLoadedId(targetId);
        }
      }

    } catch (error) {
      console.error(
        'Embedding API Error:',
        error
      );

      setEmbedUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    embedUrl,
    setEmbedUrl,
    embedType,
    currentQuestion,
    setCurrentQuestion,
    currentLoadedId,
    setCurrentLoadedId,
    availableTopics,
    availableDashboards,
    suggestionData,
    fetchDiscoveryData,
    handleSend
  };
};