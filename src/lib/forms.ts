import { submitWeb3Form } from "@/lib/web3forms";

export type RecruitmentSubmission = {
  childName: string;
  birthDate: string;
  startDate: string;
  hours: string;
  guardianName: string;
  phone: string;
  email: string;
  notes: string;
};

const RECRUITMENT_SUBJECT = "Formularz rekrutacyjny — żłobek Misie Tulisie";

function recruitmentMessage(data: RecruitmentSubmission): string {
  const lines = [
    `Imię i nazwisko dziecka: ${data.childName}`,
    `Data urodzenia dziecka: ${data.birthDate}`,
    `Planowany termin rozpoczęcia: ${data.startDate}`,
    `Planowane godziny pobytu: ${data.hours}`,
    `Imię i nazwisko opiekuna: ${data.guardianName}`,
    `Numer kontaktowy opiekuna: ${data.phone}`,
    `Adres e-mail opiekuna: ${data.email}`,
  ];
  if (data.notes.trim()) {
    lines.push(`Uwagi: ${data.notes.trim()}`);
  }
  return lines.join("\n");
}

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

export async function submitRecruitment(data: RecruitmentSubmission): Promise<boolean> {
  const result = await submitWeb3Form({
    subject: RECRUITMENT_SUBJECT,
    from_name: data.guardianName,
    name: data.guardianName,
    email: data.email,
    replyto: data.email,
    message: recruitmentMessage(data),
    child_name: data.childName,
    birth_date: data.birthDate,
    start_date: data.startDate,
    hours: data.hours,
    guardian_name: data.guardianName,
    phone: data.phone,
    notes: data.notes.trim(),
  });
  return result.ok;
}
