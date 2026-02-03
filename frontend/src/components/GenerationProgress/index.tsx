import React, { useState } from 'react';
import { Card, Progress, Steps, Alert, Space } from 'antd';
import {
    LoadingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';

const { Step } = Steps;

export interface GenerationProgress {
    stage: 'analyzing' | 'retrieving' | 'generating' | 'rendering' | 'completed' | 'error';
    progress: number;
    message: string;
    document_id?: number;
    file_url?: string;
    data?: any;
}

interface ProgressDisplayProps {
    progress: GenerationProgress | null;
}

const stageConfig = {
    analyzing: { title: '解析需求', index: 0 },
    retrieving: { title: '检索知识库', index: 1 },
    generating: { title: 'AI 生成内容', index: 2 },
    rendering: { title: '填充模板', index: 3 },
    completed: { title: '完成', index: 4 },
    error: { title: '错误', index: 4 },
};

/**
 * 通用文档生成进度显示组件
 */
const GenerationProgressDisplay: React.FC<ProgressDisplayProps> = ({ progress }) => {
    if (!progress) {
        return null;
    }

    const currentStage = stageConfig[progress.stage];
    const isError = progress.stage === 'error';
    const isCompleted = progress.stage === 'completed';

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* 进度条 */}
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <strong>生成进度</strong>
                    </div>
                    <Progress
                        percent={progress.progress}
                        status={isError ? 'exception' : isCompleted ? 'success' : 'active'}
                        strokeColor={isError ? '#ff4d4f' : isCompleted ? '#52c41a' : '#1890ff'}
                    />
                </div>

                {/* 步骤指示 */}
                <Steps
                    current={currentStage.index}
                    status={isError ? 'error' : isCompleted ? 'finish' : 'process'}
                >
                    <Step
                        title="解析需求"
                        icon={
                            currentStage.index > 0 ? (
                                <CheckCircleOutlined />
                            ) : currentStage.index === 0 ? (
                                <LoadingOutlined />
                            ) : null
                        }
                    />
                    <Step
                        title="检索知识库"
                        icon={
                            currentStage.index > 1 ? (
                                <CheckCircleOutlined />
                            ) : currentStage.index === 1 ? (
                                <LoadingOutlined />
                            ) : null
                        }
                    />
                    <Step
                        title="AI 生成"
                        icon={
                            currentStage.index > 2 ? (
                                <CheckCircleOutlined />
                            ) : currentStage.index === 2 ? (
                                <LoadingOutlined />
                            ) : null
                        }
                    />
                    <Step
                        title="填充模板"
                        icon={
                            currentStage.index > 3 ? (
                                <CheckCircleOutlined />
                            ) : currentStage.index === 3 ? (
                                <LoadingOutlined />
                            ) : null
                        }
                    />
                    <Step
                        title={isError ? '失败' : '完成'}
                        icon={
                            isCompleted ? (
                                <CheckCircleOutlined />
                            ) : isError ? (
                                <CloseCircleOutlined />
                            ) : null
                        }
                    />
                </Steps>

                {/* 当前状态消息 */}
                <Alert
                    message={progress.message}
                    type={isError ? 'error' : isCompleted ? 'success' : 'info'}
                    showIcon
                />
            </Space>
        </Card>
    );
};

export default GenerationProgressDisplay;
