function Timeline() {
    const events = [
        { date: "01/05/2025", title: "Mở đăng ký nguyện vọng" },
        { date: "30/06/2025", title: "Kỳ thi THPT Quốc gia" },
        { date: "15/07/2025", title: "Công bố kết quả" },
        { date: "30/08/2025", title: "Xác nhận nhập học" },
    ];

    return (
        <section className="bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Lịch tuyển sinh 2025</h2>
                <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600"></div>
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className={`mb-8 flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                        >
                            <div className="w-1/2 px-4">
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                    <p className="text-gray-600">{event.date}</p>
                                </div>
                            </div>
                            <div className="w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Timeline;
