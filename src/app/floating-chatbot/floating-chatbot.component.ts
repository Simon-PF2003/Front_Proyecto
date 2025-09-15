import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatMessage, QuickAction } from '../services/chatbot.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-floating-chatbot',
  templateUrl: './floating-chatbot.component.html',
  styleUrls: ['./floating-chatbot.component.css']
})
export class FloatingChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  // Estado del componente
  messages: ChatMessage[] = [];
  isTyping = false;
  isConnected = false;
  isOpen = false;
  messageText = '';
  userId = '';

  // Suscripciones
  private subscriptions: Subscription = new Subscription();

  // Propiedades para animaciones y UX
  hasNewMessages = false;
  shouldScrollToBottom = false;

  constructor(
    public chatbotService: ChatbotService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los observables del servicio
    this.subscriptions.add(
      this.chatbotService.messages$.subscribe(messages => {
        const hadMessages = this.messages.length > 0;
        this.messages = messages;
        if (hadMessages && messages.length > this.messages.length) {
          this.hasNewMessages = true;
          setTimeout(() => this.hasNewMessages = false, 3000);
        }
        this.shouldScrollToBottom = true;
      })
    );

    this.subscriptions.add(
      this.chatbotService.isTyping$.subscribe(typing => {
        this.isTyping = typing;
        if (typing) {
          this.shouldScrollToBottom = true;
        }
      })
    );

    this.subscriptions.add(
      this.chatbotService.isConnected$.subscribe(connected => {
        this.isConnected = connected;
      })
    );

    this.subscriptions.add(
      this.chatbotService.isOpen$.subscribe(open => {
        this.isOpen = open;
        if (open) {
          // Enfocar el input cuando se abre el chat
          setTimeout(() => {
            if (this.messageInput) {
              this.messageInput.nativeElement.focus();
            }
          }, 300);
        }
      })
    );

    // Obtener información del usuario si está logueado
    if (this.authService.loggedIn()) {
      this.authService.getUserData().subscribe({
        next: (userInfo) => {
          this.userId = userInfo?.email || userInfo?.id || '';
        },
        error: (error) => {
          console.error('Error getting user info:', error);
        }
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleChat(): void {
    this.chatbotService.toggleChat();
    this.hasNewMessages = false;
  }

  closeChat(): void {
    this.chatbotService.closeChat();
  }

  async sendMessage(): Promise<void> {
    if (!this.messageText.trim()) return;

    const message = this.messageText.trim();
    this.messageText = '';

    try {
      await this.chatbotService.sendMessage(message, this.userId || undefined);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async sendQuickAction(action: QuickAction): Promise<void> {
    try {
      await this.chatbotService.sendQuickAction(action.id, this.userId || undefined);
    } catch (error) {
      console.error('Error sending quick action:', error);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  formatMessageText(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/•/g, '•')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  getMessageClasses(message: ChatMessage): string {
    let classes = 'message';
    
    if (message.isCustomer) {
      classes += ' customer';
    } else {
      classes += ' assistant';
      if (message.messageType === 'warning') {
        classes += ' warning';
      } else if (message.messageType === 'error') {
        classes += ' error';
      }
    }
    
    return classes;
  }

  clearChat(): void {
    this.chatbotService.clearChat();
  }

  // Getters para las estadísticas
  get messageCount(): number {
    return this.chatbotService.messageCount;
  }

  get responseCount(): number {
    return this.chatbotService.responseCount;
  }

  get averageResponseTime(): number {
    return this.chatbotService.getAverageResponseTime();
  }

  get quickActions(): QuickAction[] {
    return this.chatbotService.quickActions;
  }

  // TrackBy function for performance optimization
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id || `${index}_${message.timestamp.getTime()}`;
  }
}