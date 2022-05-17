import { UiValidator } from './../../../types/staking'
import { Pagination } from '@injectivelabs/sdk-ts/dist/types/pagination'
import {
  pageResponseToPagination,
  generatePagination,
} from '@injectivelabs/sdk-ts/dist/utils/pagination'
import { ChainMetrics } from '../../../types/metrics'
import { Base } from './Base'
import {
  Delegation,
  StakingGrpcTransformer,
} from '@injectivelabs/sdk-ts/dist/client/chain'
import { UiStakingTransformer } from '../../../transformers/UiStakingTransformer'

export class UiStakingApi extends Base {
  async fetchValidators(): Promise<UiValidator[]> {
    const promise = this.chainClient.staking.fetchValidators()
    const response = await this.fetchOrFetchAndMeasure(
      promise,
      ChainMetrics.FetchValidators,
    )
    const grpcValidators = response.getValidatorsList()

    return UiStakingTransformer.validatorsToUiValidators(grpcValidators)
  }

  async fetchValidator(validatorAddress: string): Promise<UiValidator> {
    const promise = this.chainClient.staking.fetchValidator(validatorAddress)
    const response = await this.fetchOrFetchAndMeasure(
      promise,
      ChainMetrics.FetchValidator,
    )
    const grpcValidator = response.getValidator()

    if (!grpcValidator) {
      throw new Error(`Validator ${validatorAddress} not found`)
    }

    const [uiValidator] = UiStakingTransformer.validatorsToUiValidators([
      grpcValidator,
    ])

    return uiValidator
  }

  async fetchValidatorDelegations({
    validatorAddress,
    pagination,
  }: {
    validatorAddress: string
    pagination: Pagination
  }): Promise<{
    pagination: Pagination
    validatorDelegations: Delegation[]
  }> {
    try {
      const promise = this.chainClient.staking.fetchDelegators({
        validatorAddress,
        ...generatePagination(pagination),
      })

      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ChainMetrics.FetchValidatorDelegations,
      )
      const grpcDelegators = response.getDelegationResponsesList()
      const grpcPagination = response.getPagination()

      return {
        pagination: pageResponseToPagination({
          oldPagination: pagination,
          newPagination: grpcPagination,
        }),
        validatorDelegations:
          StakingGrpcTransformer.grpcDelegationToDelegation(grpcDelegators),
      }
    } catch (e) {
      return {
        pagination: {
          next: null,
          prev: null,
          current: null,
        },
        validatorDelegations: [],
      }
    }
  }

  async fetchDelegations({ injectiveAddress }: { injectiveAddress: string }) {
    try {
      const promise = this.chainClient.staking.fetchDelegations({
        injectiveAddress,
      })
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ChainMetrics.FetchDelegations,
      )
      const grpcDelegations = response.getDelegationResponsesList()

      return StakingGrpcTransformer.grpcDelegationToDelegation(grpcDelegations)
    } catch (e) {
      return []
    }
  }

  async fetchUnbondingDelegations({
    injectiveAddress,
  }: {
    injectiveAddress: string
  }) {
    try {
      const promise = this.chainClient.staking.fetchUnbondingDelegations({
        injectiveAddress,
      })
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ChainMetrics.FetchUnbondingDelegations,
      )
      const grpcUnbondingDelegations = response.getUnbondingResponsesList()

      return StakingGrpcTransformer.grpcUnBondingDelegationsToUnBondingDelegations(
        grpcUnbondingDelegations,
      )
    } catch (e) {
      return []
    }
  }

  async fetchReDelegations({ injectiveAddress }: { injectiveAddress: string }) {
    try {
      const promise = this.chainClient.staking.fetchReDelegations({
        injectiveAddress,
      })
      const response = await this.fetchOrFetchAndMeasure(
        promise,
        ChainMetrics.FetchReDelegations,
      )
      const grpcReDelegations = response.getRedelegationResponsesList()

      return StakingGrpcTransformer.grpcReDelegationsToReDelegations(
        grpcReDelegations,
      )
    } catch (e) {
      return []
    }
  }
}
