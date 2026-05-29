import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getDetailByCategoryAndId } from "@/data/detailContent";

interface SchemeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const { id } = await params;
  const detail = getDetailByCategoryAndId("schemes", id);

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
