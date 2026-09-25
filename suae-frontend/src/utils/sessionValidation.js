/**
 * Session Validation Utility
 * Determines if course operations (add/copy) are allowed based on session timeline
 */

/**
 * Get the status of a session relative to current date
 * @param {Object} session - Session object with start_date and end_date
 * @returns {string} - 'future', 'current', or 'past'
 */
export const getSessionStatus = (session) => {
    if (!session || !session.start_date || !session.end_date) {
        return 'unknown';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    const startDate = new Date(session.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(session.end_date);
    endDate.setHours(23, 59, 59, 999); // End of day

    if (today < startDate) {
        return 'future';  // Session hasn't started yet
    }
    
    if (today > endDate) {
        return 'past';    // Session has ended
    }
    
    return 'current';     // Session is ongoing
};

/**
 * Validate if course operations are allowed for a given session
 * @param {Array} sessions - Array of all session objects
 * @param {string} sessionName - Name of the session to validate (e.g., "2025-2026")
 * @returns {Object} - { allowed: boolean, reason: string, status: string }
 */
export const validateSessionForCourseOperations = (sessions, sessionName) => {
    // If no sessions or session name provided
    if (!sessions || !sessions.length || !sessionName) {
        return {
            allowed: false,
            reason: 'Session information not available',
            status: 'unknown'
        };
    }

    // Find the session object
    const session = sessions.find(s => s.name === sessionName);
    
    if (!session) {
        return {
            allowed: false,
            reason: 'Session not found',
            status: 'unknown'
        };
    }

    // Get session status
    const status = getSessionStatus(session);

    // Validation logic: Only allow operations for FUTURE sessions
    switch (status) {
        case 'future':
            return {
                allowed: true,
                reason: null,
                status: 'future'
            };
        
        case 'current':
            return {
                allowed: false,
                reason: 'Cannot add courses to the current active session. Please add courses for upcoming sessions.',
                status: 'current'
            };
        
        case 'past':
            return {
                allowed: false,
                reason: 'Cannot add courses to past sessions',
                status: 'past'
            };
        
        default:
            return {
                allowed: false,
                reason: 'Unable to determine session status',
                status: 'unknown'
            };
    }
};

/**
 * Get a user-friendly message about session status
 * @param {string} status - Session status ('future', 'current', 'past')
 * @returns {string} - User-friendly message
 */
export const getSessionStatusMessage = (status) => {
    switch (status) {
        case 'future':
            return 'This is a future session. You can add courses.';
        case 'current':
            return 'This is the current active session. Course additions are not allowed.';
        case 'past':
            return 'This is a past session. Course additions are not allowed.';
        default:
            return 'Session status unknown.';
    }
};
