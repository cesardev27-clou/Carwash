"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "password";
  inputMode?: "text" | "numeric" | "email" | "tel";
  autoCapitalize?: "none" | "characters" | "words";
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  onBlur?: () => void;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  type = "text",
  inputMode,
  autoCapitalize,
  autoComplete,
  autoFocus,
  maxLength,
  onBlur,
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        // El placeholder desaparece al enfocar y reaparece al perder foco sin contenido.
        placeholder={focused ? "" : placeholder}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChange={(e) => onChange(e.target.value)}
        className={cn("field-input", error && "border-danger focus:border-danger focus:ring-danger/20")}
      />
      {error ? (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
