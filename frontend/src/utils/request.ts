/**
 * 统一的请求工具函数
 * 提供类型安全的请求方法和统一的错误处理
 */
import { request as umiRequest } from '@umijs/max';
import { message } from 'antd';

/**
 * 统一的 API 响应格式
 */
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    detail?: string; // FastAPI 的错误信息字段
    success?: boolean;
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
    /** 是否显示成功提示 */
    showSuccess?: boolean;
    /** 成功提示文本 */
    successText?: string;
    /** 是否显示错误提示 */
    showError?: boolean;
    /** 是否跳过错误处理（抛出错误由调用方处理） */
    skipErrorHandler?: boolean;
}

/**
 * 统一的 GET 请求
 */
export async function get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: RequestOptions
): Promise<T> {
    try {
        const response = await umiRequest<T>(url, {
            method: 'GET',
            params,
            skipErrorHandler: options?.skipErrorHandler,
        });

        if (options?.showSuccess && options?.successText) {
            message.success(options.successText);
        }

        return response;
    } catch (error: any) {
        handleError(error, options);
        throw error;
    }
}

/**
 * 统一的 POST 请求
 */
export async function post<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
): Promise<T> {
    try {
        const response = await umiRequest<T>(url, {
            method: 'POST',
            data,
            skipErrorHandler: options?.skipErrorHandler,
        });

        if (options?.showSuccess && options?.successText) {
            message.success(options.successText);
        }

        return response;
    } catch (error: any) {
        handleError(error, options);
        throw error;
    }
}

/**
 * 统一的 PUT 请求
 */
export async function put<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
): Promise<T> {
    try {
        const response = await umiRequest<T>(url, {
            method: 'PUT',
            data,
            skipErrorHandler: options?.skipErrorHandler,
        });

        if (options?.showSuccess && options?.successText) {
            message.success(options.successText);
        }

        return response;
    } catch (error: any) {
        handleError(error, options);
        throw error;
    }
}

/**
 * 统一的 DELETE 请求
 */
export async function del<T = any>(
    url: string,
    options?: RequestOptions
): Promise<T> {
    try {
        const response = await umiRequest<T>(url, {
            method: 'DELETE',
            skipErrorHandler: options?.skipErrorHandler,
        });

        if (options?.showSuccess && options?.successText) {
            message.success(options.successText);
        }

        return response;
    } catch (error: any) {
        handleError(error, options);
        throw error;
    }
}

/**
 * 统一的错误处理
 */
function handleError(error: any, options?: RequestOptions) {
    // 如果跳过错误处理或显式设置不显示错误，则直接返回
    if (options?.skipErrorHandler || options?.showError === false) {
        return;
    }

    // 尝试从不同的错误格式中提取错误信息
    let errorMessage = '请求失败，请重试';

    if (error?.response?.data) {
        const { detail, message: msg } = error.response.data;
        errorMessage = detail || msg || errorMessage;
    } else if (error?.message) {
        errorMessage = error.message;
    }

    // 显示错误提示
    message.error(errorMessage);
}

/**
 * 导出默认的 request 对象（保持向后兼容）
 */
export { umiRequest as request };
