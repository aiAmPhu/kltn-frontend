import React, { useState, useEffect } from "react";
import axios from "axios";
import PermissionList from "./PermissionList";

const PermissionListPage = () => {
    // Khai báo state users và setUsers
    const [users, setUsers] = useState([]);

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

                setUsers(response.data); // sử dụng đúng setUsers trong component
            } catch (error) {
                console.error("Error fetching users", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <PermissionList users={users} setUsers={setUsers} />
        </div>
    );
};

export default PermissionListPage;