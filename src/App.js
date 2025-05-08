import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./components/Banner.jsx";
import Announcements from "./components/Announcements.jsx";
import Timeline from "./components/Timeline.jsx";
import RegisterStep1 from "./pages/Register/RegisterStep1.jsx";
import RegisterStep2 from "./pages/Register/RegisterStep2.jsx";
import RegisterStep3 from "./pages/Register/RegisterStep3.jsx";
import Login from "./pages/Login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./layouts/AppLayout.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Banner />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/register/step1" element={<RegisterStep1 />} />
                    <Route path="/register/step2" element={<RegisterStep2 />} />
                    <Route path="/register/step3" element={<RegisterStep3 />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/login" element={<Login />} />
            </Routes>
            <ToastContainer />
        </Router>
    );
}

export default App;
