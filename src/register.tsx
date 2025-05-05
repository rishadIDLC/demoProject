import { defaultBotProps } from './constants';
import { Full } from './features/full';
import { Bubble } from './features/bubble';

class TiktikFullChatbot extends HTMLElement {
  connectedCallback() {
    const root = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(root);
    
    const props = { ...defaultBotProps, ...this.getProps() };
    const element = document.createElement('div');
    root.appendChild(element);
    
    // @ts-ignore
    window.ReactDOM.render(<Full {...props} />, element);
  }

  disconnectedCallback() {
    // @ts-ignore
    window.ReactDOM.unmountComponentAtNode(this.shadowRoot?.firstChild);
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
    
    // @ts-ignore
    window.ReactDOM.render(<Bubble {...props} />, element);
  }

  disconnectedCallback() {
    // @ts-ignore
    window.ReactDOM.unmountComponentAtNode(this.shadowRoot?.firstChild);
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
