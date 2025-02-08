import React, { createContext, useContext, useState } from "react";
import { env } from "../config/env";
import {
  GetSNUrlRequest,
  RegisterSNRequest,
  StockListRequest,
  StockDetailRequest,
} from "../types/stock";
import { useAuth } from "./AuthContext";

interface StockContextType {
  getStock: (parameter: StockListRequest) => Promise<void>;
  getStockDetail: (parameter: StockDetailRequest) => Promise<void>;
  getSNUrl: (parameter: GetSNUrlRequest) => Promise<void>;
  registerSN: (data: RegisterSNRequest) => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const { changeLoading } = useAuth();
  const token = localStorage.getItem("auth_token");
  const getStock = async (parameter: StockListRequest) => {
    const params = new URLSearchParams();
    // changeLoading(true);
    for (const key in parameter) {
      params.append(key, parameter[key]);
    }

    try {
      const response = await fetch(`${env.apiUrl}/stockin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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

  const getStockDetail = async (parameter: StockDetailRequest) => {
    try {
      const response = await fetch(
        `${env.apiUrl}/stockin/${parameter.stock_id}`,
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

  const getSNUrl = async (parameter: GetSNUrlRequest) => {
    const parameterQuery = JSON.stringify(parameter);
    try {
      const response = await fetch(
        `${env.apiUrl}/serial-number-url` + new URLSearchParams(parameterQuery),
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

  const registerSN = async (data: RegisterSNRequest) => {
    try {
      const response = await fetch(
        `${env.apiUrl}/register-serial-number?` +
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
      );

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
    <StockContext.Provider
      value={{
        getStock,
        getStockDetail,
        getSNUrl,
        registerSN,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStock must be used within an StockProvider");
  }
  return context;
}
