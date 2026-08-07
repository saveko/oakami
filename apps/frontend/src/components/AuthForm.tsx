'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface AuthFormField {
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  required?: boolean;
}

interface AuthFormProps {
  fields: AuthFormField[];
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  submitLabel: string;
  error?: string | null;
  isLoading?: boolean;
}

// Validation rules
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters
  return password.length >= 8;
};

export default function AuthForm({
  fields,
  onSubmit,
  submitLabel,
  error,
  isLoading = false,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    if (!value && fields.find(f => f.name === name)?.required) {
      return 'This field is required';
    }

    if (name === 'email' && value && !validateEmail(value)) {
      return 'Please enter a valid email address';
    }

    if (name === 'password' && value && !validatePassword(value)) {
      return 'Password must be at least 8 characters';
    }

    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error is handled by caller
    }
  };

  // Group fields into responsive grid (2 columns for first 2 fields if type is text/not email/password)
  const shouldGridFirstTwo = fields.length > 2 &&
    fields[0]?.type === 'text' &&
    fields[1]?.type === 'text';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm" role="alert">
          {error}
        </div>
      )}

      {shouldGridFirstTwo ? (
        <div className="grid grid-cols-2 gap-4">
          {fields.slice(0, 2).map((field) => (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              required={field.required}
              error={touched[field.name] && !!validationErrors[field.name]}
              errorMessage={validationErrors[field.name]}
              disabled={isLoading}
            />
          ))}
        </div>
      ) : null}

      {shouldGridFirstTwo
        ? fields.slice(2).map((field) => (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              required={field.required}
              error={touched[field.name] && !!validationErrors[field.name]}
              errorMessage={validationErrors[field.name]}
              disabled={isLoading}
            />
          ))
        : fields.map((field) => (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder}
              required={field.required}
              error={touched[field.name] && !!validationErrors[field.name]}
              errorMessage={validationErrors[field.name]}
              disabled={isLoading}
            />
          ))}

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={isLoading}
        isLoading={isLoading}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
