import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getScholarshipById } from "@/lib/api/scholarships";
import { mapScholarshipToDetailItem } from "@/lib/utils/detail";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const { id } = await params;
  const scholarship = await getScholarshipById(id);

  if (!scholarship) {
    notFound();
  }

  return (
    <DetailPage
      item={mapScholarshipToDetailItem(scholarship)}
      relatedTitle="Similar Scholarships"
      relatedItems={[]}
    />
  );
}
