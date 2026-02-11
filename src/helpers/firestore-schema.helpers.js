import { firestoreSchemas } from '../schemas/firestore.schemas.js';

const validatePrimitive = (fieldName, rule, value) => {
  if (rule.type === 'string') {
    if (typeof value !== 'string') return `${fieldName} must be a string`;
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName} must be at least ${rule.minLength} characters`;
    }
    if (rule.pattern && !(new RegExp(rule.pattern).test(value))) {
      return `${fieldName} has invalid format`;
    }
    if (rule.enum && !rule.enum.includes(value)) {
      return `${fieldName} must be one of: ${rule.enum.join(', ')}`;
    }
  }

  if (rule.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return `${fieldName} must be a number`;
    }
    if (rule.min !== undefined && value < rule.min) return `${fieldName} must be >= ${rule.min}`;
    if (rule.max !== undefined && value > rule.max) return `${fieldName} must be <= ${rule.max}`;
  }

  if (rule.type === 'array') {
    if (!Array.isArray(value)) return `${fieldName} must be an array`;
    if (rule.items?.type === 'string' && value.some((item) => typeof item !== 'string')) {
      return `${fieldName} must be an array of strings`;
    }
  }

  return null;
};

const validateObject = (fieldName, rule, value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return `${fieldName} must be an object`;
  }

  const missing = (rule.required || []).filter((requiredField) => value[requiredField] === undefined);
  if (missing.length) {
    return `${fieldName} is missing required fields: ${missing.join(', ')}`;
  }

  for (const [nestedFieldName, nestedRule] of Object.entries(rule.properties || {})) {
    const nestedValue = value[nestedFieldName];

    if (nestedValue === undefined) {
      if (!nestedRule.optional && (rule.required || []).includes(nestedFieldName)) {
        return `${fieldName}.${nestedFieldName} is required`;
      }
      continue;
    }

    if (nestedRule.type === 'object') {
      const error = validateObject(`${fieldName}.${nestedFieldName}`, nestedRule, nestedValue);
      if (error) return error;
      continue;
    }

    const primitiveError = validatePrimitive(`${fieldName}.${nestedFieldName}`, nestedRule, nestedValue);
    if (primitiveError) return primitiveError;
  }

  return null;
};

export const validateCollectionPayload = (collectionName, payload) => {
  const schema = firestoreSchemas[collectionName];

  if (!schema) {
    throw new Error(`Schema not found for collection: ${collectionName}`);
  }

  const missingRequired = schema.required.filter((field) => payload[field] === undefined);
  if (missingRequired.length) {
    return {
      isValid: false,
      errors: [`Missing required fields: ${missingRequired.join(', ')}`]
    };
  }

  const errors = [];

  for (const [fieldName, rule] of Object.entries(schema.properties)) {
    const value = payload[fieldName];

    if (value === undefined) {
      if (!rule.optional && schema.required.includes(fieldName)) {
        errors.push(`${fieldName} is required`);
      }
      continue;
    }

    if (rule.type === 'object') {
      const objectError = validateObject(fieldName, rule, value);
      if (objectError) errors.push(objectError);
      continue;
    }

    const primitiveError = validatePrimitive(fieldName, rule, value);
    if (primitiveError) errors.push(primitiveError);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAndThrow = (collectionName, payload) => {
  const result = validateCollectionPayload(collectionName, payload);
  if (!result.isValid) {
    throw new Error(`${collectionName} validation failed: ${result.errors.join('; ')}`);
  }
};
