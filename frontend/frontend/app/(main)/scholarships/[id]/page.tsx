import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getDetailByCategoryAndId } from "@/data/detailContent";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const { id } = await params;
  const detail = getDetailByCategoryAndId("scholarships", id);

  if (!detail) {
    notFound();
  }

  return (
    <DetailPage
      item={detail.item}
      relatedTitle={detail.relatedTitle}
      relatedItems={detail.related}
    />
  );
}
