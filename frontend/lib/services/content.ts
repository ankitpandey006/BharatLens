/**
 * Content service — fetches real data from BharatLens backend APIs.
 * Falls back to dummy data only for development/fallback purposes.
 */
import * as schemesApi from "@/lib/api/schemes";
import * as jobsApi from "@/lib/api/jobs";
import * as scholarshipsApi from "@/lib/api/scholarships";
import * as examsApi from "@/lib/api/exams";
import * as savedItemsApi from "@/lib/api/saved-items";
import * as notificationsApi from "@/lib/api/notifications";

/**
 * Fetch schemes from backend, fallback to dummy data
 */
export async function getSchemes() {
  return await schemesApi.getSchemes();
}

export async function getScholarships() {
  return await scholarshipsApi.getScholarships();
}

export async function getJobs() {
  return await jobsApi.getJobs();
}

export async function getExams() {
  return await examsApi.getExams();
}

export async function getSavedItems(): Promise<any[]> {
  return await savedItemsApi.getSavedItems();
}

export async function getNotifications(): Promise<any[]> {
  return await notificationsApi.getNotifications();
}

