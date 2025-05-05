import type { ComponentType } from "react";
import { ChatMessage } from './components/ChatBotWidget';

export enum BuilderNode {
 // START = "start",
 // END = "end",
  TEXT_MESSAGE = "text-message",
  CONDITIONAL_PATH = "conditional-path",
  TAGS = "tags",
  //MENU = "menu",
  MENU_TEXT_OPTION = "menu-text-option",
  MENU_INPUT_OPTION = "menu-input-option",
  MENU_DATE_OPTION = "menu-date-option",
  MENU_PHONE_OPTION = "menu-phone-option",
  MENU_DATE_NODE = "menu-date-node",
  BUTTONS_NODE = "buttons-node", 
  BUTTONS_OPTION = "buttons-option",
  PROCESS_NODE = "process-node",
  SET_VARIABLE = "set-variable",
  CONDITION = "condition",
  REDIRECT = "redirect",
  SCRIPT_BLOCK = "script-block",
  WAIT = "wait",
  JUMP = "jump",
  OPENAI = "openai",
  WEBHOOK = "webhook",
  EMAIL = "email",
  GOOGLE_SHEETS = "google-sheets",
  GOOGLE_ANALYTICS = "google-analytics",
  ZAPIER = "zapier",
  MAKE_COM = "make-com",
  CHATWOOT = "chatwoot",
  SLACK = "slack",
  MENU_NUMBER_OPTION = "menu-number-option",
  MENU_EMAIL_OPTION = "menu-email-option",
  MENU_URL_OPTION = "menu-url-option",
  MENU_FILE_OPTION = "menu-file-option",
  MENU_IMAGE_OPTION = "menu-image-option",
  MENU_VIDEO_OPTION = "menu-video-option",
  MENU_AUDIO_OPTION = "menu-audio-option",
  MENU_LOCATION_OPTION = "menu-location-option"
}

export enum StartAndEndNode {
   START = "start",
   END = "end",
  
 }

export const HeaderGradientColors = {
  purple: "from-purple-700",
  red: "from-red-700",
  blue: "from-blue-700",
  green: "from-green-700",
  yellow: "from-yellow-700",
  pink: "from-pink-700",
  orange: "from-orange-700",
  teal: "from-teal-700",
  lime: "from-lime-700",
  indigo: "from-indigo-700",
  fuchsia: "from-fuchsia-700",
  emerald: "from-emerald-700",
  cyan: "from-cyan-700",
  rose: "from-rose-700",
  sky: "from-sky-700",
  gray: "from-gray-700",
  slate: "from-slate-700",
};

export type BuilderNodeType = `${BuilderNode}` | `${StartAndEndNode}`;

export interface RegisterNodeMetadata<T = Record<string, unknown>> {
  type: BuilderNodeType | StartAndEndNode;
  node: ComponentType<any>;
  isConnectableStart?: boolean;
  isConnectableEnd?: boolean;
  isConnectable?: boolean;
  id?: string;
  detail: {
    icon: string;
    title: string;
    description: string;
    gradientColor?: keyof typeof HeaderGradientColors;
  };
  connection: {
    inputs: number;
    outputs: number;
  };
  available?: boolean;
  defaultData?: T;
  propertyPanel?: ComponentType<any>;
}

export interface BaseNodeData extends Record<string, unknown> {
  deletable?: boolean;
}

export interface ChatBotConfig {
  apiUrl: string;
  workflowId: string;
  sessionId: string;
  currentNodeId: string;
  token: string;
  title?: string;
  titleAvatarSrc?: string;
  titleBackgroundColor?: string;
  titleTextColor?: string;
  welcomeMessage?: string;
  errorMessage?: string;
  placeholder?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  bubbleBackgroundColor?: string;
  bubbleTextColor?: string;
  userBubbleBackgroundColor?: string;
  userBubbleTextColor?: string;
  height?: number | string;
  width?: number | string;
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
}

export interface NodeResponse {
  type: string;
  nodeId: string;
  data: any;
  message: string;
  validation?: boolean;
}

export interface ButtonOption {
  id: string;
  label: string;
  selected: boolean;
  variant: string;
}

export type ObserverConfigType = (accessor: string | boolean | object | ChatMessage[]) => void;
export type ObserversConfigType = {
  observeUserInput: (input: string) => void;
  observeLoading: (loading: boolean) => void;
  observeMessages: (messages: ChatMessage[]) => void;
};

export interface ChatBotWidgetProps {
  config: ChatBotConfig;
  onSendMessage?: (message: string) => void;
  onReceiveMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onOpen?: () => void;
  bubbleParams?: BubbleParams;
}

export type autoWindowOpenTheme = {
  autoOpen?: boolean;
  openDelay?: number;
  autoOpenOnMobile?: boolean;
};

export type ButtonTheme = {
  size?: 'small' | 'medium' | 'large' | number;
  backgroundColor?: string;
  iconColor?: string;
  customIconSrc?: string;
  bottom?: number;
  right?: number;
  dragAndDrop?: boolean;
  autoWindowOpen?: autoWindowOpenTheme;
};

export type ToolTipTheme = {
  showTooltip?: boolean;
  tooltipMessage?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipFontSize?: number;
};

export type DisclaimerPopUpTheme = {
  title?: string;
  message?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonText?: string;
  blurredBackgroundColor?: string;
  backgroundColor?: string;
  denyButtonBgColor?: string;
  denyButtonText?: string;
};

export type FormTheme = {
  backgroundColor?: string;
  textColor?: string;
};

export type ChatWindowTheme = {
  // Add chat window specific theme properties here
  backgroundColor?: string;
  textColor?: string;
};

export type BubbleTheme = {  
  button?: ButtonTheme;
  tooltip?: ToolTipTheme;
  disclaimer?: DisclaimerPopUpTheme;
  customCSS?: string;
  form?: FormTheme;
  chatWindow?: ChatWindowTheme;
};

export type BubbleParams = {
  theme?: BubbleTheme;
}; 