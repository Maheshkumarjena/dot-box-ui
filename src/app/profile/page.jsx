"use client"
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

function Profile() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // User is logged in, and session data is available
      console.log('User session:', session);
      console.log('User ID (if available):', session.user.id); // May not be directly available by default
      console.log('User Name:', session.user.name);
      console.log('User Email:', session.user.email);
      console.log('User Image:', session.user.image);

      // You can perform actions here based on the logged-in user
    }
  }, [session, status]);

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
    </div>
  );
}

export default Profile;