import Dexie, { type Table } from "dexie";

export interface Product {
  id?: number;
  kode: string;
  barcode: string;
  nama: string;
  kategori: string;
  merek: string;
  warna: string;
  ukuran: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimum: number;
  foto?: string;
  createdAt: Date;
}

export interface Sale {
  id?: number;
  nomor: string;
  tanggal: Date;
  total: number;
}

export class HardMotionDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;

  constructor() {
    super("HardMotionDB");

    this.version(1).stores({
      products:
        "++id,kode,barcode,nama,kategori,merek,ukuran,stok",
      sales:
        "++id,nomor,tanggal,total",
    });
  }
}

export const db = new HardMotionDB();