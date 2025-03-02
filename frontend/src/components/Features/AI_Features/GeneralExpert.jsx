
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const GeneralExpert = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Loading animation messages
  useEffect(() => {
    let loadingTexts = [
      "Analyzing agricultural parameters...",
      "Evaluating soil composition data...",
      "Processing crop physiology models...",
      "Cross-referencing research databases...",
    ];
    let currentIndex = 0;

    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingTexts[currentIndex]);
        currentIndex = (currentIndex + 1) % loadingTexts.length;
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <svg
        className="w-48 h-48 mb-4 text-mycol-mint/50"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 12V8M12 16H12.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 9C9 9 10 8 12 8C14 8 15 9 15 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="text-xl font-semibold mb-2">
        Agricultural Knowledge Base
      </h3>
      <p className="text-center text-gray-500 max-w-sm">
        Ask about crop science, soil chemistry, agricultural engineering, or
        farm management strategies.
      </p>
    </div>
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await axios.post("/api/v1/ai/general", {
        message: inputMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: response.data,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to analyze agricultural data");

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "**Agricultural Analysis Error**\n```\n" + error.message + "\n```",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h2
        className="text-2xl font-bold text-mycol-brunswick_green mt-6 mb-4"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h3
        className="text-xl font-semibold text-mycol-sea_green mt-5 mb-3"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h4
        className="text-lg font-medium text-mycol-mint mt-4 mb-2"
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside pl-4 mb-4 space-y-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside pl-4 mb-4 space-y-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-700 pl-2" {...props} />
    ),
    code: ({ node, inline, className, ...props }) =>
      inline ? (
        <code
          className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono"
          {...props}
        />
      ) : (
        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-gray-100 my-4">
          <code className="font-mono text-sm" {...props} />
        </pre>
      ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full border-collapse border border-gray-200"
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="bg-mycol-mint/10 text-left py-3 px-4 border border-gray-200 font-semibold text-mycol-brunswick_green"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className="py-2 px-4 border border-gray-200 text-gray-700"
        {...props}
      />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-mycol-sea_green pl-4 my-4 text-gray-600 italic"
        {...props}
      />
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-gradient-to-br from-mycol-nyanza/30 to-white p-6"
    >
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full relative">
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mycol-brunswick_green to-mycol-mint bg-clip-text text-transparent">
            Agricultural Science Expert System
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced analysis of agronomy, horticulture, and agricultural
            technology
          </p>
        </motion.div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-6 rounded-xl bg-white shadow-lg p-6 space-y-6"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-4xl rounded-lg p-4 ${
                      message.type === "user"
                        ? "bg-mycol-mint text-white"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {message.type === "user" ? (
                      <p className="font-medium">{message.content}</p>
                    ) : (
                      <div className="agricultural-content">
                        <ReactMarkdown
                          components={MarkdownComponents}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start"
            >
              <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-mycol-sea_green" />
                <span className="text-gray-600">{loadingMessage}</span>
              </div>
            </motion.div>
          )}
        </div>

        <motion.form
          onSubmit={handleSend}
          className="flex space-x-4 bg-transparent backdrop-blur-sm py-2"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter agricultural query..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-mycol-mint focus:border-transparent outline-none bg-white placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-mycol-mint to-mycol-sea_green text-white rounded-xl flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span>Analyze</span>
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default GeneralExpert;
