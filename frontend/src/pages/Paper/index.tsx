import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Modal, Typography } from 'antd';

const META_AI_URL = 'https://metaso.cn';

const Paper: React.FC = () => {
    useEffect(() => {
        Modal.confirm({
            title: '论文管理暂未开放',
            content: (
                <div>
                    <div style={{ marginBottom: 8 }}>
                        当前论文管理功能尚未开发完成，建议先使用秘塔 AI 编写论文。
                    </div>
                    <Typography.Link href={META_AI_URL} target="_blank" rel="noreferrer">
                        前往秘塔 AI
                    </Typography.Link>
                </div>
            ),
            okText: '前往秘塔 AI',
            cancelText: '知道了',
            onOk: () => {
                window.open(META_AI_URL, '_blank', 'noopener,noreferrer');
            },
        });
    }, []);

    return (
        <PageContainer title="论文管理">
            <Card>
                <div style={{ marginBottom: 12 }}>
                    论文管理功能暂未开放，建议先使用秘塔 AI 编写论文。
                </div>
                <Button type="primary" onClick={() => window.open(META_AI_URL, '_blank', 'noopener,noreferrer')}>
                    前往秘塔 AI
                </Button>
            </Card>
        </PageContainer>
    );
};

export default Paper;
