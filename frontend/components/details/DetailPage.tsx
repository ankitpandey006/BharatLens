"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DetailHero from "@/components/details/DetailHero";
import DetailSidebar from "@/components/details/DetailSidebar";
import DocumentsList from "@/components/details/DocumentsList";
import EligibilityList from "@/components/details/EligibilityList";
import InfoSection from "@/components/details/InfoSection";
import RelatedCards from "@/components/details/RelatedCards";
import TimelineSection from "@/components/details/TimelineSection";
import type { DetailItemData, RelatedItem } from "@/components/details/types";

interface DetailPageProps {
  item: DetailItemData;
  relatedTitle: string;
  relatedItems: RelatedItem[];
}

export default function DetailPage({ item, relatedTitle, relatedItems }: DetailPageProps) {
  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <DetailHero item={item} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {item.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <InfoSection title={section.title}>
                  {section.type === "text" && typeof section.content === "string" ? (
                    <p>{section.content}</p>
                  ) : null}

                  {section.type === "list" && Array.isArray(section.content) ? (
                    <ul className="space-y-2">
                      {(section.content as string[]).map((itemValue) => (
                        <li key={itemValue} className="rounded-lg bg-[#F5F3EE] px-3 py-2">
                          {itemValue}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.type === "links" && Array.isArray(section.content) ? (
                    <ul className="space-y-2">
                      {(section.content as Array<{ label: string; href: string }>).map((itemValue) => (
                        <li key={itemValue.href}>
                          <Link
                            href={itemValue.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1A3C6E] underline-offset-4 transition hover:text-[#3B82F6] hover:underline"
                          >
                            {itemValue.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.type === "eligibility" && Array.isArray(section.content) ? (
                    <EligibilityList items={section.content as string[]} />
                  ) : null}

                  {section.type === "documents" && Array.isArray(section.content) ? (
                    <DocumentsList items={section.content as string[]} />
                  ) : null}

                  {section.type === "timeline" && Array.isArray(section.content) ? (
                    <TimelineSection items={section.content as Array<{ label: string; date: string; description?: string }>} />
                  ) : null}
                </InfoSection>
              </motion.div>
            ))}
          </div>

          <DetailSidebar item={item} />
        </div>

        <RelatedCards title={relatedTitle} items={relatedItems} />
      </div>
    </section>
  );
}
