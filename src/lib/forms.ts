import { submitWeb3Form } from "@/lib/web3forms";

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const CONTACT_SUBJECT = "Umówienie wizyty — żłobek Misie Tulisie";

function contactMessage(data: ContactSubmission): string {
  const lines = [`Imię i nazwisko: ${data.name}`, `E-mail: ${data.email}`];
  const phone = data.phone.trim();
  if (phone) lines.push(`Telefon: ${phone}`);
  lines.push("", data.message);
  return lines.join("\n");
}

export async function submitContact(data: ContactSubmission) {
  return submitWeb3Form({
    subject: CONTACT_SUBJECT,
    from_name: data.name,
    name: data.name,
    email: data.email,
    replyto: data.email,
    message: contactMessage(data),
    phone: data.phone.trim(),
  });
}
