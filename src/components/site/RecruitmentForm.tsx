import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { contact } from "@/lib/site";
import { submitRecruitment } from "@/lib/forms";
import { cn } from "@/lib/utils";

/* ---------- telefon: krajowy 9-cyfrowy → +48; zagraniczny z + / 00 ---------- */

const COUNTRY_CODES = [
  "351", "353", "354", "356", "357", "358", "359", "370", "371", "372", "373", "374", "375",
  "376", "377", "378", "380", "381", "382", "383", "385", "386", "387", "389", "420", "421", "423",
  "20", "27", "30", "31", "32", "33", "34", "36", "39", "40", "41", "43", "44", "45", "46", "47",
  "48", "49", "51", "52", "53", "54", "55", "56", "57", "58", "60", "61", "62", "63", "64", "65",
  "66", "81", "82", "84", "86", "90", "91", "92", "93", "94", "95", "98", "1", "7",
].sort((a, b) => b.length - a.length);

function groupThrees(digits: string) {
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ");
}

function countryCode(digits: string) {
  return COUNTRY_CODES.find((c) => digits.startsWith(c)) ?? "";
}

function isInternational(raw: string) {
  const t = raw.trim();
  return t.startsWith("+") || /^00\d/.test(t.replace(/\s/g, ""));
}

function formatPhone(raw: string) {
  const t = raw.trim();
  if (!t) return "";
  if (t === "+" || t === "00") return "+";

  if (isInternational(raw)) {
    const digits = raw.replace(/\D/g, "").replace(/^00/, "").slice(0, 15);
    if (!digits) return "+";
    const cc = countryCode(digits);
    const rest = cc ? digits.slice(cc.length) : digits;
    return `+${cc || ""}${rest ? (cc ? " " : "") + groupThrees(rest) : ""}`;
  }

  return groupThrees(raw.replace(/\D/g, "").slice(0, 9));
}

function caretAfterDigits(formatted: string, n: number) {
  if (n <= 0) return formatted.startsWith("+") ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!) && ++seen === n) return i + 1;
  }
  return formatted.length;
}

function phoneError(value: string) {
  const t = value.trim();
  if (!t) return "Podaj numer kontaktowy opiekuna.";
  const digits = t.replace(/\D/g, "");
  if (t.startsWith("+")) {
    if (digits.startsWith("48")) {
      return digits.length === 11 ? "" : "Polski numer musi mieć 9 cyfr po +48.";
    }
    return digits.length >= 8 && digits.length <= 15 ? "" : "Podaj kompletny numer z kierunkowym, np. +44…";
  }
  if (digits.length === 9) return "";
  if (digits.length > 9) return "Dodaj numer kierunkowy (np. +44) albo podaj 9-cyfrowy numer polski.";
  return "Numer polski musi mieć 9 cyfr. Numer zagraniczny zacznij od +.";
}

function phoneForSubmit(value: string) {
  const formatted = value.trim().startsWith("+")
    ? value.trim()
    : value.replace(/\D/g, "").length === 9
      ? `+48 ${groupThrees(value.replace(/\D/g, ""))}`
      : value.trim();
  return formatted.replace(/\s+/g, " ");
}

function PhoneInput({
  value,
  onChange,
  invalid,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  id: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (caret.current === null || !el || document.activeElement !== el) return;
    el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const apply = (raw: string, caretPos: number) => {
    const next = formatPhone(raw);
    const before = raw.slice(0, caretPos).replace(/\D/g, "").length;
    caret.current = caretAfterDigits(next, before);
    onChange(next);
  };

  return (
    <input
      ref={ref}
      id={id}
      name={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      value={value}
      onChange={(e) => apply(e.target.value, e.target.selectionStart ?? e.target.value.length)}
      onBlur={() => {
        if (!value.trim() || value.trim().startsWith("+")) return;
        const digits = value.replace(/\D/g, "");
        if (digits.length === 9) onChange(`+48 ${groupThrees(digits)}`);
      }}
      onKeyDown={(e) => {
        const el = e.currentTarget;
        const start = el.selectionStart ?? 0;
        if (start !== el.selectionEnd) return;
        if (e.key === "Backspace" && value[start - 1] === " ") {
          e.preventDefault();
          apply(value.slice(0, start - 2) + value.slice(start), start - 2);
        } else if (e.key === "Delete" && value[start] === " ") {
          e.preventDefault();
          apply(value.slice(0, start) + value.slice(start + 2), start);
        }
      }}
      className={cn(
        "mt-2 w-full rounded-md border bg-secondary/70 px-4 py-3 text-base outline-none transition-colors focus:border-foreground/40",
        invalid ? "border-destructive" : "border-border",
      )}
    />
  );
}

/* ---------- pola ---------- */

const inputClass =
  "mt-2 w-full rounded-md border border-border bg-secondary/70 px-4 py-3 text-base outline-none transition-colors focus:border-foreground/40 aria-[invalid=true]:border-destructive";

function Field({
  id,
  label,
  error,
  children,
  className,
  required = true,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium leading-snug text-foreground">
        {label}{" "}
        {required ? (
          <>
            <span className="font-normal text-muted-foreground">(pole wymagane)</span>{" "}
            <span className="text-honey">*</span>
          </>
        ) : (
          <span className="font-normal text-muted-foreground">(Opcjonalnie)</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function a11y(id: string, error?: string) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

/* ---------- data: wpis ręczny albo własny kalendarz ---------- */

const MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];
const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

function toISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseISO(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, m! - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m! - 1 || date.getDate() !== d) return null;
  return date;
}

function isoToDisplay(iso: string) {
  const d = parseISO(iso);
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function displayToISO(value: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!m) return null;
  return parseISO(`${m[3]}-${m[2]}-${m[1]}`) ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function yearsAgoISO(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function yearOptions(min?: string, max?: string) {
  const now = new Date().getFullYear();
  const lo = min ? Number(min.slice(0, 4)) : now - 3;
  const hi = max ? Number(max.slice(0, 4)) : now + 4;
  const start = Math.min(lo, hi);
  const end = Math.max(lo, hi);
  return Array.from({ length: end - start + 1 }, (_, i) => end - i);
}

function groupDate(digits: string) {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
}

function DateField({
  id,
  value,
  onChange,
  min,
  max,
  error,
}: {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  error?: string | undefined;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(() => isoToDisplay(value));
  const selected = parseISO(value);
  const [view, setView] = useState(() => selected ?? new Date());

  useLayoutEffect(() => {
    setTyped(isoToDisplay(value));
    const d = parseISO(value);
    if (d) setView(d);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minDate = min ? parseISO(min) : null;
  const maxDate = max ? parseISO(max) : null;
  const disabled = (d: Date) => {
    const iso = toISO(d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const year = view.getFullYear();
  const month = view.getMonth();
  const years = yearOptions(min, max);
  if (!years.includes(year)) years.unshift(year);
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "mt-2 flex items-center rounded-md border bg-secondary/70 transition-colors focus-within:border-foreground/40",
          error ? "border-destructive" : "border-border",
        )}
      >
        <input
          {...a11y(id, error)}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd.mm.rrrr"
          value={typed}
          onChange={(e) => {
            const next = groupDate(e.target.value.replace(/\D/g, ""));
            setTyped(next);
            const iso = displayToISO(next);
            if (iso) onChange(iso);
            else if (!next) onChange("");
          }}
          onBlur={() => {
            if (!typed) {
              onChange("");
              return;
            }
            const iso = displayToISO(typed);
            if (iso) setTyped(isoToDisplay(iso));
            else setTyped(isoToDisplay(value));
          }}
          className="w-full bg-transparent py-3 pr-2 pl-4 text-base outline-none"
        />
        <button
          type="button"
          aria-label="Otwórz kalendarz"
          aria-expanded={open}
          onClick={() => {
            setView(selected ?? minDate ?? maxDate ?? new Date());
            setOpen((v) => !v);
          }}
          className="mr-2 rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-honey"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-40 mt-2 w-[17.5rem] rounded-2xl border border-honey/25 bg-card p-4 shadow-[0_12px_40px_-18px_rgba(80,55,20,0.28)]">
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              aria-label="Poprzedni miesiąc"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-sand hover:text-foreground"
            >
              ‹
            </button>
            <p className="min-w-0 flex-1 text-center font-display text-lg capitalize leading-none">
              {MONTHS[month]}
            </p>
            <button
              type="button"
              aria-label="Następny miesiąc"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-sand hover:text-foreground"
            >
              ›
            </button>
            <label className="sr-only" htmlFor={`${id}-year`}>
              Rok
            </label>
            <select
              id={`${id}-year`}
              value={year}
              onChange={(e) => setView(new Date(Number(e.target.value), month, 1))}
              className="rounded-md border border-border bg-secondary/70 px-1.5 py-1 font-display text-base outline-none focus:border-foreground/40"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[0.7rem] uppercase tracking-wider text-honey">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <span key={`e-${i}`} />;
              const iso = toISO(d);
              const isSelected = value === iso;
              const isToday = toISO(new Date()) === iso;
              const off = disabled(d);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={off}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    "mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    off && "cursor-not-allowed text-muted-foreground/35",
                    !off && !isSelected && "hover:bg-sand",
                    isToday && !isSelected && "ring-1 ring-honey/50",
                    isSelected && "bg-honey text-primary-foreground",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- formularz ---------- */

type Values = {
  childName: string;
  birthDate: string;
  startDate: string;
  hoursFrom: string;
  hoursTo: string;
  guardianName: string;
  phone: string;
  email: string;
  notes: string;
};
type ErrorKey = Exclude<keyof Values, "hoursFrom" | "hoursTo"> | "hours";
type Errors = Partial<Record<ErrorKey, string>>;

const empty: Values = {
  childName: "",
  birthDate: "",
  startDate: "",
  hoursFrom: "",
  hoursTo: "",
  guardianName: "",
  phone: "",
  email: "",
  notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function validate(v: Values): Errors {
  const e: Errors = {};
  const today = todayISO();
  const oldest = yearsAgoISO(3);

  if (!v.childName.trim()) e.childName = "Podaj imię i nazwisko dziecka.";
  if (!v.birthDate) e.birthDate = "Podaj datę urodzenia dziecka.";
  else if (v.birthDate > today) e.birthDate = "Data urodzenia nie może być z przyszłości.";
  else if (v.birthDate < oldest) e.birthDate = "Przyjmujemy dzieci do 3. roku życia.";
  if (!v.startDate) e.startDate = "Podaj planowany termin rozpoczęcia uczęszczania do żłobka.";
  else if (v.startDate < today) e.startDate = "Termin rozpoczęcia nie może być z przeszłości.";
  if (!v.hoursFrom || !v.hoursTo) e.hours = "Podaj godzinę przyprowadzenia i odbioru dziecka.";
  else if (v.hoursFrom >= v.hoursTo) e.hours = "Godzina „do” musi być późniejsza niż godzina „od”.";
  if (!v.guardianName.trim()) e.guardianName = "Podaj imię i nazwisko opiekuna.";
  const phoneMsg = phoneError(v.phone);
  if (phoneMsg) e.phone = phoneMsg;
  if (!v.email.trim()) e.email = "Podaj adres e-mail opiekuna.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Podaj poprawny adres e-mail.";
  return e;
}

type Status = "idle" | "sending" | "sent" | "unavailable";

function NotesField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const styles = getComputedStyle(el);
    const line = parseFloat(styles.lineHeight) || 24;
    const pad =
      parseFloat(styles.paddingTop) +
      parseFloat(styles.paddingBottom) +
      parseFloat(styles.borderTopWidth) +
      parseFloat(styles.borderBottomWidth);
    const empty = pad + line;
    if (!value) {
      el.style.height = `${empty}px`;
      return;
    }
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight + line, empty + line * 5)}px`;
  }, [value]);

  return (
    <textarea
      {...a11y(id)}
      ref={ref}
      rows={1}
      maxLength={1000}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-none overflow-hidden`}
    />
  );
}

export function RecruitmentForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const today = todayISO();
  const oldest = yearsAgoISO(3);

  const update = (field: keyof Values, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setStatus("idle");
    if (touchedSubmit) setErrors(validate(next));
  };

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const found = validate(values);
        flushSync(() => {
          setTouchedSubmit(true);
          setErrors(found);
        });
        if (Object.keys(found).length) {
          form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
          return;
        }
        setStatus("sending");
        const sent = await submitRecruitment({
          childName: values.childName.trim(),
          birthDate: values.birthDate,
          startDate: values.startDate,
          hours: `${values.hoursFrom}–${values.hoursTo}`,
          guardianName: values.guardianName.trim(),
          phone: phoneForSubmit(values.phone),
          email: values.email.trim(),
          notes: values.notes.trim(),
        });
        setStatus(sent ? "sent" : "unavailable");
        if (sent) {
          setValues(empty);
          setTouchedSubmit(false);
        }
      }}
    >
      <div className="rounded-2xl border border-honey/20 bg-card p-6 md:p-10">
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
          <Field id="childName" label="Imię i nazwisko dziecka" error={errors.childName}>
            <input
              {...a11y("childName", errors.childName)}
              type="text"
              maxLength={120}
              value={values.childName}
              onChange={(e) => update("childName", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id="guardianName" label="Imię i nazwisko opiekuna" error={errors.guardianName}>
            <input
              {...a11y("guardianName", errors.guardianName)}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={values.guardianName}
              onChange={(e) => update("guardianName", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id="phone" label="Numer kontaktowy opiekuna" error={errors.phone}>
            <PhoneInput
              id="phone"
              value={values.phone}
              onChange={(v) => update("phone", v)}
              invalid={Boolean(errors.phone)}
            />
          </Field>

          <Field id="email" label="Adres e-mail opiekuna" error={errors.email}>
            <input
              {...a11y("email", errors.email)}
              type="email"
              autoComplete="email"
              maxLength={120}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id="birthDate" label="Data urodzenia dziecka" error={errors.birthDate}>
            <DateField
              id="birthDate"
              value={values.birthDate}
              onChange={(v) => update("birthDate", v)}
              min={oldest}
              max={today}
              error={errors.birthDate}
            />
          </Field>

          <Field
            id="startDate"
            label="Planowany termin rozpoczęcia"
            error={errors.startDate}
          >
            <DateField
              id="startDate"
              value={values.startDate}
              onChange={(v) => update("startDate", v)}
              min={today}
              error={errors.startDate}
            />
          </Field>

          <Field id="hoursFrom" label="Planowane godziny pobytu w żłobku" error={errors.hours}>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">od</span>
              <input
                {...a11y("hoursFrom", errors.hours)}
                type="time"
                step={900}
                value={values.hoursFrom}
                onChange={(e) => update("hoursFrom", e.target.value)}
                className={cn(inputClass, "mt-0")}
              />
              <span className="text-sm text-muted-foreground">do</span>
              <input
                {...a11y("hoursTo", errors.hours)}
                aria-label="Planowane godziny pobytu — do"
                aria-describedby={errors.hours ? "hoursFrom-error" : undefined}
                type="time"
                step={900}
                value={values.hoursTo}
                onChange={(e) => update("hoursTo", e.target.value)}
                className={cn(inputClass, "mt-0")}
              />
            </div>
          </Field>

          <Field id="notes" label="Uwagi" required={false}>
            <NotesField
              id="notes"
              value={values.notes}
              onChange={(v) => update("notes", v)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors duration-500 hover:bg-honey disabled:opacity-60 sm:w-auto"
        >
          Wyślij formularz
        </button>
      </div>

      <div aria-live="polite">
        {status === "sent" && (
          <p className="mt-8 max-w-2xl rounded-md bg-sand p-6 leading-relaxed">
            Dziękujemy! Otrzymaliśmy zgłoszenie i wkrótce się odezwiemy.
          </p>
        )}
        {status === "unavailable" && (
          <p className="mt-8 max-w-2xl rounded-md bg-sand p-6 leading-relaxed">
            Formularz jest poprawnie wypełniony, ale wysyłanie zgłoszeń przez stronę nie jest
            jeszcze dostępne — dane nie zostały nigdzie przesłane. Prosimy o kontakt telefoniczny:{" "}
            <a href={contact.phoneHref} className="link-underline whitespace-nowrap">
              {contact.phone}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
