import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Typography, Space, Spin, Alert } from 'antd';
import { SendOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { useChatStream, type Message } from '../hooks/useChatStream';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 聊天组件 - 实现聊天界面和交互逻辑
 * 
 * @returns {React.ReactElement} 聊天组件
 */
const Chat: React.FC = () => {
  /**
   * 输入框的值
   */
  const [inputValue, setInputValue] = useState('');
  
  /**
   * 用于自动滚动到底部的引用
   */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  /**
   * 聊天容器的引用
   */
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  /**
   * 使用聊天流自定义 hook
   */
  const {
    messages,
    isGenerating,
    error,
    sendMessage,
    stopGenerating,
    retryLastMessage
  } = useChatStream();

  /**
   * 自动滚动到底部当有新消息添加时
   * 
   * @dependency {messages} 聊天消息列表
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 处理发送消息
   * 
   * @returns {void}
   */
  const handleSend = () => {
    if (inputValue.trim() && !isGenerating) {
      const message = inputValue.trim();
      setInputValue('');
      sendMessage(message);
    }
  };

  /**
   * 处理停止生成
   * 
   * @returns {void}
   */
  const handleStop = () => {
    stopGenerating();
  };

  /**
   * 处理重试发送消息
   * 
   * @returns {void}
   */
  const handleRetry = () => {
    retryLastMessage();
  };

  /**
   * 处理键盘按键事件
   * - Enter: 发送消息
   * - Shift+Enter: 换行
   * 
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e 键盘事件
   * @returns {void}
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * 渲染消息项
   * 
   * @param {Message} message 消息对象
   * @returns {React.ReactElement} 渲染后的消息元素
   */
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          padding: '8px 16px',
          animation: 'fadeIn 0.3s ease-in-out',
        }}
      >
        <div
          className="chat-message-bubble"
          style={{
            maxWidth: '75%',
            padding: '12px 16px',
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            backgroundColor: isUser ? '#6366f1' : '#f8fafc',
            color: isUser ? '#fff' : '#1e293b',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            wordWrap: 'break-word',
            lineHeight: 1.6,
            fontSize: '15px',
            transition: 'all 0.2s ease',
          }}
        >
          <Text>{message.content}</Text>
          {message.status === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
              <Spin size="small" style={{ color: isUser ? 'rgba(255, 255, 255, 0.8)' : '#6366f1' }} />
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '12px', 
                  color: isUser ? 'rgba(255, 255, 255, 0.8)' : '#64748b' 
                }}
              >
                正在生成中...
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={chatContainerRef}
      className="chat-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
      <div className="chat-header" style={{
        marginBottom: '24px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px',
        }}>
          流式聊天应用
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0,
          fontWeight: '500',
        }}>
          基于 SSE 的实时 AI 聊天体验
        </p>
      </div>
      
      {error && (
        <Alert
          message="错误"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button
              className="chat-button"
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRetry}
              style={{
                borderRadius: '20px',
                backgroundColor: '#6366f1',
                borderColor: '#6366f1',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              重试
            </Button>
          }
          style={{ 
            marginBottom: '16px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: 'none',
          }}
        />
      )}

      <div className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
      }}>
        {messages.length === 0 ? (
          <div className="chat-empty-state" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 20px',
            color: '#64748b',
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              opacity: 0.8,
              filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))',
            }}>
              💬
            </div>
            <Text style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600', color: '#1e293b' }}>
              开始聊天吧！
            </Text>
            <Text style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
              输入你的问题，AI 将实时为你生成回复，体验流畅的流式聊天
            </Text>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area" style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '16px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息... (Shift+Enter 换行)"
          rows={2}
          disabled={false}
          style={{
            flex: 1,
            borderRadius: '16px',
            resize: 'none',
            border: '2px solid #e2e8f0',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            fontSize: '15px',
          }}
        />
        <Space orientation="vertical" style={{ gap: '8px' }}>
          {isGenerating ? (
            <Button
              className="chat-button"
              type="primary"
              danger
              icon={<StopOutlined />}
              onClick={handleStop}
              size="large"
              block
              style={{
                borderRadius: '16px',
                height: '44px',
                fontWeight: '600',
                fontSize: '15px',
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              停止生成
            </Button>
          ) : (
            <Button
              className="chat-button"
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              size="large"
              block
              disabled={!inputValue.trim()}
              style={{
                borderRadius: '16px',
                height: '44px',
                fontWeight: '600',
                fontSize: '15px',
                backgroundColor: '#6366f1',
                borderColor: '#6366f1',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              发送
            </Button>
          )}
        </Space>
      </div>

      {isGenerating && (
        <div className="chat-status" style={{
          marginTop: '12px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-in-out',
        }}>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '500',
            }}
          >
            <Spin size="small" style={{ color: '#ffffff' }} />
            AI 正在生成回复...
          </Text>
        </div>
      )}
    </div>
  );
};

export default Chat;