import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

export interface ProductEvent {
  type: 'created' | 'updated' | 'deleted';
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: any;
  private productEvents = new Subject<ProductEvent>();
  
  public productEvents$ = this.productEvents.asObservable();

  constructor() {}

  connect(): void {
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = Stomp.over(socket);
    
    // Desabilitar logs do Stomp (opcional)
    this.stompClient.debug = null;
    
    this.stompClient.connect({}, () => {
      console.log('✅ WebSocket conectado!');
      
      // Escutar produtos criados
      this.stompClient.subscribe('/topic/products/created', (message: any) => {
        const product = JSON.parse(message.body);
        console.log('🆕 Novo produto criado:', product);
        this.productEvents.next({ type: 'created', data: product });
      });
      
      // Escutar produtos atualizados
      this.stompClient.subscribe('/topic/products/updated', (message: any) => {
        const product = JSON.parse(message.body);
        console.log('🔄 Produto atualizado:', product);
        this.productEvents.next({ type: 'updated', data: product });
      });
      
      // Escutar produtos deletados
      this.stompClient.subscribe('/topic/products/deleted', (message: any) => {
        const productId = JSON.parse(message.body);
        console.log('🗑️ Produto deletado:', productId);
        this.productEvents.next({ type: 'deleted', data: productId });
      });
    }, (error: any) => {
      console.error('❌ Erro ao conectar WebSocket:', error);
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      console.log('🔌 WebSocket desconectado');
    }
  }
}
