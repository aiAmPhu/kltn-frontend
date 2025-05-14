import React, { useState } from "react";
import { useParams } from "react-router-dom";
// import clsx from "clsx";

// Import các tab component
import Information from "./Information";
import LearningProccess from "./LearningProccess";
import Transcript from "./Transcript";
import Photo from "./Photo";

const UserDetailPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(null); // null = chưa chọn tab

    const tabs = [
        { key: "info", label: "Thông tin" },
        { key: "progress", label: "Quá trình học" },
        { key: "transcript", label: "Học bạ" },
        { key: "photo", label: "Ảnh cần thiết" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-indigo-700">🧑 Chi tiết User: {id}</h1>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold py-3 px-4 rounded-xl text-left shadow"
                        >
                            👉 {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overlay modal */}
            {activeTab && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-xl relative">
                        <button
                            onClick={() => setActiveTab(null)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                        >
                            ✖️
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-indigo-600">
                            📄 {tabs.find((t) => t.key === activeTab)?.label}
                        </h2>

                        <div className="overflow-y-auto max-h-[70vh]">
                            {activeTab === "info" && <Information userId={id} />}
                            {activeTab === "progress" && <LearningProccess userId={id} />}
                            {activeTab === "transcript" && <Transcript userId={id} />}
                            {activeTab === "photo" && <Photo userId={id} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetailPage;
