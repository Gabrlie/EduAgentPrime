"""
课程知识库服务 - RAG 系统
提供课程相关信息的检索和上下文构建功能
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .models import Course, CourseDocument


def retrieve_course_context(db: Session, course_id: int) -> Dict[str, Any]:
    """
    检索课程完整上下文信息，供 AI 生成时参考
    
    Args:
        db: 数据库会话
        course_id: 课程 ID
        
    Returns:
        包含课程信息、教材、大纲、文档等的上下文字典
    """
    # 获取课程基本信息
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise ValueError(f"课程 {course_id} 不存在")
    
    # 获取所有相关文档
    documents = db.query(CourseDocument).filter(
        CourseDocument.course_id == course_id
    ).all()
    
    # 构建上下文
    context = {
        "course_info": {
            "id": course.id,
            "name": course.name,
            "semester": course.semester,
            "class_name": course.class_name,
            "total_hours": course.total_hours,
            "practice_hours": course.practice_hours,
            "course_type": course.course_type,
        },
        "textbook": {
            "isbn": course.textbook_isbn,
            "name": course.textbook_name,
            "image": course.textbook_image,
            "publisher": course.textbook_publisher,
            "link": course.textbook_link,
        },
        "catalog": course.course_catalog or "",
        "documents": []
    }
    
    # 添加文档信息
    for doc in documents:
        context["documents"].append({
            "id": doc.id,
            "type": doc.doc_type,
            "title": doc.title,
            "content": doc.content or "",
            "lesson_number": doc.lesson_number,
        })
    
    return context


def build_ai_context_prompt(context: Dict[str, Any]) -> str:
    """
    将课程上下文转换为 AI Prompt
    
    Args:
        context: 课程上下文字典
        
    Returns:
        格式化的上下文提示词
    """
    course = context["course_info"]
    textbook = context["textbook"]
    
    prompt = f"""# 课程基础信息

**课程名称**: {course['name']}
**学期**: {course['semester']}
**授课班级**: {course['class_name']}
**总学时**: {course['total_hours']} 学时
**实训学时**: {course['practice_hours']} 学时
**课程类型**: {course['course_type']}

# 教材信息

**教材名称**: {textbook['name']}
**ISBN**: {textbook['isbn']}
**出版社**: {textbook.get('publisher') or '未指定'}
"""
    
    # 添加课程目录
    if context.get("catalog"):
        prompt += f"\n# 课程目录\n\n{context['catalog']}\n"
    
    # 添加相关文档
    if context.get("documents"):
        prompt += "\n# 相关文档\n\n"
        for doc in context["documents"]:
            if doc.get("content"):
                prompt += f"## {doc['title']} ({doc['type']})\n\n{doc['content'][:500]}...\n\n"
    
    return prompt


def get_documents_by_type(db: Session, course_id: int, doc_type: str) -> List[Dict[str, Any]]:
    """
    获取指定类型的文档列表
    
    Args:
        db: 数据库会话
        course_id: 课程 ID
        doc_type: 文档类型
        
    Returns:
        文档列表
    """
    documents = db.query(CourseDocument).filter(
        CourseDocument.course_id == course_id,
        CourseDocument.doc_type == doc_type
    ).order_by(CourseDocument.lesson_number).all()
    
    return [
        {
            "id": doc.id,
            "title": doc.title,
            "content": doc.content,
            "lesson_number": doc.lesson_number,
        }
        for doc in documents
    ]
