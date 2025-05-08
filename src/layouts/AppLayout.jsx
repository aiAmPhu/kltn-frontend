import { useLocation } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { Outlet } from "react-router-dom";

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
