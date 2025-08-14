import { Type } from './Type.js'

export class TypeAutoStandby implements Type {
	readonly data: any
	private enable: boolean
	private threshold: number
	private timeout: number

	constructor(data: { enable: boolean; threshold: number; timeout: number }) {
		this.data = data
		this.enable = data.enable
		this.threshold = data.threshold
		this.timeout = data.timeout
	}

	toReqData(): object {
		return { enable: this.enable, threshold: this.threshold, timeout: this.timeout }
	}

	get isEnabled(): boolean {
		return this.enable
	}

	get thresholdValue(): number {
		return this.threshold
	}

	get timeoutValue(): number {
		return this.timeout
	}

	set isEnabled(value: boolean) {
		this.enable = value
	}

	set thresholdValue(value: number) {
		this.threshold = value
	}

	set timeoutValue(value: number) {
		this.timeout = value
	}
}
