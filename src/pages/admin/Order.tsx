import { useState, useEffect } from "react";
import { OrderLists } from "../../types/order";
import { OrderProvider, useOrder } from "../../context/OrderContext";
import { NavLink, Router } from "react-router-dom";
import OrderinDetail from "./OrderInDetail";

function Page() {
  const { getOrder } = useOrder();
  const [orderList, setOrderlist] = useState<OrderLists>([]);
  const [page, setPage] = useState(1);
  const [length, setLength] = useState(5);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  function onSearchChange(e) {
    setSearch(e.target.value);
  }

  function onNextPageClick(e) {
    console.log(page);
    setPage((prev) => (prev == orderList.last_page ? prev : page + 1));
  }

  function onPrevPageClick(e) {
    console.log(page);
    setPage((prev) => (prev == 1 ? 1 : page - 1));
  }

  function onStartDateChange(e) {
    setStartDate(e.target.value);
  }
  function onEndDateChange(e) {
    setEndDate(e.target.value);
  }
  function onLengthChange(e) {
    setLength(e.target.value);
  }

  function fetchOrderList(params) {
    getOrder(params).then((response: any) => {
      setOrderlist(response);
    });
  }
  useEffect(() => {
    fetchOrderList({
      page,
      length,
      search,
      startDate,
      endDate,
    });
    setLoading(false);
  }, [page, length, search, startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"></button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              Order Lists
            </h2>
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-green-600"></p>
            </div>

            <hr />
            <div className="relative  ">
              {loading && (
                <>
                  <div className="absolute h-full w-full max-w-md bg-white opacity-45 flex items-center content-center">
                    <span className="loading loading-dots loading-sm mx-auto"></span>
                  </div>
                </>
              )}
              <Column orders={orderList.data} />
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
                disabled={page === orderList.last_page}
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

function Column({ orders }) {
  return (
    <>
      {Object(orders).length > 0 &&
        Object(orders).map((order?: any) => (
          <NavLink to={`/order/${order.id}`} key={order.id}>
            <div
              className="p-2 border border-2 shadow-md my-2 relative"
              key={order.id}
            >
              <p className="float-right">{order.created_at}</p>
              <p className="capitalize">{order.order_number}</p>
              <p className="capitalize">{order.customer_name}</p>
              <p>{order.customer_phone}</p>
              <p className="m-0">
                Total Scanned : {order.total_scan} / {order.total_item}
              </p>
            </div>
          </NavLink>
        ))}
    </>
  );
}

export function Order() {
  return (
    <OrderProvider>
      <Page />
    </OrderProvider>
  );
}
