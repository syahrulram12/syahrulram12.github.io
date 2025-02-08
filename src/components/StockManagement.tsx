import { useState, useEffect } from "react";
import { StockLists } from "../types/stock";
import { StockProvider, useStock } from "../context/StockContext";
import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Plus,
  Minus,
} from "lucide-react";

function Page() {
  const { getStock } = useStock();
  const [stockList, setStocklist] = useState<StockLists | object>({
    current_page: 1,
    data: [],
    last_page: 1,
  });
  const [page, setPage] = useState(1);
  const [length, setLength] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchStockList();
    console.log("Test");
  }, []);

  function onSearchChange(e) {
    setSearch(e.target.value);
    fetchStockList();
  }

  function onNextPageClick(e) {
    setPage(page == stockList?.last_page ? page : page + 1);
  }

  function onPrevPageClick(e) {
    setPage(page === 0 ? 0 : e.target.value - 1);
  }

  function onStartDateChange(e) {
    setStartDate(e.target.value);
    fetchStockList();
  }
  function onEndDateChange(e) {
    setEndDate(e.target.value);
    fetchStockList();
  }
  function onLengthChange(e) {
    setLength(e.target.value);
    fetchStockList();
  }

  async function fetchStockList() {
    setStocklist([]);
    await getStock({
      page,
      length,
      search,
      startDate,
      endDate,
    }).then((response: any) => {
      setStocklist(response.data);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"></button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              Write to NFC Tag
            </h2>
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-green-600"></p>
            </div>

            <hr />
            <Column stocks={stockList} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ stocks }) {
  console.log(stocks);
  return (
    <>
      {Object(stocks).map((stock?: any) => (
        <div className="p-2 border border-2 shadow-md my-2" key={stock.id}>
          <div className="float-left">Product Name : {stock.product_name}</div>
          <div className="float-right">Size : {stock.size}</div>
          <div className="float-left">Variant :{stock.variant}</div>
          <div className="float-right">Production Date{stock.production_date}</div>
          <div className="float-left">
            Total Scanned : {stock.scanned} / {stock.total}
          </div>
          <div className="float-right">Stock At : {stock.stock_at}</div>
        </div>
      ))}
    </>
  );
}

export function StockManagement() {
  return (
    <StockProvider>
      <Page />
    </StockProvider>
  );
}
