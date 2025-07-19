//schema:
// id: string
// firstUserId: string
// secondUserId: string
// delayInHours: number
// messages: Message[]

// message schema:
// id: string
// senderId: string
// content: string
// sentAt: Date

interface Connection {
  id: string;
  firstUserId: string;
  secondUserId: string;
  delayInHours: number;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  sentAt: Date;
}

export const dummyConnections: Connection[] = [
  {
    id: '1',
    firstUserId: '1',
    secondUserId: '2',
    delayInHours: 1,
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hello, how are you?',
        sentAt: new Date(),
      },
    ],
  },
  {
    id: '2',
    firstUserId: '2',
    secondUserId: '1',
    delayInHours: 2,
    messages: [
      {
        id: '2',
        senderId: '2',
        content: 'I am fine, thank you!',
        sentAt: new Date(),
      },
    ],
  },
];
