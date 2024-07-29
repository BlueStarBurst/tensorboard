import components from "../blocks";
import Block from "./block";

export default function Blocks() {
    return (
        <div className="w-full h-full flex flex-row items-start justify-center flex-wrap overflow-auto gap-0 scroll">
            {Object.keys(components).map((key, index) => {
                const Component = components[key];
                return <Block
                    key={index}
                    componentKey={key}
                    component={components[key]}
                />;
            })}
        </div>
    )
}