export interface BenchmarkSummary {
  'Time taken for tests (s)': number
  'Number of concurrency': number
  'Total requests': number
  'Succeed requests': number
  'Failed requests': number
  'Output token throughput (tok/s)': number
  'Total token throughput (tok/s)': number
  'Request throughput (req/s)': number
  'Average latency (s)': number
  'Average time to first token (s)': number
  'Average time per output token (s)': number
  'Average input tokens per request': number
  'Average output tokens per request': number
  'Average package latency (s)': number
  'Average package per request': number
  'Expected number of requests': number
}

export interface BenchmarkPercentile {
  Percentile: string
  'TTFT (s)': number
  'ITL (s)': number
  'Latency (s)': number
  'Input tokens': number
  'Output tokens': number
  'Throughput(tokens/s)': number
}

export interface BenchmarkResult {
  summary: BenchmarkSummary
  percentile: BenchmarkPercentile[]
}
