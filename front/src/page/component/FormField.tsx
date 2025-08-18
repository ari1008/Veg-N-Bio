// components/FormField.tsx
// components/FormField.tsx
import type {ReactNode} from "react";

export function FormField({
                              label,
                              error,
                              children,
                          }: { label?: string; error?: string; children: ReactNode }) {
    return (
        <div className="relative space-y-2">
            {label && <label className="label text-base-content">{label}</label>}

            {error && (
                <div className="absolute -top-2 right-0 translate-y-[-100%]">
          <span className="badge badge-error gap-2" role="alert">
            ⚠️ <span className="max-w-[18rem] truncate">{error}</span>
          </span>
                </div>
            )}

            {children}
            {error && <p className="text-error text-sm">{error}</p>}
        </div>
    );
}
