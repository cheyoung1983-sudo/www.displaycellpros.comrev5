"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Film, 
  Terminal, 
  AlertTriangle, 
  HelpCircle,
  Code,
  Layers,
  Sparkles,
  Search,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DbConfig {
  configured: boolean;
  host: string;
  user: string;
  database: string;
  port: string;
  awsRegion: string;
  awsRoleArn: string;
  awsAccountId: string;
}

interface RdsStatusResponse {
  success: boolean;
  message: string;
  queryDurationMs?: number;
  currentTime?: string;
  dbVersion?: string;
  config: DbConfig;
  error?: string;
}

interface Movie {
  id: number;
  title: string;
  year: number;
  genre?: string;
}

interface MoviesResponse {
  success: boolean;
  source: string;
  movies: Movie[];
  message?: string;
  ddlHint?: string;
  error?: string;
}

interface MovieResponse {
  success: boolean;
  source: string;
  movie?: Movie;
  error?: string;
}

export function RdsDiagnosticPanel() {
  const [status, setStatus] = useState<RdsStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  
  const [moviesData, setMoviesData] = useState<MoviesResponse | null>(null);
  const [loadingMovies, setLoadingMovies] = useState(false);
  
  const [singleMovieId, setSingleMovieId] = useState("");
  const [singleMovieResult, setSingleMovieResult] = useState<any>(null);
  const [loadingSingleMovie, setLoadingSingleMovie] = useState(false);
  const [singleMovieError, setSingleMovieError] = useState<string | null>(null);

  // Snippets/recipes state
  const [activeSnippetTab, setActiveSnippetTab] = useState<"v3" | "v2" | "cli" | "mcp">("v3");
  const [copied, setCopied] = useState(false);

  // Read manual token from localStorage if present
  const [manualToken, setManualToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("rds_manual_auth_token") || "";
  });

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualToken(val);
    if (typeof window !== "undefined") {
      if (val.trim()) {
        localStorage.setItem("rds_manual_auth_token", val.trim());
      } else {
        localStorage.removeItem("rds_manual_auth_token");
      }
    }
  };

  const fetchRdsStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const headers: HeadersInit = {};
      if (manualToken.trim()) {
        headers["X-RDS-Auth-Token"] = manualToken.trim();
      }
      const res = await fetch("/api/rds-status", { headers });
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      console.error(err);
      setStatus({
        success: false,
        message: "Failed to connect to API endpoint /api/rds-status",
        config: {
          configured: false,
          host: "error",
          user: "error",
          database: "error",
          port: "5432",
          awsRegion: "us-east-1",
          awsRoleArn: "error",
          awsAccountId: "error"
        },
        error: err.message || String(err)
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [manualToken]);

  // Fetch status on mount or when token changes
  useEffect(() => {
    fetchRdsStatus();
  }, [fetchRdsStatus]);

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const headers: HeadersInit = {};
      if (manualToken.trim()) {
        headers["X-RDS-Auth-Token"] = manualToken.trim();
      }
      const res = await fetch("/api/movies", { headers });
      const data = await res.json();
      setMoviesData(data);
    } catch (err: any) {
      console.error(err);
      setMoviesData({
        success: false,
        source: "api-error",
        movies: [],
        error: err.message || String(err)
      });
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchSingleMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleMovieId.trim()) return;
    
    setLoadingSingleMovie(true);
    setSingleMovieError(null);
    setSingleMovieResult(null);

    try {
      const headers: HeadersInit = {};
      if (manualToken.trim()) {
        headers["X-RDS-Auth-Token"] = manualToken.trim();
      }
      const res = await fetch(`/api/movies/${singleMovieId}`, { headers });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      setSingleMovieResult(data);
    } catch (err: any) {
      setSingleMovieError(err.message || String(err));
    } finally {
      setLoadingSingleMovie(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col flex-1 shadow-md overflow-hidden animate-in fade-in duration-200 p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase font-mono">
              AWS RDS PostgreSQL & OIDC Signer Lab
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Monitor, query, and debug Amazon RDS Serverless integration with IAM OIDC credentials
            </p>
          </div>
        </div>
        <button
          onClick={fetchRdsStatus}
          disabled={loadingStatus}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 p-1.5 rounded-lg transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-4 h-4 ${loadingStatus ? "animate-spin text-blue-400" : ""}`} />
        </button>
      </div>

      {/* AWS IAM Token Override Control Panel */}
      <div className="bg-slate-900 border border-slate-750 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              AWS IAM Database Authentication Token Override
            </span>
          </div>
          
          {manualToken.trim() ? (
            <span className="bg-amber-950/60 text-amber-400 border border-amber-900/40 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Token Override Active
            </span>
          ) : (
            <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-mono px-2 py-0.5 rounded-full">
              Using Default Config (OIDC / Env Password)
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
          Need to test connection with a temporary AWS RDS token (15-min expiry) or a manually generated sign-in token? Paste it below to route all status requests and table queries through an isolated connection client.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Paste your AWS RDS IAM Authentication token (presigned URL/hash) here..."
            value={manualToken}
            onChange={handleTokenChange}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
          />
          {manualToken && (
            <button
              onClick={() => {
                setManualToken("");
                localStorage.removeItem("rds_manual_auth_token");
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid: Config Status & Connection Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connection Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2">
              Connection Status
            </span>
            
            {status ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {status.success ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/50">
                      <CheckCircle className="w-4 h-4" /> Connected
                    </span>
                  ) : status.config.configured ? (
                    <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/40 px-2.5 py-1 rounded-full border border-red-900/50">
                      <XCircle className="w-4 h-4" /> Connection Failed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-900/50">
                      <AlertTriangle className="w-4 h-4" /> Not Configured
                    </span>
                  )}
                  
                  {status.queryDurationMs && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ping: <b className="text-blue-400">{status.queryDurationMs}ms</b>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {status.message}
                </p>

                {status.currentTime && (
                  <div className="text-[10px] text-slate-400 font-mono space-y-0.5 pt-1">
                    <div><b>Database Time:</b> {status.currentTime}</div>
                    <div className="truncate"><b>Engine Version:</b> {status.dbVersion}</div>
                  </div>
                )}

                {status.error && (
                  <div className="bg-red-950/20 border border-red-900/40 rounded p-2.5 mt-2">
                    <span className="text-[10px] text-red-400 font-bold font-mono uppercase block mb-1">Error Logs</span>
                    <p className="text-[10px] text-slate-300 font-mono break-all line-clamp-3">
                      {status.error}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-24">
                <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-mono">AWS RDS IAM Auth Handler</span>
            <span className="text-[9px] bg-blue-950/60 text-blue-400 font-bold px-1.5 rounded font-mono">SSL REQUIRED</span>
          </div>
        </div>

        {/* Masked Config Variables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2">
              Loaded AWS & Postgres Credentials
            </span>
            
            {status ? (
              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">PGHOST</span>
                  <span className="text-slate-200 text-right truncate max-w-[160px]">{status.config.host}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">PGUSER</span>
                  <span className="text-slate-200">{status.config.user}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">PGDATABASE</span>
                  <span className="text-slate-200">{status.config.database}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">PGPORT</span>
                  <span className="text-slate-200">{status.config.port}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">AWS_REGION</span>
                  <span className="text-slate-200">{status.config.awsRegion}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">AWS_ROLE_ARN</span>
                  <span className="text-slate-200 text-right truncate max-w-[140px]">{status.config.awsRoleArn}</span>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center">
                <span className="text-xs text-slate-500 font-mono">Loading config...</span>
              </div>
            )}
          </div>

          <div className="mt-2 bg-slate-950 px-2 py-1.5 rounded text-[10px] text-slate-400 leading-snug font-mono border border-slate-800">
            💡 Set these values securely inside Vercel's environment settings. They are retrieved via server OIDC automatically.
          </div>
        </div>
      </div>

      {/* Movies Table / Postgres Query Console */}
      <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-900/50">
        <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              PostgreSQL Movie Repository
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMovies}
              disabled={loadingMovies}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 text-xs px-3 py-1 rounded font-bold font-mono transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${loadingMovies ? "animate-spin" : ""}`} />
              Query movies Table
            </button>
          </div>
        </div>

        <div className="p-4">
          {moviesData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2 text-xs font-mono">
                <span className="text-slate-400">
                  Data Source: <strong className={moviesData.source.includes("aws") ? "text-emerald-400" : "text-blue-400"}>{moviesData.source.toUpperCase()}</strong>
                </span>
                {moviesData.message && (
                  <span className="text-amber-400 text-[11px] font-medium max-w-md text-right leading-tight">
                    ⚠️ {moviesData.message}
                  </span>
                )}
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-2.5 font-bold">ID</th>
                      <th className="p-2.5 font-bold">Title</th>
                      <th className="p-2.5 font-bold">Year</th>
                      <th className="p-2.5 font-bold">Genre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {moviesData.movies.length > 0 ? (
                      moviesData.movies.map((movie) => (
                        <tr key={movie.id} className="hover:bg-slate-800/40 text-slate-300">
                          <td className="p-2.5 text-blue-400 font-bold">{movie.id}</td>
                          <td className="p-2.5 font-sans font-medium text-slate-100">{movie.title}</td>
                          <td className="p-2.5 text-slate-400">{movie.year}</td>
                          <td className="p-2.5">
                            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                              {movie.genre || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">
                          No movies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* DDL Hint for setup */}
              {moviesData.ddlHint && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs font-mono">
                    <Code className="w-3.5 h-3.5" />
                    <span>AWS RDS PostgreSQL Initialization Query</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    To make the movies table live on your RDS cluster, execute the following SQL DDL statements:
                  </p>
                  <pre className="text-[10px] bg-slate-900 p-2 rounded text-blue-300 font-mono overflow-x-auto border border-slate-800 select-all">
                    {moviesData.ddlHint}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
              Click "Query movies Table" to load records from the RDS PostgreSQL service.
            </div>
          )}
        </div>
      </div>

      {/* Row: Single ID Query tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2">
          Interactive Parameterized Query Probe (`SELECT * FROM movies WHERE id = $1`)
        </span>

        <form onSubmit={fetchSingleMovie} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter Movie ID (e.g., 1, 2, 3)"
              value={singleMovieId}
              onChange={(e) => setSingleMovieId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loadingSingleMovie || !singleMovieId.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-xs text-white px-4 py-2 rounded-lg font-bold font-mono transition-all flex items-center gap-1.5"
          >
            {loadingSingleMovie ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Execute Query"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {singleMovieError && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg p-2.5 text-[11px] font-mono"
            >
              ❌ Error: {singleMovieError}
            </motion.div>
          )}

          {singleMovieResult && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2"
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
                <span>SQL Source: <b>{singleMovieResult.source.toUpperCase()}</b></span>
                <span className="text-emerald-400">✔️ Query Executed Successfully</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="space-y-1">
                  <div className="text-slate-500">ID: <span className="text-blue-400 font-bold">{singleMovieResult.movie?.id}</span></div>
                  <div className="text-slate-500">Title: <span className="text-slate-100 font-sans font-medium">{singleMovieResult.movie?.title}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500">Year: <span className="text-slate-300">{singleMovieResult.movie?.year}</span></div>
                  <div className="text-slate-500">Genre: <span className="text-slate-300">{singleMovieResult.movie?.genre || "N/A"}</span></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-500 font-mono block">Raw JSON Payload</span>
                <pre className="text-[9.5px] text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800 overflow-x-auto mt-1 max-h-24">
                  {JSON.stringify(singleMovieResult, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Code Snippets & Guides Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-blue-400" />
            <span className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
              {activeSnippetTab === "mcp" ? "AWS MCP Server Configuration" : "AWS RDS Connection & Agent Snippets"}
            </span>
          </div>

          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono flex-wrap gap-1">
            <button
              onClick={() => {
                setActiveSnippetTab("v3");
                setCopied(false);
              }}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                activeSnippetTab === "v3"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AWS SDK v3 (ESM)
            </button>
            <button
              onClick={() => {
                setActiveSnippetTab("v2");
                setCopied(false);
              }}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                activeSnippetTab === "v2"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AWS SDK v2 (CJS)
            </button>
            <button
              onClick={() => {
                setActiveSnippetTab("cli");
                setCopied(false);
              }}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                activeSnippetTab === "cli"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AWS CLI Setup
            </button>
            <button
              onClick={() => {
                setActiveSnippetTab("mcp");
                setCopied(false);
              }}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                activeSnippetTab === "mcp"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AWS MCP Server
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          {activeSnippetTab === "cli" 
            ? "Run standard AWS CLI credentials configuration inside your terminal to enable secure authentication from local environments."
            : activeSnippetTab === "mcp"
            ? "Configure the AWS Model Context Protocol (MCP) server inside your Claude Desktop or MCP Client to securely expose RDS, S3, DynamoDB, and Bedrock tools directly to AI Agents."
            : "The following template scripts demonstrate how to configure secure IAM authentication. Place them in your microservices or local test directory to run standalone database validation."
          }
        </p>

        <div className="relative">
          <div className="absolute right-3 top-3 z-10">
            <button
              onClick={() => {
                const codeText = 
                  activeSnippetTab === "v3" ? v3Code : 
                  activeSnippetTab === "v2" ? v2Code : 
                  activeSnippetTab === "cli" ? cliCode : 
                  mcpCode;
                navigator.clipboard.writeText(codeText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded border border-slate-700 text-[11px] font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy snippet to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96 text-left select-all">
            {activeSnippetTab === "v3" ? v3Code : activeSnippetTab === "v2" ? v2Code : activeSnippetTab === "cli" ? cliCode : mcpCode}
          </pre>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 font-mono space-y-1.5">
          <div className="font-bold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeSnippetTab === "mcp" ? "AWS MCP Server Quick-Start Guide" : "Connection Quick-Start Guide"}</span>
          </div>
          {activeSnippetTab === "mcp" ? (
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open your Claude Desktop configuration file (<code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">claude_desktop_config.json</code>).</li>
              <li>Add the <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">aws-mcp-server</code> block inside the <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">mcpServers</code> object.</li>
              <li>Provide your secure <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">AWS_REGION</code> and credentials environment variables.</li>
              <li>Restart Claude Desktop to unlock real-time tools for Amazon RDS databases, Amazon S3 Buckets, Bedrock Models, and DynamoDB.</li>
            </ol>
          ) : (
            <ol className="list-decimal pl-4 space-y-1">
              <li>Ensure your AWS RDS cluster has IAM Authentication enabled.</li>
              <li>Verify your executing environment has valid AWS credentials or is linked via OpenID Connect (OIDC).</li>
              <li>Run <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">npm install pg {activeSnippetTab === "v3" ? "@aws-sdk/rds-signer" : "aws-sdk"}</code> inside your test project folder.</li>
              <li>Execute the script using <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">node script.js</code> to establish a passwordless handshake!</li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

// Hardcoded snippets to display
const v3Code = `// ------------------- AWS SDK v3 (ES MODULES / RECOMMENDED) -------------------
// Install dependencies: npm install pg @aws-sdk/rds-signer

import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

const signer = new Signer({
  hostname: process.env.PGHOST || "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com",
  port: Number(process.env.PGPORT) || 5432,
  username: process.env.PGUSER || "postgres",
  region: process.env.AWS_REGION || "us-east-1"
});

const pool = new Pool({
  host: process.env.PGHOST || "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com",
  user: process.env.PGUSER || "postgres",
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getAuthToken(),
  port: Number(process.env.PGPORT) || 5432,
  ssl: { rejectUnauthorized: false }
});

async function runQuery() {
  try {
    const res = await pool.query("SELECT version()");
    console.log("Connected! Engine Version:", res.rows[0].version);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await pool.end();
  }
}

runQuery();`;

const v2Code = `// ------------------- AWS SDK v2 (COMMONJS / CLASSIC STYLE) -------------------
// Install dependencies: npm install pg aws-sdk

const { Client } = require('pg');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

async function main() {
  const signer = new AWS.RDS.Signer({
    region: 'us-east-1',
    hostname: 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com',
    port: 5432,
    username: 'postgres'
  });
  
  const password = signer.getAuthToken({});

  const client = new Client({
    host: 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log("Connected! Engine Version:", res.rows[0].version);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(console.error);`;

const cliCode = `# Configure AWS CLI Credentials for local sandbox/development environments
aws configure
AWS Access Key ID [None]: xxxxxxxxxxxxxxxx
AWS Secret Access Key [None]: xxxxxxxxxxxxxxxxxxxxxxxxx
Default region name [None]: us-east-1
Default output format [None]: json

# Verify configured profile
aws sts get-caller-identity`;

const mcpCode = `{
  "mcpServers": {
    "aws-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@aws-mcp/server"
      ],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "YOUR_AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY": "YOUR_AWS_SECRET_ACCESS_KEY"
      }
    }
  }
}`;
