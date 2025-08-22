import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { DeviceApi } from './device/DeviceAPI.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()

	deviceApi: DeviceApi | undefined

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		if (this.config.host === undefined) {
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.deviceApi = new DeviceApi(this)
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.deviceApi?.destroy()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}
}

runEntrypoint(ModuleInstance, [])
