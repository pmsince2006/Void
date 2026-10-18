import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  placeholder = 'SEARCH ARCHIVE // CODE, SILHOUETTE, DROP',
  onChange,
  onSearch,
  className = '',
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!isControlled) setInternalValue(newVal);
    onChange?.(newVal);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <div className={`relative flex items-center border-b border-[#111111] ${className}`}>
      <Search className="w-4 h-4 text-[#111111] shrink-0 mr-3" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent py-3 pr-8 text-xs font-mono tracking-wider text-[#111111] placeholder-[#777777] focus:outline-none uppercase"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1 text-[#777777] hover:text-[#111111] transition-colors p-1"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
