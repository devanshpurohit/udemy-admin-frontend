/**
 * Safely extracts localized text from a data object based on user language preference.
 * 
 * @param {Object|String} data - The localized object (e.g., {en: "Text", kn: "ಪಠ್ಯ"}) or a plain string (legacy).
 * @param {String} userLanguage - The user's preferred language (e.g., 'English' or 'Kannada').
 * @returns {String} The localized text or a fallback.
 */
export const getLangText = (data, userLanguage = 'English') => {
    if (!data) return "";
    
    // If it's already a string, just return it (legacy data)
    if (typeof data === 'string') return data;
    
    // Default to 'en' if language is English or unspecified
    const langCode = userLanguage === 'Kannada' ? 'kn' : 'en';
    
    // If the preferred translation exists, return it
    if (data[langCode]) return data[langCode];
    
    // Fallback: If 'en' exists, use it
    if (data['en']) return data['en'];
    
    // Final fallback: Use the first available key or empty string
    const keys = Object.keys(data);
    if (keys.length > 0) return data[keys[0]];
    
    return "";
};
