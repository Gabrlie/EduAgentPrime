import { get, post, del } from '@/utils/request';

export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

/**
 * 发送消息
 */
export async function sendMessage(content: string): Promise<{ content: string }> {
    return post<{ content: string }>('/api/chat/send', { content });
}

/**
 * 获取聊天历史
 */
export async function getChatHistory(): Promise<{ messages: Message[] }> {
    return get<{ messages: Message[] }>('/api/chat/history');
}

/**
 * 清除聊天历史
 */
export async function clearChatHistory(): Promise<{ message: string }> {
    return del<{ message: string }>('/api/chat/clear');
}
