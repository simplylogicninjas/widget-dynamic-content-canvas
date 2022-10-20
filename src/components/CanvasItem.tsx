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
    onActivate,
    children
}: Props) => {
    const itemRef = createRef<HTMLDivElement>();
    const [init, setInit] = useState(false);
    const [itemWidth, setItemWidth] = useState(0);
    const [itemHeight, setItemHeight] = useState(0);
    const [itemAngle, setItemAngle] = useState(0);

    const onItemClick = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (onActivate) {
            onActivate(id);
        }
    }

    const updateItemDimension = (element: HTMLDivElement) => {
        if (width === 0 && height === 0) {
            if (element.children[0]) {
                const boundingClientRect = element.children[0].getBoundingClientRect();

                setItemWidth(boundingClientRect.width);
                setItemHeight(boundingClientRect.height);
            } else {
                setItemWidth(100);
                setItemHeight(100);
            }
        } else {
            setItemWidth(width);
            setItemHeight(height);
        }

        if(itemAngle === 0)
        {
            if (element.children[0]){
                setItemAngle(rotation)

            } else {
                setItemAngle(0);
            }
        } else {
            setItemAngle(rotation)
        }

        if (!init) {
            setInit(true);
        }
    }

    
    const getItemDimensionStyle = () => {
        if (init) {
            return {
                width: `${itemWidth}px`,
                height: `${itemHeight}px`,
                transform: `translate(${x}px, ${y}px) rotate(${itemAngle}deg)`,
            }
        }
    }
    
    const getClassNames = () => {
        return classNames({
            'canvas-item': true,
            'canvas-item-active': !locked,
            'init': init,
            'active': active
        })
    }

    useEffect(() => {
        if (itemRef.current) {
            updateItemDimension(itemRef.current);
        }
    }, [
        width,
        height
    ])

    return (
        <div
            ref={itemRef}
            className={getClassNames()}
            data-id={id}
            data-x={x}
            data-y={y}
            data-rotate={rotation}
            onClick={onItemClick}
            style={getItemDimensionStyle()}>
                <div className='canvas-item__content'>
                    { children }
                </div>
                { !locked && (
                    <div className='canvas-item__handles'>
                        <div className='resize-handle-bar resize-top'>
                            <div className='resize-handle resize-handle-topleft' />
                            <div className='resize-handle resize-handle-topright' />
                        </div>
                        <div className='resize-handle-bar resize-bottom'>
                            <div className='resize-handle resize-handle-bottomleft' />
                            <div className='resize-handle resize-handle-bottomright' />
                        </div>
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