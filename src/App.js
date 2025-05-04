import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./components/Banner.js";
import Announcements from "./components/Announcements.js";
import Timeline from "./components/Timeline.js";
import RegisterStep1 from "./pages/Register/RegisterStep1.js";
import RegisterStep2 from "./pages/Register/RegisterStep2.js";
import RegisterStep3 from "./pages/Register/RegisterStep3.js";
import Login from "./pages/Login.js";
import Profile from "./pages/Profile.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./layouts/AppLayout.js";
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
                </Route>
                <Route path="/login" element={<Login />} />
            </Routes>
            <ToastContainer />
        </Router>
    );
}

export default App;
