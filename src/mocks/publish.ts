import { PublishChannel, PublishSnapshot } from "@/types";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";
import { uuid } from "@/utils/uuid";
import { appendActivity } from "./activity";

const SNAPSHOT_KEY = "publish-snapshots";
const VERSION_KEY = "publish-versions";

function now() {
  return new Date().toISOString();
}

export async function recordPublish(channel: PublishChannel, payload: unknown) {
  await delay();
  const versions = readStorage<Record<string, number>>(VERSION_KEY, {});
  const nextVersion = (versions[channel] ?? 0) + 1;
  versions[channel] = nextVersion;
  writeStorage(VERSION_KEY, versions);

  const snapshot: PublishSnapshot = {
    id: uuid(),
    channel,
    version: nextVersion,
    payload,
    publishedAt: now(),
    publishedBy: "Demo User",
    createdAt: now(),
    updatedAt: now(),
    updatedBy: "Demo User",
  };

  const snapshots = readStorage<PublishSnapshot[]>(SNAPSHOT_KEY, []);
  snapshots.unshift(snapshot);
  writeStorage(SNAPSHOT_KEY, snapshots);

  await appendActivity({
    action: "PUBLISH",
    entityType: channel,
    entityId: snapshot.id,
    note: `Version ${nextVersion}`,
  });

  return snapshot;
}

export function listSnapshots(channel: PublishChannel) {
  const snapshots = readStorage<PublishSnapshot[]>(SNAPSHOT_KEY, []);
  return snapshots.filter((item) => item.channel === channel);
}

export function getLatestSnapshot(channel: PublishChannel) {
  return listSnapshots(channel)[0] ?? null;
}

export function getVersionMap() {
  return readStorage<Record<string, number>>(VERSION_KEY, {});
}
