"use client";
import React from "react";
import "@ant-design/v5-patch-for-react-19";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, App as AntApp, theme as antdTheme } from "antd";
import { persistor, store } from "./store";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider
            theme={{
                algorithm: antdTheme.defaultAlgorithm,
            }}
        >
            <AntApp>
                <Provider store={store}>
                    <PersistGate persistor={persistor}>
                        {children}
                    </PersistGate>
                </Provider>
            </AntApp>
        </ConfigProvider>
    );
}


