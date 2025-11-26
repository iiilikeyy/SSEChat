import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 聊天消息接口
 */
export interface Message {
  /** 消息唯一标识符 */
  id: string;
  /** 消息内容 */
  content: string;
  /** 消息角色（用户或助手） */
  role: 'user' | 'assistant';
  /** 消息状态（可选） */
  status?: 'loading' | 'completed' | 'error';
}

/**
 * 聊天流选项接口
 */
export interface ChatStreamOptions {
  /** 消息接收回调函数 */
  onMessage?: (message: string) => void;
  /** 错误处理回调函数 */
  onError?: (error: Error) => void;
  /** 完成回调函数 */
  onComplete?: () => void;
}

/**
 * 聊天流自定义 Hook - 处理 SSE 流式聊天逻辑
 * 
 * @returns {Object} 聊天流相关状态和方法
 */
export const useChatStream = () => {
  /** 聊天消息列表 */
  const [messages, setMessages] = useState<Message[]>([]);
  /** 是否正在生成回复 */
  const [isGenerating, setIsGenerating] = useState(false);
  /** 错误信息 */
  const [error, setError] = useState<Error | null>(null);
  /** EventSource 引用 */
  const eventSourceRef = useRef<EventSource | null>(null);
  /** AbortController 引用 */
  const abortControllerRef = useRef<AbortController | null>(null);
  /** 当前助手消息内容引用 */
  const currentAssistantMessageRef = useRef<string>('');
  /** 当前助手消息 ID 引用 */
  const currentAssistantMessageIdRef = useRef<string>('');

  /**
   * 清理函数 - 中止 SSE 连接
   */
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * 发送消息并启动 SSE 流
   * 
   * @param {string} message - 要发送的消息内容
   */
  const sendMessage = useCallback(async (message: string) => {
    setError(null);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      role: 'user',
      status: 'completed'
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      status: 'loading'
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    
    currentAssistantMessageRef.current = '';
    currentAssistantMessageIdRef.current = assistantMessageId;
    
    setIsGenerating(true);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const queryParams = new URLSearchParams({ message });
      const url = `http://localhost:3001/api/chat?${queryParams}`;

      const eventSource = new EventSource(url, { signal: abortController.signal });
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            throw new Error(data.error.message || 'Server error');
          }

          currentAssistantMessageRef.current += data.content;
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === currentAssistantMessageIdRef.current) {
              return {
                ...msg,
                content: currentAssistantMessageRef.current,
                status: data.finish_reason ? 'completed' : 'loading'
              };
            }
            return msg;
          }));

          if (data.finish_reason) {
            cleanup();
          }
        } catch (parseError) {
          console.error('Failed to parse SSE data:', parseError);
          setError(new Error('Failed to parse server response'));
          cleanup();
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE error:', event);
        setError(new Error('Server connection error'));
        cleanup();
      };

      eventSource.onclose = () => {
        console.log('SSE connection closed');
        if (isGenerating) {
          cleanup();
        }
      };

    } catch (err) {
      console.error('Error starting SSE:', err);
      setError(err instanceof Error ? err : new Error('Failed to start streaming'));
      cleanup();
    }
  }, [cleanup, isGenerating]);

  /**
   * 停止生成并清理 SSE 连接
   */
  const stopGenerating = useCallback(() => {
    cleanup();
    
    if (currentAssistantMessageIdRef.current) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === currentAssistantMessageIdRef.current) {
          return {
            ...msg,
            status: 'completed'
          };
        }
        return msg;
      }));
    }
  }, [cleanup]);

  /**
   * 重试最后一条失败的消息
   */
  const retryLastMessage = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.status === 'error') {
      setMessages(prev => prev.slice(0, -1));
      
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        sendMessage(lastUserMessage.content);
      }
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    stopGenerating,
    retryLastMessage
  };
};