import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getJobById } from "@/lib/api/jobs";
import { mapJobToDetailItem } from "@/lib/utils/detail";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <DetailPage
      item={mapJobToDetailItem(job)}
      relatedTitle="Similar Jobs"
      relatedItems={[]}
    />
  );
}
