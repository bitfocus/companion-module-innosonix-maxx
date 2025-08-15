import axios, { AxiosHeaders, AxiosResponse } from 'axios'
import { ModuleInstance } from '../main.js'
import { InstanceStatus } from '@companion-module/base'

export class RemoteDevice {
	readonly postfix: string = '/rest-api'

	private _url: string
	private _token: string

	private _headers: AxiosHeaders

	private interval: NodeJS.Timeout | undefined

	private timeout: number

	private connected: boolean = false
	private self: ModuleInstance

	constructor(self: ModuleInstance, host: string, token: string, timeout: number = 500) {
		this.self = self
		this.timeout = timeout
		this._url = `http://${host}${this.postfix}`
		this._token = token
		this._headers = new AxiosHeaders({
			token: this._token,
		})
	}

	init(): void {
		this.self.updateStatus(InstanceStatus.Connecting)
		this.interval = setInterval(() => {
			this.self.log('debug', 'PING')
			axios
				.get(this._url + '/status/system', { headers: this._headers })
				.then((res) => {
					if (res.status !== 200) {
						this.self.log('error', 'Connection error: ' + res.statusText)
						this.self.updateStatus(InstanceStatus.ConnectionFailure)
						this.connected = false
						return
					}
					if (res.data.ready !== true) {
						this.self.log('error', 'Device not ready: ' + res.data.ready)
						this.self.updateStatus(InstanceStatus.ConnectionFailure)
						this.connected = false
						return
					}
					this.self.log('debug', 'PONG')
					this.self.updateStatus(InstanceStatus.Ok)
					this.connected = true
				})
				.catch((err) => {
					this.self.updateStatus(InstanceStatus.ConnectionFailure)
					this.self.log('debug', JSON.stringify(err))
					this.self.log('error', 'Connection error1: ' + err.message)
					this.connected = false
				})
		}, this.timeout)
	}

	destroy(): void {
		clearInterval(this.interval)
		this.connected = false
		return
	}

	get isConnected(): boolean {
		return this.connected
	}

	get url(): string {
		return this._url
	}

	set url(url: string) {
		this._url = url
		this.destroy()
		this.init()
	}

	set token(token: string) {
		this._token = token
		this._headers = new AxiosHeaders({
			token: this._token,
		})
		this.destroy()
		this.init()
	}

	get headers(): AxiosHeaders {
		return this._headers
	}

	async get(path: string): Promise<AxiosResponse<any, any> | undefined> {
		if (!this.isConnected) {
			this.self.log('warn', 'Not connected')
			return undefined
		}
		return axios.get(this._url + path, { headers: this._headers })
	}

	async post(path: string, data: object): Promise<AxiosResponse<any, any> | undefined> {
		if (!this.isConnected) {
			this.self.log('warn', 'Not connected')
			return undefined
		}
		return axios.post(this._url + path, data, { headers: this._headers })
	}

	async put(path: string, data: object): Promise<AxiosResponse<any, any> | undefined> {
		if (!this.isConnected) {
			this.self.log('warn', 'Not connected')
			return undefined
		}
		return axios.put(this._url + path, data, { headers: this._headers })
	}

	async delete(path: string): Promise<AxiosResponse<any, any> | undefined> {
		if (!this.isConnected) {
			this.self.log('warn', 'Not connected')
			return undefined
		}
		return axios.delete(this._url + path, { headers: this._headers })
	}

	async options(path: string): Promise<AxiosResponse<any, any> | undefined> {
		if (!this.isConnected) {
			this.self.log('warn', 'Not connected')
			return undefined
		}
		return axios.options(this._url + path, { headers: this._headers })
	}
}
