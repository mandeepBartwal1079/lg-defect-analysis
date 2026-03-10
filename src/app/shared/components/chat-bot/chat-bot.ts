import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatBotApiResponse, ChatMessage } from '../../types/common.types';
import { SafeHtmlPipe } from '../../pipes/safe-html-pipe';
import { Shared } from '../../services/shared';

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.scss',
})
export class ChatBot {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  messageText = '';
  isTyping = signal(false);
  unreadCount = signal(0);
  private sharedService = inject(Shared);
  private fileLinksAttached = new Set<string>();

  ngAfterViewChecked(): void {
    this.attachFileLinksHandlers();
  }

  private attachFileLinksHandlers(): void {
    const fileLinks = document.querySelectorAll('.file-link[data-url]');
    fileLinks.forEach((link: Element) => {
      const url = link.getAttribute('data-url');
      const linkId = `link-${url}`;
      if (url && !this.fileLinksAttached.has(linkId)) {
        this.fileLinksAttached.add(linkId);
        link.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.openFileLink(url, event);
        });
      }
    });
  }

  toggleChat(): void {
    const wasClosed = !this.isOpen();
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && wasClosed) {
      this.unreadCount.set(0);
      setTimeout(() => this.scrollToBottom(false), 100);
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  minimizeChat(): void {
    this.isOpen.set(false);
  }

  private scrollToBottom(smooth = true): void {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, 0);
  }

  sendUserMessage(text: string): void {
    if (!text.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.scrollToBottom(false);
    this.isTyping.set(true);
    this.callChatBotApi(text);
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (!this.messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: this.messageText,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.scrollToBottom(false);
    this.isTyping.set(true);

    const userQuery = this.messageText;
    this.messageText = '';
    this.callChatBotApi(userQuery);
  }

  private callChatBotApi(query: string): void {
    console.log('hello');

    this.sharedService.getChatBotResponse(query).subscribe({
      next: (res: any) => {
        this.isTyping.set(false);
        const apiRes = res as ChatBotApiResponse;
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: apiRes.message ?? 'Here is what I found.',
          sender: 'bot',
          timestamp: new Date(),
          botData: apiRes.data ?? undefined,
        };
        this.messages.update(msgs => [...msgs, botMessage]);
        console.log('hello');

        console.log(this.messages);

        if (!this.isOpen()) {
          this.unreadCount.update(n => n + 1);
        }
        this.scrollToBottom();
      },
      error: () => {
        this.isTyping.set(false);
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I could not process your request. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, errorMsg]);
        this.scrollToBottom();
      }
    });
  }

  openFileLink(url: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!url || !url.startsWith('http')) return;
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        this.openFileAlternative(url);
      }
    } catch (error) {
      this.openFileAlternative(url);
    }
  }

  private openFileAlternative(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleMessageClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const fileLinkElement = target.closest('.file-link[data-url]');
    if (fileLinkElement) {
      event.preventDefault();
      event.stopPropagation();
      const url = fileLinkElement.getAttribute('data-url');
      if (url) {
        this.openFileLink(url, event);
      }
    }
  }

  getDefectColor(index: number): string {
    const colors = ['#F04E81', '#A50034', '#FF7A9C'];
    return colors[index % colors.length];
  }
}
