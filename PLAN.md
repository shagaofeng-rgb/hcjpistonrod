# 海外B2B中文管理后台实施计划

## 当前项目情况

- 当前项目为 Next.js App Router + TypeScript，前台为静态内容数据文件驱动。
- 已有询盘接口 `/api/rfq`，通过 SMTP 将表单发送到企业邮箱。
- 当前仓库没有数据库、ORM、后台认证、对象存储、权限、审计和同步任务基础设施。
- 本次按 PDF 要求先建立可部署的后台基础层，生产数据能力依赖外部 PostgreSQL 和对象存储凭证。

## 技术架构

- 前端和后台：Next.js App Router、TypeScript、React。
- 后台语言：简体中文。
- 服务端：Next.js Route Handlers，所有后台 API 走服务端鉴权。
- 数据库：PostgreSQL，通过 `pg` 驱动访问。
- 密码：Node.js `crypto.scrypt` 哈希，不明文保存。
- 会话：数据库持久化 session + HttpOnly Cookie。
- 文件存储：第一阶段预留对象存储配置与媒体表，未配置凭证时不伪造上传。
- 部署：Vercel 生产部署，同时提供 Docker/Docker Compose 文件用于自托管。

## 数据库设计

迁移文件：`db/migrations/001_admin_foundation.sql`

第一阶段创建核心表：

- 用户与权限：`admin_users`、`admin_roles`、`admin_permissions`、`admin_user_roles`、`admin_role_permissions`、`admin_sessions`、`admin_login_attempts`
- 内容：`product_categories_cms`、`products_cms`、`product_translations`、`media_assets`、`news_categories`、`news_articles`
- 客户表单：`form_submissions`、`lead_notes`
- 数据与 SEO：`analytics_events`、`analytics_daily_summary`、`seo_metrics`、`seo_issues`、`redirects`
- 同步与审计：`sync_sources`、`sync_jobs`、`sync_logs`、`audit_logs`
- 系统：`system_settings`、`import_jobs`、`export_jobs`、`notifications`

## 功能模块

- 阶段一已实现：中文后台入口、登录页、会话认证、角色权限基础、健康检查、通用分页 API、后台模块页面、迁移和初始化脚本。
- 阶段二待接入：产品分类和产品完整 CRUD、媒体真实上传、新闻管理、发布流程。
- 阶段三待接入：询盘写入数据库、线索分配、备注、导出、通知失败兜底。
- 阶段四待接入：访问事件采集、聚合看板、SEO 外部数据适配器、同步中心。
- 阶段五待接入：自动化测试扩展、安全扫描、备份恢复演练、权限边界测试。

## 安全方案

- 后台页面由 middleware 检查会话 Cookie。
- 登录 API 只在服务端验证数据库用户。
- 密码使用 scrypt 哈希，不保存明文。
- Session token 仅保存哈希值，Cookie 设置 HttpOnly、SameSite=Lax，生产环境 Secure。
- API 统一返回中文错误，不暴露数据库连接和内部堆栈。
- 审计表记录登录、导出、同步、内容变更等关键操作。

## 测试方案

- 当前必须通过：`pnpm lint`、`pnpm build`。
- 接入数据库后补充：迁移测试、登录集成测试、权限拒绝测试、CRUD 流程测试、导入导出测试。
- 接入浏览器测试后补充：管理员登录、密码显示隐藏、分页切换、客户表单分类、同步按钮等 E2E。

## 部署方案

- Vercel：配置 `DATABASE_URL`、`ADMIN_SESSION_SECRET`、SMTP 和对象存储变量后部署。
- 初始化数据库：`pnpm admin:migrate`
- 创建管理员：设置 `ADMIN_EMAIL`、`ADMIN_PASSWORD`、`ADMIN_NAME` 后运行 `pnpm admin:create-user`
- 自托管：使用 `Dockerfile` 和 `docker-compose.yml`。

## 风险和待确认事项

- 生产 PostgreSQL 连接串尚未提供，后台数据写入不能真正启用。
- 对象存储/S3 凭证尚未提供，媒体上传只能显示待配置状态。
- Google Search Console、第三方分析、CRM、Webhook 等外部凭证尚未提供，同步页显示未配置，不伪造数据。
- 初始管理员密码不能硬编码，需要通过环境变量或安全初始化流程创建。
