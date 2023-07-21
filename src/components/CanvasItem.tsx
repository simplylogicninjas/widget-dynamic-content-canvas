import classNames from "classnames";
import React, { createElement, createRef, useEffect, useRef, useState } from "react";
// import { getRotationMatrix } from "src/utils/rotate-matrix";
import { Item } from "./CanvasInteract";

interface Props extends Item {
    active?: boolean;
    canActivate?: boolean;
    dragInteractActive: boolean;
    children?: React.ReactNode;
    onActivate?: (id: string | number) => void;
}

const CanvasItem = ({
    locked,
    lockPosition,
    itemId,
    active,
    canActivate,
    width,
    height,
    x,
    y,
    z,
    rotation,
    autoHeight,
    preserveAspectRatio,
    dragInteractActive,
    onActivate,
    children
}: Props) => {
    const itemRef = createRef<HTMLDivElement>();
    const itemContentRef = createRef<HTMLDivElement>();
    const updateStyleRef = useRef(true);
    const [itemWidth, setItemWidth] = useState(width);
    const [itemHeight, setItemHeight] = useState(height);
    const [itemX, setItemX] = useState<number>(x);
    const [itemY, setItemY] = useState<number>(y);

    const onItemClick = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!locked) {
            if (canActivate && !active && onActivate) {
                onActivate(itemId);
            }
        }
    }

    const updateItemDimension = (rootElement: HTMLDivElement, contentElement: HTMLDivElement) => {
        const defaultItemWidth = 200;
        const defaultItemHeight = 200;
        let itemCalculatedWidth = itemWidth;
        let itemCalculatedHeight = itemHeight;

        updateStyleRef.current = true;

        if (itemCalculatedWidth === 0 && itemCalculatedHeight === 0) {
            if (contentElement && contentElement.children[0]) {
                const boundingClientRect = contentElement.children[0].getBoundingClientRect();
    
                itemCalculatedWidth = boundingClientRect.right - boundingClientRect.left;
                itemCalculatedHeight = boundingClientRect.bottom - boundingClientRect.top;
            }
    
            itemCalculatedWidth = itemWidth === 0 ? defaultItemWidth : itemWidth;
            itemCalculatedHeight = itemHeight === 0 ? defaultItemHeight : itemHeight;
        }

        if (x === 0 && y === 0) {
            const canvasRoot = rootElement.parentElement;

            if (canvasRoot?.classList.contains('canvas-root')) {
                const canvasClientRect = canvasRoot.getBoundingClientRect();

                setItemX((canvasClientRect.width - itemWidth) / 2);
                setItemY((canvasClientRect.height - itemHeight) / 2);
            }
        }

        setItemWidth(itemCalculatedWidth);
        setItemHeight(itemCalculatedHeight);
    }

    
    const getItemDimensionStyle = () => {
        return {
            width: `${itemWidth}px`,
            height: autoHeight ? 'auto' : `${itemHeight}px`,
            left: itemX,
            top: itemY,
        }
    };

    const getItemContentStyle = () => {
        // const matrix = getRotationMatrix(rotation);

        return {
            zIndex: z
        }
    }
    
    const getClassNames = () => {
        return classNames({
            'canvas-item': true,
            [`canvas-item-${itemId}`]: true,
            'canvas-item--dragging': dragInteractActive,
            'canvas-item-canActivate': canActivate,
            'canvas-item-locked': locked,
            'canvas-item-lockPosition': lockPosition,
            'canvas-item-draggable': locked ? false : !lockPosition,
            'canvas-item-resizable': locked ? false : !lockPosition,
            'init': true,
            'active': active
        })
    }

    useEffect(() => {
        if (itemRef.current && itemContentRef.current) {
            updateItemDimension(itemRef.current, itemContentRef.current);
        }
    }, [
        width,
        height,
        itemRef.current,
        itemContentRef.current
    ])

    useEffect(() => {
        setItemWidth(width);
        setItemHeight(height);
        setItemX(x);
        setItemY(y);
    }, [
        width,
        height,
        x,
        y
    ])

    /*
    const SnapLines = (rootElement:HTMLDivElement) => {
        const canvasroot = rootElement.parentElement
        return(
            <div></div>
        )
    }
    */

    return (
        <div
            ref={itemRef}
            className={getClassNames()}
            data-id={itemId}
            data-x={itemX}
            data-y={itemY}
            data-width={itemWidth}
            data-height={itemHeight}
            data-preserveratio={preserveAspectRatio}
            data-autoheight={autoHeight}
            data-rotate={rotation}
            style={getItemDimensionStyle()}
        >
                <div
                    className='canvas-item__content'
                    style={getItemContentStyle()}
                    ref={itemContentRef}
                    onMouseDown={onItemClick}
                >
                    { children }
                </div>
                <div className='canvas-item__handles'>
                    { (!locked) && (
                        <React.Fragment>
                            { !autoHeight && (
                                <React.Fragment>
                                    <div className='resize-handle-bar resize-top rt' onMouseDown={onItemClick}>
                                        <div className='resize-handle resize-handle-topleft rt rl' onMouseDown={onItemClick} />
                                        <div className='resize-handle resize-handle-topright rt rr' onMouseDown={onItemClick} />
                                    </div>

                                    <div className='resize-handle-bar resize-bottom rb' onMouseDown={onItemClick}>
                                        <div className='resize-handle resize-handle-bottomleft rb rl' onMouseDown={onItemClick} />
                                        <div className='resize-handle resize-handle-bottomright rb rr' onMouseDown={onItemClick} />
                                    </div>
                                </React.Fragment>
                            )}

                            <div className='resize-handle-bar resize-left rl' onMouseDown={onItemClick}>
                                <div className='resize-handle resize-handle-left rl' onMouseDown={onItemClick} />
                            </div>
                            <div className='resize-handle-bar resize-right rr' onMouseDown={onItemClick}>
                                <div className='resize-handle resize-handle-right rr' onMouseDown={onItemClick} />
                            </div>

                            {/* <div className='rotate-handle' data-itemid={id} data-rotate={rotation}>
                                <RotateIcon />
                            </div> */}
                        </React.Fragment>
                    )}
                </div>
        </div>
    );
}

export default CanvasItem;