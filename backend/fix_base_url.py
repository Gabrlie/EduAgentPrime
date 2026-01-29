"""
修复用户 AI 配置的脚本
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import User

def fix_base_url():
    db = SessionLocal()
    try:
        # 获取所有用户
        users = db.query(User).all()
        
        for user in users:
            if user.ai_base_url:
                original_url = user.ai_base_url
                
                # 修复双重 https://
                if user.ai_base_url.startswith('https://https://'):
                    user.ai_base_url = user.ai_base_url.replace('https://https://', 'https://')
                    print(f"用户 {user.username}:")
                    print(f"  原 URL: {original_url}")
                    print(f"  新 URL: {user.ai_base_url}")
                    print()
                
                # 修复双重 http://
                elif user.ai_base_url.startswith('http://http://'):
                    user.ai_base_url = user.ai_base_url.replace('http://http://', 'http://')
                    print(f"用户 {user.username}:")
                    print(f"  原 URL: {original_url}")
                    print(f"  新 URL: {user.ai_base_url}")
                    print()
        
        db.commit()
        print("✅ 修复完成！")
        
        # 显示所有用户的当前配置
        print("\n📋 当前所有用户的 AI 配置：")
        print("=" * 80)
        for user in users:
            print(f"\n用户: {user.username}")
            print(f"  Base URL: {user.ai_base_url or '未配置'}")
            print(f"  模型: {user.ai_model_name or '未配置'}")
            print(f"  API Key: {'已配置' if user.ai_api_key else '未配置'}")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    fix_base_url()
