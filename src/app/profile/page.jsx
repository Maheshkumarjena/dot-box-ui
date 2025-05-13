"use client"
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const USER_STORAGE_KEY = 'user';
const STORAGE_EXPIRY_KEY = 'userExpiry';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // Milliseconds in a week

function Profile() {
 
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) {
      console.log('User session:', session);
      console.log('User ID (if available):', session.user.id);
      console.log('User Name:', session.user.name);
      console.log('User Email:', session.user.email);
      console.log('User Image:', session.user.image);

      // Store user data in local storage with an expiry timestamp
      const userData = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        // You might want to include other relevant user data
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('saved to local storage')
      localStorage.setItem(STORAGE_EXPIRY_KEY, Date.now() + ONE_WEEK_MS);
    }
  }, [session]);

  // Check for stored user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const expiryTime = localStorage.getItem(STORAGE_EXPIRY_KEY);

    if (storedUser && expiryTime && parseInt(expiryTime) > Date.now()) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // You could potentially set a local state here to use the stored data
        console.log('User data loaded from local storage:', parsedUser);
        // For example: setUser(parsedUser); if you have a useState for user data
      } catch (error) {
        console.error('Error parsing user data from local storage:', error);
        // Optionally clear invalid data
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
      }
    } else {
      // If no data or expired, clear it
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXPIRY_KEY);
    }
  }, []); // Run only once on mount

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>You need to sign in to view your profile.</p>;
  }

  return (
    <div>
      <h1>Your Profile</h1>
      {session?.user?.name && <p>Name: {session.user.name}</p>}
      {session?.user?.email && <p>Email: {session.user.email}</p>}
      {session?.user?.image && <img src={session.user.image} alt="Profile picture" />}
      {/* You can also display the stored data here if you manage it in a local state */}
    </div>
  );
}

export default Profile;