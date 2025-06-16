import { authApi } from "../src/front2backconnect/api";


const SSO = () => (
  <div className="mt-6 border-t pt-4">
    <p className="text-center mb-2">Or login with</p>
    <div className="flex justify-center space-x-4">
      <button
        type="button"
        onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
        className="px-4 py-2 border "
      >
        Google
      </button>
      <button
        type="button"
        onClick={() => window.location.href = authApi.getGithubAuthUrl()}
        className="px-4 py-2 border  "
      >
        GitHub
      </button>
    </div>
  </div>
);

export default SSO;