/**
 * Lead Filtering Utility
 * 
 * This utility provides frontend filtering for leads based on their user_filters (strategy).
 * The backend sends ALL students, and this utility filters them on the frontend.
 * 
 * User filters format:
 * {
 *   "country_id": [111, 89],
 *   "discipline_id": [26, 19],
 *   "student_status": ["ONLINE", "OFFLINE"],
 *   "institute_id": 5  // Super Admin only
 * }
 */

/**
 * Get user filters from localStorage
 * @returns {Object|null} User filters object or null if not set
 */
export const getUserFilters = () => {
    try {
        const filtersStr = window.localStorage.getItem('user_filters');
        if (!filtersStr || filtersStr === 'null' || filtersStr === 'undefined') {
            return null;
        }
        return JSON.parse(filtersStr);
    } catch (e) {
        console.error('Error parsing user_filters from localStorage:', e);
        return null;
    }
};

/**
 * Set user filters in localStorage
 * @param {Object} filters - User filters object
 */
export const setUserFilters = (filters) => {
    try {
        if (filters && typeof filters === 'object') {
            window.localStorage.setItem('user_filters', JSON.stringify(filters));
        } else {
            window.localStorage.removeItem('user_filters');
        }
    } catch (e) {
        console.error('Error setting user_filters in localStorage:', e);
    }
};

/**
 * Check if a student matches the user's filters
 * @param {Object} student - Student object
 * @param {Object} filters - User filters object
 * @returns {boolean} True if student matches all filters
 */
export const studentMatchesFilters = (student, filters) => {
    if (!filters || typeof filters !== 'object') {
        // No filters means show all students
        return true;
    }

    // Check country filter
    if (filters.country_id && Array.isArray(filters.country_id) && filters.country_id.length > 0) {
        const studentCountryId = student.country_id;
        if (!studentCountryId || !filters.country_id.includes(Number(studentCountryId))) {
            return false;
        }
    }

    // Check discipline filter
    if (filters.discipline_id && Array.isArray(filters.discipline_id) && filters.discipline_id.length > 0) {
        const studentDisciplineId = student.discipline_id;
        if (!studentDisciplineId || !filters.discipline_id.includes(Number(studentDisciplineId))) {
            return false;
        }
    }

    // Check student status filter (ONLINE/OFFLINE)
    if (filters.student_status && Array.isArray(filters.student_status) && filters.student_status.length > 0) {
        const studentStatus = student.registered_via;
        if (!studentStatus) {
            return false;
        }
        const normalizedStatus = String(studentStatus).toUpperCase();
        const normalizedFilters = filters.student_status.map(s => String(s).toUpperCase());
        if (!normalizedFilters.includes(normalizedStatus)) {
            return false;
        }
    }

    // Check institute filter (Super Admin only)
    if (filters.institute_id !== undefined && filters.institute_id !== null && filters.institute_id !== '') {
        const studentInstituteId = student.institute_id;
        if (!studentInstituteId || Number(studentInstituteId) !== Number(filters.institute_id)) {
            return false;
        }
    }

    // All filters passed
    return true;
};

/**
 * Filter an array of students based on user filters
 * @param {Array} students - Array of student objects
 * @param {Object} filters - User filters object (optional, will use localStorage if not provided)
 * @returns {Array} Filtered array of students
 */
export const filterStudents = (students, filters = null) => {
    if (!Array.isArray(students)) {
        return [];
    }

    // Get filters from parameter or localStorage
    const userFilters = filters || getUserFilters();
    
    // If no filters, return all students
    if (!userFilters) {
        return students;
    }

    // Filter students
    return students.filter(student => studentMatchesFilters(student, userFilters));
};

/**
 * Get filter summary for display
 * @param {Object} filters - User filters object (optional, will use localStorage if not provided)
 * @returns {string} Human-readable filter summary
 */
export const getFilterSummary = (filters = null) => {
    const userFilters = filters || getUserFilters();
    
    if (!userFilters) {
        return 'No filters applied (showing all students)';
    }

    const parts = [];

    if (userFilters.country_id && Array.isArray(userFilters.country_id) && userFilters.country_id.length > 0) {
        parts.push(`Countries: ${userFilters.country_id.join(', ')}`);
    }

    if (userFilters.discipline_id && Array.isArray(userFilters.discipline_id) && userFilters.discipline_id.length > 0) {
        parts.push(`Disciplines: ${userFilters.discipline_id.join(', ')}`);
    }

    if (userFilters.student_status && Array.isArray(userFilters.student_status) && userFilters.student_status.length > 0) {
        parts.push(`Status: ${userFilters.student_status.join(', ')}`);
    }

    if (userFilters.institute_id !== undefined && userFilters.institute_id !== null && userFilters.institute_id !== '') {
        parts.push(`Institute ID: ${userFilters.institute_id}`);
    }

    if (parts.length === 0) {
        return 'No filters applied (showing all students)';
    }

    return `Filters: ${parts.join(' | ')}`;
};

/**
 * Check if user has any filters set
 * @param {Object} filters - User filters object (optional, will use localStorage if not provided)
 * @returns {boolean} True if user has filters
 */
export const hasFilters = (filters = null) => {
    const userFilters = filters || getUserFilters();
    
    if (!userFilters || typeof userFilters !== 'object') {
        return false;
    }

    return (
        (userFilters.country_id && Array.isArray(userFilters.country_id) && userFilters.country_id.length > 0) ||
        (userFilters.discipline_id && Array.isArray(userFilters.discipline_id) && userFilters.discipline_id.length > 0) ||
        (userFilters.student_status && Array.isArray(userFilters.student_status) && userFilters.student_status.length > 0) ||
        (userFilters.institute_id !== undefined && userFilters.institute_id !== null && userFilters.institute_id !== '')
    );
};

export default {
    getUserFilters,
    setUserFilters,
    studentMatchesFilters,
    filterStudents,
    getFilterSummary,
    hasFilters
};
