import React, { createElement, useEffect, useRef, useState, ReactNode } from "react"
import { InteractModule } from "src/modules/interact";
import { listUnique } from "src/utils/utils";
import CanvasItem from "./CanvasItem";
import CanvasLine from "./CanvasLine";

export interface Item {
    id: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    autoHeight: boolean;
    lockPosition: boolean;
    content: ReactNode;
}

interface Props {
    items: Item[];
    onItemActivate: (id: string | number) => void;
    onDimensionChange: (target: HTMLElement) => void;
}

const CanvasInteract = ({
    items,
    onItemActivate,
    onDimensionChange
}: Props) => {
    const [activeItemId, setActiveItemId] = useState<string | number | undefined>();
    const isInteractingRef = useRef(false);
    const currentItemsRef = useRef<Item[]>([]);
    const interactModule = useRef<InteractModule>(new InteractModule(onDimensionChange));

    const onItemActive = (id: string | number) => {
        setActiveItemId(id);
        onItemActivate(id);
    }

    const onRootClick = () => {
        if (!isInteractingRef.current) {
            setActiveItemId(undefined);
        }
    }

    useEffect(() => {
        interactModule.current.init();
    }, []);

    useEffect(() => {
        interactModule.current.syncItems(items);
        currentItemsRef.current = items;
    }, [listUnique(currentItemsRef.current, items)])

    return (
        <div className='canvas-root' onClick={onRootClick}>
            {
                items.map(item => (
                    <CanvasItem
                        key={item.id}
                        onActivate={onItemActive}
                        active={activeItemId === item.id}
                        locked={false}
                        {...item}
                    >
                        {item.content}
                    </CanvasItem>
                ))
            }

            {
                items.map(item => (
                    <React.Fragment>
                        <CanvasLine x={item.x} />
                        <CanvasLine y={item.y} />
                    </React.Fragment>
                ))
            }
        </div>
    )
}

export default CanvasInteract