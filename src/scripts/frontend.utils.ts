/**
 * @param element HTML element that will have a height transition
 * @returns True if element's next state is 'opened' (height == auto)
 * @returns False if element's next state is 'closed' (height == 0)
 */
export function height_0auto_startTransition(element: HTMLElement): boolean {
    if (element.style.height === "0px") {
        element.style.height = `${element.scrollHeight}px`

        return true
    }
    else {
        element.style.height = `${element.scrollHeight}px`;
        window.getComputedStyle(element, null).getPropertyValue("height");
        element.style.height = "0px";

        return false
    }
}

/**
 * @param e element's 'onTransitionEnd' event
 * @returns True if element is now in 'opened' state (height == auto)
 * @returns False if element is now in 'closed' state (height == 0)
 */
export function height_0auto_endTransition(e: React.TransitionEvent<HTMLElement>): boolean {
    const block = e.currentTarget

    if (block.style.height !== '0px') {
        block.style.height = 'auto'

        return true
    }

    return false
}