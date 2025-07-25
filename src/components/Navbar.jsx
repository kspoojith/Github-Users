import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="Logo"
          className="h-8 w-8"
        />
        <span className="font-bold text-lg">GitHub Dashboard</span>
      </div>

      <div className="flex gap-4 items-center">
        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 rounded"
          >
            Log In
          </button>
        ) : (
          <>
            <span className="text-sm hidden sm:inline">Welcome, {user.name}</span>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
