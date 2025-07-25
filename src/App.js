import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import './App.css';
import Navbar from "./components/Navbar";
import GitHubCalendar from 'react-github-calendar';
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

function App() {
  const { isAuthenticated } = useAuth0();
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError(null);
    setUserData(null);
    setRepos([]);
    setEvents([]);

    try {
      const [userRes, reposRes, eventsRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos?per_page=100`),
        axios.get(`https://api.github.com/users/${username}/events/public`)
      ]);

      setUserData(userRes.data);
      setRepos(reposRes.data);
      setEvents(eventsRes.data.slice(0, 5)); // Show last 5 events
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("User not found or API limit reached.");
    }
  };

  const getLanguageChartData = () => {
    const langCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });
    return Object.keys(langCount).map(lang => ({
      label: lang,
      value: langCount[lang]
    }));
  };

  const renderEventText = (event) => {
    const repoName = event.repo?.name || "Unknown repo";
    switch (event.type) {
      case "PushEvent":
        return `Pushed to ${repoName}`;
      case "PullRequestEvent":
        return `${event.payload.action} pull request in ${repoName}`;
      case "IssuesEvent":
        return `${event.payload.action} issue in ${repoName}`;
      case "WatchEvent":
        return `Starred ${repoName}`;
      case "CreateEvent":
        return `Created ${event.payload.ref_type} in ${repoName}`;
      default:
        return `Did ${event.type} in ${repoName}`;
    }
  };

  return (
    <div className="bg-[#0d1117] text-gray-200 min-h-screen font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {isAuthenticated && (
          <>
            <div className="space-y-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username"
                  className="flex-grow px-4 py-2 rounded bg-[#161b22] border border-gray-600 text-white focus:outline-none focus:ring focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                >
                  Search
                </button>
              </form>

              {error && <p className="text-red-500">{error}</p>}

              {userData && (
                <>
                  <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700">
                    <div className="flex gap-4 items-center">
                      <img
                        src={userData.avatar_url}
                        alt="avatar"
                        className="w-20 h-20 rounded-full"
                      />
                      <div>
                        <h2 className="text-xl font-semibold">{userData.name}</h2>
                        <p className="text-gray-400 text-sm">@{userData.login}</p>
                        <p className="mt-2 text-gray-300 text-sm">{userData.bio}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-400">
                      <span>Public Repos: {userData.public_repos}</span>
                      <span>Followers: {userData.followers}</span>
                      <span>Following: {userData.following}</span>
                    </div>
                    <a
                      href={userData.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 text-blue-500 hover:underline text-sm"
                    >
                      View GitHub Profile →
                    </a>
                  </div>

                  <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700 hidden lg:block">
                    <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
                    <GitHubCalendar
                      username={username}
                      colorScheme="dark"
                      blockSize={15}
                      blockMargin={5}
                    />
                  </div>

                  {events.length > 0 && (
                    <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700 mt-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Timeline</h3>
                      <ul className="relative border-l border-gray-600 ml-3 pl-4">
                        {events.map((event, index) => (
                          <li key={event.id} className="relative mb-6">
                            <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[22px] top-1.5 border border-gray-800"></span>
                            <p className="text-sm text-gray-300">{renderEventText(event)}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6">
              {repos.length > 0 && (
                <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700 max-h-[400px] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Top Repositories</h3>
                  <ul className="space-y-4">
                    {repos.slice(0, 5).map(repo => (
                      <li key={repo.id} className="border-b border-gray-600 pb-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 font-medium hover:underline"
                        >
                          {repo.name}
                        </a>
                        {repo.description && (
                          <p className="text-sm text-gray-400">{repo.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-1 flex gap-4">
                          <span>⭐ {repo.stargazers_count}</span>
                          {repo.language && <span>{repo.language}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {repos.length > 0 && (
                <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Languages Used</h3>
                  <ReactFC
                    type="pie3d"
                    width="100%"
                    height="280"
                    dataFormat="json"
                    dataSource={{
                      chart: {
                        caption: "Languages Used in Public Repos",
                        theme: "fusion",
                        bgColor: "#161b22",
                        baseFontColor: "#ffffff",
                        showPercentValues: 1,
                        decimals: 0,
                        useDataPlotColorForLabels: 1
                      },
                      data: getLanguageChartData()
                    }}
                  />
                </div>
              )}

              {userData && username && (
                <div className="bg-[#161b22] p-6 rounded-lg shadow border border-gray-700 lg:hidden">
                  <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
                  <GitHubCalendar
                    username={username}
                    colorScheme="dark"
                    blockSize={15}
                    blockMargin={5}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
