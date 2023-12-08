export type EventHandler<T> = (event: T) => void

export interface Action<T> {
    register(handler: EventHandler<T>): void
    unregister(handler: EventHandler<T>): void
}

export class EventDispatcher<T> implements Action<T> {
    private handlers: EventHandler<T>[] = []

    public register(handler: EventHandler<T>): void {
        this.handlers.push(handler)
    }

    public unregister(handler: EventHandler<T>): void {
        for (let i = 0; i < this.handlers.length; i++) {
            if (this.handlers[i] === handler) {
                this.handlers.splice(i, 1)
            }
        }
    }

    public dispatch(value: T): void {
        for (let handler of this.handlers) {
            handler(value)
        }
    }
}
