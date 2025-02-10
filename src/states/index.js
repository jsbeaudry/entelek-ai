import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      params: {
        llm: "deepseek-r1:1.5b",
        vision: "moondream:latest",
        language: "english",
      },
      setParams: (data) => set({ params: data }),

      messagesList: [[]],
      setMessagesList: (data) => set({ messagesList: data }),

      messagesListIndex: 0,
      setMessagesListIndex: (data) => set({ messagesListIndex: data }),
    }),
    {
      name: "kinanm-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
export default useStore;
