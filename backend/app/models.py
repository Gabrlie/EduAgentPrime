"""
数据库模型定义
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()


# SQLAlchemy ORM 模型
class User(Base):
    """用户表模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # AI 配置字段
    ai_api_key = Column(String(255), nullable=True)
    ai_base_url = Column(String(255), nullable=True)
    ai_model_name = Column(String(100), default="gpt-3.5-turbo")
    
    # 关系
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")


class Message(Base):
    """聊天消息表模型"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="messages")


# Pydantic 模型 - 响应模型
class UserResponse(BaseModel):
    """用户信息响应模型"""
    id: int
    username: str
    created_at: datetime
    ai_base_url: Optional[str] = None
    ai_model_name: Optional[str] = None
    has_api_key: bool = False  # 是否已配置 API Key（不返回实际值）

    class Config:
        from_attributes = True

    @classmethod
    def from_user(cls, user):
        """从 User 对象创建响应"""
        return cls(
            id=user.id,
            username=user.username,
            created_at=user.created_at,
            ai_base_url=user.ai_base_url,
            ai_model_name=user.ai_model_name,
            has_api_key=bool(user.ai_api_key)  # 只返回是否配置的标志
        )


class MessageResponse(BaseModel):
    """消息响应模型"""
    id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Pydantic 模型 - 请求模型
class Token(BaseModel):
    """登录响应 Token 模型"""
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    """修改密码请求模型"""
    old_password: str
    new_password: str


class UserSettingsRequest(BaseModel):
    """用户设置请求模型"""
    ai_api_key: Optional[str] = None
    ai_base_url: Optional[str] = None
    ai_model_name: Optional[str] = None


class ChatMessageRequest(BaseModel):
    """聊天消息请求模型"""
    content: str

