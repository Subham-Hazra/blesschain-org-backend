import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { AppRouter } from '@/routes/Router';
import { Database } from '@/config/Database';
import { HttpException } from '@/exceptions/HttpException';
import { ResponseHelper } from '@/util/ResponseHelper';
import cookieParser from 'cookie-parser';
import path from 'path';
import { UserService } from './module/user/services/UserService';
import { RequestWithUser } from './module/auth/interfaces/auth.interface';
const socketMap = new Set<string>();
export class App {
  private app: Express;
  private server?: http.Server;
  private io?: SocketIOServer;
  private userService: UserService;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
    this.userService = new UserService();
  }

  private configureMiddleware() {
    const corsOptions = {
      origin: '*', // Replace '*' with your specific client URLs for security
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    };
    this.app.use(cors(corsOptions));
    this.app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads/')));
    this.app.use(cookieParser());
    this.app.use(express.json());
  }

  private configureRoutes() {
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Hello, world today!');
    });

    const appRouter = new AppRouter();
    this.app.use('/api', appRouter.router);

    this.app.get("/connect-api", (req, res) => {
      var options = {
        root: path.join(__dirname)
      }
      var filename = 'index.html';
      res.sendFile(filename, options);
    })

  }

  private configureErrorHandling() {
    this.app.use((err: HttpException | any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || 'Internal Server Error';
      return ResponseHelper.sendSuccessResponse(res, status, null, message);
    });
  }

  private configureSocketIO() {
    if (!this.server) {
      throw new Error('Server instance is not initialized.');
    }

    this.io = new SocketIOServer(this.server, {
      transports: ['polling', 'websocket'], // Allow fallback to polling if websocket fails
      cors: {
        // origin: '*', // Replace with specific client URL
        methods: ['GET', 'POST'],
      },
    });

    const userNamespace = this.io.of('/user-chats');

    userNamespace.on('connection', (socket: Socket) => {
      socketMap.add(socket.id);
      console.log(`Client connected to /user-chats: ${socket.id}`);

      socket.emit('welcome', { message: 'Connected to Socket.IO server' });

      socket.on('initialData', (data: { id: string }) => {
        const { id } = data;
        if (id) {
          socket.broadcast.emit('getOnlineUser', { userId: id });
        }
      });

      socket.on('chat message', (msg: string) => {
        socket.broadcast.emit('chat message', msg);
      });

      socket.on('delete_chat', (data: any) => {
        socket.broadcast.emit('delete_chat', data);
      });

      socket.on('chat_update', (data: any) => {
        socket.broadcast.emit('chat_update', data);
      });



      socket.on('message', (data) => {
        console.log('Received message:', data);
        socket.emit('response', { message: 'Message received!' });
      });
      socket.broadcast.emit('userConnected', { id: socket.id });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        this.io?.emit('userDisconnected', { id: socket.id });
        const payload = { socket_id: socket.id, is_online: 0 }
        try {
          const result = await this.userService.updateUserOnlineOfflineBySocket(payload);
          if (result) {
            socket.broadcast.emit('getOfflineUser', { userId: result?.id as string });
          }
          socketMap.delete(socket.id);
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      });

      // Add more custom event listeners as needed
      socket.on('customEvent', (data) => {
        console.log('Custom Event Data:', data);
      });
    });
    console.log(`Socket.IO server initialized and ready.`);
  }

  public async start(port: number, mongoUri: string) {
    try {
      await Database.connect(mongoUri); // Connect to MongoDB
      console.log('Database connected successfully');

      this.server = http.createServer(this.app);
      this.configureSocketIO();

      this.server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1); // Exit process on failure
    }
  }

  public stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('Server stopped');
      });
    }

    if (this.io) {
      this.io.close(() => {
        console.log('Socket.IO server stopped');
      });
    }
  }
}
