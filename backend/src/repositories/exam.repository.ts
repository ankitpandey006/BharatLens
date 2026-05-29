export interface ExamItem {
  id: string;
  title: string;
  examBody: string;
  level: string;
  applicationWindow: string;
  notificationDate: string;
  status: string;
  description: string;
}

const exams: ExamItem[] = [
  {
    id: "exam-001",
    title: "State Public Service Commission Exam",
    examBody: "PSC",
    level: "State",
    applicationWindow: "2026-06-01 to 2026-06-21",
    notificationDate: "2026-05-10",
    status: "Open",
    description: "Recruitment exam for multiple state government administrative positions.",
  },
  {
    id: "exam-002",
    title: "National Eligibility Test",
    examBody: "UGC",
    level: "National",
    applicationWindow: "2026-07-10 to 2026-07-30",
    notificationDate: "2026-06-15",
    status: "Upcoming",
    description: "Eligibility exam for junior research fellowships and assistant professor roles.",
  },
];

export function getAllExams(): ExamItem[] {
  return exams;
}

export function getExamById(id: string): ExamItem | undefined {
  return exams.find((exam) => exam.id === id);
}
