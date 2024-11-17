import axios from 'axios'

export const createAxios = () => {
    return axios.create({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validateStatus: (status) => {
            return true
        }
    })
}