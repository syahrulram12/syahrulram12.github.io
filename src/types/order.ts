export interface OrderLists {
  current_page: number;
  data?: [
    {
      id: 1;
      order_number: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      customer_address: string;
      status: string;
      status_scan: string;
      created_at: string;
      updated_at: string;
      total_item: string;
      scan_by: string;
      delivery_addresses: string;
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

export interface OrderDetail {
  id: 2;
  order_number: string;
  customer_name: string;
  total_item: number;
  customer_phone: number;
  customer_email: string;
  status_order: string;
  status_scan: string;
  items: Array<{
    id: number;
    order_id: number;
    product_id: number;
    name: string;
    variant: string;
    qty: number;
    size: string;
    inventory_id: number;
    total_scan: number;
    variant_name: string;
  }>;
}

export interface storeSerialNumberRequest {
  order_id: string;
  item_id: number;
  serial_number: number;
}

export interface orderUpdateRequest {
  serial_number: string;
}

export interface OrderListRequest {
  page: number;
  length: number;
  search: string;
  startDate: string;
  endDate: string;
}

export interface OrderDetailRequest {
  order_id: number;
}
