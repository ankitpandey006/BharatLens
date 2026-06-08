import Link from "next/link";
import { BellRing, ExternalLink, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DetailItemData } from "@/components/details/types";

interface DetailSidebarProps {
  item: DetailItemData;
}

export default function DetailSidebar({ item }: DetailSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <Card>
        <CardContent className="space-y-3 pt-5">
          <Link href={item.applyUrl ?? "#"} target="_blank" rel="noreferrer">
            <Button className="w-full min-h-[44px]">Apply Now</Button>
          </Link>
          <Link href={item.websiteUrl ?? "#"} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full min-h-[44px]">
              Official Website <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </Link>
          <Link href={item.pdfUrl ?? "#"} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full min-h-[44px]">
              Download PDF <FileDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Insights</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 pt-4 text-sm text-[#111827]/80">
          <div className="rounded-lg bg-[#F5F3EE] px-3 py-2">
            <p className="font-medium text-[#1A3C6E]">Deadline</p>
            <p>{item.deadline}</p>
          </div>
          <div className="rounded-lg bg-[#DBEAFE] px-3 py-2">
            <p className="font-medium text-[#1A3C6E]">AI Match Score</p>
            <p className="text-lg font-semibold">{item.matchScore}%</p>
          </div>
          <Button variant="secondary" className="w-full min-h-[44px]">
            Notify Me <BellRing className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
