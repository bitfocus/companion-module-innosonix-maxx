import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	token: string
	meteringOn: boolean
	meteringInterval: number
	ampType: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'ampType',
			label: 'Amplifier Type',
			default: 'UMA04_POE',
			width: 4,
			choices: Object.values(AmpType),
		},
		{
			type: 'textinput',
			id: 'host',
			required: true,
			label: 'Target IP',
			width: 4,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'meteringInterval',
			label: 'Metering Interval (in ms)',
			tooltip: 'If this value is too low (fast)\nthe GUI may lock up.',
			width: 4,
			min: 50,
			max: 99999,
			default: 5000,
			required: true,
		},
		{
			type: 'textinput',
			id: 'token',
			required: true,
			label: 'Authentication Token',
			width: 12,
			default: 'f4005bf8507999192162d989d5a60823',
		},
	]
}

export const AmpType: { [key: string]: { id: string; label: string; ch: number } } = {
	UMA04_POE: {
		id: 'UMA04_POE',
		label: 'UMA04/POE',
		ch: 4,
	},
}
