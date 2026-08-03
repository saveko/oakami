import { useState, useCallback } from 'react';

export interface UseSelectOptions<T = string> {
  initialValue?: T | T[];
  isMulti?: boolean;
  onChange?: (value: T | T[]) => void;
}

export interface UseSelectReturn<T = string> {
  value: T | T[];
  setValue: (value: T | T[]) => void;
  reset: () => void;
  isSelected: (val: T) => boolean;
  toggleSelection: (val: T) => void;
}

export function useSelect<T = string>(
  options?: UseSelectOptions<T>
): UseSelectReturn<T> {
  const { initialValue, isMulti = false, onChange } = options || {};
  const defaultValue = initialValue ?? (isMulti ? ([] as T[]) : ('' as T));

  const [value, setValueState] = useState<T | T[]>(defaultValue);

  const setValue = useCallback(
    (newValue: T | T[]) => {
      setValueState(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const reset = useCallback(() => {
    const resetValue = isMulti ? [] : '';
    setValue(resetValue as T | T[]);
  }, [isMulti, setValue]);

  const isSelected = useCallback(
    (val: T): boolean => {
      if (isMulti && Array.isArray(value)) {
        return value.includes(val);
      }
      return value === val;
    },
    [value, isMulti]
  );

  const toggleSelection = useCallback(
    (val: T) => {
      if (isMulti && Array.isArray(value)) {
        const newValue = value.includes(val)
          ? value.filter((v) => v !== val)
          : [...value, val];
        setValue(newValue);
      } else {
        setValue(val);
      }
    },
    [value, isMulti, setValue]
  );

  return {
    value,
    setValue,
    reset,
    isSelected,
    toggleSelection,
  };
}
