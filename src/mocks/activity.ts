import { ActivityLogEntry, ActivityAction } from "@/types";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";
import { uuid } from "@/utils/uuid";

const ACTIVITY_KEY = "activity-log";

function now() {
  return new Date().toISOString();
}

export async function appendActivity(params: {
  action: ActivityAction;
  entityType: string;
  entityId: string;
  note?: string;
}) {
  await delay();
  const entries = readStorage<ActivityLogEntry[]>(ACTIVITY_KEY, []);
  const entry: ActivityLogEntry = {
    id: uuid(),
    actor: "Demo User",
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    when: now(),
    note: params.note,
    createdAt: now(),
    updatedAt: now(),
    updatedBy: "Demo User",
  };
  const updated = [entry, ...entries].slice(0, 500);
  writeStorage(ACTIVITY_KEY, updated);
  return entry;
}

export async function listActivity(page = 1, pageSize = 10, action?: ActivityAction) {
  await delay();
  const entries = readStorage<ActivityLogEntry[]>(ACTIVITY_KEY, []);
  const filtered = action ? entries.filter((entry) => entry.action === action) : entries;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return {
    data,
    total: filtered.length,
    page,
    pageSize,
  };
}
