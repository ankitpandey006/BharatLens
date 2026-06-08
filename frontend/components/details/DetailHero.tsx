"use client";

import { motion } from "framer-motion";
import { Bookmark, Clock3, MapPin, Sparkles, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DetailItemData } from "@/components/details/types";

interface DetailHeroProps {
  item: DetailItemData;
}

function statusTone(status: DetailItemData["status"]): "info" | "warning" | "muted" | "default" {
  if (status === "Open") return "info";
  if (status === "Closing Soon") return "warning";
  if (status === "Closed") return "muted";
  return "default";
}

export default function DetailHero({ item }: DetailHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-[#E5E7EB] bg-white">
        <div className="h-1.5 bg-linear-to-r from-[#1A3C6E] via-[#3B82F6] to-[#9BB6E5]" />
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{item.categoryLabel}</Badge>
            <Badge tone={statusTone(item.status)}>{item.status}</Badge>
          </div>
          <h1 className="text-xl font-bold text-[#1A3C6E] sm:text-2xl lg:text-3xl">{item.title}</h1>
          <div className="grid gap-2 text-sm text-[#111827]/75 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-[#111827]">Provider:</span> {item.provider}
            </p>
            <p>
              <span className="font-semibold text-[#111827]">Deadline:</span> {item.deadline}
            </p>
            {item.amountOrBenefit ? (
              <p>
                <span className="font-semibold text-[#111827]">Amount/Benefit:</span>{" "}
                {item.amountOrBenefit}
              </p>
            ) : null}
            {item.location ? (
              <p className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 shrink-0 text-[#3B82F6]" />
                <span>{item.location}</span>
              </p>
            ) : null}
            {item.examLevel ? (
              <p>
                <span className="font-semibold text-[#111827]">Exam Level:</span> {item.examLevel}
              </p>
            ) : null}
          </div>
          <p className="text-sm leading-7 text-[#111827]/80">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button variant="outline" className="min-h-[44px]">Save</Button>
            <Button variant="secondary" className="min-h-[44px]">
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button size="icon" variant="ghost" aria-label="Bookmark item" className="min-h-[44px] min-w-[44px]">
              <Bookmark className="h-5 w-5 text-[#1A3C6E]" />
            </Button>
            <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#F5F3EE] px-3 py-1.5 text-xs font-medium text-[#1A3C6E]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Updated daily</span>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
