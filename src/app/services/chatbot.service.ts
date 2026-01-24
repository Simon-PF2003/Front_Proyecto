import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

export interface ChatMessage {
  id?: string;
  text: string;
  isCustomer: boolean;
  timestamp: Date;
  messageType?: 'normal' | 'warning' | 'error';
}

export interface ChatbotResponse {
  success: boolean;
  data?: {
    response: string;
    message?: string;
    creditWarning?: {
      message: string;
    };
    suggestions?: Array<{
      text: string;
    }>;
  };
  error?: string;
}

export interface QuickAction {
  id: string;
  text: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly API_BASE_URL: string;
  private sessionId: string;
  
  // Estado del chat
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private isOpenSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public messages$ = this.messagesSubject.asObservable();
  public isTyping$ = this.isTypingSubject.asObservable();
  public isConnected$ = this.isConnectedSubject.asObservable();
  public isOpen$ = this.isOpenSubject.asObservable();

  // Estadísticas
  public messageCount = 0;
  public responseCount = 0;
  public responseTimes: number[] = [];

  // Acciones rápidas predefinidas
  public quickActions: QuickAction[] = [
    { id: 'catalog-overview', text: 'Ver Catálogo', icon: '📋' },
    { id: 'featured-products', text: 'Destacados', icon: '⭐' },
    { id: 'categories', text: 'Categorías', icon: '🏷️' },
    { id: 'brands', text: 'Marcas', icon: '🔖' },
    { id: 'contact', text: 'Contacto', icon: '📞' }
  ];

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.API_BASE_URL = `${this.apiConfig.getApiBaseUrl()}/chatbot`;
    this.sessionId = this.generateSessionId();
    this.initializeChat();
    this.checkConnection();
  }

  private generateSessionId(): string {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeChat(): void {
    // Mensaje de bienvenida
    const welcomeMessage: ChatMessage = {
      text: '¡Bienvenido! Soy tu asistente virtual. Puedo ayudarte a:\n• Buscar productos específicos\n• Consultar precios y disponibilidad\n• Ver productos destacados\n• Explorar nuestro catálogo\n\n¿Qué estás buscando hoy?',
      isCustomer: false,
      timestamp: new Date(),
      messageType: 'normal'
    };
    this.addMessage(welcomeMessage);
  }

  public async checkConnection(): Promise<void> {
    try {
      const response = await this.http.get(`${this.API_BASE_URL}/questions`).toPromise();
      this.isConnectedSubject.next(true);
    } catch (error) {
      this.isConnectedSubject.next(false);
      console.error('Error checking chatbot connection:', error);
    }
  }

  public toggleChat(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  public closeChat(): void {
    this.isOpenSubject.next(false);
  }

  public openChat(): void {
    this.isOpenSubject.next(true);
  }

  public addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    message.id = this.generateMessageId();
    currentMessages.push(message);
    this.messagesSubject.next(currentMessages);

    if (!message.isCustomer) {
      this.responseCount++;
    }
  }

  private generateMessageId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public async sendMessage(message: string, userId?: string): Promise<void> {
    if (!message.trim()) return;

    const startTime = Date.now();
    this.messageCount++;

    // Agregar mensaje del usuario
    const customerMessage: ChatMessage = {
      text: message,
      isCustomer: true,
      timestamp: new Date()
    };
    this.addMessage(customerMessage);

    // Mostrar indicador de escritura
    this.isTypingSubject.next(true);

    try {
      const requestBody: any = { 
        message: message.trim(), 
        sessionId: this.sessionId 
      };
      
      if (userId) {
        requestBody.userId = userId;
      }

      const response = await this.http.post<ChatbotResponse>(
        `${this.API_BASE_URL}/message`,
        requestBody
      ).toPromise();

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      if (response?.success && response.data) {
        // Agregar respuesta del asistente
        const assistantMessage: ChatMessage = {
          text: response.data.response,
          isCustomer: false,
          timestamp: new Date(),
          messageType: 'normal'
        };
        this.addMessage(assistantMessage);

        // Agregar advertencia si existe
        if (response.data.creditWarning) {
          const warningMessage: ChatMessage = {
            text: `⚠️ Atención: ${response.data.creditWarning.message}`,
            isCustomer: false,
            timestamp: new Date(),
            messageType: 'warning'
          };
          this.addMessage(warningMessage);
        }

        // Agregar sugerencias si las hay
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          const suggestionsText = '💡 Sugerencias: ' + 
            response.data.suggestions.map(s => s.text).join(' • ');
          
          const suggestionsMessage: ChatMessage = {
            text: suggestionsText,
            isCustomer: false,
            timestamp: new Date(),
            messageType: 'normal'
          };
          this.addMessage(suggestionsMessage);
        }
      } else {
        throw new Error(response?.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        text: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        isCustomer: false,
        timestamp: new Date(),
        messageType: 'error'
      };
      this.addMessage(errorMessage);
    } finally {
      this.isTypingSubject.next(false);
    }
  }

  public async sendQuickAction(actionId: string, userId?: string): Promise<void> {
    const action = this.quickActions.find(a => a.id === actionId);
    if (!action) return;

    const startTime = Date.now();
    this.messageCount++;

    // Mostrar indicador de escritura
    this.isTypingSubject.next(true);

    try {
      const requestBody: any = { 
        questionId: actionId, 
        sessionId: this.sessionId 
      };
      
      if (userId) {
        requestBody.userId = userId;
      }

      const response = await this.http.post<ChatbotResponse>(
        `${this.API_BASE_URL}/message`,
        requestBody
      ).toPromise();

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      if (response?.success && response.data) {
        // Agregar pregunta del usuario (si viene en la respuesta)
        if (response.data.message) {
          const customerMessage: ChatMessage = {
            text: response.data.message,
            isCustomer: true,
            timestamp: new Date()
          };
          this.addMessage(customerMessage);
        }

        // Agregar respuesta del asistente
        const assistantMessage: ChatMessage = {
          text: response.data.response,
          isCustomer: false,
          timestamp: new Date(),
          messageType: 'normal'
        };
        this.addMessage(assistantMessage);

        // Agregar advertencia si existe
        if (response.data.creditWarning) {
          const warningMessage: ChatMessage = {
            text: `⚠️ Atención: ${response.data.creditWarning.message}`,
            isCustomer: false,
            timestamp: new Date(),
            messageType: 'warning'
          };
          this.addMessage(warningMessage);
        }
      } else {
        throw new Error(response?.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error sending quick action:', error);
      const errorMessage: ChatMessage = {
        text: '❌ Error al procesar la consulta.',
        isCustomer: false,
        timestamp: new Date(),
        messageType: 'error'
      };
      this.addMessage(errorMessage);
    } finally {
      this.isTypingSubject.next(false);
    }
  }

  public getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length);
  }

  public clearChat(): void {
    this.messagesSubject.next([]);
    this.messageCount = 0;
    this.responseCount = 0;
    this.responseTimes = [];
    this.initializeChat();
  }
}