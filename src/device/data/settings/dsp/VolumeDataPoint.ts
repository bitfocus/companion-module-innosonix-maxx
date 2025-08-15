import { DataPoint } from '../../DataPoint.js'
import { DeviceApi } from '../../../DeviceAPI.js'
import { AmpType } from '../../../../config.js'
export class VolumeDataPoint extends DataPoint {
	private volumeArray: number[] = []

	constructor(public deviceApi: DeviceApi) {
		super(deviceApi)
	}

	getData(): { [key: string]: any } {
		return {
			volume: this.volumeArray,
		}
	}

	onEnable(): void {
		this.deviceApi.self.log('debug', 'VolumeDataPoint enabled')
		this.deviceApi.actions.volumeCh = {
			callback: async (event) => {
				if (event.options.channel === undefined || event.options.volume === undefined) {
					this.deviceApi.self.log('error', 'Channel or volume not defined')
					return
				}
				const _ch = Number(event.options.channel)
				const _volume = Number(event.options.volume)
				this.setChVolume(_ch, _volume)
					.then(() => {
						this.volumeArray[_ch - 1] = _volume
						this.deviceApi.self.setVariableValues({ [`volume_ch_${_ch}`]: _volume })
						this.deviceApi.self.checkFeedbacks('volume')
						this.deviceApi.self.log(
							'info',
							'Set Volume: ' + event.options.volume + ' on channel ' + event.options.channel,
						)
					})
					.catch((err) => {
						this.deviceApi.self.log('error', 'Error setting mute: ' + err.message)
					})
			},
			name: 'Set Channel Volume',
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
					id: 'volume',
					type: 'number',
					label: 'Volume',
					default: 0,
					min: -100,
					max: 24,
				},
			],
		}
		for (let i = 1; i <= AmpType[this.deviceApi.self.config.ampType].ch; i++) {
			this.deviceApi.variables.push({
				name: 'Volume Channel ' + i,
				variableId: 'volume_ch_' + i,
			})
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	update(settings: any): void {
		this.volumeArray = settings.channel.map((channel: any) => {
			return channel.dsp.volume.value
		})
		this.deviceApi.self.log('debug', 'VolumeDataPoint updated: ' + this.volumeArray.join(', '))
		this.deviceApi.self.checkFeedbacks('volume')
		this.volumeArray.forEach((volume, index) => {
			this.deviceApi.self.setVariableValues({ [`volume_ch_${index + 1}`]: volume })
		})
	}

	onDisable(): void {}

	async getChVolume(channel_id: number): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel/' + channel_id + '/dsp/volume')
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

	async setChVolume(channel_id: number, volume: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.put('/settings/channel/' + channel_id + '/dsp/volume', { value: volume })
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

	async chVolumeArray(): Promise<number[]> {
		return new Promise<number[]>((resolve, reject) => {
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
					const chVolume = res.data.map((channel: any) => {
						return channel.dsp.volume.value
					})
					resolve(chVolume)
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}
}
