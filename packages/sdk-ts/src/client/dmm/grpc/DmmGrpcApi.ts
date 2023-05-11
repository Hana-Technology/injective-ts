import { InjectiveDmmRpc } from '@injectivelabs/dmm-proto-ts'
import { getGrpcDmmWebImpl } from '../../BaseGrpcDmmWebConsumer'
import { DmmGrpcTransformer } from './transformers'
import {
  UnspecifiedErrorCode,
  GrpcUnaryRequestException,
  DmmErrorModule,
} from '@injectivelabs/exceptions'

export class DmmGrpcApi {
  protected module: string = DmmErrorModule.Dmm
  protected client: InjectiveDmmRpc.InjectiveDmmV2RPCClientImpl
  constructor(endpoint: string) {
    this.client = new InjectiveDmmRpc.InjectiveDmmV2RPCClientImpl(
      getGrpcDmmWebImpl(endpoint),
    )
  }

  async fetchEpochs(status?: string) {
    const request = InjectiveDmmRpc.GetEpochsRequest.create()

    if (status) {
      request.status = status
    }

    try {
      const response = await this.client.GetEpochs(request)

      return DmmGrpcTransformer.epochsResponseToEpochs(response)
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchMarketRewards(epochId: string) {
    const request = InjectiveDmmRpc.GetMarketRewardsRequest.create()

    request.epochId = epochId.toString()

    try {
      const response = await this.client.GetMarketRewards(request)

      return DmmGrpcTransformer.marketRewardsResponseToMarketRewards(response)
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchEligibleAddresses({
    epochId,
    page,
  }: {
    epochId: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetEligibleAddressesRequest.create()
    InjectiveDmmRpc.GetRewardsDistributionRequest
    request.epochId = epochId

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetEligibleAddresses(request)

      return DmmGrpcTransformer.eligibleAddressesResponseToEligibleAddresses(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchEpochScores({
    epochId,
    page,
  }: {
    epochId: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetEpochScoresRequest.create()

    request.epochId = epochId

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetEpochScores(request)

      return DmmGrpcTransformer.epochScoresResponseToEpochScores(response)
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchEpochScoresHistory({
    epochId,
    accountAddress,
    page,
  }: {
    epochId: string
    accountAddress: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetEpochScoresHistoryRequest.create()

    request.epochId = epochId
    request.accountAddress = accountAddress

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetEpochScoresHistory(request)

      return DmmGrpcTransformer.epochScoresHistoryResponseToEpochScoresHistory(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchTotalScores({
    epochId,
    marketId,
    page,
  }: {
    epochId: string
    marketId: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetTotalScoresRequest.create()

    request.epochId = epochId
    request.marketId = marketId

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetTotalScores(request)

      return DmmGrpcTransformer.totalScoresResponseToTotalScores(response)
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchTotalScoresHistory({
    epochId,
    marketId,
    accountAddress,
    page,
  }: {
    epochId: string
    marketId: string
    accountAddress: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetTotalScoresHistoryRequest.create()

    request.epochId = epochId
    request.marketId = marketId
    request.accountAddress = accountAddress

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetTotalScoresHistory(request)

      return DmmGrpcTransformer.totalScoresHistoryResponseToTotalScoresHistory(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchLiquiditySnapshots({
    epochId,
    marketId,
    accountAddress,
    page,
  }: {
    epochId: string
    marketId: string
    accountAddress: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetLiquiditySnapshotsRequest.create()

    request.epochId = epochId
    request.marketId = marketId
    request.accountAddress = accountAddress

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetLiquiditySnapshots(request)

      return DmmGrpcTransformer.liquiditySnapshotsResponseToLiquiditySnapshots(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchRewardsDistribution({
    epochId,
    height,
    page,
  }: {
    epochId: string
    height?: string
    page?: InjectiveDmmRpc.Pagination
  }) {
    const request = InjectiveDmmRpc.GetRewardsDistributionRequest.create()

    request.epochId = epochId

    if (height) {
      request.height = height
    }

    if (page) {
      request.page = page
    }

    try {
      const response = await this.client.GetRewardsDistribution(request)

      return DmmGrpcTransformer.rewardsDistributionResponseToRewardsDistribution(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchAccountVolumes({
    epochId,
    accountAddress,
  }: {
    epochId: string
    accountAddress: string
  }) {
    const request = InjectiveDmmRpc.GetAccountVolumesRequest.create()

    request.epochId = epochId
    request.accountAddress = accountAddress

    try {
      const response = await this.client.GetAccountVolumes(request)

      return DmmGrpcTransformer.accountVolumesResponseToAccountVolumes(response)
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }

  async fetchRewardsEligibility({
    epochId,
    accountAddress,
  }: {
    epochId?: string
    accountAddress?: string
  }) {
    const request = InjectiveDmmRpc.GetRewardsEligibilityRequest.create()

    if (epochId) {
      request.epochId = epochId
    }

    if (accountAddress) {
      request.accountAddress = accountAddress
    }

    try {
      const response = await this.client.GetRewardsEligibility(request)

      return DmmGrpcTransformer.rewardsEligibilityResponseToRewardsEligibility(
        response,
      )
    } catch (e: unknown) {
      if (e instanceof InjectiveDmmRpc.GrpcWebError) {
        throw new GrpcUnaryRequestException(new Error(e.toString()), {
          code: e.code,
          contextModule: this.module,
        })
      }

      throw new GrpcUnaryRequestException(e as Error, {
        code: UnspecifiedErrorCode,
        contextModule: this.module,
      })
    }
  }
}
