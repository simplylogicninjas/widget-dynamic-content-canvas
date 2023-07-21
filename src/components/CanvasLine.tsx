import React, { createElement } from "react";
import { SnapLineEvent } from "src/modules/interact";

interface Props {
    snapLine: SnapLineEvent;
    canvasRootRect?: DOMRect;
}

const CanvasLine = ({
    canvasRootRect,
    snapLine
}: Props) => {
    const getStylePositionY = () => {
        const canvasRootTop = canvasRootRect ? canvasRootRect.top : 0;
        const canvasRootLeft = canvasRootRect ? canvasRootRect.left : 0;

        const top = snapLine.snapItem.y - canvasRootTop;
        
        if (snapLine.snapItem.type === 'root') {
            return {
                top,
                left: 0,
                right: 0
            }
        } else {
            const targetDifference = snapLine.targetX + snapLine.targetWidth;
            const snapItemDifference = (snapLine.snapItem.x - canvasRootLeft) + snapLine.snapItem.width;

            const isBeforeSnapItem = targetDifference < (snapLine.snapItem.x - canvasRootLeft);
            const isAfterSnapItem = targetDifference > snapItemDifference;

            if (isBeforeSnapItem) {
                return {
                    top,
                    left: snapLine.targetX,
                    width: (snapLine.snapItem.x - canvasRootLeft) - snapLine.targetX
                }
            }

            if (isAfterSnapItem) {
                const left = (snapLine.snapItem.x + snapLine.snapItem.width) - canvasRootLeft;
                return {
                    top,
                    left,
                    width: snapLine.targetX - left 
                }
            }
        }
    }

    const getStyleYPositionCurrentItem = () => {
        const canvasRootTop = canvasRootRect?.top ?? 0

        return {
            top: snapLine.snapItem.y - canvasRootTop,
            left: snapLine.targetX,
            width: snapLine.targetWidth
        }
    }

    const getStyleYPositionSnapItem = () => {
        const canvasRootTop = canvasRootRect?.top ?? 0
        const canvasRootLeft = canvasRootRect?.left ?? 0

        return {
            top: snapLine.snapItem.y - canvasRootTop,
            left: (snapLine.snapItem.x - canvasRootLeft),
            width: snapLine.snapItem.width
        }
    }

    const getStyleXPosition = () => {
        const canvasRootTop = canvasRootRect?.top ?? 0
        const canvasRootLeft = canvasRootRect?.left ?? 0

        const left = snapLine.snapItem.x - canvasRootLeft;

        console.log('x', snapLine);

        if (snapLine.snapItem.type === 'root') {
            return {
                top: 0,
                bottom: 0,
                left: left
            }
        } else {
            const targetDifference = snapLine.targetY + snapLine.targetHeight;
            const snapItemDifference = (snapLine.snapItem.y - canvasRootTop) + snapLine.snapItem.height;

            const isBeforeSnapItem = targetDifference < (snapLine.snapItem.y - canvasRootTop);
            const isAfterSnapItem = targetDifference > snapItemDifference;

            if (isBeforeSnapItem) {
                return {
                    top: snapLine.targetY,
                    left,
                    height: (snapLine.snapItem.y - canvasRootTop) - snapLine.targetY
                }
            }

            if (isAfterSnapItem) {
                const top = (snapLine.snapItem.y + snapLine.snapItem.height) - canvasRootTop;
                return {
                    top,
                    left,
                    height: snapLine.targetY - top 
                }
            }
        }
    }

    const getStyleXPositionCurrentItem = () => {
        const canvasRootLeft = canvasRootRect?.left ?? 0

        return {
            left: snapLine.snapItem.x - canvasRootLeft,
            top: snapLine.targetY,
            height: snapLine.targetHeight
        }
    }

    const getStyleXPositionSnapItem = () => {
        const canvasRootTop = canvasRootRect?.top ?? 0
        const canvasRootLeft = canvasRootRect?.left ?? 0

        return {
            top: snapLine.snapItem.y - canvasRootTop,
            left: snapLine.snapItem.x - canvasRootLeft,
            height: snapLine.targetHeight
        }
    }

    const renderXLine = () => (
        <React.Fragment>
            <div className="canvas-line canvas-line--x" style={getStyleXPosition()} />
            <div className="canvas-line canvas-line--x canvas-line--current-item" style={getStyleXPositionCurrentItem()} />
            { snapLine.snapItem.type === 'item' ? 
                <React.Fragment>
                    <div className="canvas-line canvas-line--x  canvas-line--item" style={getStyleXPositionSnapItem()} />
                </React.Fragment>
                : undefined
            }
        </React.Fragment>
    )

    const renderYLine = () => {
        console.log('snap line Y');

        return (
            <React.Fragment>
            <div className="canvas-line canvas-line--y" style={getStylePositionY()} />
            <div className="canvas-line canvas-line--y canvas-line--current-item" style={getStyleYPositionCurrentItem()} />
            { snapLine.snapItem.type === 'item' ? 
                <React.Fragment>
                    <div className="canvas-line canvas-line--y  canvas-line--item" style={getStyleYPositionSnapItem()} />
                </React.Fragment>
                : undefined
            }
        </React.Fragment>
        )
    }

    const renderLines = () => {
        if (snapLine?.snapItem?.axis === 'x') {
            return renderXLine();
        }

        if (snapLine?.snapItem?.axis === 'y') {
            return renderYLine();
        }

        if (snapLine?.snapItem?.axis === 'xy') {
            return (
                <React.Fragment>
                    { renderXLine() }
                    { renderYLine() }
                </React.Fragment>
            )
        }

        return null;

    }

    return (
        <React.Fragment>
            {renderLines()}
        </React.Fragment>
    )
}

export default CanvasLine;