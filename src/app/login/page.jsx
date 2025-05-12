import { signIn } from "@/auth";

export default function SignIn() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        action={async () => {
          "use server";
          await signIn("google");
          // NextAuth's redirect callback will handle navigation to '/'
        }}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4 text-center">
          <p className="font-semibold text-gray-700">Dot and Box Game</p>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          type="submit"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}