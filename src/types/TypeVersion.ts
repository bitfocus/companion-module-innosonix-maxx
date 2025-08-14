import { Type } from './Type.js'

export class TypeVersion implements Type {
	readonly data: any
	readonly version: string

	constructor(data: { version: string }) {
		this.data = data
		this.version = data.version.toString()
	}

	toReqData(): object {
		return { version: this.version }
	}
}
