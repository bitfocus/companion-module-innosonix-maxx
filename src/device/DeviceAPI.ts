import { RemoteDevice } from './RemoteDevice.js'
import { ModuleInstance } from '../main.js'
import { TypeInfo } from '../types/TypeInfo.js'
import { TypeVersion } from '../types/TypeVersion.js'
import { DataPoint } from './data/DataPoint.js'
import { MuteDataPoint } from './data/settings/dsp/MuteDataPoint.js'
import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionFeedbackDefinitions, CompanionVariableDefinition } from '@companion-module/base'
import { PowerDataPoint } from './data/settings/PowerDataPoint.js'
import { AutoStandbyDataPoint } from './data/settings/AutoStandbyDataPoint.js'
import { VolumeDataPoint } from './data/settings/dsp/VolumeDataPoint.js'

export class DeviceApi {
	public self: ModuleInstance
	private _remoteDevice: RemoteDevice

	private dataTimeout: NodeJS.Timeout | undefined

	private dataPoints: DataPoint[] = []

	public actions: CompanionActionDefinitions = {}
	public variables: CompanionVariableDefinition[] = []
	public feedbacks: CompanionFeedbackDefinitions = {}

	constructor(self: ModuleInstance) {
		this.self = self
		this._remoteDevice = new RemoteDevice(self, self.config.host, self.config.token)
		this._remoteDevice.init()

		this.dataPoints.push(new MuteDataPoint(this))
		this.dataPoints.push(new PowerDataPoint(this))
		this.dataPoints.push(new AutoStandbyDataPoint(this))
		this.dataPoints.push(new VolumeDataPoint(this))

		this.dataPoints.forEach((dataPoint) => {
			dataPoint.onEnable()
		})

		this.self.setActionDefinitions(this.actions)
		this.self.setVariableDefinitions(this.variables)
		this.self.setFeedbackDefinitions(this.feedbacks)

		this.dataTimeout = setInterval(() => {
			if (!this._remoteDevice.isConnected) {
				this.self.log('debug', 'DeviceApi data timeout skipped, device not connected')
				return
			}
			this.self.log('debug', 'DeviceApi data timeout started')
			this.dataPoints.forEach((dataPoint) => {
				dataPoint.update()
			})
			this.self.log('debug', 'DeviceApi data timeout finished')
		}, this.self.config.meteringInterval || 5000)
	}

	destroy(): void {
		this.dataPoints.forEach((dataPoint) => {
			dataPoint.onDisable()
		})
		if (this._remoteDevice.isConnected) {
			this._remoteDevice.destroy()
			if (this.dataTimeout) {
				clearTimeout(this.dataTimeout)
			}
			this.self.log('debug', 'DeviceApi destroyed')
		}
	}

	get remoteDevice(): RemoteDevice {
		return this._remoteDevice
	}

	get version(): Promise<TypeVersion> {
		return new Promise<TypeVersion>((resolve, reject) => {
			this._remoteDevice
				.get('/version')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(new TypeVersion(res.data))
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}

	get deviceInfo(): Promise<TypeInfo> {
		return new Promise<TypeInfo>((resolve, reject) => {
			this._remoteDevice
				.get('/info/device')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(new TypeInfo(res.data))
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}
}
