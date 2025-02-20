import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const [profileId, setProfileId] = useState<string | null>(null);

  const updateProfileId = () => {
    // Retrieve the profile ID from localStorage
    const storedProfile = localStorage.getItem('user-data');
    if (storedProfile) {
      try {
        const user = JSON.parse(storedProfile);
        setProfileId(user._id);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
  };

  useEffect(() => {
    // Initial load
    updateProfileId();

    // Listen for custom 'profile-update' events
    const handleProfileUpdate = () => {
      updateProfileId();
    };

    window.addEventListener('profile-update', handleProfileUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('profile-update', handleProfileUpdate);
    };
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center pt-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Link
          href={'/'}
          title="Chat App"
          className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        >
          Chat
          <code className="font-mono font-bold">App</code>
        </Link>

        {!isLoginPage && (
          <div className="static left-0 top-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <Link
              className="flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href={`/profile/${profileId}`}
              rel="noopener noreferrer"
            >
              <FaUser className="flex text-center place-items-center text-3xl text-gray-800 dark:text-gray-200 lg:text-4xl lg:text-gray-800 lg:dark:text-gray-200 lg:pointer-events-auto lg:p-0" />
            </Link>
          </div>
        )}
      </div>
      <main>{children}</main>
    </div>
  );
}
