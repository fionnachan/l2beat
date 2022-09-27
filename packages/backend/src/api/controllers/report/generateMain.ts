import { ApiMain, Chart, ChartPoint, Charts, ProjectId } from '@l2beat/types'

import { AggregateReportRecord } from '../../../peripherals/database/AggregateReportRepository'
import { ReportRecord } from '../../../peripherals/database/ReportRepository'
import { asNumber } from './asNumber'
import { getChartPoints } from './charts'

export function generateMain(
  hourly: AggregateReportRecord[],
  sixHourly: AggregateReportRecord[],
  daily: AggregateReportRecord[],
  latestReports: ReportRecord[],
  projectIds: ProjectId[],
): ApiMain {
  const reports = { hourly, sixHourly, daily }
  return {
    layers2s: getProjectCharts(reports, ProjectId.LAYER2S),
    bridges: getProjectCharts(reports, ProjectId.BRIDGES),
    combined: getProjectCharts(reports, ProjectId.ALL),
    projects: projectIds.reduce<ApiMain['projects']>((acc, projectId) => {
      acc[projectId.toString()] = {
        charts: getProjectCharts(reports, projectId),
        tokens: latestReports
          .filter((r) => r.projectId === projectId)
          .map((r) => ({ assetId: r.asset, tvl: asNumber(r.balanceUsd, 2) })),
      }
      return acc
    }, {}),
  }
}

function getProjectCharts(
  reports: {
    hourly: AggregateReportRecord[]
    sixHourly: AggregateReportRecord[]
    daily: AggregateReportRecord[]
  },
  projectId: ProjectId,
): Charts {
  const types: Chart['types'] = ['timestamp', 'usd', 'eth']
  return {
    hourly: {
      types,
      data: getProjectChartData(reports.hourly, projectId, 1),
    },
    sixHourly: {
      types,
      data: getProjectChartData(reports.sixHourly, projectId, 6),
    },
    daily: {
      types: types,
      data: getProjectChartData(reports.daily, projectId, 24),
    },
  }
}

function getProjectChartData(
  reports: AggregateReportRecord[],
  projectId: ProjectId,
  hours: number,
): ChartPoint[] {
  const balances = reports
    .filter((r) => r.projectId === projectId)
    .map((r) => ({
      timestamp: r.timestamp,
      usd: r.tvlUsd,
      asset: r.tvlEth,
    }))
  return getChartPoints(balances, hours, 6, true)
}