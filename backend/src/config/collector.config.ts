import { RssCollectorConfig } from "../types/collector.types";

export interface DataGovConfig {
  apiKeyEnvVar: string;
  apiUrl: string;
}

export interface CollectorConfig {
  rssSources: RssCollectorConfig[];
  scraperSources: string[];
  rssMaxItems: number;
  scraperMaxItems: number;
  pdfMaxContentLength: number;
  dataGov: DataGovConfig;
  cronExpression: string;
}

export const collectorConfig: CollectorConfig = {
  rssSources: [
    {
      sourceName: "PIB",
      defaultUrl: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    },
    {
      sourceName: "Employment News",
      defaultUrl: "https://employmentnews.gov.in/RssFeed.aspx",
    },
    {
      sourceName: "MyGov",
      defaultUrl: "https://www.mygov.in/feed/",
    },
    {
      sourceName: "India.gov",
      defaultUrl: "https://www.india.gov.in/app/newsfeed/en/rss",
    },
  ],

  scraperSources: ["SSC", "UPSC", "NTA", "AICTE", "UGC", "RRB"],

  rssMaxItems: 50,
  scraperMaxItems: 20,
  pdfMaxContentLength: 120000,

  dataGov: {
    apiKeyEnvVar: "DATA_GOV_API_KEY",
    apiUrl: "https://api.data.gov.in/resource",
  },

  cronExpression: "0 2 * * *", // Daily at 2:00 AM server time
};