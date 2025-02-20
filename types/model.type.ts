export type Base = {
  _id: string;
};

export type Timestamp = {
  createdAt: string;
  updatedAt: string;
};

export type BaseWithTimestamp = Base & Timestamp;

export type User = BaseWithTimestamp & {
  name: string;
  password: string;
  access_token: string;
};

export type Profile = BaseWithTimestamp & {
  name: string;
  gender: string;
  occupation: string;
};

export type Chat = BaseWithTimestamp & {
  message: string;
  user: User;
};

export type ChatRoom = BaseWithTimestamp & {
  name: string;
  participants: User[];
  chats: Chat[];
};

export type ChatRoomsData = Array<
  Omit<ChatRoom, 'chats'> & {
    participants: Array<Pick<User, '_id' | 'name'>>;
  }
>;
