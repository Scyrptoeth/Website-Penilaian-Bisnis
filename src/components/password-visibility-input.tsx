"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordVisibilityInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
};

export function PasswordVisibilityInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
}: PasswordVisibilityInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const visibilityLabel = isVisible ? `Sembunyikan ${label}` : `Tampilkan ${label}`;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <span className="password-input-wrap">
        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          spellCheck={false}
          required={required}
        />
        <button
          className="password-visibility-button"
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={visibilityLabel}
          title={visibilityLabel}
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </div>
  );
}
