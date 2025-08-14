import { Type } from './Type.js'

export class TypeInfo implements Type {
	readonly data: any
	private _modelName: string
	private _channel: number
	private _options: string[]
	private _psuFan: boolean
	private _housingFan: boolean
	private _sdCard: boolean
	private _rtc: boolean
	private _mainsMeasure: boolean
	private _swRevision: string
	private _fpgaRevision: string
	private _loaderRevision: string
	private _imageId: number
	private _serial: string

	constructor(data: {
		model_name: string
		channel: number
		options: string[]
		psu_fan: boolean
		housing_fan: boolean
		sd_card: boolean
		rtc: boolean
		mains_measure: boolean
		sw_revision: string
		fpga_revision: string
		loader_revision: string
		image_id: number
		serial: string
	}) {
		this.data = data
		this._modelName = data.model_name
		this._channel = data.channel
		this._options = data.options
		this._psuFan = data.psu_fan
		this._housingFan = data.housing_fan
		this._sdCard = data.sd_card
		this._rtc = data.rtc
		this._mainsMeasure = data.mains_measure
		this._swRevision = data.sw_revision
		this._fpgaRevision = data.fpga_revision
		this._loaderRevision = data.loader_revision
		this._imageId = data.image_id
		this._serial = data.serial
	}

	toReqData(): object {
		return {
			model_name: this._modelName,
			channel: this._channel,
			options: this._options,
			psu_fan: this._psuFan,
			housing_fan: this._housingFan,
			sd_card: this._sdCard,
			rtc: this._rtc,
			mains_measure: this._mainsMeasure,
			sw_revision: this._swRevision,
			fpga_revision: this._fpgaRevision,
			loader_revision: this._loaderRevision,
			image_id: this._imageId,
			serial: this._serial,
		}
	}

	get modelName(): string {
		return this._modelName
	}

	get channel(): number {
		return this._channel
	}

	get options(): string[] {
		return this._options
	}

	get psuFan(): boolean {
		return this._psuFan
	}

	get housingFan(): boolean {
		return this._housingFan
	}

	get sdCard(): boolean {
		return this._sdCard
	}

	get rtc(): boolean {
		return this._rtc
	}

	get mainsMeasure(): boolean {
		return this._mainsMeasure
	}

	get swRevision(): string {
		return this._swRevision
	}
	get fpgaRevision(): string {
		return this._fpgaRevision
	}

	get loaderRevision(): string {
		return this._loaderRevision
	}

	get imageId(): number {
		return this._imageId
	}

	get serial(): string {
		return this._serial
	}
}
