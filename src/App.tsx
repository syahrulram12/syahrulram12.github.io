import React from "react";
import { Nfc, AlertCircle, Edit3, LogOut, Package } from "lucide-react";
import { env } from "./config/env";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthForm } from "./components/AuthForm";
import { StockManagement } from "./components/StockManagement";

interface NFCMessage {
  timestamp: string;
  records: Array<{
    recordType: string;
    data: string;
  }>;
}

function NFCApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"nfc" | "stock">("nfc");
  const [supported, setSupported] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<NFCMessage[]>([]);
  const [error, setError] = React.useState<string>("");
  const [writeText, setWriteText] = React.useState<string>("");
  const [writeStatus, setWriteStatus] = React.useState<string>("");

  React.useEffect(() => {
    if ("NDEFReader" in window) {
      setSupported(true);
    }
  }, []);

  const startScanning = async () => {
    if (!supported) return;
    document.getElementById("my_modal_1").showModal();
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      setError("");

      ndef.addEventListener(
        "reading",
        async ({ message, serialNumber }: any) => {
          const records = Array.from(message.records).map((record: any) => {
            let data = "";

            if (record.recordType === "text") {
              const textDecoder = new TextDecoder();
              data = textDecoder.decode(record.data);
            } else {
              data = record.data;
            }

            return {
              recordType: record.recordType,
              data: data,
            };
          });

          try {
            const token = localStorage.getItem("auth_token");
            await fetch(`${env.apiUrl}/serial-number-link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                serialNumber,
              }),
            });
          } catch (apiError) {
            console.error("Failed to send scan data to API:", apiError);
          }

          setMessages((prev) => [
            {
              timestamp: new Date().toLocaleString(),
              records,
            },
            ...prev,
          ]);
        }
      );
    } catch (error) {
      setError("Error accessing NFC: " + (error as Error).message);
    }
  };

  const writeToTag = async () => {
    if (!supported || !writeText.trim()) return;

    try {
      const ndef = new (window as any).NDEFReader();
      setWriteStatus("Waiting for NFC tag...");

      await ndef.write({
        records: [
          {
            recordType: "text",
            data: writeText,
          },
        ],
      });

      try {
        const token = localStorage.getItem("auth_token");
        await fetch(`${env.apiUrl}/nfc/write`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: writeText,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (apiError) {
        console.error("Failed to log write operation:", apiError);
      }

      setWriteStatus("Successfully wrote to NFC tag!");
      setWriteText("");
      setTimeout(() => setWriteStatus(""), 3000);
    } catch (error) {
      setError("Error writing to NFC: " + (error as Error).message);
      setWriteStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {activeTab === "nfc" ? (
              <Nfc className="w-12 h-12 text-blue-600 mr-4" />
            ) : (
              <Package className="w-12 h-12 text-blue-600 mr-4" />
            )}
            <h1 className="text-4xl font-bold text-gray-900">
              {activeTab === "nfc" ? "NFC Reader & Writer" : "Stock Management"}
            </h1>
          </div>
        </div>
        <div className="flex mb-8">
          <div className="flex justify-between items-center space-x-4 w-screen">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("nfc")}
                className={`${
                  activeTab === "nfc"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Nfc className="w-5 h-5 mr-2" />
                NFC Operations
              </button>
              <button
                onClick={() => setActiveTab("stock")}
                className={`${
                  activeTab === "stock"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Package className="w-5 h-5 mr-2" />
                Stock Management
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "nfc" ? (
          <>
            {!supported ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-yellow-400 mr-2" />
                  <p className="text-yellow-700">
                    Web NFC is not supported in your browser. Please use Chrome
                    for Android.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={startScanning}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Nfc className="w-5 h-5 mr-2" />
                  Start NFC Scan
                </button>
                <dialog id="my_modal_1" className="modal">
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">
                      Press ESC key or click the button below to close
                    </p>
                    <div className="modal-action">
                      <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Edit3 className="w-6 h-6 mr-2" />
                    Write to NFC Tag
                  </h2>
                  <div className="space-y-4">
                    <textarea
                      value={writeText}
                      onChange={(e) => setWriteText(e.target.value)}
                      placeholder="Enter text to write to NFC tag..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <button
                      onClick={writeToTag}
                      disabled={!writeText.trim()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Write to Tag
                    </button>
                    {writeStatus && (
                      <p className="text-center text-sm font-medium text-green-600">
                        {writeStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Scanned Messages</h2>
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No NFC tags scanned yet. Tap an NFC tag to read its content.
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
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
            </div>
          </>
        ) : (
          <StockManagement />
        )}
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <NFCApp /> : <AuthForm />;
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
