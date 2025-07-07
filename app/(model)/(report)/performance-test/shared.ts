/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { BenchmarkMode } from '@/trpc/inputs/benchmark'

/* eslint-disable camelcase */
export const benchmarkModeMap: Record<BenchmarkMode, string> = {
  standard: '标准测试（快速测试）',
  throughput: '吞吐量测试',
  latency: '延迟测试',
  high_concurrency: '高并发测试',
  long_context: '长上下文测试',
}
