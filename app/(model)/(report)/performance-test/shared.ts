import { BenchmarkMode } from '@/trpc/inputs/benchmark'

/* eslint-disable camelcase */
export const benchmarkModeMap: Record<BenchmarkMode, string> = {
  standard: '标准测试（快速测试）',
  throughput: '吞吐量测试',
  latency: '延迟测试',
  high_concurrency: '高并发测试',
  long_context: '长上下文测试',
}
