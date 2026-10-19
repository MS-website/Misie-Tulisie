const WEB3FORMS_SUBMIT_URL = "https://api.web3forms.com/submit";

export function web3formsAccessKey(): string | undefined {
  const raw = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type Web3FormsJson = {
  success?: boolean;
  message?: string;
};

export type Web3FormsResult = {
  ok: boolean;
  message?: string;
};

export async function submitWeb3Form(fields: Record<string, string>): Promise<Web3FormsResult> {
  const accessKey = web3formsAccessKey();
  if (!accessKey) {
    return { ok: false, message: "Brak konfiguracji wysyłki formularza." };
  }

  const body = new FormData();
  body.append("access_key", accessKey);
  for (const [name, value] of Object.entries(fields)) {
    body.append(name, value);
  }

  try {
    const response = await fetch(WEB3FORMS_SUBMIT_URL, { method: "POST", body });
    const data = (await response.json()) as Web3FormsJson;
    if (data.success === true) return { ok: true };
    return {
      ok: false,
      message: data.message ?? "Serwer odrzucił wysyłkę.",
    };
  } catch {
    return { ok: false, message: "Błąd połączenia z serwerem wysyłki." };
  }
}
