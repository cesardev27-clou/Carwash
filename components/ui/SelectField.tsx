"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  error,
  required,
  disabled,
}: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "field-input appearance-none bg-surface",
          !value && "text-muted/70",
          error && "border-danger focus:border-danger focus:ring-danger/20"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
