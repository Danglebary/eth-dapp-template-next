import { createContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers'
import { formatBigNum, log } from '../utils'

interface iDappContext {
    connected: boolean
    network: string
    address: string
    balance: string
    connectAccount: null | (() => void)
    disconnectAccount: null | (() => void)
    error: string
}

interface iProviderProps {
    children?: React.ReactNode
}

const defaultState: iDappContext = {
    connected: false,
    network: '',
    address: '',
    balance: 'NaN',
    connectAccount: null,
    disconnectAccount: null,
    error: ''
}

export const DappContext = createContext(defaultState)

export const DappProvider: React.FC<iProviderProps> = ({ children }) => {
    // STATE
    // Wallet api state
    const [provider, setProvider] = useState<null | Web3Provider>()
    const [signer, setSigner] = useState<null | JsonRpcSigner>()

    // Wallet data state
    const [network, setNetwork] = useState(defaultState.network)
    const [address, setAddress] = useState(defaultState.address)
    const [balance, setBalance] = useState(defaultState.balance)

    // Misc. state (used for ui)
    const [connected, setConnected] = useState(defaultState.connected)
    const [error, setError] = useState(defaultState.error)

    // FUNCTIONS
    // Local storage functions
    const setStorageProvider = (name: string) => {
        window.localStorage.setItem('current-provider', name)
    }
    const setStorageNetwork = (name: string) => {
        window.localStorage.setItem('current-network', name)
    }
    const clearLocalStorage = () => {
        window.localStorage.removeItem('current-provider')
        window.localStorage.removeItem('current-network')
    }

    // Wallet auth functions
    const connectWallet = async () => {
        if (!window.ethereum) {
            log({
                label: 'connectWallet',
                message: 'No compatible wallet installed'
            })
            return
        }
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(provider)
            setStorageProvider('browser')
            setSigner(provider.getSigner())
            setConnected(true)
        } catch (err: any) {
            log({ label: 'connectWallet', message: `Error: ${err}` })
            setError(`[connectWallet]: Error: ${err}`)
        }
    }
    const disconnectWallet = () => {
        clearLocalStorage()
        window.location.reload()
    }

    // Wallet data functions
    const getNetwork = async () => {
        if (!provider || !signer) return

        const network = await provider.getNetwork().then((data: Network) => {
            return data.name
        })

        if (network === 'homestead') {
            setNetwork('mainnet')
            setStorageNetwork('mainnet')
        } else {
            setNetwork(network)
            setStorageNetwork(network)
        }
    }
    const getAddress = async () => {
        if (!provider || !signer) return

        const address = await signer.getAddress()
        setAddress(address)
    }
    const getBalance = async () => {
        if (!provider || !signer) return

        const balance = await signer.getBalance()
        setBalance(formatBigNum(balance))
    }
    const getWalletData = () => {
        getNetwork()
        getAddress()
        getBalance()
    }

    // Util functions
    const accountIsConnected = () => {
        if (window.ethereum) {
            if (localStorage.getItem('current-provider')) {
                return true
            } else return false
        } else {
            if (localStorage.getItem('current-provider')) {
                localStorage.removeItem('current-provider')
            }
            return false
        }
    }

    // Side-effect functions
    useEffect(() => {
        if (accountIsConnected()) {
            connectWallet()
        }
    }, [])
    useEffect(() => {
        if (provider) {
            getWalletData()
        }
    }, [provider])

    // Public functions (used for ui)
    const connectAccount = async () => {
        connectWallet()
    }
    const disconnectAccount = async () => {
        disconnectWallet()
    }

    return (
        <DappContext.Provider
            value={{
                connected,
                network,
                address,
                balance,
                connectAccount,
                disconnectAccount,
                error
            }}
        >
            {children}
        </DappContext.Provider>
    )
}
