import { createElement } from "react";

interface Props {
    x?: number;
    y?: number; 
}

const CanvasLine = ({
    x,
    y
}: Props) => {
    const getStyle = () => {
        if (x) {
            return {
                left: x,
                top: 0,
                bottom: 0,
                width: 2
            }
        }

        if (y) {
            return {
                top: y,
                left: 0,
                right: 0,
                height: 2
            }
        }
    }

    return (
        <div className={'canvas-line'} style={getStyle()} />
    )
}

export default CanvasLine;