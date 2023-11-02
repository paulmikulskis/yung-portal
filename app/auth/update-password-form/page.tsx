import LoginBox from "@/components/auth/LoginBox";

function UpdatePassword() {
  return (
    <div className="flex flex-col items-center min-h-screen py-2">
      <div className="mt-20">
        <LoginBox type="forgot" />
      </div>
    </div>
  );
}

export default UpdatePassword;
