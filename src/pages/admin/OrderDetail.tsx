import { useEffect, useState } from "react";
import { OrderProvider, useOrder } from "../../context/OrderContext";
import { useParams } from "react-router-dom";
import { OrderDetail as OrderDetailInterface } from "../../types/order";
import { AlertCircle, TrainTrack } from "lucide-react";
import { useStock, StockProvider } from "../../context/StockContext";

interface NFCMessage {
  timestamp: string;
  records: Array<{
    recordType: string;
    data: string;
  }>;
}

function Page() {
  const { getOrderDetail, storeSerialNumber, orderUpdate } = useOrder();
  const { getSNUrl } = useStock();
  const { id } = useParams();

  const [detail, setDetails] = useState<OrderDetailInterface | object>({
    items: [],
  });
  const [errorMessage, setError] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [nfcLoading, setNfcLoading] = useState<boolean>(false);
  const [writingState, setWritingState] = useState<boolean>(false);
  const [messages, setMessages] = useState<NFCMessage[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [serialUrl, setSerialUrl] = useState<string>("");
  const [item, setItem] = useState<object>({});
  const [targetModal, setTargetModal] = useState<string>({});

  useEffect(function () {
    fetchOrderDetail();
    if ("NDEFReader" in window) {
      setSupported(true);
    }
  }, []);

  const fetchOrderDetail = () => {
    getOrderDetail({ order_id: parseInt(id) }).then((response: any) => {
      console.log(response.items);
      setDetails(response);
    });
  };

  const checkSerialNumberMatch = async (item: object) => {
    setItem({ ...item, item });
    setModalState(true, "item");
    if (!supported) return;
    try {
      const ndef = new (window as any).NDEFReader();
      ndef.scan();
      setWritingState(true);
      ndef.addEventListener("reading", async function (message, serialNumber) {
        const record = Array.from(message.records).map((record: any) => {
          let data = "";
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder();
            data = textDecoder.decode(record.data);
          }

          return {
            data,
          };
        });
        alert(record);
        // storeSerialNumber({
        //   order_id: item.order_id,
        //   item_id: item.id,
        //   serial_number: record.data,
        // })
        //   .then((response) => {
        //     console.log("test");
        //   })
        //   .catch((apiError) => {
        //     throw new Error(apiError.message);
        //   });
      });
    } catch (error) {
      setError("Error accessing NFC: " + (error as Error).message);
    }
    // storeSerialNumberOrder(item);
  };

  const storeSerialNumberOrder = async (item: object) => {};

  const readNFC = async () => {
    if (!supported) return;
    try {
      const ndef = new (window as any).NDEFReader();
      ndef.scan();
      setNfcLoading(true);
      await setError("");
      setModalState(true, "readNFC");
      ndef.addEventListener(
        "reading",
        async ({ message, serialNumber }: any) => {
          const records = Array.from(message.records).map((record: any) => {
            let data = "";
            if (record.recordType === "text" || record.recordType === "url") {
              const textDecoder = new TextDecoder();
              data = textDecoder.decode(record.data);
            }
            return {
              recordType: record.recordType,
              data: data,
            };
          });
          setMessages([
            {
              timestamp: new Date().toLocaleString(),
              records,
            },
          ]);

          setNfcLoading(false);
        }
      );
    } catch (error) {
      setError("Error accessing NFC: " + (error as Error).message);
    }
  };

  const writeToTag = async () => {
    if (!supported || !item.serial_number.trim()) return;
    setError("");
    try {
      const ndef = new (window as any).NDEFReader();
      setWritingState(true);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("NFC tag not detected within 4 seconds"));
        }, 4000); // 4 seconds
      });

      // Race the NFC write operation against the timeout
      await Promise.race([
        ndef.write({
          records: [
            {
              recordType: "text",
              data: item.serial_number.trim(),
            },
          ],
        }),
        timeoutPromise,
      ]);

      setWritingState(false);
    } catch (error) {
      setWritingState(false);
      setError("Error writing to NFC: " + (error as Error).message);
    }
  };

  function setModalState(state: boolean, target?: string) {
    setTargetModal(target);
    if (state == true) {
      document?.getElementById("my_modal_1").showModal();
    } else {
      fetchOrderDetail();
      document?.getElementById("my_modal_1").close();
    }
  }

  const closeModal = () => {
    setLoading(false);
    setWritingState(false);
    setModalState(false);
  };

  return (
    <>
      <div className="w-full mx-auto h-full px-4 py-12 overflow-hidden">
        {loading && (
          <div className="absolute h-full w-full max-w-md bg-white opacity-45 flex items-center content-center">
            <span className="loading loading-dots loading-sm mx-auto"></span>
          </div>
        )}
        <hr />
        {!supported ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-400 mr-2" />
              <p className="text-yellow-700">
                Web NFC is not supported in your browser. Please use Chrome for
                Android.
              </p>
            </div>
          </div>
        ) : (
          <>Supported</>
        )}
        <button
          className="btn btn-primary btn-square btn-block mx-auto p-3 my-3 "
          onClick={readNFC}
        >
          Check Data Tag
        </button>
        <div className="border-2 px-4 py-3 border-gray-100 shadow-md bg-white">
          <span className="float-right">{detail?.order_number}</span>
          <span>Order Number : </span>
          <br />
          <span className="float-right"> {detail?.customer_name}</span>
          <span>Customer Name : </span>
          <br />
          <span className="float-right">{detail?.customer_email}</span>
          <span>Email :</span> <br />
          <span className="float-right">{detail?.created_at}</span>
          <span>Order At : {detail?.created_at}</span>
          <br />
          <span className="float-right">
            {detail?.total_scan} / {detail?.total_item}
          </span>
          <span>Total Scan :</span>
        </div>
        <div className="max-h-full overflow-auto my-3">
          {detail?.items.length > 0 &&
            detail?.items.map((item) => (
              <div
                className="border border-gray-200 shadow p-4 bg-white my-2"
                key={item.id}
              >
                <div className="w-full">
                  <span className="float-right">{item.name}</span>
                  <span className="">Name</span>
                  <br />
                  <span className="float-right">{item.variant}</span>
                  <span className="">Variant</span>
                  <br />
                  <span className="float-right">{item.size}</span>
                  <span className="">Size</span>
                  <br />
                  <span className="float-right">
                    {item.total_scan} / {item.qty}
                  </span>
                  <span className="">Total Scan</span>
                  <br />
                </div>
                <button
                  className="btn btn-primary btn-square btn-block mx-auto p-3 my-3 "
                  onClick={(item) => checkSerialNumberMatch(item)}
                >
                  Scan Item
                </button>
              </div>
            ))}
        </div>

        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="bg-red-50 border-l-4 border-green-400 p-4 my-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-green-400 mr-2" />
                  <p className="text-green-900">{successMessage}</p>
                </div>
              </div>
            )}
            {targetModal === "item" && (
              <div className="w-full my-2">
                Serial Number : {item?.serial_number} <br />
                {serialUrl ? "SerialUrl :" + serialUrl : ""}
              </div>
            )}
            {writingState && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                <div className="flex flex-col items-center">
                  <p className="text-red-700">
                    Please, Stick the nfc back to the phone
                  </p>
                  <br />
                  <span className="loading loading-bars loading-lg my-3"></span>
                </div>
              </div>
            )}
            {targetModal === "readNFC" && (
              <div className="d-flex">
                {messages && (
                  <>
                    <div className="d-flex flex-row">
                      Information About Tag :
                    </div>
                    {nfcLoading ? (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                        <div className="flex flex-col items-center">
                          <p className="text-red-700">Approach an NFC Tag</p>
                          <br />
                          <span className="loading loading-bars loading-lg my-3"></span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full mt-3 border-gray-200 bg-gray-200">
                        {messages.map((msg, idx) => (
                          <div key={idx} className="rounded-lg p-4 ">
                            <p className="text-sm text-gray-500 mb-2">
                              {msg.timestamp}
                            </p>
                            {msg.records.map((record, recordIdx) => (
                              <div key={recordIdx} className="mb-2 last:mb-0">
                                <p className="text-sm font-medium text-gray-600">
                                  Type: {record.recordType}
                                </p>
                                <p className="text-gray-800 break-all">
                                  Data: {record.data}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              {targetModal === "item" && (
                <button
                  className={"btn" + serialUrl ? "d-none" : ""}
                  onClick={writeToTag}
                >
                  Start Scan
                </button>
              )}
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </>
  );
}

function OrderDetail() {
  return (
    <OrderProvider>
      <StockProvider>
        <Page />
      </StockProvider>
    </OrderProvider>
  );
}

export default OrderDetail;
