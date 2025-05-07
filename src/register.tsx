import { defaultBotProps } from './constants';
import { Full } from './features/full';
import { Bubble } from './features/bubble';
import { createRoot } from 'react-dom/client';


class TiktikFullChatbot extends HTMLElement {
  connectedCallback() {
    const root = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(root);
    
    const props = { ...defaultBotProps, ...this.getProps() };
    const element = document.createElement('div');
    root.appendChild(element);

    const root1 = createRoot(root); // createRoot(container!) if you use TypeScript
    // @ts-ignore
    root1.render(<Full {...props} />);
  }

  disconnectedCallback() {
    // @ts-ignore
    root1.unmountComponentAtNode(this.shadowRoot?.firstChild);
  }

  getProps() {
    return Object.fromEntries(
      Array.from(this.attributes).map(attr => [attr.name, attr.value])
    );
  }
}

class TiktikChatbot extends HTMLElement {
  connectedCallback() {
    const root = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(root);
    
    const props = { ...defaultBotProps, ...this.getProps() };
    const element = document.createElement('div');
    root.appendChild(element);

    const root1 = createRoot(root); // createRoot(container!) if you use TypeScript
    // @ts-ignore
    root1.render(<Bubble {...props} />);
  }

  disconnectedCallback() {
    // @ts-ignore
    root1.unmountComponentAtNode(this.shadowRoot?.firstChild);
  }

  getProps() {
    return Object.fromEntries(
      Array.from(this.attributes).map(attr => [attr.name, attr.value])
    );
  }
}

export const registerWebComponents = () => {
  if (typeof window === 'undefined') return;
  
  if (!customElements.get('tiktik-fullchatbot')) {
    customElements.define('tiktik-fullchatbot', TiktikFullChatbot);
  }
  
  if (!customElements.get('tiktik-chatbot')) {
    customElements.define('tiktik-chatbot', TiktikChatbot);
  }
};
