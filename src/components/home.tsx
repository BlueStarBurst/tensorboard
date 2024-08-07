"use client";

import { useState } from "react";
import DockViewContainer from "./dockview-container";
import { ElementsContextProvider } from "./canvas/elements-provider";

export default function Main() {
    return (
        <div className="w-full h-dvh flex items-center justify-center">
            <ElementsContextProvider>
                <DockViewContainer />
            </ElementsContextProvider>
        </div>
    )
}