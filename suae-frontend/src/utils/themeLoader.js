/**
 * Theme Loader Utility
 * 
 * Strategy:
 *  1. On startup → instantly apply from localStorage (no network, no flash)
 *  2. Then fetch the active theme from backend (public endpoint, no auth needed)
 *  3. If backend theme differs → update CSS vars AND localStorage cache
 *  4. Result: instant paint + always-consistent with backend on every load
 */

const THEME_CACHE_KEY = 'app-theme-vars';
const THEME_META_KEY = 'app-theme-meta';

// Default fallback colors (used when no theme is active)
const DEFAULT_VARS = {
    '--theme-green-dark': '#00666a',
    '--theme-green-light': '#009297',
    '--theme-orange': '#fd8a52',
    '--theme-neutral': '#F0F4F8',
};

class ThemeLoader {
    constructor() {
        this.isLoading = false;
    }

    /**
     * Apply CSS variables directly to :root
     */
    applyTheme(theme) {
        if (!theme) return;
        const root = document.documentElement;
        if (theme.primary_color) root.style.setProperty('--theme-green-dark', theme.primary_color);
        if (theme.secondary_color) root.style.setProperty('--theme-green-light', theme.secondary_color);
        if (theme.accent_color) root.style.setProperty('--theme-orange', theme.accent_color);
        if (theme.neutral_color) root.style.setProperty('--theme-neutral', theme.neutral_color);
    }

    /**
     * Apply CSS vars object (key → value) directly to :root
     */
    applyVars(vars) {
        if (!vars || typeof vars !== 'object') return;
        const root = document.documentElement;
        Object.entries(vars).forEach(([k, v]) => {
            if (v) root.style.setProperty(k, v);
        });
    }

    /**
     * Save theme to localStorage cache for instant future loads
     */
    cacheTheme(theme) {
        if (!theme) return;
        try {
            const vars = {
                '--theme-green-dark': theme.primary_color || DEFAULT_VARS['--theme-green-dark'],
                '--theme-green-light': theme.secondary_color || DEFAULT_VARS['--theme-green-light'],
                '--theme-orange': theme.accent_color || DEFAULT_VARS['--theme-orange'],
                '--theme-neutral': theme.neutral_color || DEFAULT_VARS['--theme-neutral'],
            };
            localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(vars));
            // Store meta so we know which theme is cached
            localStorage.setItem(THEME_META_KEY, JSON.stringify({
                id: theme.id,
                name: theme.name,
                cachedAt: Date.now(),
            }));
        } catch (e) {
            // localStorage unavailable — not fatal
        }
    }

    /**
     * Load and apply from localStorage cache (instant, no network)
     * Call this before React mounts to avoid flash of default colors.
     */
    loadFromCache() {
        try {
            const raw = localStorage.getItem(THEME_CACHE_KEY);
            if (raw) {
                const vars = JSON.parse(raw);
                if (vars && typeof vars === 'object') {
                    this.applyVars(vars);
                }
            }
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Clear all theme caches (used when admin resets to default)
     */
    clearCache() {
        try {
            localStorage.removeItem(THEME_CACHE_KEY);
            localStorage.removeItem(THEME_META_KEY);
        } catch (e) { }
        this.applyVars(DEFAULT_VARS);
    }

    /**
     * Fetch the active theme from the backend (public endpoint — no auth required).
     * Updates CSS vars AND localStorage cache when a theme is found.
     * Safe to call from any page (login, registration, dashboard, etc).
     */
    async loadActiveTheme() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;

            // Dynamic import to avoid circular dependency at module load time
            const { axiosPublicInstance } = await import('./axiosnode');
            const response = await axiosPublicInstance.get('color-schemes/active');

            // Handle different response shapes
            const data = response.data;
            let activeTheme = null;
            if (data && data.result) {
                activeTheme = data.result;
            } else if (data && (data.primary_color || data.name)) {
                activeTheme = data;
            }

            if (activeTheme && activeTheme.primary_color) {
                this.applyTheme(activeTheme);
                this.cacheTheme(activeTheme);
            } else {
                // No active theme on backend → fall back to defaults and clear cache
                // Only clear if we have no cached theme (don't wipe a valid cache for a transient error)
                const cached = localStorage.getItem(THEME_CACHE_KEY);
                if (!cached) {
                    this.applyVars(DEFAULT_VARS);
                }
            }
        } catch (error) {
            // Network error or no active theme — silently use whatever is in localStorage
            // (already applied in loadFromCache / index.js startup)
            const cached = localStorage.getItem(THEME_CACHE_KEY);
            if (!cached) {
                this.applyVars(DEFAULT_VARS);
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Full init:
     *  Step 1 — instantly apply cache (no flash)
     *  Step 2 — fetch from backend and sync cache
     * 
     * Call once from index.js (runs for everyone, authenticated or not).
     * Header.js also calls this after login to ensure fresh theme post-login.
     */
    async init() {
        // Step 1: instant paint from cache
        this.loadFromCache();
        // Step 2: sync from backend (async, doesn't block render)
        await this.loadActiveTheme();
    }
}

// Singleton
const themeLoader = new ThemeLoader();

export default themeLoader;
