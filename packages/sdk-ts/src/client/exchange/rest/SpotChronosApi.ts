import { HttpException } from '@injectivelabs/exceptions'
import {
  ChronosSpotMarketSummaryResponse,
  AllSpotMarketSummaryResponse,
} from '../types/spot-rest'
import BaseRestConsumer from '../../BaseRestConsumer'

export class SpotChronosApi extends BaseRestConsumer {
  async fetchMarketSummary(marketId: string) {
    const endpoint = `chronos/v1/spot/market_summary`

    try {
      const { data } = (await this.client.get(endpoint, {
        marketId,
        resolution: '24h',
      })) as ChronosSpotMarketSummaryResponse

      return data
    } catch (e: any) {
      throw new HttpException(e.response ? e.response.data.message : e.message)
    }
  }

  async fetchMarketsSummary() {
    const endpoint = `chronos/v1/spot/market_summary_all`

    try {
      const { data } = (await this.client.get(endpoint, {
        resolution: '24h',
      })) as AllSpotMarketSummaryResponse

      return data
    } catch (e: any) {
      throw new HttpException(e.response ? e.response.data.message : e.message)
    }
  }
}
