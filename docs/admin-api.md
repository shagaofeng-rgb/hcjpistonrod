# 中文管理后台 API 文档

## 认证

### POST `/api/admin/bootstrap`

仅在系统没有管理员时可用，并要求 `Authorization: Bearer <CRON_SECRET>`。接口向配置的管理员邮箱发送30分钟有效的一次性密码设置链接，不在响应中返回令牌或密码。

### POST `/api/admin/setup`

接收一次性 `token`、`password` 和 `confirmation`。密码必须为12至128位并同时包含大小写字母、数字和符号；成功后创建超级管理员并立即使令牌失效。

### POST `/api/admin/auth/login`

表单字段：

- `account`: 邮箱或用户名
- `password`: 密码
- `remember`: `on` 时延长会话有效期

成功后写入 `hcj_admin_session` HttpOnly Cookie。

### POST `/api/admin/auth/logout`

撤销当前会话并跳转至 `/admin/login`。

## 健康检查

### GET `/api/admin/health`

登录且拥有设置管理权限后，返回数据库、对象存储和外部数据源配置状态。未配置外部服务时只显示状态，不返回假数据。

## 后台列表

### GET `/api/admin/content/:module`

支持模块：

- `products`
- `categories`
- `news`
- `leads`
- `analytics`
- `seo`
- `media`
- `users`
- `audit-logs`
- `settings`
- `sync`

查询参数：

- `page`: 页码，默认 1
- `pageSize`: 10、20、50、100，默认 20
- `keyword`: 关键词

响应格式：

```json
{
  "ok": true,
  "data": {
    "rows": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0
    }
  }
}
```

错误格式：

```json
{
  "ok": false,
  "error": {
    "code": "ADMIN_ERROR",
    "message": "中文错误信息",
    "traceId": "request-trace-id"
  }
}
```
