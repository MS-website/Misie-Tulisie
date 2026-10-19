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

export async function submitWeb3Form(fields: Record<string, string>): Promise<boolean> {
  const accessKey = web3formsAccessKey();
  if (!accessKey) return false;

  const body = new FormData();
  body.append("access_key", accessKey);
  for (const [name, value] of Object.entries(fields)) {
    body.append(name, value);
  }

  try {
    const response = await fetch(WEB3FORMS_SUBMIT_URL, { method: "POST", body });
    const data = (await response.json()) as Web3FormsJson;
    return data.success === true;
  } catch {
    return false;
  }
}
