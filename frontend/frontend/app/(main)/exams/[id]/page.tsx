import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getDetailByCategoryAndId } from "@/data/detailContent";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const detail = getDetailByCategoryAndId("exams", id);

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
