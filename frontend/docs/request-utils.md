# 统一请求封装使用指南

## 📦 已创建的工具

### 1. `utils/request.ts` - 统一请求工具

提供了类型安全的请求方法：
- `get<T>()` - GET 请求
- `post<T>()` - POST 请求
- `put<T>()` - PUT 请求
- `del<T>()` - DELETE 请求

### 2. `requestErrorConfig.ts` - 优化的错误处理

已优化以支持 FastAPI 的错误响应格式（`detail` 字段）。

---

## 🎯 使用方式

### 方式一：使用封装的工具函数（推荐）

```typescript
import { get, post, put, del } from '@/utils/request';

// GET 请求
const courses = await get<Course[]>('/api/courses');

// POST 请求 - 带成功提示
const newCourse = await post<Course>('/api/courses', courseData, {
  showSuccess: true,
  successText: '课程创建成功',
});

// PUT 请求
const updated = await put<Course>(`/api/courses/${id}`, updateData);

// DELETE 请求 - 带成功提示
await del(`/api/courses/${id}`, {
  showSuccess: true,
  successText: '删除成功',
});

// 跳过自动错误处理（手动处理错误）
try {
  await post('/api/courses', data, { skipErrorHandler: true });
} catch (error) {
  // 自定义错误处理
  console.error('自定义错误处理', error);
}
```

### 方式二：继续使用 UMI 的 request（现有代码保持兼容）

```typescript
import { request } from '@umijs/max';

const response = await request<Course[]>('/api/courses', {
  method: 'GET',
});
```

---

## 📝 建议的服务层改造示例

### 改造前（现有代码）

```typescript
// services/course/index.ts
import { request } from '@umijs/max';

export async function getCourses() {
  return request<Course[]>('/api/courses', {
    method: 'GET',
  });
}

export async function createCourse(params: CourseCreateParams) {
  return request<Course>('/api/courses', {
    method: 'POST',
    data: params,
  });
}
```

### 改造后（使用新工具）

```typescript
// services/course/index.ts
import { get, post, put, del } from '@/utils/request';

export async function getCourses() {
  return get<Course[]>('/api/courses');
}

export async function createCourse(params: CourseCreateParams) {
  return post<Course>('/api/courses', params, {
    showSuccess: true,
    successText: '课程创建成功',
  });
}

export async function updateCourse(id: number, params: CourseUpdateParams) {
  return put<Course>(`/api/courses/${id}`, params, {
    showSuccess: true,
    successText: '课程更新成功',
  });
}

export async function deleteCourse(id: number) {
  return del<{ message: string }>(`/api/courses/${id}`, {
    showSuccess: true,
    successText: '课程删除成功',
  });
}
```

---

## ✨ 优势

1. **类型安全**：泛型支持，自动推导返回类型
2. **统一错误处理**：自动提取 FastAPI 的 `detail` 字段
3. **简化代码**：减少重复代码，一行搞定请求
4. **成功提示**：可选的成功消息提示
5. **灵活控制**：支持跳过自动错误处理

---

## 🔧 已优化的错误处理

现在错误处理会：
- ✅ 401错误 → 自动清除token并跳转登录页
- ✅ 其他错误 → 优先显示后端的 `detail` 字段
- ✅ 网络错误 → 友好的中文提示
- ✅ 自定义错误 → 支持跳过自动处理

---

## 📌 注意事项

1. 现有代码**无需立即修改**，新旧方式可以并存
2. 建议**新功能**使用封装的工具函数
3. 页面组件中**已经调用了** `message.error/success` 的地方，在服务层**不要重复设置** `showSuccess`
4. 对于需要**特殊错误处理**的请求，使用 `skipErrorHandler: true`
