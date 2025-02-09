import { useEffect, useState } from "react";
import { StockProvider, useStock } from "../../context/StockContext";
import { useParams } from "react-router-dom";
import { StockDetail } from "../../types/stock";
import { AlertCircle } from "lucide-react";

interface NFCMessage {
  timestamp: string;
  records: Array<{
    recordType: string;
    data: string;
  }>;
}

function Page() {
  const { getStockDetail, getSNUrl, registerSN } = useStock();
  const { id } = useParams();

  const [detail, setDetails] = useState<StockDetail | object>([]);
  const [notScannedItems, setNotScannedItems] = useState({});
  const [item, setItem] = useState([]);
  const [errorMessage, setError] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [nfcLoading, setNfcLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<NFCMessage[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [serialUrl, setSerialUrl] = useState<string>("");
  const [targetModal, setTargetModal] = useState<string>("");
  useEffect(function () {
    fetchStockDetail();
    if ("NDEFReader" in window) {
      setSupported(true);
    }
  }, []);

  const fetchStockDetail = () => {
    getStockDetail({ stock_id: parseInt(id) }).then((response: any) => {
      setDetails(response);
      filterScannedItems(response.items);
    });
  };

  const filterScannedItems = (items: any) => {
    const newItem = Object(items).filter((item) => item.rfid_status === 0);
    setNotScannedItems(newItem);
  };

  const getDataScan = () => {
    const item = notScannedItems[0];
    setItem(item);
    setLoading(true);
    getSNUrl({ serial_number: item.serial_number })
      .then((response: any) => {
        const records = [
          {
            recordType: "text",
            recordData: item.serial_number,
          },
          {
            recordType: "url",
            recordData: response.url,
          },
        ];
        setSerialUrl(response.url);
        setLoading(false);
        setModalState(true);
      })
      .catch((error) => {
        setError("Failed to send scan data to API:");
      });
  };

  const readNFC = async () => {
    if (!supported) return;
    setNfcLoading(true);
    setModalState(true, "readNFC");
    try {
      const ndef = new (window as any).NDEFReader();
      ndef.scan();
      await setError("");
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
        }
      );
      setNfcLoading(false);
    } catch (error) {
      setError("Error accessing NFC: " + (error as Error).message);
    }
  };

  const writeToTag = async () => {
    if (!supported || !item.serial_number.trim()) return;
    setNfcLoading(true);
    setError("");
    try {
      const ndef = new (window as any).NDEFReader();

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

      registerSN({ serial_number: item.serial_number })
        .then((response: any) => {
          setSuccessMessage("NFC success tag");
          setNfcLoading(false);
          setTimeout(() => {}, 700);
        })
        .catch((error) => {
          throw new Error("Failed to send scan data to API:");
        });

      setNfcLoading(false);
    } catch (error) {
      setNfcLoading(false);
      setError("Error writing to NFC: " + (error as Error).message);
    } finally {
    }
  };

  function setModalState(state: boolean, target: string) {
    setTargetModal(target);
    if (state == true) {
      document?.getElementById("my_modal_1").showModal();
    } else {
      fetchStockDetail();
      document?.getElementById("my_modal_1").close();
    }
  }

  const closeModal = () => {
    setLoading(false);
    setNfcLoading(false);
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
        <div className="d-flex border-2 px-4 py-3 border-gray-100 shadow-md bg-white">
          <div className="w-50">
            <span>Product Name : {detail?.product_name}</span>
            <br />
            <span>Size : {detail?.size}</span>
            <br />
            <span>Variant : {detail?.variant}</span>
          </div>
          <div className="w-50">
            <span>Production Date : {detail.production_date}</span>
            <br />
            <span>Stock At : {detail.stock_at}</span>
            <br />
            <span>
              Total Scan : {detail.scanned} / {detail.total}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-square btn-block mx-auto p-3 my-3 "
          onClick={getDataScan}
        >
          Scan Item
        </button>
        <button
          className="btn btn-primary btn-square btn-block mx-auto p-3 my-3 "
          onClick={readNFC}
        >
          Check Data Tag
        </button>

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
            {targetModal === "readNFC" ? (
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
            ) : (
              <>
                {nfcLoading ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                    <div className="flex flex-col items-center">
                      <p className="text-red-700">Approach an NFC Tag</p>
                      <br />
                      <span className="loading loading-bars loading-lg my-3"></span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full my-2">
                    Serial Number : {item?.serial_number} <br />
                    {serialUrl ? "SerialUrl :" + serialUrl : ""}
                  </div>
                )}
              </>
            )}

            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              <button
                className={"btn" + serialUrl ? "d-none" : ""}
                onClick={writeToTag}
              >
                Start Scan
              </button>
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

function StockinDetail() {
  return (
    <StockProvider>
      <Page />
    </StockProvider>
  );
}

export default StockinDetail;
