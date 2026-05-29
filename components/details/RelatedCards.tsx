import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RelatedItem } from "@/components/details/types";

interface RelatedCardsProps {
  title: string;
  items: RelatedItem[];
}

function statusTone(status: RelatedItem["status"]): "info" | "warning" | "muted" | "default" {
  if (status === "Open") return "info";
  if (status === "Closing Soon") return "warning";
  if (status === "Closed") return "muted";
  return "default";
}

export default function RelatedCards({ title, items }: RelatedCardsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[#1A3C6E] sm:text-2xl">{title}</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-sm text-[#111827]/70">
            No related items available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link key={item.id} href={item.href}>
              <Card className="h-full transition duration-300 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-md">
                <CardContent className="space-y-3 pt-5">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  <h3 className="line-clamp-2 text-base font-semibold text-[#1A3C6E]">{item.title}</h3>
                  <p className="text-sm text-[#111827]/70">{item.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
