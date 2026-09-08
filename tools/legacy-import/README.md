# Công cụ nhập dữ liệu cũ (độc lập)

Thư mục này không thuộc runtime/build của website. Chỉ cài dependencies ở đây nếu cần nhập tiếp dữ liệu nguồn cũ:

```sh
cd tools/legacy-import
npm install
npm run migrate -- --public --resolve-slugs
```

Cấu hình MongoDB đọc từ `.env.local` và `.env` ở thư mục dự án gốc. Config nguồn nằm tại `config.ts`. `--public` chỉ đọc các collection công khai. Dữ liệu riêng tư cần service account có quyền đọc:

```sh
npm run migrate -- --dry-run --service-account="D:/secrets/service-account.json"
npm run migrate -- --service-account="D:/secrets/service-account.json"
```

Mặc định chỉ thêm ID chưa có. `--overwrite` thay thế dữ liệu đã nhập cùng nguồn; `--collections=cakes,categories` giới hạn phạm vi; `--batch-size=200` cấu hình phân trang; `--resolve-slugs` thêm hậu tố ID khi slug trùng và lưu slug gốc trong metadata. Không sửa/xóa dữ liệu nguồn. Chạy `npm test` để kiểm thử bằng MongoDB tạm.

Các file rules/hosting cũ chỉ được lưu tham khảo, không còn là cấu hình triển khai của ứng dụng.
