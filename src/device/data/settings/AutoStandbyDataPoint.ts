import { DataPoint } from '../DataPoint.js'
import { DeviceApi } from '../../DeviceAPI.js'
import { AmpType } from '../../../config.js'
import { TypeAutoStandby } from '../../../types/TypeAutoStandby.js'

export class AutoStandbyDataPoint extends DataPoint {
	private autoStandByArray: TypeAutoStandby[] = []

	constructor(public deviceApi: DeviceApi) {
		super(deviceApi)
	}

	getData(): { [key: string]: any } {
		return {
			autoStandby: this.autoStandByArray,
		}
	}

	onEnable(): void {
		this.deviceApi.self.log('debug', 'AutoStandbyDataPoint enabled')
		this.deviceApi.actions.autoStandbyCh = {
			callback: async (event) => {
				if (
					(event.options.timeout === undefined,
					event.options.channel === undefined || event.options.enable === undefined,
					event.options.threshold === undefined)
				) {
					this.deviceApi.self.log('error', 'Channel or enable not defined')
					return
				}
				const _ch = Number(event.options.channel)
				const _enable = Boolean(event.options.enable)
				const _threshold = Number(event.options.threshold)
				const _timeout = Number(event.options.mute)
				const as = new TypeAutoStandby({ enable: _enable, threshold: _threshold, timeout: _timeout })
				this.setChAutoStandby(_ch, as)
					.then(() => {
						this.autoStandByArray[_ch - 1] = as
						this.deviceApi.self.setVariableValues({ [`autostandby_ch_${_ch}`]: JSON.stringify(as) })
						this.deviceApi.self.log(
							'info',
							'Set Autostandby: ' + JSON.stringify(as) + ' on channel ' + event.options.channel,
						)
					})
					.catch((err) => {
						this.deviceApi.self.log('error', 'Error setting mute: ' + err.message)
					})
			},
			name: 'Set Channel Autostandby',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					required: true,
					min: 1,
					max: AmpType[this.deviceApi.self.config.ampType].ch,
				},
				{
					id: 'enable',
					type: 'checkbox',
					label: 'Enable Autostandby',
					default: false,
				},
				{
					id: 'threshold',
					type: 'number',
					label: 'Threshold (in dBFs)',
					default: -80,
					required: true,
					min: -80,
					max: 0,
					step: 1,
				},
				{
					id: 'timeout',
					type: 'number',
					label: 'Timeout (in seconds)',
					default: 60,
					required: true,
					min: 60,
					max: 86400,
					step: 1,
				},
			],
		}
		for (let i = 1; i <= AmpType[this.deviceApi.self.config.ampType].ch; i++) {
			this.deviceApi.variables.push({
				name: 'Autostandby Channel ' + i,
				variableId: 'power_ch_' + i,
			})
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	update(settings: any): void {
		this.autoStandByArray = settings.channel.map((channel: any) => {
			return new TypeAutoStandby(channel.autostandby)
		})
		this.deviceApi.self.log('debug', `AutoStandbyDataPoint updated: ${JSON.stringify(this.autoStandByArray)}`)
		this.deviceApi.self.checkFeedbacks('autostandby')
		this.autoStandByArray.forEach((autoStandby: TypeAutoStandby, index) => {
			this.deviceApi.self.setVariableValues({ [`autostandby_ch_${index + 1}`]: JSON.stringify(autoStandby) })
		})
	}

	onDisable(): void {}

	async getChAutoStandby(channel_id: number): Promise<TypeAutoStandby> {
		return new Promise<TypeAutoStandby>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel/' + channel_id + '/autostandby')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(new TypeAutoStandby(res.data))
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}

	async setChAutoStandby(channel_id: number, autoStandby: TypeAutoStandby): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.put('/settings/channel/' + channel_id + '/autostandby', autoStandby.toReqData())
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(true)
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}
}
