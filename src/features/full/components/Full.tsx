import { ChatBotWidget, ChatBotWidgetProps } from '../../../components/ChatBotWidget';
import { BubbleParams } from '../../../features/bubble/types';
import { useEffect, useState } from 'react';

const defaultButtonColor = '#3B81F6';
const defaultIconColor = 'white';

export type FullProps = ChatBotWidgetProps & BubbleParams;

export const Full = (props: FullProps) => {
  const [isBotDisplayed, setIsBotDisplayed] = useState(false);

  const launchBot = () => {
    setIsBotDisplayed(true);
    document.body.style.margin = '0';
    document.documentElement.style.padding = '0';

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content');
    }
  };

  useEffect(() => {
    const botLauncherObserver = new IntersectionObserver((intersections) => {
      if (intersections.some((intersection) => intersection.isIntersecting)) launchBot();
    });

    const element = document.querySelector('#chatbot-container');
    if (element) {
      botLauncherObserver.observe(element);
    }

    return () => {
      botLauncherObserver.disconnect();
      document.body.style.margin = '';
      document.documentElement.style.padding = '';

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  return (
    <>
      {props.theme?.customCSS && (
        <style>{props.theme.customCSS}</style>
      )}
      {isBotDisplayed && (
        <div
          id="chatbot-container"
          style={{
            backgroundColor: props.theme?.chatWindow?.backgroundColor || '#ffffff',
            height: props.theme?.chatWindow?.height ? `${props.theme?.chatWindow?.height.toString()}px` : '100dvh',
            width: props.theme?.chatWindow?.width ? `${props.theme?.chatWindow?.width.toString()}px` : '100%',
            margin: '0px',
            overflow: 'hidden',
          }}  
        >
          <ChatBotWidget
            apiUrl={props.apiUrl}
            workflowid={props.workflowid}
            sessionId={props.sessionId}
            currentNodeId={props.currentNodeId}
            token={props.token}
            initialMessages={props.initialMessages}
            className={props.className}
            config={props.config}
            observersConfig={props.observersConfig}
          />
        </div>
      )}
    </>
  );
};
