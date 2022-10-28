import { Interactable, SnapTarget } from "@interactjs/types";
import interact from "interactjs";
import { Item } from "src/components/CanvasInteract";

const AXIS_RANGE = 20;

export class InteractModule {
    interactable: Interactable | undefined = undefined;
    interactableRotate: Interactable | undefined = undefined;
    isInteracting = false;
    items: Item[] = [];
    currentElement: HTMLElement | undefined = undefined;
    offX1: number = 0;
    offX2: number = 0;
    offY1: number = 0;
    offY2: number = 0;
    snapTargets: SnapTarget[] = [];
    onDimensionChange: (target: HTMLElement) => void;

    constructor(
        onDimensionChange: (target: HTMLElement) => void
    ) {
        this.onDimensionChange = onDimensionChange;
    }

    init() {
        this.interactable = interact('.canvas-item-resizable')
        .resizable(this.getResizableConfig())
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.snap({
                    targets: this.snapTargets,
                    relativePoints: [
                        {x: 0, y: 0},
                        {x: .5, y: .5},
                        {x: 1, y: 1}
                    ]
                })
            ],
            listeners: {
                start: (event) => {
                    const target = event.target as HTMLElement;

                    this.currentElement = target;
                    this.getSnapTargets(target);
                },
                move: this.onDragMove.bind(this),
                end: (event: any) => {
                    this.isInteracting = false;
                    this.onDimensionChange(event.target as HTMLElement);
                }
            }
        })

        this.interactableRotate = interact('.rotate-handle')
        .draggable({
            listeners: {
                start: this.onDragRotateStart.bind(this),
                move: this.onDragRotateMove.bind(this),
                end: (event) => {
                    this.onDragRotateEnd(event);
                    this.onDimensionChange(event.target as HTMLElement);
                }
            }
        })
    }

    syncItems(items: Item[]) {
        this.items = [...items];

        // if (this.interactable) {
        //     this.interactable.options.drag.modifiers = [
        //         interact.modifiers.snap({
        //             targets: this.snapTargets
        //         })
        //     ]
        // }
    }

    private getSnapTargets(target: HTMLElement) {
        const id = target.getAttribute('data-id');

        if (id) {
            const currentItem = this.items.find(it => it.id === id);

            if (currentItem) {
                const otherItems = this.items.filter(it => it.id !== id);

                const {width, height} = currentItem;

                const halfWidth = width / 2;
                const halfHeight = height / 2;

                otherItems.forEach(item => {
                    const itemX = item.width / 2;
                    const itemY = item.height / 2;

                    this.snapTargets = [
                        {
                            x: itemX,
                            range: AXIS_RANGE
                        },
                        {
                            x: itemX - halfWidth,
                            range: AXIS_RANGE
                        },
                        {
                            x: itemX - width,
                            range: AXIS_RANGE
                        },
                        {
                            y: itemY,
                            range: AXIS_RANGE
                        },
                        {
                            y: itemY - halfHeight,
                            range: AXIS_RANGE
                        },
                        {
                            y: itemY - height,
                            range: AXIS_RANGE
                        },
                        {
                            x: itemX,
                            y: itemY,
                            range: AXIS_RANGE * 2
                        }
                    ]
                })
            }
        }
    }

    private getResizableConfig() {
        return {
            edges: {
                left: true,
                right: true,
                bottom: '.resize-bottom',
                top: '.resize-top',
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 20, height: 20 }
                })
            ],
            listeners: {
                start: () => this.isInteracting = true,
                    move: this.onResizeMove.bind(this),
                    end: (event: any) => {
                        // const target = event.target as HTMLElement;
                        this.isInteracting = false;
                        this.onDimensionChange(event.target as HTMLElement);
                    }
            }
        }
    }

    private onResizeMove(event: any) {
        const target = event.target as HTMLElement;
        const hasAutoHeight = target.getAttribute('data-autoheight');

        let x = (parseFloat(target.getAttribute('data-x') as string) || 0);
        let y = (parseFloat(target.getAttribute('data-y') as string) || 0);
        let angle = target.getAttribute('data-rotate');

        // update the element's style
        target.style.width = event.rect.width + 'px'

        if (!hasAutoHeight) {
            target.style.height = event.rect.height + 'px'
        }

        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.setAttribute('data-x', `${x}`);
        target.setAttribute('data-y', `${y}`);
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
    }

    private onDragMove(event: any) {
        const target = event.target as HTMLElement;

        let x = (parseFloat(target.getAttribute('data-x') as string) || 0);
        let y = (parseFloat(target.getAttribute('data-y') as string) || 0);
        let angle = target.getAttribute('data-rotate');

        x += event.dx;
        y += event.dy;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
        target.setAttribute('data-x', `${x}`);
        target.setAttribute('data-y', `${y}`);
    }

    private onDragRotateStart(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

        if (canvasItem) {
            const {left, top, width, height} = canvasItem.getBoundingClientRect();
            
            canvasItem.setAttribute('data-center-x', `${left + width / 2}`);
            canvasItem.setAttribute('data-center-y', `${top + height / 2}`);
            canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
            
        }
    }

    private onDragRotateMove(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;
        if (canvasItem) {
            const angle = this.getDragAngle(canvasItem, event.clientY, event.clientX);
            const x = canvasItem.getAttribute('data-x');
            const y = canvasItem.getAttribute('data-y');
            canvasItem.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
        }
    }

    private onDragRotateEnd(event: any) {
        const target = event.target as HTMLElement;
        const id = target.getAttribute('data-itemid');
        const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

        if (canvasItem) {
            canvasItem.setAttribute('data-rotate', `${this.getDragAngle(canvasItem, event.clientY, event.clientX)}`)
        }
    }

    private getDragAngle(element: HTMLElement, clientY: number, clientX: number) {
        const startAngle = parseFloat(element.getAttribute('data-rotate') ?? '');
        const x = parseFloat(element.getAttribute('data-center-x') ?? '');
        const y = parseFloat(element.getAttribute('data-center-y') ?? '');
    
        const angle = Math.atan2(y - clientY, x - clientX);
    
        return angle - startAngle;
    }
}