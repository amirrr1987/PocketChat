import { useHttp } from "@/composables/http.composable";

export interface ConversationResponse {
  id: string;
  conversationType: 'direct' | 'group' | 'channel';
  title: string | null;
  createdById: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    user: {
      id: string;
      username: string;
      email: string;
      status?: 'online' | 'offline' | 'away' | 'busy';
      lastSeenAt?: string | null;
      profile: {
        displayName: string | null;
        avatarUrl: string | null;
      } | null;
    };
  }>;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      profile: {
        displayName: string | null;
        avatarUrl: string | null;
      } | null;
    };
  };
}

export interface CreateDirectConversationDto {
  userId: string;
}

export const useConversationsApi = () => {
  const { instance } = useHttp();

  const createDirect = async (dto: CreateDirectConversationDto): Promise<ConversationResponse> => {
    const { data } = await instance.post<ConversationResponse>("conversations/direct", dto);
    return data;
  };

  const getAll = async (): Promise<ConversationResponse[]> => {
    const { data } = await instance.get<ConversationResponse[]>("conversations");
    return data;
  };

  const getOne = async (id: string): Promise<ConversationResponse> => {
    const { data } = await instance.get<ConversationResponse>(`conversations/${id}`);
    return data;
  };

  return { createDirect, getAll, getOne };
};
