import type { ExamListItem } from "@/types";

export const dummyExams: ExamListItem[] = [
  {
    id: "exam-1",
    title: "UPSC Civil Services Examination",
    conductingBody: "Union Public Service Commission",
    category: "National",
    examDate: "2026-10-05",
    applicationDeadline: "2026-06-12",
    status: "Open",
    description:
      "Recruitment exam for All India and Central Civil Services including IAS, IPS and IFS.",
  },
  {
    id: "exam-2",
    title: "SSC Combined Graduate Level",
    conductingBody: "Staff Selection Commission",
    category: "National",
    examDate: "2026-09-08",
    applicationDeadline: "2026-06-20",
    status: "Closing Soon",
    description:
      "Graduate-level recruitment exam for Group B and Group C posts across central government departments.",
  },
  {
    id: "exam-3",
    title: "RRB NTPC",
    conductingBody: "Railway Recruitment Board",
    category: "Railways",
    examDate: "2026-11-16",
    applicationDeadline: "2026-08-02",
    status: "Upcoming",
    description:
      "Non-technical popular category exam for clerical, traffic and station management positions in Indian Railways.",
  },
  {
    id: "exam-4",
    title: "State Judicial Services Preliminary",
    conductingBody: "State Public Service Commission",
    category: "Law",
    examDate: "2026-04-25",
    applicationDeadline: "2026-03-30",
    status: "Closed",
    description:
      "Entry-level exam for state judiciary roles with objective papers focused on procedural and substantive law.",
  },
];
