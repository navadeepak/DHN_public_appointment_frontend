import { io } from "socket.io-client";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import axios from "axios";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import { useEffect, useRef, useState } from "react";
import { Axiosinstance, AxiosinstanceseconderyBackend } from "../../utilites/AxiosInstance";

dayjs.extend(isToday);
dayjs.extend(relativeTime);

const ChatWindow = ({ clinicId = "DHN-C-0006", clinicName = "Clinic", onClose }) => {
    const [user, setUser] = useState({});
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // Request Notification Permission
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const sendBrowserNotification = (title, body) => {
        if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
            new Notification(title, { body, icon: "/dhn_logo.png" });
        }
    };

    // Load user from sessionStorage and Sync with Backend
    useEffect(() => {
        let active = true;
        let internalSocket = null;

        const initializeChat = async () => {
            try {
                // 1. Get DHN User from Session Storage
                const storedUser = sessionStorage.getItem("user");
                if (!storedUser) return;

                const dhnUser = JSON.parse(storedUser);

                // 2. Sync with Central Hub Backend (Port 3008)
                const syncRes = await AxiosinstanceseconderyBackend.post("patientregistration/sync", {
                    clinicId,
                    DHN_ID: dhnUser._id || dhnUser.id,
                    name: dhnUser.name,
                    email: dhnUser.email,
                    phone: dhnUser.phno || dhnUser.phone
                });

                if (!active) return;

                const syncedPatient = syncRes.data.patient;
                const patientId = syncedPatient.patientId;
                const patientName = syncedPatient.patientName;

                setUser({ patientId, patientName, clinicId });

                // 3. Connect to Central Socket (Port 3008)
                const SOCKET_URL = "https://dependencyfordhn.dentalhealthnet.com";

                internalSocket = io(SOCKET_URL, {
                    auth: {
                        userType: "patient",
                        clinicId,
                        patientId,
                        patientName,
                    },
                    transports: ["websocket", "polling"],
                });

                setSocket(internalSocket);

                internalSocket.on("connect", () => {
                    console.log("Connected to Chat for Clinic:", clinicId);
                    if (active) setIsConnected(true);
                });

                internalSocket.on("disconnect", () => {
                    if (active) setIsConnected(false);
                });

                internalSocket.on("doctor:message", (msg) => {
                    if (active) {
                        sendBrowserNotification(`Message from ${clinicName}`, msg.message);
                        setMessages((prev) => [...prev, msg]);
                    }
                });

                internalSocket.on("message:received", (msg) => {
                    if (active && msg.sender === "doctor") {
                        // Avoid duplication if doctor:message also fires
                        setMessages((prev) => {
                            const exists = prev.some(m => m.timestamp === msg.timestamp && m.message === msg.message);
                            return exists ? prev : [...prev, msg];
                        });
                    }
                });

                internalSocket.on("message:sent", (msg) => {
                    if (active) setMessages((prev) => [...prev, msg]);
                });

                // Fetch History from Central Hub
                try {
                    const historyRes = await AxiosinstanceseconderyBackend.get(`patient-chat/messages/${clinicId}/${patientId}`);
                    if (active) setMessages(historyRes.data);
                } catch (e) {
                    console.error("Failed to load history", e);
                }

            } catch (error) {
                console.error("Chat Initialization Error:", error);
            }
        };

        // Reset state for new clinic
        setMessages([]);
        setIsConnected(false);

        initializeChat();

        return () => {
            active = false;
            if (internalSocket) {
                internalSocket.close();
            }
        };
    }, [clinicId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputMessage.trim() || !socket) return;

        socket.emit("message:send", {
            message: inputMessage,
        });

        setInputMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getDateLabel = (dateStr) => {
        const date = dayjs(dateStr);
        if (date.isToday()) return "Today";
        return date.format("MMM D, YYYY");
    };

    const groupedMessages = messages.reduce((groups, message) => {
        const date = dayjs(message.timestamp).format("YYYY-MM-DD");
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div className="flex flex-col h-[500px] w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-blue-600 px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Icon icon="solar:hospital-bold" width="20" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-sm">{clinicName}</h2>
                        <span className="flex items-center gap-1 text-[10px] text-blue-100">
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-amber-400'}`} />
                            {isConnected ? 'Online' : 'Connecting...'}
                        </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors">
                    <Icon icon="solar:close-circle-bold" width="24" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && !isConnected && (
                    <div className="text-center mt-10 opacity-60">
                        <p className="text-gray-500 text-xs">Connecting to support...</p>
                    </div>
                )}

                {Object.keys(groupedMessages).map((date) => (
                    <div key={date} className="space-y-4">
                        <div className="flex justify-center">
                            <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase">
                                {getDateLabel(date)}
                            </span>
                        </div>

                        {groupedMessages[date].map((msg, idx) => {
                            const isMe = msg.sender === 'patient';
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm text-sm
                                    ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                        <p className="leading-relaxed">{msg.message}</p>
                                        <span className={`text-[10px] mt-1 block text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {dayjs(msg.timestamp).format("h:mm A")}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className={`p-2 rounded-full transition-all ${inputMessage.trim() ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
                    >
                        <Icon icon="solar:plain-bold" width="20" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
