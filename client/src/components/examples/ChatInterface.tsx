import ChatInterface from '../ChatInterface';
import type { Message } from '@shared/schema';

export default function ChatInterfaceExample() {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Welcome to the Whispering Woods, brave adventurer. The ancient temple lies ahead, shrouded in mist.',
      sender: 'dm',
      senderName: null,
      timestamp: '2:30 PM'
    },
    {
      id: '2',
      content: 'I approach the temple carefully and listen for any sounds.',
      sender: 'player',
      senderName: null,
      timestamp: '2:31 PM'
    },
    {
      id: '3',
      content: 'Stranger! Turn back now, or face the curse of this place!',
      sender: 'npc',
      senderName: 'Temple Guardian',
      timestamp: '2:32 PM'
    }
  ];

  return (
    <div className="h-96 max-w-md mx-auto p-4">
      <ChatInterface messages={mockMessages} />
    </div>
  );
}