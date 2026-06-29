import { ValidationError } from '@nestjs/common';

export const flattenValidationErrors = (
  validationErrors: ValidationError[],
  parentPath = '',
): { field: string; error: string }[] => {
  const errors = [];

  for (const error of validationErrors) {
    const currentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    if (error.constraints) {
      errors.push({
        field: currentPath,
        error:
          error.constraints.isNotEmpty ?? Object.values(error.constraints)[0],
      });
    }
    if (error.children?.length) {
      errors.push(...flattenValidationErrors(error.children, currentPath));
    }
  }
  return errors;
};
