import { Type } from './Type.js'

export class TypeDelay implements Type {
	readonly data: any
	private type: DType
	private delaySamples: number
	private delayMs: number
	private delayM: number
	private samples: number
	private ms: number
	private m: number
	private temperature: number

	constructor(data: {
		type?: string
		delay_samples?: number
		delay_ms?: number
		delay_m?: number
		samples?: number
		ms?: number
		m?: number
		temperature?: number
	}) {
		this.data = data
		this.type = typeof data.type === 'string' ? DType[data.type as keyof typeof DType] : DType.ms
		this.delaySamples = data.delay_samples ? data.delay_samples : 0
		this.delayMs = data.delay_ms ? data.delay_ms : 0
		this.delayM = data.delay_m ? data.delay_m : 0
		this.samples = data.samples ? data.samples : this.delaySamples
		this.ms = data.ms ? data.ms : this.delayMs
		this.m = data.m ? data.m : this.delayM
		this.temperature = data.temperature ? data.temperature : 21
	}
	toReqData(): object {
		return { type: this.type, samples: this.samples, ms: this.ms, m: this.m, temperature: this.temperature }
	}

	toReqDataType(): object {
		return {
			type: this.type,
		}
	}

	toReqDataDelay(): object {
		return {
			samples: this.samples,
			ms: this.ms,
			m: this.m,
		}
	}

	toReqDataTemperature(): object {
		return {
			temperature: this.temperature,
		}
	}

	get typeValue(): DType {
		return this.type
	}

	get delaySamplesValue(): number {
		return this.delaySamples
	}

	get delayMsValue(): number {
		return this.delayMs
	}

	get delayMValue(): number {
		return this.delayM
	}

	get samplesValue(): number {
		return this.samples
	}

	get msValue(): number {
		return this.ms
	}

	get mValue(): number {
		return this.m
	}

	get temperatureValue(): number {
		return this.temperature
	}

	set typeValue(value: DType) {
		this.type = value
	}

	set samplesValue(value: number) {
		this.samples = value
	}

	set msValue(value: number) {
		this.ms = value
	}

	set mValue(value: number) {
		this.m = value
	}

	set temperatureValue(value: number) {
		this.temperature = value
	}
}

export enum DType {
	m = 'm',
	ms = 'ms',
	samples = 'samples',
}
