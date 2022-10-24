import classNames from "classnames";
import React, { createElement, createRef, useEffect, useState } from "react";
import RotateIcon from "./RotateIcon";

interface Props {
    id: string | number;
    active: boolean;
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
    locked: boolean;
    autoHeight: boolean;
    lockPosition: boolean;
    children?: React.ReactNode;
    onActivate?: (id: string | number) => void;
}

const CanvasItem = ({
    locked,
    id,
    active,
    width,
    height,
    x,
    y,
    rotation,
    autoHeight,
    lockPosition,
    onActivate,
    children
}: Props) => {
    const itemRef = createRef<HTMLDivElement>();
    const itemContentRef = createRef<HTMLDivElement>();
    const [itemWidth, setItemWidth] = useState(width);
    const [itemHeight, setItemHeight] = useState(height);
    const [itemX, setItemX] = useState(x);
    const [itemY, setItemY] = useState(y);
    const [itemAngle, setItemAngle] = useState(0);

    const onItemClick = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (onActivate) {
            onActivate(id);
        }
    }

    const updateItemDimension = (rootElement: HTMLDivElement, contentElement: HTMLDivElement) => {
        const defaultItemWidth = 200;
        const defaultItemHeight = 200;
        let itemCalculatedWidth = itemWidth;
        let itemCalculatedHeight = itemHeight;

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

        if(itemAngle === 0)
        {
            if (contentElement){
                setItemAngle(rotation)

            } else {
                setItemAngle(0);
            }
        } else {
            setItemAngle(rotation)
        }

        setItemWidth(itemCalculatedWidth);
        setItemHeight(itemCalculatedHeight);
    }

    
    const getItemDimensionStyle = () => {
        return {
            width: `${itemWidth}px`,
            height: autoHeight ? 'auto' : `${itemHeight}px`,
            transform: `translate(${itemX}px, ${itemY}px) rotate(${itemAngle}deg)`,
        }
    }
    
    const getClassNames = () => {
        return classNames({
            'canvas-item': true,
            'canvas-item-draggable': !locked && !lockPosition,
            'canvas-item-resizable': !locked,
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

    return (
        <div
            ref={itemRef}
            className={getClassNames()}
            data-id={id}
            data-x={itemX}
            data-y={itemY}
            data-autoheight={autoHeight}
            data-rotate={itemAngle}
            onMouseDown={onItemClick}
            style={getItemDimensionStyle()}>
                <div className='canvas-item__content' ref={itemContentRef}>
                    { children }
                </div>
                { !locked && (
                    <div className='canvas-item__handles'>
                        { !autoHeight && (
                            <React.Fragment>
                                <div className='resize-handle-bar resize-top'>
                                    <div className='resize-handle resize-handle-topleft' />
                                    <div className='resize-handle resize-handle-topright' />
                                </div>

                                <div className='resize-handle-bar resize-bottom'>
                                    <div className='resize-handle resize-handle-bottomleft' />
                                    <div className='resize-handle resize-handle-bottomright' />
                                </div>
                            </React.Fragment>
                        )}
                        
                        <div className='resize-handle-bar resize-left'>
                            <div className='resize-handle resize-handle-left' />
                        </div>
                        <div className='resize-handle-bar resize-right'>
                            <div className='resize-handle resize-handle-right' />
                        </div>

                        <div className='rotate-handle' data-itemid={id} data-rotate={rotation}>
                            <RotateIcon />
                        </div>
                    </div>
                )}
                
        </div>
    );
}

export default CanvasItem;