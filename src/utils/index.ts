import { BigNumber } from 'ethers'

interface LogProps {
    label: string
    message: string
}

export const log = ({ label, message }: LogProps) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${label}]: ${message}`)
    }
}

export const formatBigNum = (value: BigNumber) => {
    const strNum = value.toString()
    const length = strNum.length
    const numZeros = 18 - length

    const zeros: string[] = []

    for (let i = 0; i < numZeros; i++) {
        zeros.push('0')
    }

    let finalString: string

    if (zeros.length <= 0) {
        finalString = '0.' + strNum
    } else {
        const zeroString = zeros.join('')
        finalString = '0.' + zeroString + strNum
    }

    return finalString
}
