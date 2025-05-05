
//import { BubbleTheme } from './features/bubble/types';

import { ChatBotWidgetProps } from "./components/ChatBotWidget";


let elementUsed: Element | undefined;

export const initFull = (props: ChatBotWidgetProps & { id?: string }) => {
  destroy();
  const fullElement = props.id ? document.getElementById(props.id) : document.querySelector('tiktik-fullchatbot');
  if (!fullElement) throw new Error('<tiktik-fullchatbot> element not found.');
  Object.assign(fullElement, props);
  elementUsed = fullElement;
};

export const init = (props: ChatBotWidgetProps) => {
  destroy();
  const element = document.createElement('tiktik-chatbot');
  Object.assign(element, props);
  document.body.appendChild(element);
  elementUsed = element;
};

export const destroy = () => {
  elementUsed?.remove();
};

type Chatbot = {
  initFull: typeof initFull;
  init: typeof init;
  destroy: typeof destroy;
};

declare const window:
  | {
      Chatbot: Chatbot | undefined;
    }
  | undefined;

export const parseChatbot = () => ({
  initFull,
  init,
  destroy,
});

export const injectChatbotInWindow = (bot: Chatbot) => {
  if (typeof window === 'undefined') return;
  window.Chatbot = { ...bot };
};
