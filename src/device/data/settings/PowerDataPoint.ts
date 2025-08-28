import { DataPoint } from '../DataPoint.js'
import { DeviceApi } from '../../DeviceAPI.js'
import { AmpType } from '../../../config.js'
import { combineRgb } from '@companion-module/base'

export class PowerDataPoint extends DataPoint {
	private powerArray: boolean[] = []

	constructor(public deviceApi: DeviceApi) {
		super(deviceApi)
	}

	getData(): { [key: string]: any } {
		return {
			power: this.powerArray,
		}
	}

	onEnable(): void {
		this.deviceApi.self.log('debug', 'PowerDataPoint enabled')
		this.deviceApi.actions.powerCh = {
			callback: async (event) => {
				if (event.options.channel === undefined || event.options.power === undefined) {
					this.deviceApi.self.log('error', 'Channel or power not defined')
					return
				}
				const _ch = Number(event.options.channel)
				const _power = Boolean(event.options.power)
				this.setChPower(_ch, _power)
					.then(() => {
						this.powerArray[_ch - 1] = _power
						this.deviceApi.self.setVariableValues({ [`power_ch_${_ch}`]: _power })
						this.deviceApi.self.checkFeedbacks('power')
						this.deviceApi.self.log(
							'info',
							'Set Power: ' + event.options.power + ' on channel ' + event.options.channel,
						)
					})
					.catch((err) => {
						this.deviceApi.self.log('error', 'Error setting power: ' + err.message)
					})
			},
			name: 'Set Channel Power',
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
					id: 'power',
					type: 'checkbox',
					label: 'Power',
					default: false,
				},
			],
		}
		this.deviceApi.feedbacks.power = {
			type: 'boolean',
			name: 'Channel Power State',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(255, 255, 255),
			},
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
			],
			callback: (feedback) => {
				const ch = Number(feedback.options.channel) - 1
				return this.powerArray[ch]
			},
		}
		for (let i = 1; i <= AmpType[this.deviceApi.self.config.ampType].ch; i++) {
			this.deviceApi.variables.push({
				name: 'Power Channel ' + i,
				variableId: 'power_ch_' + i,
			})
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	update(settings: any): void {
		this.powerArray = settings.channel.map((channel: any) => {
			return channel.ampenable.value
		})
		this.deviceApi.self.log('debug', 'PowerDataPoint updated: ' + this.powerArray.join(', '))
		this.deviceApi.self.checkFeedbacks('power')
		this.powerArray.forEach((power, index) => {
			this.deviceApi.self.setVariableValues({ [`power_ch_${index + 1}`]: power })
		})
	}

	onDisable(): void {}

	async getChPower(channel_id: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel/' + channel_id + '/ampenable')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(res.data.value)
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}

	async setChPower(channel_id: number, state: boolean): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.put('/settings/channel/' + channel_id + '/ampenable', { value: state })
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(state)
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}
}
