import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

export interface ProductEvent {
  type: 'created' | 'updated' | 'deleted';
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private productEvents = new Subject<ProductEvent>();
  
  public productEvents$ = this.productEvents.asObservable();

  constructor() {}

  connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws') as any,
      
      connectHeaders: {},
      
      debug: (str) => {
        // Desabilitar logs ou usar console.log(str) para debug
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('WebSocket conectado!');
        
        // Escutar produtos criados
        this.stompClient?.subscribe('/topic/products/created', (message) => {
          const product = JSON.parse(message.body);
          console.log('Novo produto criado:', product);
          this.productEvents.next({ type: 'created', data: product });
        });
        
        // Escutar produtos atualizados
        this.stompClient?.subscribe('/topic/products/updated', (message) => {
          const product = JSON.parse(message.body);
          console.log('Produto atualizado:', product);
          this.productEvents.next({ type: 'updated', data: product });
        });
        
        // Escutar produtos deletados
        this.stompClient?.subscribe('/topic/products/deleted', (message) => {
          const productId = JSON.parse(message.body);
          console.log('Produto deletado:', productId);
          this.productEvents.next({ type: 'deleted', data: productId });
        });
      },
      
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame);
      },
      
      onWebSocketError: (error) => {
        console.error('Erro WebSocket:', error);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('🔌 WebSocket desconectado');
    }
  }
}
