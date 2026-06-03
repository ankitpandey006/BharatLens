import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getExamById } from "@/lib/api/exams";
import { mapExamToDetailItem } from "@/lib/utils/detail";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const exam = await getExamById(id);

  if (!exam) {
    notFound();
  }

  return (
    <DetailPage
      item={mapExamToDetailItem(exam)}
      relatedTitle="Similar Exams"
      relatedItems={[]}
    />
  );
}
