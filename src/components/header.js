import { useEffect, useState } from "react";
import { Button } from "./ui/button";

function Header({ onChange }) {
  const [search, setSearch] = useState();

  useEffect(() => {
    if (onChange) {
      onChange(search);
    }
  }, [search]);
  return (
    <div>
      <div className="mt-20 max-w-4xl w-full text-center mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold  sm:text-4xl ">
          Welcome to Anplwa AI
        </h1>
        <p className="mt-3  ">
          Your AI-Career copilot to prepare and find jobs easily
        </p>
      </div>
      {/* Search */}
      <div className="mt-10 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <input
            type="text"
            className="p-4 block w-full bg-gray-50  rounded-full text-sm  disabled:pointer-events-none "
            placeholder="Ask me anything..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <div className="absolute top-1/2 end-2 -translate-y-1/2">
            <button
              type="button"
              className="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover: focus:outline-none focus: disabled:opacity-50 disabled:pointer-events-none  dark:hover:text-white dark:focus:text-white"
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
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </button>
            <button
              type="button"
              className="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover: focus:outline-none focus: bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  dark:bg-neutral-800 dark:hover:text-white dark:focus:text-white"
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
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1={12} x2={12} y1={19} y2={22} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
