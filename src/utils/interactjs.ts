export const onResizeMove = (event: any) => {
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

export const onDragMove = (event: any) => {
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

export const onDragRotateStart = (event: any) => {
    const target = event.target as HTMLElement;
    const id = target.getAttribute('data-itemid');
    const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

    if (canvasItem) {
        const {left, top, width, height} = canvasItem.getBoundingClientRect();
        
        canvasItem.setAttribute('data-center-x', `${left + width / 2}`);
        canvasItem.setAttribute('data-center-y', `${top + height / 2}`);
        canvasItem.setAttribute('data-rotate', `${getDragAngle(canvasItem, event.clientY, event.clientX)}`)
    }
}

export const onDragRotateMove = (event: any) => {
    const target = event.target as HTMLElement;
    const id = target.getAttribute('data-itemid');
    const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;
    if (canvasItem) {
        const angle = getDragAngle(canvasItem, event.clientY, event.clientX);
        const x = canvasItem.getAttribute('data-x');
        const y = canvasItem.getAttribute('data-y');
        canvasItem.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'rad' + ')'
    }
}

export const onDragRotateEnd = (event: any) => {
    const target = event.target as HTMLElement;
    const id = target.getAttribute('data-itemid');
    const canvasItem = document.querySelector(`div[data-id="${id}"]`) as HTMLElement;

    if (canvasItem) {
        canvasItem.setAttribute('data-rotate', `${getDragAngle(canvasItem, event.clientY, event.clientX)}`)
    }
}

export const getDragAngle = (element: HTMLElement, clientY: number, clientX: number) => {
    const startAngle = parseFloat(element.getAttribute('data-rotate') ?? '');
    const x = parseFloat(element.getAttribute('data-center-x') ?? '');
    const y = parseFloat(element.getAttribute('data-center-y') ?? '');

    const angle = Math.atan2(y - clientY, x - clientX);

    return angle - startAngle;
}