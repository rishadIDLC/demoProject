import { ChatMessage, NodeResponse } from './components/ChatBotWidget';

const USE_MOCK = process.env.USE_MOCK === 'true';
const API_HOST = process.env.API_HOST;
const MY_API_KEY = process.env.MY_API_KEY;

export class MockChatService {
  private chatSessions: Map<string, {
    messages: ChatMessage[];
    currentNode: NodeResponse;
  }> = new Map();

  startChat(workflowid: string, sessionId: string, currentNodeId: string, token: string): Promise<{
    chatSessionId: string;
    chatToken: string;
    message: string;
    type: string;
    nodeId: string;
    data: any;
  }> {
    const chatSessionId = `session_${Date.now()}`;
    const chatToken = `token_${Date.now()}`;

    const initialNode: NodeResponse = {
      type: 'TEXT_MESSAGE',
      nodeId: currentNodeId,
      data: {},
      message: 'Welcome to the chat! How can I help you today?'
    };

    this.chatSessions.set(chatSessionId, {
      messages: [],
      currentNode: initialNode
    });

    return Promise.resolve({
      chatSessionId,
      chatToken,
      ...initialNode
    });
  }

  continueChat(
    workflowid: string,
    sessionId: string,
    currentNodeId: string,
    token: string,
    chatSessionId: string,
    chatToken: string,
    userInput: string
  ): Promise<NodeResponse> {
    const session = this.chatSessions.get(chatSessionId);

    if (!session) {
      // throw new Error('Chat session not found');
      throw new Error(`Chat session not found for chatSessionId: ${chatSessionId}`);
    }
    console.log("hjello1",userInput);
    // Mock different types of responses based on user input
    let response: NodeResponse;
    console.log("hjello",userInput);
    if(userInput.toLowerCase().includes('text')) {
      response = {
        type: 'TEXT_MESSAGE',
        nodeId: 'text_node',
        data: { 
          text: userInput
        }  ,
        message: `You said: ${userInput}. How can I help you further?`
      };
    } else if(userInput.toLowerCase().includes('number')) {
      response = {
        type: 'NUMBER',
        nodeId: 'number_node',
        data: {
          number: userInput
        },
        message: `You said: ${userInput}. How can I help you further?`
      };
    } else if(userInput.toLowerCase().includes('label')) {
      response = {
        type: 'LABEL',
        nodeId: 'label_node',
        data: {
          label: userInput
        },
        message: `You said: ${userInput}. How can I help you further?`
      };
    }
    else if(userInput.toLowerCase().includes('dropdown')) {
      response = {
        type: 'DROPDOWN',
        nodeId: 'dropdown_node',
        data: {
          menu: [
            { id: '1', label: 'Option 1', selected: false, variant: 'default' },
            { id: '2', label: 'Option 2', selected: false, variant: 'default' },
            { id: '3', label: 'Option 3', selected: false, variant: 'default' },
            { id: '4', label: 'Option 4', selected: false, variant: 'default' },
            { id: '5', label: 'Option 5', selected: false, variant: 'default' }
          ]
        },
        message: 'Please select an option:'
      };
    } else if(userInput.toLowerCase().includes('date')) {
      response = {
        type: 'DATE_OPTION',
        nodeId: 'date_node',
        data: {
          date: '2021-01-01',
          time: '12:00:00',
          timezone: 'America/New_York'

        },
        message: 'Please select a date:'
      };
    } else if(userInput.toLowerCase().includes('phone')) {
      response = {
        type: 'PHONE_OPTION',          
        nodeId: 'phone_node',
        data: {
          countryCode: '+1',                     
          phone: '1234567890'

        },
        message: 'Please enter your phone number:'
      };
    } else if(userInput.toLowerCase().includes('button list')) {
      response = {
        type: 'BUTTONS_LIST',
        nodeId: 'buttons_list',
        data: {
          buttonlist: [
            { id: '1', label: 'Button 1', selected: false, variant: 'default' },
            { id: '2', label: 'Button 2', selected: false, variant: 'default' },
            { id: '3', label: 'Button 3', selected: false, variant: 'default' },
            { id: '4', label: 'Button 4', selected: false, variant: 'default' },
            { id: '5', label: 'Button 5', selected: false, variant: 'default' }
          ]
        },
        message: 'Please select 1 or more options:'
      };
    } else if(userInput.toLowerCase().includes('picture') || userInput.toLowerCase().includes('image')) {
      response = {
        type: 'IMAGE',
        nodeId: 'image_node',
        url: 'https://via.placeholder.com/150',
        alt: 'Image',
        width: 150,
        height: 150,
        caption: 'Image caption',
        data: {},
        message: 'Please select an image:'
      };
    } else if(userInput.toLowerCase().includes('video'))  {
      response = {
        type: 'VIDEO',
        nodeId: 'video_node',
        data: {
          video: 'https://via.placeholder.com/150',
          alt: 'Video',
          width: 150,
          height: 150,
          caption: 'Video caption'
        },
        message: 'Please select a video:'
      };
    } else if(userInput.toLowerCase().includes('audio')) {
      response = {
        type: 'AUDIO',
        nodeId: 'audio_node',
        data: {
          audio: 'https://via.placeholder.com/150',
          title: 'Audio title',
          artist: 'Audio artist',
          album: 'Audio album',
          duration: '03:45'
        },
        message: 'Please select an audio:'
      };
    } else if(userInput.toLowerCase().includes('file')) {
      response = {
        type: 'FILE',
        nodeId: 'file_node',
        data: {
          file: 'https://via.placeholder.com/150',
          title: 'File title',
          size: '1234567890',
          type: 'application/pdf'
        },
        message: 'Please select a file:'
      };
    } else if(userInput.toLowerCase().includes('location')) {
      response = {
        type: 'LOCATION',
        nodeId: 'location_node',
        data: {
          latitude: 123.456,
          longitude: 78.910,
          name: 'Location name',
          address: 'Location address'
        },
        message: 'Please select a location:'
      };
    }
    else if(userInput.toLowerCase().includes('link')) {
      response = {
        type: 'LINK',
        nodeId: 'link_node',
        data: {},
        message: 'Please select a link:'
      };
    } else {
      response = {
        type: 'TEXT_MESSAGE',
        nodeId: 'text_node',
        data: {
          text: userInput
        },
        message: `You said: ${userInput}. How can I help you further?`
      };
    }
    
    session.currentNode = response;
    session.messages.push({
      type: 'user',
      content: userInput,
      timestamp: new Date()
    });

    return Promise.resolve(response);
  }
}

export const mockChatService = new MockChatService();

if (!API_HOST && !USE_MOCK) {
  console.error('API_HOST is not set in environment variables and USE_MOCK is false');
  process.exit(1);
}

if (!MY_API_KEY && !USE_MOCK) {
  console.error('MY_API_KEY is not set in environment variables and USE_MOCK is false');
  process.exit(1);
} 