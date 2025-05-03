import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

import Banner from "./components/Banner.js";
import Announcements from "./components/Announcements.js";
import Timeline from "./components/Timeline.js";

import RegisterStep1 from "./pages/Register/RegisterStep1.js";
import RegisterStep2 from "./pages/Register/RegisterStep2.js";
import RegisterStep3 from "./pages/Register/RegisterStep3.js";
import Login from "./pages/Login.js";
import Profile from "./pages/Profile.js";

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Banner />} />
                        <Route path="/announcements" element={<Announcements />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/register/step1" element={<RegisterStep1 />} />
                        <Route path="/register/step2" element={<RegisterStep2 />} />
                        <Route path="/register/step3" element={<RegisterStep3 />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
