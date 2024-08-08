import { createContext, useEffect, useState } from "react";

type StorageContextType = {
    storage: Storage | null;
    setStorage: (storage: Storage) => void;
};

export const StorageContext = createContext<StorageContextType>({
    storage: null,
    setStorage: () => {},
});

export function StorageContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [storage, setStorage] = useState<Storage | null>(null);

    useEffect(() => {
        console.log("SETTING STORAGE");
        setStorage(window.localStorage);
    }, []);

    useEffect(() => {
        if (storage) {
            console.log("STORAGE", storage);
        }
    }, [storage]);

    return (
        <StorageContext.Provider value={{ storage, setStorage }}>
            {children}
        </StorageContext.Provider>
    );
}