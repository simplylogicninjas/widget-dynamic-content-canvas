import classNames from "classnames";
import { createElement } from "react";

interface Props {
    visible: boolean;
    children: React.ReactNode;
}

const CanvasItemPopover = ({
    visible,
    children
}: Props) => {
    const popoverClassNames = classNames({
        'canvas-item-popover': true,
        'is-visible': visible
    })
    
    return (
        <div className={popoverClassNames}>
            { children }
        </div>
    )
}

export default CanvasItemPopover