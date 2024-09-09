import { ChatRoomsData } from '@/types/model.type';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import apiService from '@/utils/api.service';
import { useAuth, useAuthRedirect } from '@/utils/useAuth';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components/Loading';
import { ErrorBox } from '@/components/ErrorBox';
import { FaMinus, FaMinusCircle, FaPlus, FaPlusCircle } from 'react-icons/fa';

async function getChatRoomsData() {
  try {
    const { data } = await apiService.get<ChatRoomsData>('/v1/chat-rooms');
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log({
        code: error.code,
        status: error.response?.status,
        error: error.response?.data,
      });
      if (error.response?.status === 401) {
        throw new Error('Session Has Ended. Please Relog');
      }
      throw new Error('Failed connect to server');
    }

    throw new Error('Unknown error');
  }
}

export default function Home() {
  const { user, socket, joinChatRoom } = useAuth(); // Updated to use `user` instead of `userId`
  const router = useRouter();
  const [data, setData] = useState<ChatRoomsData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatName, setChatName] = useState('');
  const [addShow, setAddShow] = useState(false);

  useAuthRedirect({ user });

  useEffect(() => {
    getChatRoomsData()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleJoinChatRoom = (chatRoomId: string) => {
    joinChatRoom(chatRoomId);

    // Redirect to the chat room
    router.push(`/chat-rooms/${chatRoomId}`);
  };

  const handleAddChatRoom = async () => {
    const name = chatName.trim();

    if (!name) return setError('Please enter the chat Topic');

    setLoading(true);

    try {
      await apiService.post('/v1/chat-rooms/new', { name });
      setAddShow(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log({
          code: error.code,
          message: error.message,
          status: error.response?.status,
          error: error.response?.data,
        });

        if (error.response?.data) return setError(error.response.data.message);

        return setError('Add New Chat Room failed');
      }

      console.log(error);
      setError('Unknown error');
    } finally {
      getChatRoomsData()
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  return (
    <div className="mt-16 mb-48 lg:mt-0 lg:mb-16">
      <LoadingSpinner isLoading={loading} />
      <ErrorBox error={error} onClose={() => setError('')} />

      <div className="flex items-center justify-center">
        <h1 className="text-3xl pr-5 text-center">Chat Rooms</h1>
        <button
          type="button"
          className="px-3 flex text-white bg-black rounded-md"
          onClick={() => setAddShow(!addShow)}
        >
          {addShow ? <FaMinusCircle /> : <FaPlusCircle />}
        </button>
      </div>
      {addShow && (
        <div className="flex justify-center pt-8">
          <div className="justify-center p-8 border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit static w-2/3  rounded-xl border bg-gray-200 lg:dark:bg-zinc-800/30"
          >
            <h2 className="text-xl text-center">Add New Room Topic</h2>
            <div className="flex flex-col items-center">
              <input
                className="px-4 py-4 w-full lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl mb-2"
                type="text"
                placeholder="Chat Room"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              /></div>
            <button
              onClick={() => handleAddChatRoom()}
              className="px-4 py-2 bg-teal-500 rounded-lg w-full mt-4 font-medium"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 grid md:grid-cols-2 gap-8">
        {!loading &&
          !error &&
          data.map((room) => (
            <div
              key={room._id}
              className="p-8 border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit static w-auto  rounded-xl border bg-gray-200 lg:dark:bg-zinc-800/30"
            >
              <h2 className="text-xl text-center">{room.name}</h2>
              <button
                onClick={() => handleJoinChatRoom(room._id)}
                className="px-4 py-2 bg-teal-500 rounded-lg w-full mt-4 font-medium"
              >
                Join
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
