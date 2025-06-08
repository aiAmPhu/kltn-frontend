import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./UserList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const UserListPage = () => {
    // Khai báo state users và setUsers
    const [users, setUsers] = useState([]);

    // Set document title
    useDocumentTitle("Quản lý người dùng");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/users/getall`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(response.data?.data || response.data || []);
            } catch (error) {
                toast.error("Không thể tải danh sách người dùng. Vui lòng thử lại sau!");
                console.error("Error fetching users", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <UserList users={users} setUsers={setUsers} />
        </div>
    );
};

export default UserListPage;
