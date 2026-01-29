"""
数据库初始化脚本

创建默认管理员账号
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User
from app.auth import get_password_hash


def init_db():
    """初始化数据库"""
    print("开始初始化数据库...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✓ 数据库表创建成功")
    
    # 创建数据库会话
    db: Session = SessionLocal()
    
    try:
        # 检查是否已存在管理员账号
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if admin_user:
            print("✓ 管理员账号已存在")
        else:
            # 创建默认管理员账号
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin_user)
            db.commit()
            print("✓ 默认管理员账号创建成功")
            print("  用户名: admin")
            print("  密码: admin123")
        
        print("\n数据库初始化完成！")
        
    except Exception as e:
        print(f"✗ 数据库初始化失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
