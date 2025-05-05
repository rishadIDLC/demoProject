import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { MessageSquare, X, Send } from 'lucide-react';
import { cn } from '../utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PhoneInput } from './ui/phone-input';
import { ChatWindowTheme } from '../features/bubble/types'; 

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
  workflowId: string;
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
    workflowId,
    sessionId,
    currentNodeId,
    token,
    initialMessages = [],
    className,
    config = defaultConfig,
    observersConfig,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
      startWorkflow();
    }
  }, [isOpen]);

  const startWorkflow = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/start-chat/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
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
    } else if (currentNode?.type === 'TEXT_MESSAGE') {
      //userInput = currentNode.message;
    }

    setMessages(prev => [...prev, {
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch(`${apiUrl}/api/v1/continue-chat/${workflowId}`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chatToken}`  
        },
        body: JSON.stringify({  
          workflowId,
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
            {currentNode.message}
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
          <MessageSquare className="w-6 h-6" />
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
          <ScrollArea.Root className="flex-1">
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
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
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