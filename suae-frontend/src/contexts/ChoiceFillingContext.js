import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import ClientService from '../services/ClientService';
import util from '../utils/util'; // Import util to check login status

const ChoiceFillingContext = createContext();

export const useChoiceFilling = () => {
  const context = useContext(ChoiceFillingContext);
  if (!context) {
    throw new Error('useChoiceFilling must be used within a ChoiceFillingProvider');
  }
  return context;
};

export const ChoiceFillingProvider = ({ children }) => {
  const [started, setStarted] = useState('N');
  const [closed, setClosed] = useState('N');
  const [loading, setLoading] = useState(false);

  // Fetch initial status
  const fetchStatus = useCallback(async () => {
    // Only fetch if user is logged in
    if (!util.isLogged()) {
      console.log('User not logged in, skipping choice filling status fetch');
      return;
    }

    try {
      const [startedRes, closedRes] = await Promise.all([
        ClientService.choiceFillingStarted(),
        ClientService.choiceFillingClosed()
      ]);
      
      setStarted(startedRes.data.result || 'N');
      setClosed(closedRes.data.result || 'N');
    } catch (error) {
      console.error('Error fetching choice filling status:', error);
      setStarted('N');
      setClosed('N');
    }
  }, []);

    // Update choice filling started status
  const setChoiceFillingStarted = useCallback(async (value) => {
    setLoading(true);
    try {
      const res = await ClientService.setChoiceFillingStarted(value);
      console.log('API Response:', res); // Debug log

      // If the request succeeded (no error thrown), update the state
      setStarted(value);
      message.success('Choice filling status updated');
      return true;
    } catch (error) {
      console.error('Error updating choice filling status:', error);
      setStarted(prev => prev === 'Y' ? 'N' : 'Y');
      message.error(error.response?.data?.message || error.message || 'Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);


  // Refresh status (useful for manual refresh)
  const refreshStatus = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    // Listen for login success events to fetch status
    const handleLoginSuccess = () => {
      console.log('Login success detected, fetching choice filling status');
      fetchStatus();
    };

    // Only fetch on mount if already logged in
    if (util.isLogged()) {
      fetchStatus();
    }

    // Listen for login success events
    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [fetchStatus]);

  const value = {
    started,
    closed,
    loading,
    setChoiceFillingStarted,
    refreshStatus,
    fetchStatus
  };

  return (
    <ChoiceFillingContext.Provider value={value}>
      {children}
    </ChoiceFillingContext.Provider>
  );
};

export default ChoiceFillingContext;
