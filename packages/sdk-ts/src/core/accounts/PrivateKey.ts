import { generateMnemonic } from 'bip39'
import { Wallet } from 'ethers'
import secp256k1 from 'secp256k1'
import keccak256 from 'keccak256'
import { DEFAULT_DERIVATION_PATH } from '../../utils/constants'
import { PublicKey } from './PublicKey'
import { Address } from './Address'
import * as BytesUtils from '@ethersproject/bytes'
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { recoverTypedSignaturePubKey } from '../../utils'
import {
  CosmosTxV1Beta1Tx,
  InjectiveTypesV1TxExt,
} from '@injectivelabs/core-proto-ts'
import { getTransactionPartsFromTxRaw } from '../modules/tx/utils/tx'
import { getEip712TypedData, MsgDecoder } from '../modules/tx/eip712'
import { GeneralException } from '@injectivelabs/exceptions'
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'

/**
 * Class for wrapping SigningKey that is used for signature creation and public key derivation.
 *
 * @category Crypto Utility Classes
 */
export class PrivateKey {
  private wallet: Wallet

  private constructor(wallet: Wallet) {
    this.wallet = wallet
  }

  /**
   * Generate new private key with random mnemonic phrase
   * @returns { privateKey: PrivateKey, mnemonic: string }
   */
  static generate(): { privateKey: PrivateKey; mnemonic: string } {
    const mnemonic = generateMnemonic()
    const privateKey = PrivateKey.fromMnemonic(mnemonic)

    return {
      privateKey,
      mnemonic,
    }
  }

  /**
   * Create a PrivateKey instance from a given mnemonic phrase and a HD derivation path.
   * If path is not given, default to Band's HD prefix 494 and all other indexes being zeroes.
   * @param {string} words the mnemonic phrase
   * @param {string|undefined} path the HD path that follows the BIP32 standard (optional)
   * @returns {PrivateKey} Initialized PrivateKey object
   */
  static fromMnemonic(
    words: string,
    path: string | undefined = DEFAULT_DERIVATION_PATH,
  ): PrivateKey {
    return new PrivateKey(Wallet.fromMnemonic(words, path))
  }

  /**
   * Create a PrivateKey instance from a given private key and a HD derivation path.
   * If path is not given, default to Band's HD prefix 494 and all other indexes being zeroes.
   * @param {string} privateKey  the private key
   * @returns {PrivateKey} Initialized PrivateKey object
   *
   * @deprecated - use fromHex instead
   */
  static fromPrivateKey(privateKey: string): PrivateKey {
    return new PrivateKey(new Wallet(privateKey))
  }

  /**
   * Create a PrivateKey instance from a given private key and a HD derivation path.
   * If path is not given, default to Band's HD prefix 494 and all other indexes being zeroes.
   * @param {string} privateKey  the private key
   * @returns {PrivateKey} Initialized PrivateKey object
   */
  static fromHex(privateKey: string | Uint8Array): PrivateKey {
    const isString = typeof privateKey === 'string'
    const privateKeyHex =
      isString && privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
    const privateKeyBuff = isString
      ? Buffer.from(privateKeyHex.toString(), 'hex')
      : privateKey

    return new PrivateKey(new Wallet(privateKeyBuff))
  }

  /**
   * Return the private key in hex
   * @returns {string}
   **/
  toPrivateKeyHex(): string {
    return this.wallet.privateKey.startsWith('0x')
      ? this.wallet.privateKey
      : `0x${this.wallet.privateKey}`
  }

  /**
   * Return the PublicKey associated with this private key.
   * @returns {PublicKey} a Public key that can be used to verify the signatures made with this PrivateKey
   **/
  toPublicKey(): PublicKey {
    return PublicKey.fromHex(this.wallet.privateKey)
  }

  /**
   * Return a hex representation of signing key.
   * @returns {string}
   */
  toHex(): string {
    return this.wallet.address.startsWith('0x')
      ? this.wallet.address
      : `0x${this.wallet.address}`
  }

  /**
   * Return the Address associated with this private key.
   * @returns {Address}
   **/
  toAddress(): Address {
    return Address.fromHex(this.toHex())
  }

  /**
   * Return the Bech32 address associated with this private key.
   * @returns {string}
   **/
  toBech32(): string {
    return Address.fromHex(this.toHex()).toBech32()
  }

  /**
   * Sign the given message using the wallet's _signingKey function.
   * @param {string} messageBytes: the message that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async sign(messageBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this

    const msgHash = keccak256(messageBytes)
    const signature = await wallet._signingKey().signDigest(msgHash)
    const splitSignature = BytesUtils.splitSignature(signature)

    return BytesUtils.arrayify(
      BytesUtils.concat([splitSignature.r, splitSignature.s]),
    )
  }

  /**
   * Sign the given message using the edcsa sign_deterministic function.
   * @param {Buffer} messageBytes: the message that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signEcda(messageBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this

    const msgHash = keccak256(messageBytes)
    const privateKeyHex = wallet.privateKey.startsWith('0x')
      ? wallet.privateKey.slice(2)
      : wallet.privateKey
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'))
    const { signature } = secp256k1.ecdsaSign(msgHash, privateKey)

    return signature
  }

  /**
   * Sign the given message using the wallet's _signingKey function.
   * @param {string} messageHashedBytes: the message that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signHashed(messageHashedBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this

    const signature = await wallet._signingKey().signDigest(messageHashedBytes)
    const splitSignature = BytesUtils.splitSignature(signature)

    return BytesUtils.arrayify(
      BytesUtils.concat([splitSignature.r, splitSignature.s]),
    )
  }

  /**
   * Sign the given message using the edcsa sign_deterministic function.
   * @param {Buffer} messageHashedBytes: the message that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signHashedEcda(messageHashedBytes: Buffer): Promise<Uint8Array> {
    const { wallet } = this

    const privateKeyHex = wallet.privateKey.startsWith('0x')
      ? wallet.privateKey.slice(2)
      : wallet.privateKey
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'))
    const { signature } = secp256k1.ecdsaSign(messageHashedBytes, privateKey)

    return signature
  }

  /**
   * Sign the given typed data using the edcsa sign_deterministic function.
   * @param {Buffer} eip712Data: the typed data that will be hashed and signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signTypedData(eip712Data: any): Promise<Uint8Array> {
    const { wallet } = this

    const privateKeyHex = wallet.privateKey.startsWith('0x')
      ? wallet.privateKey.slice(2)
      : wallet.privateKey
    const signature = signTypedData({
      privateKey: Buffer.from(privateKeyHex, 'hex'),
      data: eip712Data,
      version: SignTypedDataVersion.V4,
    })

    return Buffer.from(signature.replace('0x', ''), 'hex')
  }

  /**
   * Sign the given typed data using the edcsa sign_deterministic function.
   * @param {Buffer} eip712Data: the typed data that will be signed, a Buffer made of bytes
   * @returns {Uint8Array} a signature of this private key over the given message
   */
  async signHashedTypedData(eip712Data: Buffer): Promise<Uint8Array> {
    const { wallet } = this

    const privateKeyHex = wallet.privateKey.startsWith('0x')
      ? wallet.privateKey.slice(2)
      : wallet.privateKey
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'))
    const { signature } = secp256k1.ecdsaSign(eip712Data, privateKey)

    return signature
  }

  /**
   * Verify signature using EIP712 typed data
   * and the publicKey
   *
   * (params are passed as an object)
   *
   * @param {string} signature: the signature to verify in hex
   * @param {any} eip712: the EIP712 typed data to verify against
   * @param {string} publicKey: the public key to verify against in hex
   * */
  public static verifySignature({
    signature,
    eip712,
    publicKey,
  }: {
    signature: string /* in hex */
    eip712: any
    publicKey: string /* in hex */
  }): boolean {
    const publicKeyInHex = publicKey.startsWith('0x')
      ? publicKey
      : `0x${publicKey}`

    return publicKeyInHex === recoverTypedSignaturePubKey(eip712, signature)
  }

  /**
   * Verify cosmos signature EIP712 typed
   * data from the TxRaw and verify the signature
   * that's included in the TxRaw
   *
   * (params are passed as an object)
   *
   * @param {CosmosTxV1Beta1Tx.TxRaw} txRaw: the signature to verify in hex
   * @param {object} signer: the public key and the account number to verify against
   **/
  public static verifyCosmosSignature({
    txRaw,
    signer,
  }: {
    txRaw: CosmosTxV1Beta1Tx.TxRaw
    signer: {
      accountNumber: number | string
      publicKey: string /* in base64 */
    }
  }): boolean {
    const { body, authInfo, signatures } = getTransactionPartsFromTxRaw(txRaw)

    if (authInfo.signerInfos.length > 1 || signatures.length > 1) {
      throw new GeneralException(
        new Error('Validation of multiple signers is not supported'),
      )
    }

    if (body.messages.length > 1) {
      throw new GeneralException(
        new Error('Validation of multiple messages is not supported'),
      )
    }

    const getChainIds = () => {
      if (!body.extensionOptions.length) {
        return {
          ethereumChainId: EthereumChainId.Mainnet,
          chainId: ChainId.Mainnet,
        }
      }

      const extension = body.extensionOptions.find((extension) =>
        extension.typeUrl.includes('ExtensionOptionsWeb3Tx'),
      )

      if (!extension) {
        return {
          ethereumChainId: EthereumChainId.Mainnet,
          chainId: ChainId.Mainnet,
        }
      }

      const decodedExtension =
        InjectiveTypesV1TxExt.ExtensionOptionsWeb3Tx.decode(extension.value)

      const ethereumChainId = Number(
        decodedExtension.typedDataChainID,
      ) as EthereumChainId

      return {
        ethereumChainId: ethereumChainId,
        chainId: [
          EthereumChainId.Goerli,
          EthereumChainId.Kovan,
          EthereumChainId.Sepolia,
        ].includes(ethereumChainId)
          ? ChainId.Testnet
          : ChainId.Mainnet,
      }
    }

    const { ethereumChainId, chainId } = getChainIds()
    const [signerInfo] = authInfo.signerInfos
    const [signature] = signatures
    const [msg] = body.messages
    const decodedMsg = MsgDecoder.decode(msg)

    const eip712TypedData = getEip712TypedData({
      msgs: [decodedMsg],
      fee: authInfo.fee,
      tx: {
        memo: body.memo,
        accountNumber: signer.accountNumber.toString(),
        sequence: signerInfo.sequence.toString(),
        timeoutHeight: body.timeoutHeight.toString(),
        chainId,
      },
      ethereumChainId,
    })

    return this.verifySignature({
      eip712: eip712TypedData,
      signature: Buffer.from(signature).toString('hex'),
      publicKey: Buffer.from(signer.publicKey, 'base64').toString('hex'),
    })
  }
}
