# Vibary Bites

Cửa hàng Next.js 15 và trang quản trị sử dụng MongoDB. Đăng nhập admin dùng tài khoản MongoDB và session cookie; ứng dụng không còn dùng Firebase SDK.

## Cấu hình và chạy

Cài Node.js 20.19+ và chạy `npm install`. Cấu hình `.env`. Launcher đọc `APP_ENV` và `PORT` từ file này; biến môi trường của process được ưu tiên:

```dotenv
APP_ENV=development
PORT=3009
MONGODB_URI="mongodb://127.0.0.1:27017/luxcare"
MONGODB_USER=
MONGODB_PASSWORD=
MONGODB_AUTH_SOURCE=admin
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_NAME=Quản trị viên
```

Điền tên đăng nhập 3–64 ký tự (chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang; không phân biệt hoa thường) và mật khẩu admin từ 12–128 ký tự. Để trống user/password MongoDB nếu local không bật xác thực. Tên database lấy trực tiếp từ URI. Không commit `.env` hoặc gửi mật khẩu vào chat.

```sh
npm run db:setup
npm run admin:init
npm run serve
```

Mở `http://localhost:3009`, đăng nhập tại `/admin/login` bằng tài khoản trong `.env`. Nếu chưa chạy `admin:init`, lần đăng nhập đầu sẽ khởi tạo admin khi database chưa có quản trị viên. Nếu thiếu thông tin cấu hình, hệ thống không tạo tài khoản mặc định. Khi đã có admin, thay đổi `.env` **không đổi tên đăng nhập/mật khẩu tài khoản hiện có**.

Mật khẩu được băm bằng scrypt với salt riêng. Session có hạn 12 giờ; MongoDB chỉ lưu hash token. Cookie dùng HttpOnly, SameSite=Lax, Secure khi URL là HTTPS. Đăng xuất thu hồi session ở database. Tài khoản bị vô hiệu hóa hoặc không còn quyền admin bị chặn ở mỗi request. Có giới hạn số lần đăng nhập.

Khi triển khai qua domain/proxy, đặt `APP_ORIGIN=https://your-domain` đúng origin công khai; API ghi yêu cầu Origin khớp để chống CSRF. Local mặc định dùng origin của request. Cloudinary dùng `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` nếu tải ảnh.

Đặt/hủy đơn sử dụng MongoDB transaction, cần Atlas hoặc replica set. MongoDB standalone chạy được catalog và đăng nhập nhưng chưa hỗ trợ đặt/hủy đơn.

## Chọn môi trường chạy

- `APP_ENV=development`: `npm run serve` chạy dev với Turbopack, tự cập nhật khi sửa mã.
- `APP_ENV=production`: chạy `npm run build` trước, sau đó `npm run serve` để kiểm tra bản production.
- `npm run dev` luôn chọn development; `npm start` luôn chọn production, bất kể giá trị APP_ENV hợp lệ trong cấu hình.
- Không cần đặt NODE_ENV trong .env; launcher đặt đúng giá trị theo chế độ đã chọn. APP_ENV không tự đổi database hay thông tin kết nối.
- Thay đổi .env cần dừng server cũ và chạy lại. Production cần build lại khi mã nguồn thay đổi. Docker vẫn chạy production qua entrypoint riêng.
- Chỉ chạy một server dev trên cùng thư mục để tránh dùng chung .next. Dùng `npm run serve -- --port 3010` để ghi đè cổng.

## API

Response đọc dữ liệu: `{ "data": ... }`. Lỗi: `{ "error": "..." }`. MongoDB `_id` chuỗi được trả về thành `id`; metadata migration và fingerprint không gửi xuống giao diện.

| Endpoint | Quyền | Chức năng |
| --- | --- | --- |
| `POST /api/auth/login` | Origin hợp lệ | `{username,password}`, đặt session cookie |
| `GET /api/auth/session` | Session cookie | Profile admin hoặc `{user:null}` |
| `POST /api/auth/logout` | Origin hợp lệ | Thu hồi phiên hiện tại |
| `GET /api/data/{resource}` | Công khai với catalog; admin với nội bộ | Lọc `slug`/`categorySlug`; phân trang `limit` 1–200, `skip`; `sort`, `direction` |
| `GET /api/data/{resource}/{id}` | Như trên | Chi tiết |
| `PUT/PATCH/DELETE /api/data/{resource}/{id}` | Admin + Origin hợp lệ | Ghi dữ liệu; đơn hàng chỉ PATCH `orderStatus` |
| `POST /api/submit-order` | Khách mua hàng | Tính giá ở server, tạo đơn và trừ kho |
| `POST /api/upload-cloudinary` | Admin + Origin hợp lệ | JPG/PNG/WEBP/GIF, tối đa 10 MB |
| `GET /api/health` | Công khai | Kiểm tra MongoDB |

Catalog công khai: `cakes`, `categories`, `news_articles`, `birthday_cake_sizes`. Nội bộ: `ingredients`, `customers`, `orders`. API dùng session cookie cùng origin, không dùng Firebase token hay Bearer token. Không cache dữ liệu đăng nhập/riêng tư.

Checkout nhận `customerName`, `phone`, `address`, `notes`, `items: [{id,quantity,size?}]` và UUID `idempotencyKey`. Backend tự lấy giá và kiểm tra kho; gửi lại cùng nội dung/key không tạo thêm đơn. Bánh sinh nhật dùng giá trong `birthday_cake_sizes`. Giá 0 cần liên hệ báo giá.

Đơn chuyển `new → processing → shipping → completed`. Hủy ở `new` hoặc `processing` sẽ hoàn kho một lần; không mở lại đơn đã hủy. Mỗi đơn khách vãng lai lưu một snapshot liên hệ riêng.

## Hiệu năng và dữ liệu cũ

Không còn màn hình chờ cố định 2,5 giây. Layout và danh sách sản phẩm/tin tức render ở server; trang chủ đọc dữ liệu song song; font được tự lưu qua `next/font`. GET catalog trùng nhau được gộp, cache trình duyệt tối đa 15 giây/100 request, vô hiệu hóa sau khi ghi. Excel chỉ tải khi bấm nhập/xuất. Dashboard vẫn còn một số biểu đồ dữ liệu mẫu từ dự án gốc.

Đã nhập 60 sản phẩm, 4 danh mục, 5 bài viết và 13 cỡ bánh từ nguồn cũ. Dữ liệu riêng tư cũ chưa nhập vì thiếu quyền đọc. Không xóa dữ liệu MongoDB khi đổi đăng nhập; tài khoản Firebase cũ không tự trở thành tài khoản admin MongoDB.

Công cụ nhập cũ được lưu độc lập trong `tools/legacy-import` với package riêng. Không được build/cài cùng ứng dụng; xem README trong thư mục đó nếu cần dùng lại. URL ảnh cũ vẫn giữ nguyên để tránh mất ảnh; đây không phải phụ thuộc SDK.

## Kiểm tra và build

```sh
npm run test:auth
npm run test:backend
npm run test:cache
npm run typecheck
npm run build
npm start -- -p 3100
```

Build production nằm ở `.next-production`, tách khỏi `.next` của dev. `npm run test:web` kiểm tra bản chạy cổng 3100; có thể đổi bằng `SMOKE_BASE_URL`. Cài Chromium cho lần đầu bằng `npx playwright install chromium --only-shell`. Kiểm thử auth/backend dùng MongoDB tạm, không ghi database thật. Kiểm thử browser cơ bản không tạo đơn thật.

## Chuyển trang

Danh mục sản phẩm cập nhật URL bằng History API, không gọi lại server khi toàn bộ danh mục đã tải. Cơ chế đồng bộ URL theo [tài liệu Next.js](https://nextjs.org/docs/14/app/building-your-application/routing/linking-and-navigating#using-the-native-history-api). Chi tiết sản phẩm và bài viết lấy dữ liệu ở server; trang sản phẩm tải đồng thời sản phẩm, danh mục và kích thước. Menu chính tải trước các trang đích và loading.tsx hiển thị phản hồi khi đang chờ trang.

Để dùng bản production: chạy npm run build, rồi npm start. Cả npm start và npm run dev đọc PORT từ .env (mặc định 3009); npm run dev dành cho phát triển. Chạy npm run test:navigation với SMOKE_BASE_URL trỏ tới bản production để kiểm tra đổi danh mục không có request server, lịch sử Back/Forward và chi tiết không gọi thêm API dữ liệu sau khi tải JavaScript.

## Docker và CI/CD

Cấu hình tham khảo dự án Luxcare: GitHub Actions → GHCR → VPS qua SSH, nhánh `develop` và `production`. Image dùng Node.js 22 và [Next.js standalone](https://nextjs.org/docs/app/getting-started/deploying), chạy bằng user không phải root. `.env` và dữ liệu nhập cũ không được đưa vào image.

`PORT` trong `.env` điều khiển cả ứng dụng và ánh xạ cổng Docker, mặc định `3009` nếu thiếu/trống. Biến môi trường của process được ưu tiên; launcher đọc `.env` và hỗ trợ `npm run serve -- --port 3010`. Compose dùng [cú pháp mặc định `${PORT:-3009}`](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).

Chạy Docker trên máy có Docker Engine và Compose v2:

```sh
docker network create default_network  # chỉ cần khi network chưa tồn tại
docker compose up -d --build --wait
docker compose logs -f vibary-bites
```

Compose nạp `.env`. `docker-compose.override.yml` thêm build cho local. Trên VPS workflow chỉ dùng `docker-compose.yml` và image đã kiểm thử, không build lại.

**MongoDB trong Docker:** `127.0.0.1` bên trong container là chính container. Nếu MongoDB chạy trên host, đặt `MONGODB_URI=mongodb://host.docker.internal:27017/luxcare` và bảo đảm MongoDB cho phép kết nối từ Docker. Nếu MongoDB ở container cùng `default_network`, dùng tên service MongoDB trong URI. Không sửa URI local trên máy phát triển nếu vẫn chạy npm. Đặt/hủy đơn vẫn cần replica set hoặc Atlas. `APP_ORIGIN` phải khớp URL truy cập (gồm cổng nếu có). Admin đầu tiên vẫn lấy `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NAME` từ env lúc đăng nhập đầu tiên.

GitHub repository cần các Secrets sau (cùng quy ước Luxcare):

| Staging / develop | Production | Nội dung |
| --- | --- | --- |
| `SSH_HOST` | `SSH_HOST_PROD` | Host VPS |
| `SSH_USER` | `SSH_USER_PROD` | User có quyền Docker và ghi thư mục deploy |
| `SSH_KEY` | `SSH_KEY_PROD` | SSH private key |
| `SSH_PORT` | `SSH_PORT_PROD` | Cổng SSH, mặc định 22 |
| `ENV_FILE` | `ENV_FILE_PROD` | Toàn bộ nội dung `.env` cho từng môi trường |

`GITHUB_TOKEN` do Actions cung cấp để đẩy/kéo GHCR. Bật quyền Actions và packages cho repository. VPS cần Bash, Docker Engine và Compose v2 hỗ trợ `up --wait`. Staging ở `/opt/vibary-bites/develop`, production ở `/opt/vibary-bites/production`; hai Compose project tách biệt. Nếu cùng VPS, đặt PORT khác nhau cho hai môi trường. Dịch vụ đang dùng cổng sẽ không bị tự động dừng/xóa để nhường cổng.

PR chạy TypeScript, kiểm thử port/cache/auth/backend, build Docker và smoke test cổng mặc định 3009 cùng cổng tùy chỉnh 3010 bằng MongoDB tạm. Push chỉ xuất bản image đã qua smoke test rồi deploy đúng digest. Deploy chờ `/api/health` xác nhận cả ứng dụng và MongoDB; thất bại sẽ báo pipeline đỏ, không tự động rollback. Thông tin image đang deploy được lưu ở `.env.image` trên VPS.

Để kiểm tra thủ công dịch vụ đã deploy:

```sh
cd /opt/vibary-bites/production
docker compose -p vibary-bites-production --env-file .env --env-file .env.image -f docker-compose.yml ps
```

Nếu tài khoản admin đầu tiên được tạo bằng email ở phiên bản cũ, điền ADMIN_USERNAME rồi chạy npm run admin:init (hoặc đăng nhập lần đầu với tên mới). Hệ thống chỉ bổ sung tên đăng nhập cho initial-admin; giữ nguyên ID, mật khẩu, quyền và dữ liệu. ADMIN_EMAIL không còn được dùng để đăng nhập hay khởi tạo.
