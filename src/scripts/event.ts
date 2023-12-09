export type EventHandler<T> = (event: T) => void

export interface Action<T> {
    register(handler: EventHandler<T>): Action<T>
    unregister(handler: EventHandler<T>): Action<T>
}

export class EventDispatcher<T> implements Action<T> {
    /** @internal */
    private handlers: EventHandler<T>[] = []

    public register(handler: EventHandler<T>): Action<T> {
        this.handlers.push(handler)
        return this
    }

    public unregister(handler: EventHandler<T>): Action<T> {
        for (let i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i] === handler) {
                this.handlers.splice(i, 1)
            }
        }
        return this
    }

    public dispatch(value: T): void {
        for (let handler of this.handlers) {
            handler(value)
        }
    }
}
