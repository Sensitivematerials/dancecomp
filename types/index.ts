export interface Routine {
  id: string;
  event_slug: string;
  number: string;
  studio: string;
  title: string;
  division: string;
  checked_in: boolean;
  ready: boolean;
  on_stage: boolean;
  completed: boolean;
  check_in_time: string | null;
  dancers: string | null;
  age_group: string | null;
  music_file: string | null;
  notes: string | null;
  has_prop: boolean;
  scratched?: boolean;
  created_at: string;
}

export type RoutineStatus = "not-here" | "checked" | "ready" | "stage" | "completed";

export function getStatus(r: Routine): RoutineStatus {
  if (r.on_stage)   return "stage";
  if (r.completed)  return "completed";
  if (r.ready)      return "ready";
  if (r.checked_in) return "checked";
  return "not-here";
}

export interface ChatMessage {
  id: string;
  event_slug: string;
  sender: "emcee" | "backstage";
  text: string;
  created_at: string;
}
