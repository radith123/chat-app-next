import { Profile } from '@/types/model.type';
import apiService from '@/utils/api.service';
import { useAuth, useAuthRedirect } from '@/utils/useAuth';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { LoadingSpinner } from '@/components/Loading';
import { ErrorBox } from '@/components/ErrorBox';
import { IoIosArrowBack } from 'react-icons/io';
import { SuccessBox } from '@/components/SuccessBox';

async function getProfileData(id: string) {
  try {
    const { data } = await apiService.get<Profile>(`/v1/user/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log({
        code: error.code,
        status: error.response?.status,
        error: error.response?.data,
      });

      throw new Error('Failed connect to server');
    }

    throw new Error('Unknown error');
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { user, socket, sendMessageChatRoom, deleteMessageChatRoom } = useAuth(); // Updated to use `user` instead of `userId`
  const [data, setData] = useState<Omit<Profile, 'chats'>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    password: '',
    gender: '',
    occupation: '',
  });
  const [isPasswordDisabled, setIsPasswordDisabled] = useState(true);
  useAuthRedirect({ user });

  useEffect(() => {
    if (id) {
      getProfileData(id)
        .then((res) => {
          const { ...rest } = res;
          setData(rest);
          setForm({
            name: rest.name || '',
            password: '', // Assuming password won't be filled from profile data
            gender: rest.gender || '',
            occupation: rest.occupation || '',
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnablePassword = () => {
    setIsPasswordDisabled(!isPasswordDisabled);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const gender = form.gender.trim();
    const job = form.occupation.trim();
    let pass = null;
    if (!isPasswordDisabled) {
      pass = form.password.trim()
      if (!pass) return setError('Please enter your password');
    };

    if (!name) return setError('Please enter your name');

    setLoading(true);

    try {
      await apiService.post('/v1/user/profile', { name, password: pass, _id: id, gender: gender, occupation: job });
      localStorage.removeItem('user-data');
      setSuccess('Change data successful! Please relogin.');
      router.push('/login');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log({
          code: error.code,
          message: error.message,
          status: error.response?.status,
          error: error.response?.data,
        });

        if (error.response?.data) return setError(error.response.data.message);

        return setError('Change Data failed');
      }

      console.log(error);
      setError('Unknown error');
    } finally {
      setLoading(false);
    }
    console.log(form);
  };

  function handleBack(): void {
    router.back();
  }

  function handleLogout(): void {
    localStorage.removeItem('user-data');
    router.push('/login')
  }

  return (
    <div className="w-[85vw] lg:w-[70vw] ">
      <LoadingSpinner isLoading={loading} />
      <ErrorBox error={error} onClose={() => setError('')} />
      <SuccessBox success={success} onClose={() => setSuccess('')} />
      <button
        type="button"
        className=" left-0 py-2 flex items-center text-white"
        onClick={() => handleBack()}
      >
        <IoIosArrowBack /> Back
      </button>
      <h1 className="text-xl lg:text-3xl text-center lg:text-center mb-1 lg:mb-6">Profile</h1>

      {!loading && !error && (
        <div className="flex justify-center">
          <div className="mt-4 text-center w-2/3 grid gap-4 lg:gap-8 bg-slate-500 p-6 lg:p-20 rounded-2xl pb-60">
            {/* Form starts here */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-800">
              <div className="flex flex-col lg:flex-row lg:items-center mb-2">
                <label className="lg:w-1/4 mb-1 lg:mb-0 text-left lg:text-right lg:pr-4">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full lg:w-3/4 px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl"
                />
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center mb-2">
                <label className="lg:w-1/4 mb-1 lg:mb-0 text-left lg:text-right lg:pr-4">Password:</label>
                <div className="flex w-full lg:w-3/4">
                  <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    disabled={isPasswordDisabled}
                    className="flex-grow px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-l-lg lg:rounded-l-xl"
                  />
                  <button
                    type="button"
                    onClick={handleEnablePassword}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-r-lg lg:rounded-r-xl"
                  >
                    {isPasswordDisabled ? 'Change Password' : 'Cancel'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center mb-2">
                <label className="lg:w-1/4 mb-1 lg:mb-0 text-left lg:text-right lg:pr-4">Gender:</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full lg:w-3/4 px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl"
                >
                  <option >-</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center mb-2">
                <label className="lg:w-1/4 mb-1 lg:mb-0 text-left lg:text-right lg:pr-4">Occupation:</label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleInputChange}
                  className="w-full lg:w-3/4 px-4 py-2 lg:px-6 lg:py-3 lg:text-xl outline-none text-gray-800 rounded-lg lg:rounded-xl"
                />
              </div>
              <div className="flex justify-center">
                <button type="submit" className="mt-4 p-2 bg-green-500 text-white rounded">
                  Submit
                </button>
              </div>

              <div className="flex justify-center">
                <button

                  type="button"
                  className="mt-4 p-2 bg-red-500 text-white rounded"
                  onClick={() => handleLogout()}>
                  Logout
                </button>
              </div>
            </form>
            {/* Form ends here */}
          </div>
        </div>
      )}
    </div>
  );
}
