export interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  qualification: string;
  vacancies: number;
  deadline: string;
  status: string;
  description: string;
}

const jobs: JobItem[] = [
  {
    id: "job-001",
    title: "Public Sector Clerk",
    department: "Department of Posts",
    location: "Delhi",
    qualification: "Graduate",
    vacancies: 312,
    deadline: "2026-07-05",
    status: "Open",
    description: "Clerical role in postal service with training and benefits.",
  },
  {
    id: "job-002",
    title: "Forest Ranger Trainee",
    department: "Forest Department",
    location: "Madhya Pradesh",
    qualification: "Graduate in Science",
    vacancies: 84,
    deadline: "2026-06-22",
    status: "Closing Soon",
    description: "Environmental protection and conservation role in forest reserves.",
  },
];

export function getAllJobs(): JobItem[] {
  return jobs;
}

export function getJobById(id: string): JobItem | undefined {
  return jobs.find((job) => job.id === id);
}
