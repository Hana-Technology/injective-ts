import { MsgBeginRedelegate as BaseMsgBeginRedelegate } from '@injectivelabs/chain-api/cosmos/staking/v1beta1/tx_pb'
import { Coin } from '@injectivelabs/chain-api/cosmos/base/v1beta1/coin_pb'
import { MsgBase } from '../../MsgBase'

export declare namespace MsgBeginRedelegate {
  export interface Params {
    amount: {
      denom: string
      amount: string
    }
    srcValidatorAddress: string
    dstValidatorAddress: string
    injectiveAddress: string
  }
  export interface DirectSign {
    type: '/cosmos.staking.v1beta1.MsgBeginRedelegate'
    message: BaseMsgBeginRedelegate
  }

  export interface Data extends BaseMsgBeginRedelegate.AsObject {
    '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate'
  }

  export interface Web3 extends BaseMsgBeginRedelegate.AsObject {
    '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate'
  }

  export type Proto = BaseMsgBeginRedelegate
}

export default class MsgBeginRedelegate extends MsgBase<
  MsgBeginRedelegate.Params,
  MsgBeginRedelegate.Data,
  MsgBeginRedelegate.Proto,
  MsgBeginRedelegate.Web3,
  MsgBeginRedelegate.DirectSign
> {
  static fromJSON(params: MsgBeginRedelegate.Params): MsgBeginRedelegate {
    return new MsgBeginRedelegate(params)
  }

  toProto(): MsgBeginRedelegate.Proto {
    const { params } = this

    const coinAmount = new Coin()
    coinAmount.setDenom(params.amount.denom)
    coinAmount.setAmount(params.amount.amount)

    const message = new BaseMsgBeginRedelegate()
    message.setAmount(coinAmount)
    message.setDelegatorAddress(params.injectiveAddress)
    message.setValidatorSrcAddress(params.srcValidatorAddress)
    message.setValidatorDstAddress(params.dstValidatorAddress)

    return message
  }

  toData(): MsgBeginRedelegate.Data {
    const proto = this.toProto()

    return {
      '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      ...proto.toObject(),
    }
  }

  toWeb3(): MsgBeginRedelegate.Web3 {
    const proto = this.toProto()

    return {
      '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      ...proto.toObject(),
    }
  }

  toDirectSign(): MsgBeginRedelegate.DirectSign {
    const proto = this.toProto()

    return {
      type: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      message: proto,
    }
  }
}
