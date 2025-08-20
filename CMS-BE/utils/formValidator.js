/**
 * Validates form data against the form schema
 * @param {Object} formData - The submitted form data
 * @param {Array} formFields - The form fields schema
 * @returns {Array} - Array of validation errors, empty if no errors
 */
exports.validateFormData = (formData, formFields) => {
  const errors = [];
  
  formFields.forEach(field => {
    if (!field.isActive) return; // Skip inactive fields
    
    const value = formData[field.name];
    const validation = field.validation;
    
    // Check if field should be shown based on conditional logic
    let shouldShow = true;
    if (field.conditional && field.conditional.dependsOn) {
      const dependentValue = formData[field.conditional.dependsOn];
      
      if (field.conditional.showWhen !== undefined) {
        shouldShow = dependentValue === field.conditional.showWhen;
      } else if (field.conditional.hideWhen !== undefined) {
        shouldShow = dependentValue !== field.conditional.hideWhen;
      }
    }
    
    // Only validate fields that should be shown
    if (shouldShow) {
      // Required validation
      if (validation.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: validation.customMessage || `${field.label} is required`
        });
        return; // Skip other validations if required field is missing
      }
      
      // If value is provided, validate it
      if (value !== undefined && value !== null && value !== '') {
        // Pattern validation (regex)
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          errors.push({
            field: field.name,
            message: validation.customMessage || `${field.label} format is invalid`
          });
        }
        
        // String length validation
        if (typeof value === 'string') {
          if (validation.minLength && value.length < validation.minLength) {
            errors.push({
              field: field.name,
              message: validation.customMessage || `${field.label} must be at least ${validation.minLength} characters`
            });
          }
          
          if (validation.maxLength && value.length > validation.maxLength) {
            errors.push({
              field: field.name,
              message: validation.customMessage || `${field.label} must be no more than ${validation.maxLength} characters`
            });
          }
        }
        
        // Number validation
        if (typeof value === 'number') {
          if (validation.min !== undefined && value < validation.min) {
            errors.push({
              field: field.name,
              message: validation.customMessage || `${field.label} must be at least ${validation.min}`
            });
          }
          
          if (validation.max !== undefined && value > validation.max) {
            errors.push({
              field: field.name,
              message: validation.customMessage || `${field.label} must be no more than ${validation.max}`
            });
          }
        }
      }
    }
  });
  
  return errors;
};