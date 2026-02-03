import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Form, InputNumber, message, Space, Divider, Alert, Spin } from 'antd';
import { useParams, history } from '@umijs/max';
import GenerationProgressDisplay, {
    GenerationProgress,
} from '@/components/GenerationProgress';
import { generateLessonPlanStream } from '@/services/lesson-plan';
import { getDocumentsByType } from '@/services/document';

/**
 * 教案生成页面
 */
const LessonPlanGenerate: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [documentId, setDocumentId] = useState<number | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [teachingPlan, setTeachingPlan] = useState<any>(null);

    useEffect(() => {
        checkTeachingPlan();
    }, [courseId]);

    const checkTeachingPlan = async () => {
        setLoadingPlan(true);
        try {
            // 获取授课计划文档
            const documents = await getDocumentsByType(Number(courseId), 'plan');

            if (documents && documents.length > 0) {
                // 取第一个授课计划
                setTeachingPlan(documents[0]);
            } else {
                setTeachingPlan(null);
            }
        } catch (error) {
            message.error('检查授课计划失败');
        } finally {
            setLoadingPlan(false);
        }
    };

    const handleGenerate = async () => {
        if (!teachingPlan) {
            message.error('请先创建授课计划');
            return;
        }

        try {
            const values = await form.validateFields();
            setGenerating(true);
            setProgress(null);
            setDocumentId(null);

            // 使用授课计划的内容
            const documents = teachingPlan.content || '';

            await generateLessonPlanStream(
                Number(courseId),
                values.sequence,
                documents,
                (progressData: GenerationProgress) => {
                    setProgress(progressData);

                    if (progressData.stage === 'completed') {
                        message.success('教案生成成功！');
                        setDocumentId(progressData.document_id || null);
                        setGenerating(false);
                    }
                },
            );
        } catch (error) {
            message.error('生成失败：' + (error as Error).message);
            setGenerating(false);
        }
    };

    const handleViewDocument = () => {
        if (documentId) {
            // 跳转到预览页面（后续实现）
            history.push(`/course/${courseId}/lesson-plan/${documentId}`);
        }
    };

    if (loadingPlan) {
        return (
            <PageContainer title="生成教案">
                <Card>
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>正在检查授课计划...</div>
                    </div>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="生成教案"
            extra={
                <Button onClick={() => history.push(`/courses/${courseId}`)}>返回课程</Button>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* 授课计划状态检查 */}
                {!teachingPlan ? (
                    <Alert
                        message="缺少授课计划"
                        description={
                            <div>
                                <p>生成教案需要先创建授课计划文档。</p>
                                <Button
                                    type="primary"
                                    onClick={() => history.push(`/courses/${courseId}`)}
                                    style={{ marginTop: 8 }}
                                >
                                    返回课程页面创建授课计划
                                </Button>
                            </div>
                        }
                        type="warning"
                        showIcon
                    />
                ) : (
                    <Alert
                        message="已找到授课计划"
                        description={`将使用"${teachingPlan.title}"生成教案`}
                        type="success"
                        showIcon
                    />
                )}

                {/* 输入表单 */}
                {teachingPlan && (
                    <Card title="基础信息">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                sequence: 1,
                            }}
                        >
                            <Form.Item
                                label="授课顺序"
                                name="sequence"
                                rules={[{ required: true, message: '请输入授课顺序' }]}
                                tooltip="请输入第几次课，例如：第1次课输入1，第2次课输入2"
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    placeholder="请输入授课顺序（如：1、2、3）"
                                    style={{ width: 200 }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleGenerate}
                                    loading={generating}
                                    disabled={generating}
                                >
                                    {generating ? '生成中...' : '开始生成教案'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                {/* 进度显示 */}
                {progress && (
                    <>
                        <Divider />
                        <GenerationProgressDisplay progress={progress} />
                    </>
                )}

                {/* 操作按钮 */}
                {documentId && (
                    <Card>
                        <Space>
                            <Button type="primary" onClick={handleViewDocument}>
                                查看/编辑教案
                            </Button>
                            <Button onClick={() => window.open(`/uploads/generated/lesson_plan_${courseId}_${documentId}.docx`)}>
                                下载 Word 文档
                            </Button>
                        </Space>
                    </Card>
                )}
            </Space>
        </PageContainer>
    );
};

export default LessonPlanGenerate;
