import { DataPoint } from '../../DataPoint.js'
import { DeviceApi } from '../../../DeviceAPI.js'
import { AmpType } from '../../../../config.js'

import { DType, TypeDelay } from '../../../../types/TypeDelay.js'

export class DelayDataPoint extends DataPoint {
	private delayArray: TypeDelay[] = []

	constructor(public deviceApi: DeviceApi) {
		super(deviceApi)
	}

	getData(): { [key: string]: any } {
		return {
			delay: this.delayArray,
		}
	}

	onEnable(): void {
		this.deviceApi.self.log('debug', 'DelayDataPoint enabled')
		this.deviceApi.actions.delayCh = {
			callback: async (event) => {
				if (event.options.channel === undefined) {
					this.deviceApi.self.log('error', 'Channel not defined')
					return
				}
				const _ch = Number(event.options.channel)

				this.getChDelay(_ch)
					.then((_delay: TypeDelay) => {
						_delay.msValue = Number(event.options.delay_ms)
						_delay.mValue = Number(event.options.delay_m)
						_delay.samplesValue = Number(event.options.delay_sample)
						this.setChDelay(_ch, _delay)
							.then(() => {
								this.delayArray[_ch - 1] = _delay

								this.deviceApi.self.setVariableValues({ [`delay_ch_value_ms_${_ch}`]: _delay.msValue })
								this.deviceApi.self.setVariableValues({ [`delay_ch_value_m_${_ch}`]: _delay.mValue })
								this.deviceApi.self.setVariableValues({ [`delay_ch_value_samples_${_ch}`]: _delay.samplesValue })
								this.deviceApi.self.log(
									'info',
									'Set Delay: ' + JSON.stringify(_delay.toReqDataDelay()) + ' on channel ' + event.options.channel,
								)
							})
							.catch((err: any) => {
								this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
							})
					})
					.catch((err: any) => {
						this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
					})
			},
			name: 'Set Channel Delay',
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
					id: 'delay_ms',
					type: 'number',
					label: 'Delay (ms)',
					default: 0,
					min: 0,
					max: 1000,
					step: 0.1,
				},
				{
					id: 'delay_m',
					type: 'number',
					label: 'Delay (Meters)',
					default: 0,
					min: 0,
					max: 330,
					step: 0.1,
				},
				{
					id: 'delay_sample',
					type: 'number',
					label: 'Delay (Samples)',
					default: 0,
					min: 0,
					max: 48000,
					step: 1,
				},
			],
		}

		this.deviceApi.actions.delayType = {
			callback: async (event) => {
				if (event.options.channel === undefined) {
					this.deviceApi.self.log('error', 'Channel not defined')
					return
				}
				const _ch = Number(event.options.channel)
				this.getChDelay(_ch)
					.then((_delay: TypeDelay) => {
						if (_delay === undefined) {
							this.deviceApi.self.log('error', 'Delay not found for channel ' + _ch)
							return
						}
						_delay.typeValue = DType[event.options.type as keyof typeof DType]
						this.setChDelay(_ch, _delay)
							.then(() => {
								this.delayArray[_ch - 1] = _delay
								let value: number = 0
								switch (_delay.typeValue) {
									case DType.ms:
										value = _delay.delayMsValue
										break
									case DType.m:
										value = _delay.delayMValue
										break
									case DType.samples:
										value = _delay.delaySamplesValue
										break
									default:
										value = _delay.delayMsValue
								}
								this.deviceApi.self.setVariableValues({ [`delay_ch_value_${_ch}`]: value })
								this.deviceApi.self.setVariableValues({ [`delay_ch_type_${_ch}`]: _delay.typeValue })
								this.deviceApi.self.log(
									'info',
									'Set Delay Type: ' + JSON.stringify(_delay.toReqDataType()) + ' on channel ' + event.options.channel,
								)
							})
							.catch((err: any) => {
								this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
							})
					})
					.catch((err: any) => {
						this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
					})
			},
			name: 'Set Channel Delay Readout Type',
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
					id: 'type',
					type: 'dropdown',
					label: 'Delay Type',
					default: DType.ms,
					choices: Object.keys(DType).map((key) => {
						return { id: key, label: key.toUpperCase() }
					}),
				},
			],
		}

		this.deviceApi.actions.delayTEMP = {
			callback: async (event) => {
				if (event.options.channel === undefined) {
					this.deviceApi.self.log('error', 'Channel not defined')
					return
				}
				const _ch = Number(event.options.channel)

				this.getChDelay(_ch)
					.then((_delay: TypeDelay) => {
						_delay.temperatureValue = Number(event.options.temperature)
						this.setChDelay(_ch, _delay)
							.then(() => {
								this.delayArray[_ch - 1] = _delay
								this.deviceApi.self.setVariableValues({ [`delay_ch_temp_${_ch}`]: _delay.temperatureValue })
								this.deviceApi.self.log(
									'info',
									'Set Delay Temperature: ' +
										JSON.stringify(_delay.toReqDataTemperature()) +
										' on channel ' +
										event.options.channel,
								)
							})
							.catch((err: any) => {
								this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
							})
					})
					.catch((err: any) => {
						this.deviceApi.self.log('error', 'Error setting delay: ' + err.message)
					})
			},
			name: 'Set Channel Delay Temperature',
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
					id: 'temperature',
					type: 'number',
					label: 'Temperature (°C)',
					default: 20,
					min: -100,
					max: 100,
					step: 0.1,
				},
			],
		}
		for (let i = 1; i <= AmpType[this.deviceApi.self.config.ampType].ch; i++) {
			this.deviceApi.variables.push({
				name: 'Delay Sum Channel ' + i,
				variableId: 'delay_ch_value_' + i,
			})
			this.deviceApi.variables.push({
				name: 'Delay Readout Type Channel ' + i,
				variableId: 'delay_ch_type_' + i,
			})
			this.deviceApi.variables.push({
				name: 'Delay in ms Channel ' + i,
				variableId: 'delay_ch_value_ms_' + i,
			})
			this.deviceApi.variables.push({
				name: 'Delay in m Channel ' + i,
				variableId: 'delay_ch_value_m_' + i,
			})
			this.deviceApi.variables.push({
				name: 'Delay in samples Channel ' + i,
				variableId: 'delay_ch_value_samples_' + i,
			})
			this.deviceApi.variables.push({
				name: 'Delay Temperature in °C Channel ' + i,
				variableId: 'delay_ch_temp_' + i,
			})
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	update(settings: any): void {
		this.delayArray = settings.channel.map((channel: any) => {
			return new TypeDelay(channel.dsp.delay)
		})
		this.deviceApi.self.log('debug', 'DelayDataPoint updated: ' + JSON.stringify(this.delayArray))
		this.delayArray.forEach((delay: TypeDelay, index: number) => {
			let value: number = 0
			switch (delay.typeValue) {
				case DType.ms:
					value = delay.delayMsValue
					break
				case DType.m:
					value = delay.delayMValue
					break
				case DType.samples:
					value = delay.delaySamplesValue
					break
				default:
					value = delay.delayMsValue
			}
			this.deviceApi.self.setVariableValues({ [`delay_ch_value_${index + 1}`]: value })
			this.deviceApi.self.setVariableValues({ [`delay_ch_type_${index + 1}`]: delay.typeValue })
			this.deviceApi.self.setVariableValues({ [`delay_ch_temp_${index + 1}`]: delay.temperatureValue })
			this.deviceApi.self.setVariableValues({ [`delay_ch_value_ms_${index + 1}`]: delay.msValue })
			this.deviceApi.self.setVariableValues({ [`delay_ch_value_m_${index + 1}`]: delay.mValue })
			this.deviceApi.self.setVariableValues({ [`delay_ch_value_samples_${index + 1}`]: delay.samplesValue })
		})
	}

	onDisable(): void {}

	async getChDelay(channel_id: number): Promise<TypeDelay> {
		return new Promise<TypeDelay>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.get('/settings/channel/' + channel_id + '/dsp/delay')
				.then((res) => {
					if (res === undefined) {
						reject(new Error('Connection error: no response'))
						return
					}
					if (res.status != 200) {
						reject(new Error('Connection error: ' + res.statusText))
						return
					}
					resolve(new TypeDelay(res.data))
				})
				.catch((err) => {
					reject(new Error(err.message))
					this.deviceApi.self.log('debug', 'Connection error: ' + err.message)
				})
		})
	}

	async setChDelay(channel_id: number, state: TypeDelay): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.deviceApi.remoteDevice
				.put('/settings/channel/' + channel_id + '/dsp/delay', state.toReqData())
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
					this.deviceApi.self.log('debug', 'Connection error: ' + err)
				})
		})
	}
}
