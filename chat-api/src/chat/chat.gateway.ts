import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { OpenAI } from "openai";
import { Subscriber } from 'rxjs';

interface IMessage {
  username: string;
  content: string;
  timeSent: string;
  isAccurate: boolean;
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  clients: { client: Socket; username?: string }[] = [];
  chatMessages: IMessage[] = [];
  chatHistory: string[] = []; 
  prediction: string ; 

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.server.emit('message', payload);
    console.log({ payload });
    return 'Hello world!';
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(client: any, payload: IMessage): Promise<void> {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c.username) {
      this.chatHistory.push(payload.content); 

      const veracity = await this.verification(payload.content)
      const veracity_bool = !!+veracity; //conversion en bool corriger

      this.server.emit('chat-message', {
        ...payload,
        username: c.username,
        isAccurate: veracity_bool,
      });
      this.chatMessages.push({
        ...payload,
        username: c.username,
        isAccurate: veracity_bool,
      });  
      
      const pred = await this.getSuggestionsFromOpenAI(this.chatHistory)

      this.server.emit('chat-prediction', {
        ...pred,
      });
  
    }
  }

  

  public async verification (text:string) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a verification system of veracity, you respond by 0 or 1, 0 if it is false, 1 if it is true' },
          { role: 'user', content: `This message seems true or false: ${text}` }, // Utilise payload.content au lieu de payload directement
        ],
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
      });
  
      // Vérifie si la réponse indique que le message est vrai ou faux
      const isAccurate = result.choices[0]?.message?.content;
      return isAccurate
    }
    catch (error) {
      console.error('Erreur lors de la vérification : ', error);
      return error
    }
  }

  public async getSuggestionsFromOpenAI(text: string[]): Promise<string[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an interaction suggestion system. You respond 2 answers, the most quick possible, without translation' },
        { role: 'user', content: `Suggest interactions for the last message ${text}` },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    });


    // Vérifie si la réponse contient des suggestions
    if (result && result && result.choices && result.choices.length > 0) {
      // Récupère les suggestions d'interaction
      const suggestions: string[] = result.choices[0]?.message?.content.trim().split('\n');
      return suggestions;
    } else {
      console.error('La réponse d\'OpenAI ne contient pas de suggestions.');
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions : ', error);
    return [];
  }
}

  @SubscribeMessage('username-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c) {
      c.username = payload.username;
    }
  }

  handleConnection(client: Socket) {
    console.log('client connected ', client.id);
    this.clients.push({
      client,
    });
    client.emit('messages-old', this.chatMessages);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.clients = this.clients.filter((c) => c.client.id !== client.id);
  }
}
