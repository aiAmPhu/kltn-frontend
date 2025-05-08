import React from "react";

function Profile() {
    return (
        <div className="max-w-4xl mx-auto mt-24 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Hồ sơ của tôi</h1>
            <p>Thông tin người dùng sẽ hiển thị ở đây (bạn có thể fetch từ token).</p>
        </div>
    );
}

export default Profile;
