import { uuid } from "@/utils/uuid";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";
import { appendActivity } from "./activity";
import { BaseEntity, OrderedEntity } from "@/types";

function now() {
  return new Date().toISOString();
}

type EntityWithOptionalOrder<T> = Omit<T, keyof BaseEntity> & Partial<BaseEntity>;

export function createCrudRepo<T extends BaseEntity>(options: {
  storageKey: string;
  entity: string;
}) {
  const { storageKey, entity } = options;

  const list = async () => {
    await delay();
    return readStorage<T[]>(storageKey, []);
  };

  const get = async (id: string) => {
    await delay();
    const items = readStorage<T[]>(storageKey, []);
    return items.find((item) => item.id === id) ?? null;
  };

  const create = async (input: EntityWithOptionalOrder<T>) => {
    await delay();
    const items = readStorage<T[]>(storageKey, []);
    const entityRecord: T = {
      ...input,
      id: uuid(),
      createdAt: now(),
      updatedAt: now(),
      updatedBy: "Demo User",
    } as T;
    items.push(entityRecord);
    writeStorage(storageKey, items);
    await appendActivity({ action: "CREATE", entityType: entity, entityId: entityRecord.id });
    return entityRecord;
  };

  const update = async (id: string, input: Partial<T>) => {
    await delay();
    const items = readStorage<T[]>(storageKey, []);
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error(`${entity} not found`);
    const updated: T = {
      ...items[idx],
      ...input,
      updatedAt: now(),
      updatedBy: "Demo User",
    };
    items[idx] = updated;
    writeStorage(storageKey, items);
    await appendActivity({ action: "UPDATE", entityType: entity, entityId: id });
    return updated;
  };

  const remove = async (id: string) => {
    await delay();
    const items = readStorage<T[]>(storageKey, []);
    writeStorage(
      storageKey,
      items.filter((item) => item.id !== id)
    );
    await appendActivity({ action: "DELETE", entityType: entity, entityId: id });
  };

  return { list, get, create, update, remove };
}

export function createOrderedRepo<T extends OrderedEntity>(options: {
  storageKey: string;
  entity: string;
}) {
  const base = createCrudRepo<T>(options);

  const reorder = async (ids: string[]) => {
    await delay();
    const items = readStorage<T[]>(options.storageKey, []);
    const idToItem = new Map(items.map((item) => [item.id, item] as const));
    const reordered: T[] = ids.map((id, idx) => {
      const item = idToItem.get(id);
      if (!item) throw new Error("Missing item");
      return { ...item, orderIndex: idx, updatedAt: now(), updatedBy: "Demo User" } as T;
    });
    writeStorage(options.storageKey, reordered);
    await appendActivity({ action: "REORDER", entityType: options.entity, entityId: ids.join(",") });
    return reordered;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return base.update(id, { isActive } as Partial<T>);
  };

  const create = async (input: EntityWithOptionalOrder<T>) => {
    const items = readStorage<T[]>(options.storageKey, []);
    const orderIndex = typeof (input as T).orderIndex === "number" ? (input as T).orderIndex : items.length;
    return base.create({ ...input, orderIndex } as EntityWithOptionalOrder<T>);
  };

  const replaceAll = async (items: T[]) => {
    await delay();
    writeStorage(
      options.storageKey,
      items.map((item, index) => ({
        ...item,
        orderIndex: index,
        updatedAt: now(),
        updatedBy: "Demo User",
      }))
    );
  };

  return { ...base, reorder, toggleActive, create, replaceAll };
}
