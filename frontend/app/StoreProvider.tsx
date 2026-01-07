"use client";
import { useRef, useState } from "react";
import { AppStore, makeStore } from "./lib/store/store";
import { Persistor } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  const [persistor] = useState(() => persistStore(store));

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
