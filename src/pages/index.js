import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import {
  ChevronDown,
  Eraser,
  Eye,
  File,
  Files,
  Flag,
  FlagIcon,
  LibraryIcon,
  Send,
  Trash,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Markdown from "react-markdown";
import ModeToggle from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import useStore from "@/states";
import Head from "next/head";
import SelectList from "@/components/select-list";
import dynamic from "next/dynamic";

import remarkGfm from "remark-gfm"; // Enables tables, strikethrough, etc.
import remarkMath from "remark-math"; // Math support
import rehypeKatex from "rehype-katex"; // Render math equations
import "katex/dist/katex.min.css"; // Required for KaTeX styling

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { ssr: false }
);
import therme from "react-syntax-highlighter/dist/cjs/styles/prism/dracula";
import _ from "lodash";
import Script from "next/script";

const ChatApp = () => {
  const params = useStore((state) => state.params);
  const setParams = useStore((state) => state.setParams);

  const messagesListIndex = useStore((state) => state.messagesListIndex);
  const setMessagesListIndex = useStore((state) => state.setMessagesListIndex);

  const messagesList = useStore((state) => state.messagesList);
  const setMessagesList = useStore((state) => state.setMessagesList);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [base64Images, setBase64Images] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [models, setModels] = useState([]);
  const [showThinkId, setShowThinkId] = useState(-1);

  const fileInputRef = useRef(null);
  const chatboxRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    if (messagesList[messagesListIndex]?.length > 0) {
      setMessages(messagesList[messagesListIndex] || []);
    }
  }, [messagesList]);

  const generateCompletion = async (
    prompt,
    onDone,
    onStreaming,
    history = [],
    image,
    pdfdoc,
    stop = false
  ) => {
    const reader = { current: null };

    const parseStreamData = (data) => {
      if (data === "[DONE]") return { isDone: true };

      try {
        const parsed = JSON.parse(data);
        return {
          content: parsed.content,
          error: parsed.error,
          isDone: false,
        };
      } catch (e) {
        console.error("Stream parse error:", e);
        return { error: "Parse error", isDone: false };
      }
    };

    const cleanup = (status = "FINISHED") => {
      if (reader.current) {
        reader.current.cancel();
      }
      onDone(status);
    };

    let content = "";

    try {
      const response = await fetch("/api/deep-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          history,
          image,
          pdfdoc,
          ai: params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      reader.current = response.body.getReader();
      const decoder = new TextDecoder();

      while (!stop) {
        const { done, value } = await reader.current.read();

        if (done) {
          cleanup("COMPLETED");
          break;
        }

        const lines = decoder.decode(value).split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const {
            isDone,
            content: newContent,
            error,
          } = parseStreamData(line.slice(6));

          if (isDone) {
            cleanup("COMPLETED");
            return;
          }

          if (error) {
            content += `\nError: ${error}`;
            onStreaming(content);
            cleanup("ERROR");
            return;
          }

          if (newContent) {
            content += newContent;
            onStreaming(content, newContent);
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      cleanup("ERROR");
    }
  };

  useEffect(() => {
    const init = async () => {
      const response = await fetch("/api/ollama-list");
      const resp = await response.json();
      setModels(resp?.models || []);
    };

    init();
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesList[messagesListIndex] = messages;
      setMessagesList(messagesList);
    }

    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const userID = uuidv4();
      const assistID = uuidv4();

      setMessages((prev) => [
        ...prev,
        {
          id: userID,
          content: inputMessage.trim(),
          role: "user",
          image: base64Images.length > 0 ? base64Images[0] : null,
          pdf: pdfs.length > 0 ? pdfs[0].name : null,
        },
      ]);

      const assistantMessage = {
        id: assistID,
        content: "",
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      generateCompletion(
        inputMessage.trim(),
        (status) => {
          if (status === "COMPLETED") {
            console.log("STATUS", status);
          }
        },
        (full_response) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: full_response }
                : msg
            )
          );
        },
        messages.map((m) => ({
          content: m.content,
          role: m.role,
        })),
        base64Images.length > 0 ? base64Images[0] : null,
        pdfs.length > 0 ? pdfs[0].text : null
      );

      setInputMessage("");
      setBase64Images([]);
      setPdfs([]);
    }
  };

  const clearChat = () => {
    if (messages && messages.length > 0) {
      setMessages([]);
      messagesList[messagesListIndex] = [];
      setMessagesList(messagesList);
      setBase64Images([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const UserAvatar = () => (
    <svg
      className="shrink-0 size-[30px] -mt-2 rounded-full"
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="38" height="38" rx="6" fill="#2563EB" />
      <path
        d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25"
        stroke="white"
        strokeWidth="1.5"
      />
      <ellipse cx="19" cy="18.6554" rx="3.75" ry="3.6" fill="white" />
    </svg>
  );

  const AssistantAvatar = () => (
    <span className="shrink-0 -mt-2 inline-flex items-center justify-center size-[30px] rounded-full bg-gray-600">
      <span className="text-sm font-medium leading-none">AZ</span>
    </span>
  );

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    const imagePromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension !== "pdf") {
        imagePromises.push(
          new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        );
      } else {
        const formData = new FormData();
        formData.append("files", file);

        const response = await fetch("/api/pdf", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setPdfs((pdfs) => [...pdfs, { name: file?.name, text: data[0]?.text }]);
      }
    }

    if (imagePromises.length > 0) {
      Promise.all(imagePromises)
        .then((base64Array) => setBase64Images(base64Array))
        .catch((error) => console.error("Error converting images:", error));
    }
  };

  const MarkdownFormat = ({ children }) => {
    return (
      <Markdown
        className="markdown-content"
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={therme}
                language={match[1]}
                // PreTag="div"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    );
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        <Script src="@/scripts/predline.js"></Script>
      </Head>

      <div className="h-screen">
        <div
          id="hs-application-sidebar"
          className="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[10] w-64 h-full bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 dark:bg-neutral-900 dark:border-neutral-700"
        >
          <nav className="size-full flex flex-col">
            <div className="flex items-center pt-4 pe-4 ps-7">
              <a
                className="flex-none focus:outline-none focus:opacity-80"
                aria-label="Preline"
              >
                <h1 className="text-3xl font-bold">Entèlèk AI</h1>
              </a>
            </div>

            <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              <ul className="space-y-1.5 p-4">
                <li>
                  <Button
                    variant={"outline"}
                    className="w-full"
                    onClick={() => {
                      messagesList.push([]);
                      setMessages([]);
                      setMessagesList(messagesList);
                      setMessagesListIndex(messagesListIndex + 1);
                    }}
                  >
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    New chat
                  </Button>
                </li>

                <li>
                  <SelectList
                    items={models
                      .filter(
                        (f) =>
                          (f.name.includes("deepseek") ||
                            f.name.includes("llama") ||
                            f.name.includes("phi") ||
                            f.name.includes("mistral") ||
                            f.name.includes("gemma")) &&
                          !f.name.includes("vision")
                      )
                      .map((m) => ({
                        value: m.model,
                        label: m.name,
                        icon: LibraryIcon,
                        number: "",
                      }))}
                    placeholder="LLM"
                    selected={params?.llm || "deepseek-r1:1.5b"}
                    onChanged={(e) => setParams({ ...params, llm: e })}
                  />
                </li>
                <li>
                  <SelectList
                    items={models
                      .filter((f) => f.name.includes("moon"))
                      .map((m) => ({
                        value: m.model,
                        label: m.name,
                        icon: Eye,
                        number: "",
                      }))}
                    placeholder="Vision"
                    selected={params?.vision}
                    onChanged={(e) => setParams({ ...params, vision: e })}
                  />
                </li>
                <li>
                  <SelectList
                    items={[
                      {
                        value: "english",
                        label: "English",
                        icon: FlagIcon,
                        number: "",
                      },
                      {
                        value: "french",
                        label: "French",
                        icon: FlagIcon,
                        number: "",
                      },
                      {
                        value: "spanish",
                        label: "Spanish",
                        icon: FlagIcon,
                        number: "",
                      },
                    ]}
                    placeholder="Language"
                    selected={params?.language}
                    onChanged={(e) => setParams({ ...params, language: e })}
                  />
                </li>

                <br />
              </ul>

              <div className="space-y-1.5 p-4">
                <span className=" w-full justify-between ">
                  Projects History
                </span>

                <ul className="w-full ">
                  {messagesList
                    .map((m) => ({
                      id: m[0]?.id,
                      name: m[0]?.content?.substring(0, 20),
                      megs: m,
                    }))
                    .map((m, i) => (
                      <li
                        key={i}
                        className={
                          i === messagesListIndex
                            ? "dark:bg-black bg-gray-200 w-full"
                            : "w-full"
                        }
                      >
                        <div className="flex items-center justify-between w-full ">
                          <span
                            className="flex truncate cursor-pointer w-full items-center gap-x-3 py-2 px-3 text-sm"
                            onClick={() => {
                              setMessagesListIndex(i);
                              setMessages(messagesList[i]);
                            }}
                          >
                            <svg
                              className="shrink-0 size-4"
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                            </svg>
                            {m.name || "Empty..."}
                          </span>
                          {messagesList.length > 1 && (
                            <Button
                              onClick={() => {
                                if (messagesList.length > 1) {
                                  const newOne = i > 0 ? i - 1 : 0;
                                  setMessagesListIndex(i);
                                  setMessages(messagesList.splice(i, 1));
                                  setMessagesListIndex(newOne);
                                  setMessages(messagesList[newOne]);
                                }
                              }}
                              variant="ghost"
                            >
                              <X className="cursor-pointer" size={16} />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <div className="w-full lg:ps-64">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            <ul
              className="pt-6 text-sm space-y-5 h-[80vh] overflow-y-auto"
              ref={chatboxRef}
            >
              {messages.map((message, index) => (
                <li
                  key={index}
                  className={`max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4 message ${message.role}-message`}
                >
                  {message.role === "user" ? (
                    <UserAvatar />
                  ) : (
                    <AssistantAvatar />
                  )}
                  <div
                    className={
                      message.role === "user"
                        ? "grow space-y-3 -mt-1"
                        : "grow space-y-3"
                    }
                  >
                    <span className="flex">
                      {message.role === "user" ? <p>Me</p> : <p>Assistant</p>}

                      {message.role !== "user" && (
                        <div>
                          {showThinkId === index && (
                            <span
                              className="font-bold cursor-pointer text-sm"
                              onClick={() => setShowThinkId(-1)}
                            >
                              {":  Hide thinking"}
                            </span>
                          )}

                          {showThinkId !== index && (
                            <span
                              className="font-bold cursor-pointer text-sm"
                              onClick={() => setShowThinkId(index)}
                            >
                              {": Show thinking"}
                            </span>
                          )}
                        </div>
                      )}
                    </span>

                    {message?.content?.split("^^^^^^^").length > 1 &&
                      showThinkId === index && (
                        <MarkdownFormat>
                          {message?.content?.split("^^^^^^^")[0]}
                        </MarkdownFormat>
                      )}

                    {showThinkId === index && message.role !== "user" && <hr />}

                    <MarkdownFormat>
                      {message?.content?.split("^^^^^^^").length > 1
                        ? message?.content?.split("^^^^^^^")[1]
                        : message?.content?.split("^^^^^^^")[0]}
                    </MarkdownFormat>

                    {message?.image && (
                      <img
                        src={message?.image}
                        alt={`Uploaded`}
                        className="w-12 h-12 object-cover hover:w-32 hover:h-32"
                      />
                    )}
                    {message?.pdf && <span>{message?.pdf}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-4xl mx-auto sticky bottom-0 z-10 p-3 sm:py-6">
            {base64Images.length > 0 && (
              <div className="-mb-6 lg:mb-2 flex gap-4">
                {base64Images.map((base64, index) => (
                  <div key={index} className="border p-2 rounded-lg shadow">
                    <Trash
                      onClick={() =>
                        setBase64Images(
                          base64Images.filter((f, i) => i !== index)
                        )
                      }
                      size={12}
                      color="red"
                      className="absolute r-0 t-0 cursor-pointer border bg-white"
                      style={{ zIndex: 999 }}
                    />
                    <img
                      style={{ zIndex: 99 }}
                      src={base64}
                      alt={`Uploaded ${index + 1}`}
                      className="w-12 h-12 object-cover relative"
                    />
                  </div>
                ))}
              </div>
            )}

            {pdfs.length > 0 && (
              <div className="-mb-6 lg:mb-2 flex gap-4">
                {pdfs.map((pdf, index) => (
                  <div key={index} className="border p-2 rounded-lg shadow">
                    <Trash
                      onClick={() =>
                        setPdfs(pdfs.filter((f, i) => i !== index))
                      }
                      size={12}
                      color="red"
                      className="absolute r-0 t-0 cursor-pointer border bg-white"
                      style={{ zIndex: 999 }}
                    />
                    <span>{pdf?.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="lg:hidden flex justify-end mb-2 sm:mb-3">
              <button
                type="button"
                className="p-2 inline-flex items-center gap-x-2 text-xs font-medium"
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-controls="hs-application-sidebar"
                aria-label="Toggle navigation"
                data-hs-overlay="#hs-application-sidebar"
              >
                <span>Menu</span>
              </button>
            </div>

            <div className="relative">
              <Textarea
                rows={4}
                className="p-4 block w-full bg-gray-100 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => {
                  if (e.target.value !== "\n") setInputMessage(e.target.value);
                }}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-gray-100 dark:bg-neutral-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <ModeToggle />
                    <Button
                      disabled={pdfs?.length > 0 || base64Images?.length > 0}
                      variant={"outline"}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <File size={24} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-x-1">
                    <Button
                      onClick={sendMessage}
                      className="inline-flex p-2 shrink-0 justify-center items-center size-8 rounded-lg"
                    >
                      <Send />
                    </Button>
                    <button
                      onClick={clearChat}
                      type="button"
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-white focus:z-10 focus:outline-none focus:bg-white dark:text-neutral-500 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    >
                      <Eraser />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatApp;
