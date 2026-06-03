import { notFound } from "next/navigation";
import DetailPage from "@/components/details/DetailPage";
import { getSchemeById } from "@/lib/api/schemes";
import { mapSchemeToDetailItem } from "@/lib/utils/detail";

interface SchemeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const { id } = await params;
  const scheme = await getSchemeById(id);

  if (!scheme) {
    notFound();
  }

  return (
    <DetailPage
      item={mapSchemeToDetailItem(scheme)}
      relatedTitle="Similar Schemes"
      relatedItems={[]}
    />
  );
}
