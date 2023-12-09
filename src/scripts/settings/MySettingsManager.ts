import { ConfigOptions, SettingsManager } from "tauri-settings"
import { Path, PathValue } from "tauri-settings/dist/types/dot-notation"
import { Action, EventDispatcher } from "../event"

type EventList<K extends string | number | symbol, V> = {
    [key in K]: EventDispatcher<V>
}

export class MySettingsManager<Schema extends {} = any> extends SettingsManager<Schema> {

    /** @internal */
    private events: EventList<Path<Schema>, PathValue<Schema, Path<Schema>>>

    public getValueUpdatedEvent<K extends Path<Schema>>(key: K): Action<PathValue<Schema, K>> {
        return this.events[key] as Action<PathValue<Schema, K>>
    }

    constructor(defaultSettings: Schema, options?: ConfigOptions) {
        super(defaultSettings, options)

        // init events list
        const obj: any = {}
        for (let key in defaultSettings) {
            obj[key] = new EventDispatcher<PathValue<Schema, Path<Schema>>>()
        }

        this.events = obj
    }

    override async set<K extends Path<Schema>, V extends PathValue<Schema, K>>(key: K, value: V) {
        const result = await super.set(key, value)
        this.events[key].dispatch(value)

        return result
    }

    override setCache<K extends Path<Schema>, V extends PathValue<Schema, K>>(key: K, value: V) {
        const result = super.setCache(key, value)
        this.events[key].dispatch(value)

        return result
    }

    override async initialize(): Promise<Schema> {
        console.log('settings: initialize...')

        const result = await super.initialize()

        let key: Path<Schema>
        for (key in this.events) {
            this.events[key].dispatch(this.getCache(key))
        }

        return result
    }

    override syncCache(): Promise<Schema> {
        console.log('settings: sync cache...')

        return super.syncCache()
    }
}
