import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Announcements from "./components/Announcements.jsx";
import Timeline from "./components/Timeline.jsx";
import RegisterStep1 from "./pages/UserPages/Register/RegisterStep1.jsx";
import RegisterStep2 from "./pages/UserPages/Register/RegisterStep2.jsx";
import RegisterStep3 from "./pages/UserPages/Register/RegisterStep3.jsx";
import Login from "./pages/Login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./layouts/AppLayout.jsx";
import Profile from "./pages/UserPages/ProfilePage/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./components/HomePage.jsx";
import Majors from "./pages/UserPages/Major.jsx";
import Criteria from "./pages/UserPages/Criteria.jsx";
import MajorDetail from "./pages/UserPages/MajorDetail.jsx";
import Block from "./pages/UserPages/Block.jsx";
import Wish from "./pages/UserPages/Wish.jsx";
import AdmissionResult from "./pages/UserPages/AdmissionResult.jsx";
import ChangePassword from "./pages/UserPages/ChangePassword.jsx";
import ReviewerPage from "./pages/ReviewerPages/ReviewerPage.jsx";
import AdminPage from "./pages/AdminPages/AdminPage.jsx";
import UserDetailPage from "./pages/ReviewerPages/UserDetailPage.jsx";
import AdmissionYearList from "./pages/AdminPages/AdmissionYearPage/AdmissionYearList.jsx";
import AdmissionCriteriaListPage from "./pages/AdminPages/AdmissionCriteriaPage/AdmissionCriteriaListPage.jsx";
import AdmissionMajorListPage from "./pages/AdminPages/AdmissionMajorPage/AdmissionMajorListPage.jsx";
import AdmissionRegionListPage from "./pages/AdminPages/AdmissionRegionPage/AdmissionRegionListPage.jsx";
import AdmissionObjectListPage from "./pages/AdminPages/AdmissionObjectPage/AdmissionObjectListPage.jsx";
import AdmissionQuantityListPage from "./pages/AdminPages/AdmissionQuantityPage/AdmissionQuantityListPage.jsx";
import PermissionListPage from "./pages/AdminPages/PermissionPage/PermissionListPage.jsx";
import ListAcceptedPage from "./pages/AdminPages/ListAcceptedPage/ListAcceptedPage.jsx";
import FilterPage from "./pages/AdminPages/FilterPage/FilterPage.jsx";
import ChatPage from "./pages/AdminPages/ChatPage/ChatPage.jsx";
import UserChat from "./pages/UserPages/Chat.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";
import TinyMCEEditor from "./components/TinyMCEEditor.jsx";
// Import các component con của UserDetailPage
import Information from "./pages/ReviewerPages/Information.jsx";
import LearningProccess from "./pages/ReviewerPages/LearningProccess.jsx";
import Transcript from "./pages/ReviewerPages/Transcript.jsx";
import Photo from "./pages/ReviewerPages/Photo.jsx";
import ForgotPasswordStep1 from "./pages/UserPages/ForgotPassword/ForgotPasswordStep1.jsx";
import ForgotPasswordStep2 from "./pages/UserPages/ForgotPassword/ForgotPasswordStep2.jsx";
import ForgotPasswordStep3 from "./pages/UserPages/ForgotPassword/ForgotPasswordStep3.jsx";
import AdmissionBlockListPage from "./pages/AdminPages/AdmissionBlockPage/AdmissionBlockListPage.jsx";
import UserListPage from "./pages/AdminPages/UserPage/UserListPage.jsx";
import StatisticsPage from "./pages/AdminPages/StatisticsPage/Statistic.jsx";
import AnnouncementListPage from "./pages/AdminPages/AnnouncementPage/AnnouncementListPage.jsx";
import AnnouncementListPagePublic from "./pages/UserPages/AnnouncementListPage.jsx";
import AnnouncementDetailPage from "./pages/UserPages/AnnouncementDetailPage.jsx";

function App() {
    return (
        <>
            <Routes>
                {/* Layout chung không bọc ProtectedRoute */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/register/step1" element={<RegisterStep1 />} />
                    <Route path="/register/step2" element={<RegisterStep2 />} />
                    <Route path="/register/step3" element={<RegisterStep3 />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/google/callback" element={<GoogleCallback />} />
                    <Route path="/major" element={<Majors />} />
                    <Route path="/majors/:id" element={<MajorDetail />} />
                    <Route path="/block" element={<Block />} />
                    <Route path="/criteria" element={<Criteria />} />
                    <Route path="/editor" element={<TinyMCEEditor />} />
                    <Route path="/announcements" element={<AnnouncementListPagePublic />} />
                    <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
                    <Route path="/forgot-password/step1" element={<ForgotPasswordStep1 />} />
                    <Route path="/forgot-password/step2" element={<ForgotPasswordStep2 />} />
                    <Route path="/forgot-password/step3" element={<ForgotPasswordStep3 />} />
                    {/* Protected User Routes */}
                    <Route
                        path="/wish"
                        element={
                            <ProtectedRoute allowedRoles={["user"]}>
                                <Wish />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/result"
                        element={
                            <ProtectedRoute allowedRoles={["user"]}>
                                <AdmissionResult />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={["user"]}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/changePassword"
                        element={
                            <ProtectedRoute allowedRoles={["user"]}>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute allowedRoles={["user"]}>
                                <UserChat />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Admin Routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="statistics" replace />} />
                    <Route path="statistics" element={<StatisticsPage />} />
                    <Route path="users" element={<UserListPage />} />
                    <Route path="admission-years" element={<AdmissionYearList />} />
                    <Route path="admission-blocks" element={<AdmissionBlockListPage />} />
                    <Route path="admission-majors" element={<AdmissionMajorListPage />} />
                    <Route path="admission-criteria" element={<AdmissionCriteriaListPage />} />
                    <Route path="admission-regions" element={<AdmissionRegionListPage />} />
                    <Route path="admission-objects" element={<AdmissionObjectListPage />} />
                    <Route path="admission-quantities" element={<AdmissionQuantityListPage />} />
                    <Route path="permissions" element={<PermissionListPage />} />
                    <Route path="announcements" element={<AnnouncementListPage />} />
                    <Route path="list-accepted" element={<ListAcceptedPage />} />
                    <Route path="filter" element={<FilterPage />} />
                    <Route path="chat" element={<ChatPage />} />
                </Route>

                {/* Reviewer Routes */}
                <Route
                    path="/reviewer"
                    element={
                        <ProtectedRoute allowedRoles={["reviewer"]}>
                            <ReviewerPage />
                        </ProtectedRoute>
                    }
                >            
                </Route>

                {/* Reviewer User Detail Routes */}
                <Route
                    path="/reviewer/user/:id/*"
                    element={
                        <ProtectedRoute allowedRoles={["reviewer"]}>
                            <UserDetailPage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="info" replace />} />
                    <Route path="info" element={<Information />} />
                    <Route path="progress" element={<LearningProccess />} />
                    <Route path="transcript" element={<Transcript />} />
                    <Route path="photo" element={<Photo />} />
                </Route>
            </Routes>
            <ToastContainer />
        </>
    );
}

export default App;
