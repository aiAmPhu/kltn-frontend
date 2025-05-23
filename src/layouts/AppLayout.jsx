import { useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { Outlet } from "react-router-dom";
import { FaComments, FaHome, FaUniversity, FaGraduationCap, FaListAlt } from 'react-icons/fa';

const menuItems = [
    {
        to: "/",
        icon: <FaHome className="text-lg" />,
        label: "Trang chủ",
    },
    {
        to: "/major",
        icon: <FaUniversity className="text-lg" />,
        label: "Ngành xét tuyển",
    },
    {
        to: "/block",
        icon: <FaGraduationCap className="text-lg" />,
        label: "Khối xét tuyển",
    },
    {
        to: "/criteria",
        icon: <FaListAlt className="text-lg" />,
        label: "Diện xét tuyển",
    },
    {
        to: "/chat",
        icon: <FaComments className="text-lg" />,
        label: "Chat với admin",
    },
    // ... other menu items ...
];

function AppLayout() {
    const location = useLocation();
    const HIDE_HEADER_FOOTER_PATHS = ["/login", "/register/step1", "/register/step2", "/register/step3"];
    const hideHeaderFooter = HIDE_HEADER_FOOTER_PATHS.includes(location.pathname);
    return (
        <div className="min-h-screen flex flex-col">
            {!hideHeaderFooter && <Header />}
            <main className="flex-grow">
                <Outlet />
            </main>
            {!hideHeaderFooter && <Footer />}
        </div>
    );
}

export default AppLayout;
