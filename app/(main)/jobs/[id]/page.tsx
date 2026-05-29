import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getDetailByCategoryAndId } from "@/data/detailContent";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const detail = getDetailByCategoryAndId("jobs", id);

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
