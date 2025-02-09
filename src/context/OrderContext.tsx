import React, { createContext, useContext, useState } from "react";
import { env } from "../config/env";
import {
  GetSNUrlRequest,
  orderUpdateRequest,
  OrderListRequest,
  OrderDetailRequest,
  storeSerialNumberRequest,
} from "../types/order";
import { useAuth } from "./AuthContext";

interface OrderContextType {
  getOrder: (parameter: OrderListRequest) => Promise<void>;
  getOrderDetail: (parameter: OrderDetailRequest) => Promise<void>;
  orderUpdate: (parameter: orderUpdateRequest) => Promise<void>;
  storeSerialNumber: (data: storeSerialNumberRequest) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { changeLoading } = useAuth();
  const token = localStorage.getItem("auth_token");
  const getOrder = async (parameter: OrderListRequest) => {
    const params = new URLSearchParams();
    // changeLoading(true);
    for (const key in parameter) {
      params.append(key, parameter[key]);
    }

    try {
      const response = await fetch(
        `${env.apiUrl}/order?` + new URLSearchParams(params),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      throw Promise.resolve(error);
    } finally {
      changeLoading(false);
    }
  };

  const getOrderDetail = async (parameter: OrderDetailRequest) => {
    try {
      const response = await fetch(
        `${env.apiUrl}/order/${parameter.order_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      changeLoading(false);
    }
  };

  const orderUpdate = async (data: orderUpdateRequest) => {
    try {
      const response = await fetch(`${env.apiUrl}/order/${data?.order_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = response.json();
        return data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      changeLoading(false);
    }
  };

  const storeSerialNumber = async (data: storeSerialNumberRequest) => {
    try {
      const response = await fetch(`${env.apiUrl}/order/store-serial-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = response.json();
        return data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      changeLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        getOrder,
        getOrderDetail,
        orderUpdate,
        storeSerialNumber,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
