import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

interface JwtPayload {
  sub: string;
  role: AuthenticatedUser['role'];
  tenantId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
        algorithms: ['HS256'],
      });

      // Attach user info to the socket object
      client.data.user = {
        userId: payload.sub,
        role: payload.role,
        tenantId: payload.tenantId,
      } as AuthenticatedUser;

    } catch (e) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Optional cleanup
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('bookingId') bookingId: string,
  ) {
    const user = client.data.user as AuthenticatedUser;
    if (!user) return;

    try {
      // Validate access before letting them join
      await this.messagingService.findByBooking(bookingId, user.userId, user.tenantId);
      
      const roomName = `booking_${bookingId}`;
      client.join(roomName);
    } catch (e) {
      // Access denied or booking not found
      client.emit('error', 'Accès refusé ou réservation introuvable.');
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { bookingId: string; content: string },
  ) {
    const user = client.data.user as AuthenticatedUser;
    if (!user) return;

    try {
      const senderType = user.tenantId ? 'TENANT' : 'CUSTOMER';
      
      const message = await this.messagingService.create(
        payload.bookingId,
        user.userId,
        senderType,
        payload.content,
        user.tenantId,
      );

      const roomName = `booking_${payload.bookingId}`;
      this.server.to(roomName).emit('message', message);
    } catch (e) {
      client.emit('error', "Erreur lors de l'envoi du message.");
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    
    const tokenParams = client.handshake.auth?.token;
    if (tokenParams) {
      return tokenParams;
    }

    return null;
  }
}
