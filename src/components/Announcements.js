function Announcements() {
    const announcements = [
        { id: 1, title: "Thông báo mở đăng ký nguyện vọng", date: "01/05/2025" },
        { id: 2, title: "Cập nhật lịch thi THPT Quốc gia 2025", date: "30/04/2025" },
        { id: 3, title: "Hướng dẫn nộp hồ sơ trực tuyến", date: "28/04/2025" },
    ];

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Thông báo tuyển sinh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">{ann.title}</h3>
                            <p className="text-gray-600">Ngày: {ann.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Announcements;
