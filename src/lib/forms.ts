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

/**
 * Wysyłka zgłoszeń nie jest jeszcze skonfigurowana (brak adresu odbiorcy).
 * Do czasu podpięcia wysyłki zwraca `false`, a formularz pokazuje uczciwy komunikat.
 * Danych nie wolno nigdzie logować ani zapisywać.
 */
export async function submitRecruitment(_data: RecruitmentSubmission): Promise<boolean> {
  return false;
}
