import { useAuth } from '@/utils/useAuth';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import apiService from '@/utils/api.service';
import { User } from '@/types/model.type';
import { AxiosError } from 'axios';
import { LoadingSpinner } from '@/components/Loading';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ErrorBox } from '@/components/ErrorBox';
import { SuccessBox } from '@/components/SuccessBox';

type ModalRegisterProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const ModalRegister = ({ isOpen, onClose, children }: ModalRegisterProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        {children}
        <button
          className="mt-4 px-4 py-1 bg-red-500 text-white rounded-lg w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const name = username.trim();
    const pass = password.trim();

    if (!name) return setError('Please enter your name');
    if (!pass) return setError('Please enter your password');

    setLoading(true);

    try {
      const { data } = await apiService.post<User>('/v1/auth/login', { name, password: pass });
      // Update the login function to accept the full user data
      login({ _id: data._id, name: data.name, access_token: data.access_token });
      const event = new Event('profile-update');
      window.dispatchEvent(event);
      router.push('/'); // Redirect to the dashboard
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log({
          code: error.code,
          message: error.message,
          status: error.response?.status,
          error: error.response?.data,
        });

        if (error.response?.data) return setError(error.response.data.message);

        return setError('Authentication failed');
      }

      console.log(error);
      setError('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const name = registerUsername.trim();
    const pass = registerPassword.trim();

    if (!name) return setError('Please enter your name');
    if (!pass) return setError('Please enter your password');

    setLoading(true);

    try {
      await apiService.post('/v1/auth/register', { name, password: pass });
      setSuccess('Registration successful! Please log in.');
      setIsRegisterModalOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log({
          code: error.code,
          message: error.message,
          status: error.response?.status,
          error: error.response?.data,
        });

        if (error.response?.data) return setError(error.response.data.message);

        return setError('Registration failed');
      }

      console.log(error);
      setError('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16">
      <LoadingSpinner isLoading={loading} />
      <ErrorBox error={error} onClose={() => setError('')} />
      <SuccessBox success={success} onClose={() => setSuccess('')} />

      <h1 className="text-xl lg:text-3xl text-center lg:text-center mb-1 lg:mb-6">Chat App</h1>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col items-center">
          <input
            className="px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl mb-2"
            type="text"
            placeholder="John Doe"
            value={username} // Bind the input value to 'username'
            onChange={handleInputChange} // Handle input changes
          />

          <div className="relative mb-2">
            <input
              className="px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl mb-2"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePassChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="px-4 py-2 lg:px-6 lg:py-3 lg:text-xl bg-teal-500 font-medium rounded-lg lg:rounded-xl mt-2"
          >
            Login
          </button>
        </div>
        <div className="py-5">
          <p className="border-y-2 border-y-white px-4 py-1 text-base lg:py-1 lg:text-base text-center">
            New User? Click{' '}
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-cyan-400 underline"
            >here </button>{' '}
            to register.
          </p>
        </div>
      </form>

      {/* Registration Modal */}
      <ModalRegister isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)}>
        <h2 className="text-xl mb-4 text-gray-800">Register</h2>
        <input
          className="w-full px-4 py-2 mb-2 border rounded-lg text-gray-800"
          type="text"
          placeholder="Name"
          value={registerUsername}
          onChange={(e) => setRegisterUsername(e.target.value)}
        />
        <div className="relative mb-2">
          <input
            className="w-full px-4 py-2 mb-2 border rounded-lg text-gray-800"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg"
          onClick={handleRegister}
        >
          Register
        </button>
      </ModalRegister>
    </div>
  );
}
