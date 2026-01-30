# Fairshares_auto_Ref
Auto registration, Auto referrals...

Link Tham Gia : https://t.me/HVchannelss/189

Link Tool : Đang Phát Triển..........................

Tham Gia Discor ( Vip ) : https://discord.gg/gKxvTNu5

Tham gia NHóm VIp Với Chi Phí 8u/1thang Lợi ích tham gia nhóm ViP Sẽ được cấp keey sử dụng các tool vip trong discor hỗ trợ Và tham khao Code các tool dự án mà các bạn đề xuất

Gửi Phí tháng vào đây và chụp hình gửi trực tiếp cho tôi tại discor để xác nhận Role VIp ☕ https://huynhviet933.github.io/donate_viet_mmo/ Có thể tặng tôi ít cafe tại đây



==========================================================================
        HƯỚNG DẪN SỬ DỤNG FAIRSHARES AUTOMATOR (FULL VERSION)
==========================================================================

1. YÊU CẦU HỆ THỐNG & CÀI ĐẶT
-----------------------------------------------------------
- Đã cài đặt Node.js (phiên bản 16 trở lên).
- Mở Terminal/CMD tại thư mục tool và chạy lệnh cài đặt thư viện:

npm install ethers axios https-proxy-agent uuid readline-sync

2. CHUẨN BỊ CÁC FILE DỮ LIỆU (BẮT BUỘC)
-----------------------------------------------------------
Tạo các file .txt sau trong cùng thư mục với tool:

- privatekeys.txt : Mỗi dòng 1 Private Key ví (EVM).
- proxy.txt       : Mỗi dòng 1 proxy (Định dạng: http://user:pass@ip:port).
- user_agents.txt : Mỗi dòng 1 User-Agent trình duyệt.
- ref.txt         : Mỗi dòng 1 mã Access Code (Ref code).
- mail.txt        : Mỗi dòng định dạng: email|password|token (Dùng Mail.tm). 

3. CẤU HÌNH FILE config.json
-----------------------------------------------------------
Tool sẽ tự tạo file này khi chạy lần đầu. Bạn có thể chỉnh sửa:

{
  "max_threads": 3,               // Số luồng chạy cùng lúc
  "step_delay": {
    "min": 2,                     // Giây nghỉ tối thiểu giữa các bước
    "max": 7                      // Giây nghỉ tối đa giữa các bước
  },
  "wallet_done_delay": {
    "min": 20,                    // Giây nghỉ tối thiểu sau khi xong 1 ví
    "max": 60                     // Giây nghỉ tối đa sau khi xong 1 ví
  }
}

4. CÁC CHỨC NĂNG CHÍNH CỦA TOOL
-----------------------------------------------------------
- License Check: Xác thực Key theo HWID máy (mỗi key 1 máy).
- Auto Login: Ký ví và nhận Token JWT (Lưu vào profiles.json).
- Auto Bind Ref: Tự động nhập mã mời (Bỏ qua nếu ví đã có người mời).
- Auto Bind Mail: Tự động gửi code, lấy OTP từ Mail.tm và liên kết email.
- Multi-Thread: Mở các luồng cách nhau 3-7s để tránh bị hệ thống quét.
- Proxy Rotation: Nếu proxy lỗi, tool tự động chuyển sang proxy tiếp theo.

5. HƯỚNG DẪN CHẠY TOOL
-----------------------------------------------------------
Bước 1: Chạy lệnh: node Pro.js (hoặc tên file của bạn). ( Free.js nếu dùng bản Miễn phí ) 
Bước 2: Nhập License Key khi được yêu cầu (Key sẽ được lưu vào license.txt).
Bước 3: Tool sẽ tự động kết nối Proxy, Login, Bind Ref/Mail và tổng kết AP.

6. GIẢI THÍCH MÀU SẮC LOG
-----------------------------------------------------------
- [Trắng]    : STT ví và IP hiện tại.
- [Vàng]     : Thông báo lỗi hoặc kiểm tra Proxy.
- [Xanh lá]  : Thao tác Thành công (Login, Bind Ref, Bind Mail).
- [Xanh Cyan]: Trạng thái "Already Bound" (Đã làm rồi, bỏ qua).
- [Tím]      : Địa chỉ ví rút gọn và Tổng kết điểm (AP/Rank).

7. LƯU Ý QUAN TRỌNG
-----------------------------------------------------------
- profiles.json: Lưu lại Token và trạng thái của ví. Nếu muốn chạy lại 
  từ đầu hoàn toàn, hãy xóa file này.
- License: Nếu đổi máy, bạn cần liên hệ Admin để reset HWID cho Key.
- Log English: Tool sử dụng 100% ngôn ngữ tiếng Anh để chuyên nghiệp hóa.
==========================================================================
