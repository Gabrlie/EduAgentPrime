"""
JWT 认证中间件
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .auth import verify_token


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """JWT 认证中间件 - 拦截所有请求进行鉴权"""
    
    # 不需要鉴权的路径
    EXCLUDE_PATHS = {
        "/api/auth/login",
        "/docs",
        "/redoc",
        "/openapi.json",
    }
    
    async def dispatch(self, request: Request, call_next):
        """处理请求"""
        # 检查是否是排除路径
        if request.url.path in self.EXCLUDE_PATHS or request.url.path.startswith("/uploads/"):
            return await call_next(request)
        
        # 获取 token：优先从 header，其次从 URL 参数（用于 SSE）
        auth_header = request.headers.get("Authorization")
        token = None
        
        if auth_header and auth_header.startswith("Bearer "):
            # 从 header 中获取
            token = auth_header.split(" ")[1]
        elif "token" in request.query_params:
            # 从 URL 参数中获取（EventSource 不支持自定义 headers）
            token = request.query_params.get("token")
        
        if not token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "未提供认证令牌"},
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 验证 token
        username = verify_token(token)
        if username is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "无效的认证令牌"},
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 将用户名添加到请求状态中
        request.state.username = username
        
        # 继续处理请求
        return await call_next(request)
