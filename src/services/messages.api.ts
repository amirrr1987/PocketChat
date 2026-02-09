import { useHttp } from "@/composables/http.composable";

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    email: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}

export interface CreateMessageDto {
  content: string;
}

export interface MessageQueryParams {
  limit?: number;
  cursor?: string;
}

export const useMessagesApi = () => {
  const { instance } = useHttp();

  const create = async (
    conversationId: string,
    dto: CreateMessageDto
  ): Promise<MessageResponse> => {
    const { data } = await instance.post<MessageResponse>(
      `conversations/${conversationId}/messages`,
      dto
    );
    return data;
  };

  const getAll = async (
    conversationId: string,
    params?: MessageQueryParams
  ): Promise<MessageResponse[]> => {
    const { data } = await instance.get<MessageResponse[]>(
      `conversations/${conversationId}/messages`,
      { params }
    );
    return data;
  };

  const getOne = async (
    conversationId: string,
    messageId: string
  ): Promise<MessageResponse> => {
    const { data } = await instance.get<MessageResponse>(
      `conversations/${conversationId}/messages/${messageId}`
    );
    return data;
  };

  return { create, getAll, getOne };
};
