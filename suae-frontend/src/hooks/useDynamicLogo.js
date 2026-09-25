import { useState, useEffect } from 'react';
import CmasterService from '../services/CmasterService';

// Global static cache for the logo to prevent duplicate loading/flashing
let cachedLogoUrl = null;
let isFetchingLogo = false;
const logoListeners = new Set();

/**
 * Custom hook to load and manage dynamic logo
 * Fetches active logo from public API (no authentication required)
 * Listens for logo update events to refresh automatically
 *
 * @returns {string} logoUrl - The URL of the active logo, or empty string if none
 */
export const useDynamicLogo = () => {
    const [logoUrl, setLogoUrl] = useState(cachedLogoUrl);

    useEffect(() => {
        if (cachedLogoUrl !== null) {
            // Already fetched or failed (cached value exists)
            return;
        }

        const handleLogoLoaded = (url) => {
            setLogoUrl(url);
        };
        logoListeners.add(handleLogoLoaded);

        if (!isFetchingLogo) {
            isFetchingLogo = true;
            CmasterService.getActiveLogo()
                .then(({ data }) => {
                    let url = '';
                    if (data && data.success && data.data && data.data.file_url) {
                        url = data.data.file_url;
                        if (!url.startsWith('data:')) {
                            const timestamp = new Date().getTime();
                            const separator = url.includes('?') ? '&' : '?';
                            url = `${url}${separator}t=${timestamp}`;
                        }
                    }
                    cachedLogoUrl = url;
                    logoListeners.forEach(listener => listener(url));
                    logoListeners.clear();
                })
                .catch((error) => {
                    console.error('Failed to load dynamic logo:', error);
                    cachedLogoUrl = '';
                    logoListeners.forEach(listener => listener(''));
                    logoListeners.clear();
                });
        }

        return () => {
            logoListeners.delete(handleLogoLoaded);
        };
    }, []);

    useEffect(() => {
        // Listen for logo update events
        const handleLogoUpdate = () => {
            console.log('Logo updated, resetting cache...');
            cachedLogoUrl = null;
            isFetchingLogo = false;
            setLogoUrl(null);
        };

        window.addEventListener('logoUpdated', handleLogoUpdate);
        window.addEventListener('logoChanged', handleLogoUpdate);
       
        // Cleanup
        return () => {
            window.removeEventListener('logoUpdated', handleLogoUpdate);
            window.removeEventListener('logoChanged', handleLogoUpdate);
        };
    }, []);

    return logoUrl;
};

export default useDynamicLogo;
