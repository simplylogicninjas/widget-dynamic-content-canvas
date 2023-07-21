export const getRotationMatrix = (angle: number): string => {
    const a = Math.cos(angle);
    const b = Math.sin(angle);
    const c = -b;
    const d = a;
    const e = 0;
    const f = 0;

    return `${a}, ${b}, ${c}, ${d}, ${e}, ${f}`;
}

export const calcNewPos = (
    curr_x: number,
    curr_y: number,
    curr_w: number,
    curr_h: number,
    new_w: number,
    new_h: number,
    angle: number
) => {
    //initial position.
    let pos = {left: curr_x, top: curr_y};
    
    //Get position after rotation with original size
    let x = -curr_w/2;
    let y = curr_h/2;
    let new_x = y * Math.sin(angle) + x * Math.cos(angle);
    let new_y = y * Math.cos(angle) - x * Math.sin(angle);
    let p1 = {left: new_x - x, top: new_y - y};

    //Get position after rotation with new size
    x = -new_w/2;
    y = new_h/2;
    new_x = y * Math.sin(angle) + x * Math.cos(angle);
    new_y = y * Math.cos(angle) - x * Math.sin(angle);
    let p2 = {left: new_x - x, top: new_y - y};

    //Get the difference between the two positions
    let offset = {left: p2.left - p1.left, top: p2.top - p1.top};

    //Calculate the correction
    return {left: pos.left - offset.left, top: pos.top + offset.top};
}