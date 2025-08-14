import { DataPoint } from '../../DataPoint.js'
import { DeviceApi } from '../../../DeviceAPI.js'
import { AmpType } from '../../../../config.js'
import { combineRgb } from '@companion-module/base'

export class MuteDataPoint extends DataPoint {
	private muteArray: boolean[] = []

	constructor(public deviceApi: DeviceApi) {
		super(deviceApi)
	}

	getData(): { [key: string]: any } {
		return {
			muted: this.muteArray,
		}
	}

	onEnable(): void {
		this.deviceApi.self.log('debug', 'MuteDataPoint enabled')
		this.deviceApi.actions.muteCh = {
			callback: async (event) => {
				if (event.options.channel === undefined || event.options.mute === undefined) {
					this.deviceApi.self.log('error', 'Channel or mute not defined')
					return
				}
				const _ch = Number(event.options.channel)
				const _mute = Boolean(event.options.mute)
				this.setChMute(_ch, _mute)
					.then(() => {
						this.muteArray[_ch - 1] = _mute
						this.deviceApi.self.setVariableValues({ [`mute_ch_${_ch}`]: _mute })
						this.deviceApi.self.checkFeedbacks('mute')
						this.deviceApi.self.log('info', 'Set Mute: ' + event.options.mute + ' on channel ' + event.options.channel)
					})
					.catch((err) => {
						this.deviceApi.self.log('error', 'Error setting mute: ' + err.message)
					})
			},
			name: 'Channel Mute',
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
					id: 'mute',
					type: 'checkbox',
					label: 'Mute',
					default: false,
				},
			],
		}
		this.deviceApi.feedbacks.mute = {
			type: 'boolean',
			name: 'Channel Muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
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
				return this.muteArray[ch]
			},
		}
		for (let i = 1; i <= AmpType[this.deviceApi.self.config.ampType].ch; i++) {
			this.deviceApi.variables.push({
				name: 'Mute Channel ' + i,
				variableId: 'mute_ch_' + i,
			})
		}
	}

	update(): void {
		void this.chMuteArray().then((res: boolean[]) => {
			this.muteArray = res
			this.deviceApi.self.log('debug', 'MuteDataPoint updated: ' + this.muteArray.join(', '))
			this.deviceApi.self.checkFeedbacks('mute')
			this.muteArray.forEach((mute, index) => {
				this.deviceApi.self.setVariableValues({ [`mute_ch_${index + 1}`]: mute })
			})
		})
	}

	onDisable(): void {}

	async getChMute(channel_id: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel/' + channel_id + '/dsp/mute')
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

	async setChMute(channel_id: number, state: boolean): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.put('/settings/channel/' + channel_id + '/dsp/mute', { value: state })
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

	async chMuteArray(): Promise<boolean[]> {
		return new Promise<boolean[]>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					const chMute = res.data.map((channel: any) => {
						return channel.dsp.mute.value
					})
					resolve(chMute)
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}
}
