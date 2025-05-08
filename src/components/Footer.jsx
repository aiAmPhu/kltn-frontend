import { Info } from "lucide-react";

function Footer() {
    return (
        <footer className="border-t border-gray-200 mt-8 py-6 bg-white">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
                <div className="flex items-center">
                    <img src="/logo192.png" alt="Logo" className="w-12 h-12 mr-4" />
                    <div>
                        <p className="text-gray-600">© 2025 Đại học Tuyển Sinh. All rights reserved.</p>
                    </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer">
                    <Info className="w-6 h-6 text-blue-500" />
                </div>
            </div>
        </footer>
    );
}

export default Footer;
