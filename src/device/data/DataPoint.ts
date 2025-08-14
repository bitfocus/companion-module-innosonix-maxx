import { DeviceApi } from '../DeviceAPI.js'

export abstract class DataPoint {
	constructor(public deviceApi: DeviceApi) {}

	abstract getData(): { [key: string]: any }

	abstract onEnable(): void

	abstract onDisable(): void

	abstract update(): void
}
