/**
 * Utilities for detecting changes in form data
 */

/**
 * Deep compare two objects for equality
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Boolean} - True if objects are equal
 */
export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' || 
    typeof obj2 !== 'object' || 
    obj1 === null || 
    obj2 === null
  ) {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1).filter(k => !k.startsWith('_'));
  const keys2 = Object.keys(obj2).filter(k => !k.startsWith('_'));
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Detect changes between original and current form data
 * @param {Object} current - Current form state
 * @param {Object} original - Original form state
 * @returns {Object} - Object with changes information
 */
export function detectChanges(current, original) {
  const hasChanges = !deepEqual(current, original);
  
  // Create a list of changed fields for display
  const changedFields = [];
  if (hasChanges) {
    // Compare top-level fields
    Object.keys(current).forEach(key => {
      if (!key.startsWith('_') && !deepEqual(current[key], original[key])) {
        changedFields.push(key);
      }
    });
  }
  
  return {
    hasChanges,
    changedFields
  };
}
