import type { JobListItem } from "@/types";

export const dummyJobs: JobListItem[] = [
  {
    id: "job-1",
    title: "Forest Guard Recruitment",
    organization: "State Forest Department",
    location: "Uttar Pradesh",
    qualification: "12th pass with physical eligibility",
    vacancies: 709,
    deadline: "2026-06-30",
    status: "Open",
    description:
      "Field and forest protection role with district-level postings and physical endurance requirements.",
  },
  {
    id: "job-2",
    title: "Junior Engineer Civil",
    organization: "Public Works Department",
    location: "Madhya Pradesh",
    qualification: "Diploma or degree in Civil Engineering",
    vacancies: 215,
    deadline: "2026-06-18",
    status: "Closing Soon",
    description:
      "Technical engineering role for project supervision, quality checks and public infrastructure execution.",
  },
  {
    id: "job-3",
    title: "Postal Assistant",
    organization: "India Post",
    location: "Multiple States",
    qualification: "Graduate with computer proficiency",
    vacancies: 428,
    deadline: "2026-08-05",
    status: "Upcoming",
    description:
      "Customer service and operations position in postal circles with state-wise vacancy allocation.",
  },
  {
    id: "job-4",
    title: "Village Development Officer",
    organization: "Rural Development Department",
    location: "Rajasthan",
    qualification: "Graduate with local language proficiency",
    vacancies: 356,
    deadline: "2026-05-12",
    status: "Closed",
    description:
      "Supports local governance, welfare implementation and rural reporting at block and village levels.",
  },
];
