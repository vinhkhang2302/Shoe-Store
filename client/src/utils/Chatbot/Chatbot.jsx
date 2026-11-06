import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.scss';
import { requestChat } from '../../Config/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes } from '@fortawesome/free-solid-svg-icons';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi là trợ lý bán hàng. Tôi có thể giúp gì cho bạn?', sender: 'bot' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            const userMessage = inputMessage.trim();
            setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
            setInputMessage('');
            setIsLoading(true);

            try {
                const response = await requestChat(userMessage);
                setMessages((prev) => [...prev, { text: response, sender: 'bot' }]);
            } catch (error) {
                setMessages((prev) => [
                    ...prev,
                    {
                        text: 'Xin lỗi, trợ lý Kainie đang tạm thời không kết nối được. Bạn hãy thử lại sau ít phút nhé.',
                        sender: 'bot',
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <button className={styles.chatButton} onClick={() => setIsOpen(true)} aria-label="Mở chat">
                <FontAwesomeIcon icon={faComments} />
            </button>

            {isOpen && (
                <div className={styles.chatbotContainer}>
                    <div className={styles.chatHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                                style={{ width: '35px', height: '35px', borderRadius: '50%' }}
                                src="https://static.vecteezy.com/system/resources/previews/007/225/199/non_2x/robot-chat-bot-concept-illustration-vector.jpg"
                                alt=""
                            />
                            <h2 style={{ fontSize: '16px' }}>Trợ lý Kainie</h2>
                        </div>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Đóng chat">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={styles.messageList}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${
                                    message.sender === 'user' ? styles.userMessage : styles.botMessage
                                }`}
                            >
                                <div
                                    className={styles.messageContent}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <div className={styles.messageContent}>
                                    <span className={styles.typingIndicator}>Đang nhập...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Nhập tin nhắn của bạn..."
                            className={styles.input}
                            disabled={isLoading}
                        />
                        <button type="submit" className={styles.sendButton} disabled={isLoading}>
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;

