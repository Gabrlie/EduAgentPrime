import { request } from '@umijs/max';

/**
 * 生成教案（流式，带进度）
 */
export async function generateLessonPlanStream(
    courseId: number,
    sequence: number,
    documents: string,
    onProgress: (data: any) => void,
): Promise<void> {
    const url = `/api/courses/${courseId}/generate-lesson-plan/stream?sequence=${sequence}&documents=${encodeURIComponent(documents)}`;

    // 使用 EventSource 接收 SSE
    const eventSource = new EventSource(url, {
        withCredentials: true,
    });

    return new Promise((resolve, reject) => {
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onProgress(data);

                // 如果完成或出错，关闭连接
                if (data.stage === 'completed' || data.stage === 'error') {
                    eventSource.close();
                    if (data.stage === 'error') {
                        reject(new Error(data.message));
                    } else {
                        resolve();
                    }
                }
            } catch (error) {
                console.error('解析 SSE 数据失败:', error);
                eventSource.close();
                reject(error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE 连接错误:', error);
            eventSource.close();
            reject(error);
        };
    });
}

/**
 * 获取课程的教案列表
 */
export async function getLessonPlans(courseId: number) {
    return request(`/api/courses/${courseId}/lesson-plans`, {
        method: 'GET',
    });
}

/**
 * 下载教案 Word 文档
 */
export function downloadLessonPlan(fileUrl: string) {
    window.open(fileUrl, '_blank');
}
