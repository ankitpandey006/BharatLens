import { getAllSchemes, getSchemeById, type SchemeItem } from "../repositories/scheme.repository";

export function fetchAllSchemes(): SchemeItem[] {
  return getAllSchemes();
}

export function fetchSchemeById(id: string): SchemeItem | undefined {
  return getSchemeById(id);
}
