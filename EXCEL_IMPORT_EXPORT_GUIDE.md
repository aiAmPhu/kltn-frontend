# Hướng dẫn Import/Export Excel cho Chỉ tiêu Tuyển sinh

## Tổng quan
Hệ thống đã được bổ sung tính năng import và export dữ liệu chỉ tiêu tuyển sinh bằng file Excel (.xlsx), giúp quản lý dữ liệu một cách nhanh chóng và hiệu quả.

## Tính năng Export

### Cách sử dụng:
1. Truy cập trang "Quản lý chỉ tiêu tuyển sinh"
2. Nhấn nút **"Xuất Excel"** (màu cam) ở góc trên bên phải
3. File Excel sẽ được tự động tải xuống với tên định dạng: `Chi_tieu_tuyen_sinh_YYYY-MM-DD.xlsx`

### Nội dung file xuất:
- **Mã ngành**: Mã định danh của ngành đào tạo
- **Tên ngành**: Tên đầy đủ của ngành đào tạo
- **Mã diện xét tuyển**: Mã định danh của diện xét tuyển
- **Tên diện xét tuyển**: Tên đầy đủ của diện xét tuyển
- **Số lượng chỉ tiêu**: Số lượng sinh viên dự kiến tuyển sinh

## Tính năng Import

### Cách sử dụng:
1. Truy cập trang "Quản lý chỉ tiêu tuyển sinh"
2. Nhấn nút **"Nhập Excel"** (màu tím)
3. Trong modal hiện ra:
   - Tải template nếu chưa có file mẫu
   - Chọn file Excel để upload
   - Xem trước dữ liệu và kiểm tra lỗi
   - Nhấn **"Import dữ liệu"** để thực hiện

### Định dạng file import:
File Excel cần có các cột sau (đúng tên cột):
- **Mã ngành** (bắt buộc): Mã ngành phải tồn tại trong hệ thống
- **Tên ngành** (tùy chọn): Tên ngành (chỉ để tham khảo)
- **Mã diện xét tuyển** (bắt buộc): Mã diện xét tuyển phải tồn tại trong hệ thống
- **Tên diện xét tuyển** (tùy chọn): Tên diện xét tuyển (chỉ để tham khảo)
- **Số lượng chỉ tiêu** (bắt buộc): Số nguyên dương

### Quy tắc validation:
1. **Mã ngành** và **Mã diện xét tuyển** phải tồn tại trong hệ thống
2. **Số lượng chỉ tiêu** phải là số nguyên dương
3. Không được để trống các trường bắt buộc
4. Nếu chỉ tiêu đã tồn tại (cùng mã ngành và mã diện), hệ thống sẽ cập nhật số lượng

### Xử lý lỗi:
- Hệ thống sẽ hiển thị danh sách lỗi cụ thể cho từng dòng
- Phải sửa tất cả lỗi trước khi có thể import
- Các bản ghi hợp lệ sẽ được import, bản ghi lỗi sẽ bị bỏ qua

## Kết quả Import
Sau khi import thành công, hệ thống sẽ hiển thị:
- **Thành công**: Số bản ghi được import/cập nhật thành công
- **Bỏ qua**: Số bản ghi bị bỏ qua (thường là các dòng trống)
- **Lỗi**: Số bản ghi có lỗi không thể import

## Lưu ý quan trọng:
1. Chỉ hỗ trợ file Excel (.xlsx, .xls)
2. Cần đảm bảo các mã ngành và mã diện xét tuyển đã được tạo trước trong hệ thống
3. Nên sử dụng template để đảm bảo định dạng đúng
4. Kiểm tra kỹ dữ liệu trước khi import để tránh sai sót
5. Import sẽ ghi đè dữ liệu cũ nếu trùng mã ngành và mã diện xét tuyển

## Liên hệ hỗ trợ:
Nếu gặp vấn đề trong quá trình sử dụng, vui lòng liên hệ với quản trị viên hệ thống. 