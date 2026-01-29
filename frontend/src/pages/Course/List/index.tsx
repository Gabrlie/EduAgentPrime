/**
 * 课程列表页面 - 书籍卡片样式
 */
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Empty, message, Modal, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { useEffect, useState } from 'react';
import { getCourses, deleteCourse, type Course } from '@/services/course';
import styles from './index.less';

const CourseList: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    // 加载课程列表
    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (error) {
            message.error('加载课程列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    // 删除课程
    const handleDelete = (course: Course) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除课程"${course.name}"吗？此操作不可恢复。`,
            okText: '确定',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteCourse(course.id);
                    message.success('删除成功');
                    loadCourses();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    return (
        <PageContainer
            header={{
                title: '课程管理',
                extra: [
                    <Button
                        key="create"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/courses/create')}
                    >
                        新建课程
                    </Button>,
                ],
            }}
        >
            {courses.length === 0 && !loading ? (
                <Empty description='暂无课程，点击上方"新建课程"开始创建' />
            ) : (
                <Row gutter={[24, 24]}>
                    {courses.map((course) => (
                        <Col key={course.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Card
                                hoverable
                                className={styles.courseCard}
                                cover={
                                    <div className={styles.coverWrapper}>
                                        <img
                                            alt={course.textbook_name}
                                            src={course.textbook_image}
                                            className={styles.coverImage}
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                        />
                                    </div>
                                }
                                actions={[
                                    <EditOutlined
                                        key="edit"
                                        onClick={() => navigate(`/courses/${course.id}/edit`)}
                                    />,
                                    <DeleteOutlined
                                        key="delete"
                                        onClick={() => handleDelete(course)}
                                    />,
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div className={styles.cardTitle} onClick={() => navigate(`/courses/${course.id}`)}>
                                            {course.name}
                                        </div>
                                    }
                                    description={
                                        <div className={styles.cardDescription}>
                                            <div>{course.semester}</div>
                                            <div>{course.class_name}</div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </PageContainer>
    );
};

export default CourseList;
