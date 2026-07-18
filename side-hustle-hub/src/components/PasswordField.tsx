import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { assessPassword, type PasswordAssessment } from "../lib/password-policy";

type PasswordFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  /** Show strength meter + checklist (for new passwords). */
  showStrength?: boolean;
  className?: string;
  "data-testid"?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  required,
  disabled,
  showStrength = false,
  className,
  "data-testid": testId,
}: PasswordFieldProps) {
  const genId = useId();
  const inputId = id || genId;
  const [visible, setVisible] = useState(false);
  const assessment: PasswordAssessment = assessPassword(value);

  return (
    <div className={`form-group password-field-wrap${className ? ` ${className}` : ""}`} style={{ margin: 0 }}>
      <label className="form-label" htmlFor={inputId} style={{ fontSize: "0.9375rem" }}>
        {label}
      </label>
      <div className="password-field">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-input"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          data-testid={testId}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="password-strength" aria-live="polite">
          <div className="password-strength-bar" data-strength={assessment.strength}>
            <span />
            <span />
            <span />
          </div>
          <p className="password-strength-label" data-strength={assessment.strength}>
            {assessment.strength === "weak"
              ? "Weak"
              : assessment.strength === "medium"
                ? "Medium"
                : assessment.strength === "strong"
                  ? "Strong"
                  : ""}
            {assessment.message ? ` — ${assessment.message}` : ""}
          </p>
          <ul className="password-strength-checks">
            {assessment.checks.map((c) => (
              <li key={c.id} data-ok={c.ok ? "1" : "0"}>
                {c.ok ? "✓" : "○"} {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
