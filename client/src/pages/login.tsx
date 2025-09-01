import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={() => window.location.href = "/"} />
      </div>
    </div>
  );
}