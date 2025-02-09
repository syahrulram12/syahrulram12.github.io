export interface StockLists {
  current_page: number;
  data?: [
    {
      id: number;
      inventory_id: number;
      description: string;
      stock_at: string;
      product_name: string;
      size: string;
      variant: string;
      production_date: number;
      created_by: string;
      scanned: number;
      total: number;
      string: "active" | "disabled";
    }
  ];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: number;
  links?: [{ url?: string; label: string; active: boolean }];
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

export interface StockDetail {
  id: number;
  inventory_id: number;
  description: string;
  stock_at: string;
  product_name: string;
  size: string;
  variant: string;
  production_date: number;
  created_by: string;
  scanned: number;
  total: number;
  string: "active" | "disabled";
  items: [
    {
      serial_number: string;
      rfid_status: number;
      product_id: number;
      size: string;
      variant: string;
    }
  ];
}

export interface GetSNUrlRequest {
  serial_number: string;
}

export interface RegisterSNRequest {
  serial_number: string;
}

export interface StockListRequest {
  page: number;
  length: number;
  search: string;
  startDate: string;
  endDate: string;
}

export interface StockDetailRequest {
  stock_id: number;
}
