"use client";

import Canvas from "./canvas";
import DockViewContainer from "./dockview-container";

export default function Main() {

    return (
        <div className="w-full h-dvh flex items-center justify-center">
            <DockViewContainer />
        </div>
    )
}