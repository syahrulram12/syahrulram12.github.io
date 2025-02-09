import { useState, useEffect } from "react";
import { StockLists } from "../../types/stock";
import { StockProvider, useStock } from "../../context/StockContext";
import { NavLink } from "react-router-dom";

function Page() {
  const { getStock } = useStock();
  const [stockList, setStocklist] = useState<StockLists>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function onNextPageClick(e) {
    console.log(page);
    setPage((prev) => (prev == stockList.last_page ? prev : page + 1));
  }

  function onPrevPageClick(e) {
    console.log(page);
    setPage((prev) => (prev == 1 ? 1 : page - 1));
  }

  function fetchStockList(params) {
    getStock(params).then((response: any) => {
      setStocklist(response);
    });
  }
  useEffect(() => {
    fetchStockList({
      page,
      length: 5,
    });
    setLoading(false);
  }, [page, length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto ">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 flex items-center mt-3">
              Stock In Lists
            </h2>
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-green-600"></p>
            </div>

            <hr />
            <div className="relative">
              {loading && (
                <>
                  <div className="absolute h-full w-full max-w-md bg-white opacity-45 flex items-center content-center">
                    <span className="loading loading-dots loading-sm mx-auto"></span>
                  </div>
                </>
              )}
              <Column stocks={stockList.data} />
            </div>
            <div className="flex content-between my-2 w-full">
              <button
                className="btn bg-gray-600 text-white me-auto"
                onClick={onPrevPageClick}
                disabled={page === 0 || page === 1}
              >
                Prev
              </button>
              <button
                className="btn bg-blue-600 text-white ms-auto"
                onClick={onNextPageClick}
                disabled={page === stockList.last_page}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ stocks }) {
  return (
    <>
      {Object(stocks).length > 0 &&
        Object(stocks).map((stock?: any) => (
          <NavLink to={`/stock/${stock.id}`} key={stock.id}>
            <div className="border border-2 shadow-md my-2 p-2" key={stock.id}>
              <p className="float-right">
                Production Date : {stock.production_date}
              </p>
              <p className="m-0"> {stock.product_name}</p>
              <p className="m-0 float-right">Stock At : {stock.stock_at}</p>
              <p className="m-0">Variant :{stock.variant}</p>
              <p className="m-0 float-right">
                Total Scanned : {stock.scanned} / {stock.total}
              </p>
              <p className="m-0">Size : {stock.size}</p>
            </div>
          </NavLink>
        ))}
    </>
  );
}

export function StockIn() {
  return (
    <StockProvider>
      <Page />
    </StockProvider>
  );
}
