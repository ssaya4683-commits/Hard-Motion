export type Table<T=unknown,K=number> = { count(): Promise<number>; toArray(): Promise<T[]>; orderBy(key: string): { reverse(): { toArray(): Promise<T[]> } }; add(item: T): Promise<K>; bulkAdd(items: T[]): Promise<void>; update(id: K, item: Partial<T>): Promise<void>; delete(id: K): Promise<void> };
export declare class Dexie { constructor(name: string); version(v: number): { stores(schema: Record<string,string>): void }; transaction(mode: string, a: unknown, b: unknown, cb: () => Promise<void>): Promise<void>; }
export default Dexie;
