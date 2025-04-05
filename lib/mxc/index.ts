import { Mxc } from '@/sdk/mxlite'

const endpoint = process.env.MXC_ENDPOINT || 'http://localhost:8080/api'
const token = process.env.MXC_APIKEY

export const mxc = new Mxc(endpoint, token)
