import React, {useState, useEffect} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {MessageSquare, X, Send} from 'lucide-react';
import {Input} from './ui/input';
import {Button} from './ui/button';
import {Calendar} from './ui/calendar';
import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';
import {PhoneInput} from './ui/phone-input';

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

    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentNode, setCurrentNode] = useState<NodeResponse | null>(null);
    const [date, setDate] = useState<Date>();
    const [phone, setPhone] = useState('');
    const [selectedButtons, setSelectedButtons] = useState<ButtonOption[]>([]);
    const [chatSessionId, setChatSessionId] = useState('');
    const [chatToken, setChatToken] = useState('');

    const mergedConfig = {...defaultConfig, ...config};

    useEffect(() => {
        if (observersConfig) {
            const {observeUserInput, observeLoading, observeMessages} = observersConfig;
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
        if (isOpen) {
            (async () => await startWorkflow())();
        }
    }, [isOpen]);

    const startWorkflow = async () => {
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
                setMessages(prev => [...prev, {
                    type: 'system',
                    content: `Error: ${data.error}`,
                    timestamp: new Date()
                }]);
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
            setMessages(prev => [...prev, {
                type: 'system',
                content: 'Error starting workflow. Please try again.',
                timestamp: new Date()
            }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !date && !phone && selectedButtons.length === 0) return;

        let userInput = '';
        if (currentNode?.type === 'MENU_DATE_OPTION' && date) {
            userInput = format(date, 'PPP');
        } else if (currentNode?.type === 'MENU_PHONE_OPTION' && phone) {
            userInput = phone;
        } else if (currentNode?.type === 'BUTTONS_NODE' && selectedButtons.length > 0) {
            userInput = selectedButtons.map(btn => btn.label).join(', ');
        } else if (currentNode?.type === 'MENU_INPUT_OPTION') {
            userInput = input;
        }

        setMessages(prev => [...prev, {
            type: 'user',
            content: userInput,
            timestamp: new Date()
        }]);

        try {
            console.log('Continue Chat', JSON.stringify({
                workflowid,
                sessionId,
                currentNodeId,
                token,
                chatSessionId,
                chatToken,
                userInput,
            }));
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

<<<<<<< HEAD
  const handleSend = async () => {
    if (!input.trim() && !date && !phone && selectedButtons.length === 0) return;

    let userInput = '';
    if (currentNode?.type === 'MENU_DATE_OPTION' && date) {
      userInput = format(date, 'PPP');
    } else if (currentNode?.type === 'MENU_PHONE_OPTION' && phone) {
      userInput = phone;
    } else if (currentNode?.type === 'BUTTONS_NODE' && selectedButtons.length > 0) {
      userInput = selectedButtons.map(btn => btn.label).join(', ');
    } else if (currentNode?.type === 'MENU_INPUT_OPTION') {
      userInput = input;
    } else if (currentNode?.type === 'TEXT_MESSAGE') {
      userInput = currentNode.message;
    }
=======
            const data = await response.json();
            if (data.error) {
                setMessages(prev => [...prev, {
                    type: 'system',
                    content: `Error: ${data.error}`,
                    timestamp: new Date()
                }]);
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
            setSelectedButtons([]);
        } catch (error) {
            console.error('Error processing workflow:', error);
            setMessages(prev => [...prev, {
                type: 'system',
                content: 'Error processing workflow. Please try again.',
                timestamp: new Date()
            }]);
        }
    };
>>>>>>> 3fb1f5911bc00db50b58093bdc8fe44dc2612a65

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

<<<<<<< HEAD
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
        setMessages(prev => [...prev, {
          type: 'system',
          content: `Error: ${data.error}`,
          timestamp: new Date()
        }]);
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
      setSelectedButtons([]);
    } catch (error) {
      console.error('Error processing workflow:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Error processing workflow. Please try again.',
        timestamp: new Date()
      }]);
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
      case 'MENU_INPUT_OPTION':
        return (
            <div className="flex gap-2">
              <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
        );

      case 'TEXT_MESSAGE':
        return (
            <div className="text-sm text-gray-500">
              {/*{currentNode.message}*/}
              <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSend();
                      }
                    }}
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4"/>
                </Button>
              </div>
            </div>
        );

      case 'MENU_DATE_OPTION':
        return (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                      )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
        );

      case 'MENU_PHONE_OPTION':
        return (
            <div className="flex gap-2">
              <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter phone number"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
        );

      case 'BUTTONS_NODE':
        const buttonList = currentNode.data?.buttonlist || [];
        return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {buttonList.map((button: ButtonOption) => (
                    <Button
                        key={button.id}
                        variant={button.variant as any}
                        className={cn(
                            'w-full',
                            selectedButtons.some(btn => btn.id === button.id) && 'ring-2 ring-primary'
                        )}
                        onClick={() => handleButtonSelect(button)}
                    >
                      {button.label}
                    </Button>
                ))}
              </div>
              <Button
                  onClick={handleSend}
                  disabled={selectedButtons.length === 0}
                  className="w-full"
              >
                Send Selection
              </Button>
            </div>
        );

      default:
        return (
            <div className="flex gap-2">
              <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
        );
    }
  };

  return (
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <button
              className={cn(
                  'fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors',
                  className
              )}
          >
            {/*<MessageSquare className="w-6 h-6" />*/}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content
              className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl flex flex-col"
              style={{
                width: mergedConfig.width,
                height: mergedConfig.height,
                backgroundColor: mergedConfig.backgroundColor,
                backgroundImage: mergedConfig.backgroundImage ? `url(${mergedConfig.backgroundImage})` : 'none',
                fontSize: mergedConfig.fontSize
              }}
          >
            <div
                className="p-4 border-b flex justify-between items-center"
                style={{ backgroundColor: mergedConfig.titleBackgroundColor }}
            >
              <div className="flex items-center gap-2">
                {mergedConfig.titleAvatarSrc && (
                    <img
                        src={mergedConfig.titleAvatarSrc}
                        alt="Chat Avatar"
                        className="w-6 h-6 rounded-full"
                    />
                )}
                <Dialog.Title
                    className="text-lg font-semibold"
                    style={{ color: mergedConfig.titleTextColor }}
                >
                  {mergedConfig.title}
                </Dialog.Title>
              </div>
              <Dialog.Close className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <ScrollArea.Root className="flex-1 overflow-hidden">
              <ScrollArea.Viewport className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                      <div
                          key={index}
                          className={cn(
                              'p-3 rounded-lg max-w-[80%] flex gap-2',
                              message.type === 'user' ? 'ml-auto' : ''
                          )}
                          style={{
                            backgroundColor: message.type === 'user'
                                ? mergedConfig.userMessage?.backgroundColor || '#3B81F6'
                                : mergedConfig.botMessage?.backgroundColor || '#f7f8ff',
                            color: message.type === 'user'
                                ? mergedConfig.userMessage?.textColor || '#ffffff'
                                : mergedConfig.botMessage?.textColor || '#303235',
                          }}
                      >
                        {message.type === 'system' && mergedConfig.botMessage?.showAvatar && (
                            <img
                                src={mergedConfig.botMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png'}
                                alt="Bot Avatar"
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                        <div>
                          {message.content}
                          {message.timestamp && (
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                          )}
                        </div>
                        {message.type === 'user' && mergedConfig.userMessage?.showAvatar && (
                            <img
                                src={mergedConfig.userMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png'}
                                alt="User Avatar"
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                      </div>
                  ))}
                  {isLoading && (
                      <div
                          className="p-3 rounded-lg max-w-[80%]"
                          style={{
                            backgroundColor: mergedConfig.botMessage?.backgroundColor || '#f7f8ff',
                            color: mergedConfig.botMessage?.textColor || '#303235',
                          }}
                      >
                        Thinking...
                      </div>
                  )}
                  {error && (
                      <div className="p-3 rounded-lg max-w-[80%] bg-red-100 text-red-700">
                        {error}
                      </div>
                  )}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-gray-200">
                <ScrollArea.Thumb className="bg-gray-400 rounded-full" />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner />
            </ScrollArea.Root>
            <div className="p-4 border-t">
              {renderInputField()}
            </div>
            {mergedConfig.footer?.text && (
                <div
                    className="p-2 text-center text-sm border-t"
                    style={{ color: mergedConfig.footer?.textColor }}
                >
                  {mergedConfig.footer?.text}{' '}
                  <a
                      href={mergedConfig.footer?.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                  >
                    {mergedConfig.footer?.company}
                  </a>
                </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
  );
};
=======
    const renderInputField = () => {
        if (!currentNode) return null;

        switch (currentNode.type) {
            case 'MENU_INPUT_OPTION':
                return (
                    <div style={{display: 'flex', gap: '8px'}}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send style={{width: '16px', height: '16px'}}/>
                        </Button>
                    </div>
                );

            case 'TEXT_MESSAGE':
                return (
                    <div style={{fontSize: '14px', color: '#6b7280'}}>
                        {currentNode.message}
                    </div>
                );

            case 'MENU_DATE_OPTION':
                return (
                    <div style={{display: 'flex', gap: '8px'}}>
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
                                        borderRadius: '6px'
                                    }}
                                >
                                    <CalendarIcon style={{marginRight: '8px', width: '16px', height: '16px'}}/>
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent style={{width: 'auto', padding: '0'}}>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handleSend} size="icon">
                            <Send style={{width: '16px', height: '16px'}}/>
                        </Button>
                    </div>
                );

            case 'MENU_PHONE_OPTION':
                return (
                    <div style={{display: 'flex', gap: '8px'}}>
                        <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="Enter phone number"
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send style={{width: '16px', height: '16px'}}/>
                        </Button>
                    </div>
                );

            case 'BUTTONS_NODE':
                const buttonList = currentNode.data?.buttonlist || [];
                return (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                            {buttonList.map((button: ButtonOption) => (
                                <Button
                                    key={button.id}
                                    variant={button.variant as any}
                                    style={{
                                        width: '100%',
                                        border: selectedButtons.some(btn => btn.id === button.id) ? '2px solid #3b82f6' : 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px'
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
                                borderRadius: '6px',
                                backgroundColor: selectedButtons.length === 0 ? '#d1d5db' : '#3b82f6',
                                color: '#ffffff'
                            }}
                        >
                            Send Selection
                        </Button>
                    </div>
                );

            default:
                return (
                    <div style={{display: 'flex', gap: '8px'}}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await handleSend();
                                }
                            }}
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send style={{width: '16px', height: '16px'}}/>
                        </Button>
                    </div>
                );
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
                <button
                    className={className}
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        padding: '12px',
                        borderRadius: '9999px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    <MessageSquare style={{width: '24px', height: '24px'}}/>
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay style={{position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}/>
                <Dialog.Content
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        backgroundColor: mergedConfig.backgroundColor,
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        width: mergedConfig.width,
                        height: mergedConfig.height,
                        backgroundImage: mergedConfig.backgroundImage ? `url(${mergedConfig.backgroundImage})` : 'none',
                        fontSize: mergedConfig.fontSize
                    }}
                >
                    <div
                        style={{
                            padding: '16px',
                            borderBottom: '1px solid #d1d5db',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: mergedConfig.titleBackgroundColor
                        }}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            {mergedConfig.titleAvatarSrc && (
                                <img
                                    src={mergedConfig.titleAvatarSrc}
                                    alt="Chat Avatar"
                                    style={{width: '24px', height: '24px', borderRadius: '9999px'}}
                                />
                            )}
                            <Dialog.Title
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: mergedConfig.titleTextColor
                                }}
                            >
                                {mergedConfig.title}
                            </Dialog.Title>
                        </div>
                        <Dialog.Close
                            style={{
                                padding: '4px',
                                borderRadius: '9999px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X style={{width: '20px', height: '20px'}}/>
                        </Dialog.Close>
                    </div>
                    <ScrollArea.Root style={{flex: '1'}}>
                        <ScrollArea.Viewport style={{height: '100%', padding: '16px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
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
                                            borderRadius: '8px',
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
                                            borderRadius: '8px',
                                            maxWidth: '80%',
                                            backgroundColor: '#fee2e2',
                                            color: '#b91c1c'
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical">
                            <ScrollArea.Thumb/>
                        </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                    <div style={{padding: '16px', borderTop: '1px solid #d1d5db'}}>
                        {renderInputField()}
                    </div>
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
                                style={{fontWeight: '600', textDecoration: 'none'}}
                                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                {mergedConfig.footer?.company}
                            </a>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
>>>>>>> 3fb1f5911bc00db50b58093bdc8fe44dc2612a65
