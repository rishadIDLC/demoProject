import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Download } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PhoneInput } from './ui/phone-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface ChatMessage {
    type: 'system' | 'user';
    content: string;
    timestamp: Date;
}

export interface NodeResponse {
    type: string;
    nodeId: string;
    data: any;
    message: string;
    validation?: boolean;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
}

export interface ButtonOption {
    id: string;
    label: string;
    selected: boolean;
    variant: string;
}

type observerConfigType = (accessor: string | boolean | object | ChatMessage[]) => void;
export type observersConfigType = Record<'observeUserInput' | 'observeLoading' | 'observeMessages', observerConfigType>;

export type ChatBotWidgetProps = {
    apiUrl: string;
    workflowid: string;
    sessionId: string;
    currentNodeId: string;
    token: string;
    initialMessages?: ChatMessage[];
    className?: string;
    observersConfig?: observersConfigType;
    config?: {
        title?: string;
        titleAvatarSrc?: string;
        titleBackgroundColor?: string;
        titleTextColor?: string;
        welcomeMessage?: string;
        errorMessage?: string;
        backgroundColor?: string;
        backgroundImage?: string;
        height?: number;
        width?: number;
        fontSize?: number;
        starterPrompts?: string[];
        clearChatOnReload?: boolean;
        botMessage?: {
            backgroundColor?: string;
            textColor?: string;
            showAvatar?: boolean;
            avatarSrc?: string;
        };
        userMessage?: {
            backgroundColor?: string;
            textColor?: string;
            showAvatar?: boolean;
            avatarSrc?: string;
        };
        textInput?: {
            placeholder?: string;
            backgroundColor?: string;
            textColor?: string;
            sendButtonColor?: string;
            maxChars?: number;
            maxCharsWarningMessage?: string;
            autoFocus?: boolean;
            sendMessageSound?: boolean;
            receiveMessageSound?: boolean;
        };
        footer?: {
            textColor?: string;
            text?: string;
            company?: string;
            companyLink?: string;
        };
    };
}

const defaultConfig: Required<ChatBotWidgetProps>['config'] = {
    title: 'Chat Assistant',
    titleAvatarSrc: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
    titleBackgroundColor: '#3B81F6',
    titleTextColor: '#ffffff',
    welcomeMessage: 'Hello! How can I help you today?',
    errorMessage: 'Sorry, something went wrong. Please try again.',
    backgroundColor: '#ffffff',
    backgroundImage: '',
    height: 600,
    width: 400,
    fontSize: 16,
    starterPrompts: [],
    clearChatOnReload: false,
    botMessage: {
        backgroundColor: '#f7f8ff',
        textColor: '#303235',
        showAvatar: true,
        avatarSrc: 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png',
    },
    userMessage: {
        backgroundColor: '#3B81F6',
        textColor: '#ffffff',
        showAvatar: true,
        avatarSrc: 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png',
    },
    textInput: {
        placeholder: 'Type your message...',
        backgroundColor: '#ffffff',
        textColor: '#303235',
        sendButtonColor: '#3B81F6',
        maxChars: 1000,
        maxCharsWarningMessage: 'You exceeded the characters limit.',
        autoFocus: true,
        sendMessageSound: true,
        receiveMessageSound: true,
    },
    footer: {
        textColor: '#303235',
        text: 'Powered by',
        company: 'TikTik',
        companyLink: 'https://tiktik.com',
    },
};

export const ChatBotWidget = (props: ChatBotWidgetProps) => {
    const {
        apiUrl,
        workflowid,
        sessionId,
        currentNodeId,
        token,
        initialMessages = [],
        className,
        config = defaultConfig,
        observersConfig,
    } = props;

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentNode, setCurrentNode] = useState<NodeResponse | null>(null);
    const [date, setDate] = useState<Date>();
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [selectedButtons, setSelectedButtons] = useState<ButtonOption[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState('');
    const [chatSessionId, setChatSessionId] = useState('');
    const [chatToken, setChatToken] = useState('');
    const [currentPage, setCurrentPage] = useState('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const mergedConfig = { ...defaultConfig, ...config };

    useEffect(() => {
        if (observersConfig) {
            const { observeUserInput, observeLoading, observeMessages } = observersConfig;
            if (typeof observeUserInput === 'function') {
                observeUserInput(input);
            }
            if (typeof observeLoading === 'function') {
                observeLoading(isLoading);
            }
            if (typeof observeMessages === 'function') {
                observeMessages(messages);
            }
        }
    }, [input, isLoading, messages, observersConfig]);

    useEffect(() => {
        (async () => await startWorkflow())();
    }, []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const validateInput = (type: string, value: string) => {
        switch (type) {
            case 'NUMBER':
                return /^\d+$/.test(value);
            case 'EMAIL':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'PHONE':
                return /^\+\d{1,3}\d{10}$/.test(value);
            case 'TEXT_MESSAGE':
                return value.trim() !== '';
            default:
                return true;
        }
    };

    const startWorkflow = async () => {
        setIsLoading(true);
        try {
            console.log('Starting Workflow', workflowid);
            const response = await fetch(`${apiUrl}/api/v1/start-chat/${workflowid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workflowid,
                    sessionId,
                    currentNodeId,
                    token,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setChatSessionId(data.chatSessionId);
            setChatToken(data.chatToken);
            setCurrentNode(data);
            setMessages(prev => [...prev, {
                type: 'system',
                content: data.message,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Error starting workflow:', error);
            setError('Error starting workflow. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        let userInput = '';
        let isValid = true;

        switch (currentNode?.type) {
            case 'TEXT_MESSAGE':
            case 'NUMBER':
            case 'LABEL':
                if (!validateInput(currentNode.type, input)) {
                    isValid = false;
                    setError('Invalid input. Please check your entry.');
                    return;
                }
                userInput = input;
                break;
            case 'DATE':
                if (!date) {
                    isValid = false;
                    setError('Please select a date.');
                    return;
                }
                userInput = format(date, 'MM-dd-yyyy');
                break;
            case 'PHONE':
                if (!validateInput('PHONE', phone)) {
                    isValid = false;
                    setError('Please enter a valid phone number with country code.');
                    return;
                }
                userInput = phone;
                break;
            case 'EMAIL':
                if (!validateInput('EMAIL', email)) {
                    isValid = false;
                    setError('Please enter a valid email address.');
                    return;
                }
                userInput = email;
                break;
            case 'DROPDOWN':
                if (!selectedDropdown) {
                    isValid = false;
                    setError('Please select an option.');
                    return;
                }
                userInput = selectedDropdown;
                break;
            case 'BUTTON_LIST':
                if (selectedButtons.length === 0) {
                    isValid = false;
                    setError('Please select at least one button.');
                    return;
                }
                userInput = selectedButtons.map(btn => btn.label).join(', ');
                break;
            default:
                if (!input.trim()) return;
                userInput = input;
        }

        if (!isValid) return;

        setMessages(prev => [...prev, {
            type: 'user',
            content: userInput,
            timestamp: new Date()
        }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/v1/continue-chat/${workflowid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${chatToken}`
                },
                body: JSON.stringify({
                    workflowid,
                    sessionId,
                    currentNodeId,
                    token,
                    chatSessionId,
                    chatToken,
                    userInput,
                }),
            });

            const data = await response.json();
            if (data.error) {
                setError(data.error);
                return;
            }

            setCurrentNode(data);
            setMessages(prev => [...prev, {
                type: 'system',
                content: data.message,
                timestamp: new Date()
            }]);

            setInput('');
            setDate(undefined);
            setPhone('');
            setEmail('');
            setSelectedButtons([]);
            setSelectedDropdown('');
        } catch (error) {
            console.error('Error processing workflow:', error);
            setError('Error processing workflow. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonSelect = (button: ButtonOption) => {
        setSelectedButtons(prev => {
            const isSelected = prev.some(btn => btn.id === button.id);
            if (isSelected) {
                return prev.filter(btn => btn.id !== button.id);
            } else {
                return [...prev, button];
            }
        });
    };

    const renderInputField = () => {
        if (!currentNode) return null;

        switch (currentNode.type) {
            case 'TEXT_MESSAGE':
            case 'NUMBER':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={currentNode.type === 'NUMBER' ? 'Enter a number...' : 'Type your message...'}
                            type={currentNode.type === 'NUMBER' ? 'number' : 'text'}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await handleSend();
                                }
                            }}
                            style={{ borderRadius: '4px', padding: '8px' }}
                        />
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );

            case 'LABEL':
                return (
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        <Input
                            value={currentNode.message}
                            readOnly
                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', borderRadius: '4px', padding: '8px' }}
                        />
                    </div>
                );

            case 'DROPDOWN':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Select onValueChange={setSelectedDropdown} value={selectedDropdown}>
                            <SelectTrigger style={{ width: '100%', borderRadius: '4px', padding: '8px' }}>
                                <SelectValue placeholder="Select an option..." />
                            </SelectTrigger>
                            <SelectContent>
                                {currentNode.data?.options?.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );

            case 'DATE':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        fontWeight: 'normal',
                                        color: date ? 'inherit' : '#6b7280',
                                        border: '1px solid #d1d5db',
                                        padding: '8px 12px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <CalendarIcon style={{ marginRight: '8px', width: '16px', height: '16px' }} />
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent style={{ width: 'auto', padding: '0' }}>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );

            case 'PHONE':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="Enter phone number (+1234567890)"
                            className={`border-4 padding-8`}

                        />
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );

            case 'EMAIL':
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address..."
                            type="email"
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await handleSend();
                                }
                            }}
                            style={{ borderRadius: '4px', padding: '8px' }}
                        />
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );

            case 'BUTTON_LIST':
                const buttonList = currentNode.data?.buttonlist || [];
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {buttonList.map((button: ButtonOption) => (
                                <Button
                                    key={button.id}
                                    variant={button.variant as any}
                                    style={{
                                        width: '100%',
                                        border: selectedButtons.some(btn => btn.id === button.id) ? '2px solid #3b82f6' : 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px'
                                    }}
                                    onClick={() => handleButtonSelect(button)}
                                >
                                    {button.label}
                                </Button>
                            ))}
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={selectedButtons.length === 0}
                            style={{
                                width: '100%',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                backgroundColor: selectedButtons.length === 0 ? '#d1d5db' : '#3b82f6',
                                color: '#ffffff'
                            }}
                        >
                            Send Selection
                        </Button>
                    </div>
                );

            case 'IMAGE':
                return (
                    <div style={{ maxWidth: '100%' }}>
                        <img
                            src={currentNode.url}
                            alt={currentNode.alt || 'Image'}
                            style={{
                                width: currentNode.width || '100%',
                                height: currentNode.height || 'auto',
                                borderRadius: '4px'
                            }}
                        />
                        {currentNode.caption && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                {currentNode.caption}
                            </div>
                        )}
                    </div>
                );

            case 'VIDEO':
                return (
                    <div style={{ maxWidth: '100%' }}>
                        <video
                            controls
                            src={currentNode.url}
                            style={{
                                width: currentNode.width || '100%',
                                height: currentNode.height || 'auto',
                                borderRadius: '4px'
                            }}
                        />
                        {currentNode.caption && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                {currentNode.caption}
                            </div>
                        )}
                    </div>
                );

            case 'AUDIO':
                return (
                    <div style={{ maxWidth: '100%' }}>
                        <audio
                            controls
                            src={currentNode.url}
                            style={{ width: '100%' }}
                        />
                        {currentNode.caption && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                {currentNode.caption}
                            </div>
                        )}
                    </div>
                );

            case 'FILE':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                            asChild
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '4px'
                            }}
                        >
                            <a href={currentNode.url} download>
                                <Download style={{ width: '16px', height: '16px' }} />
                                Download File
                            </a>
                        </Button>
                        {currentNode.caption && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {currentNode.caption}
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await handleSend();
                                }
                            }}
                            style={{ borderRadius: '4px', padding: '8px' }}
                        />
                        <Button onClick={handleSend} size="icon" style={{ borderRadius: '4px', backgroundColor: '#3B81F6' }}>
                            <Send style={{ width: '16px', height: '16px' }} />
                        </Button>
                    </div>
                );
        }
    };

    const renderPageContent = () => {
        switch (currentPage) {

            case 'chat':
            default:
                return (
                    <>
                        <div
                            style={{
                                flex: '1',
                                overflowY: 'auto',
                                padding: '16px',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#888 #f1f1f1',
                            }}
                            className="custom-scrollbar"
                        >
                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '4px',
                                            maxWidth: '80%',
                                            display: 'flex',
                                            gap: '8px',
                                            marginLeft: message.type === 'user' ? 'auto' : '0',
                                            backgroundColor: message.type === 'user'
                                                ? mergedConfig.userMessage?.backgroundColor || '#3B81F6'
                                                : mergedConfig.botMessage?.backgroundColor || '#f7f8ff',
                                            color: message.type === 'user'
                                                ? mergedConfig.userMessage?.textColor || '#ffffff'
                                                : mergedConfig.botMessage?.textColor || '#303235'
                                        }}
                                    >
                                        {message.type === 'system' && mergedConfig.botMessage?.showAvatar && (
                                            <img
                                                src={mergedConfig.botMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png'}
                                                alt="Bot Avatar"
                                                style={{width: '24px', height: '24px', borderRadius: '9999px'}}
                                            />
                                        )}
                                        <div>
                                            {message.content}
                                            {message.timestamp && (
                                                <div style={{fontSize: '12px', opacity: '0.7', marginTop: '4px'}}>
                                                    {message.timestamp.toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                        {message.type === 'user' && mergedConfig.userMessage?.showAvatar && (
                                            <img
                                                src={mergedConfig.userMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png'}
                                                alt="User Avatar"
                                                style={{width: '24px', height: '24px', borderRadius: '9999px'}}
                                            />
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div
                                        style={{
                                            padding: '12px',
                                            borderRadius: '4px',
                                            maxWidth: '80%',
                                            backgroundColor: mergedConfig.botMessage?.backgroundColor || '#f7f8ff',
                                            color: mergedConfig.botMessage?.textColor || '#303235'
                                        }}
                                    >
                                        Thinking...
                                    </div>
                                )}
                                {error && (
                                    <div
                                        style={{
                                            padding: '12px',
                                            borderRadius: '4px',
                                            maxWidth: '80%',
                                            backgroundColor: '#fee2e2',
                                            color: '#b91c1c'
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                                <div ref={messagesEndRef}/>
                            </div>
                        </div>
                        <div style={{ padding: '16px', borderTop: '1px solid #d1d5db' }}>
                            {renderInputField()}
                        </div>
                    </>
                );
        }
    };

    return (
        <div
            style={{
                backgroundColor: mergedConfig.backgroundColor,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: mergedConfig.width,
                height: mergedConfig.height,
                backgroundImage: mergedConfig.backgroundImage ? `url(${mergedConfig.backgroundImage})` : 'none',
                fontSize: mergedConfig.fontSize,
                position: 'relative',
                margin: '0 auto'
            }}
        >
            {/* Navigation Menu */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    padding: '16px',
                    borderBottom: '1px solid #d1d5db',
                    backgroundColor: '#f7f8ff'
                }}
            >
                <button
                    onClick={() => setCurrentPage('chat')}
                    style={{
                        fontSize: '16px',
                        color: currentPage === 'chat' ? '#3B81F6' : '#6b7280',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                    }}
                >
                    Chat
                </button>
            </div>

            {/* Main Content */}
            {renderPageContent()}


            {mergedConfig.footer?.text && (
                <div
                    style={{
                        padding: '8px',
                        textAlign: 'center',
                        fontSize: '14px',
                        borderTop: '1px solid #d1d5db',
                        color: mergedConfig.footer?.textColor
                    }}
                >
                    {mergedConfig.footer?.text}{' '}
                    <a
                        href={mergedConfig.footer?.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: '600', textDecoration: 'none' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {mergedConfig.footer?.company}
                    </a>
                </div>
            )}
        </div>
    );
};