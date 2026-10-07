import api from "../../lib/api";
import type { Dashboard } from "./dashboard.types";

export async function getDashboard(): Promise<Dashboard> {
  const response = await api.get<Dashboard>("/dashboard");

  return response.data;
}