export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validate(validatableInput: Validatable): ValidationResult {
  const errors: string[] = [];
  
  if (validatableInput.required) {
    if (validatableInput.value.toString().trim().length === 0) {
      errors.push("This field is required");
    }
  }
  
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    if (validatableInput.value.length < validatableInput.minLength) {
      errors.push(`Must be at least ${validatableInput.minLength} characters long`);
    }
  }
  
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    if (validatableInput.value.length > validatableInput.maxLength) {
      errors.push(`Must be no more than ${validatableInput.maxLength} characters long`);
    }
  }
  
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    if (validatableInput.value < validatableInput.min) {
      errors.push(`Must be at least ${validatableInput.min}`);
    }
  }
  
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    if (validatableInput.value > validatableInput.max) {
      errors.push(`Must be no more than ${validatableInput.max}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

