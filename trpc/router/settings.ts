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

import { readSettings, settingsSchema, updateSettingsEntry, writeSettings } from '@/lib/settings'
import { z } from '@/lib/zod'
import { baseProcedure, createRouter } from '@/trpc/init'

export const settingsRouter = createRouter({
  getSettings: baseProcedure.query(async () => readSettings()),
  setSettings: baseProcedure.input(settingsSchema).mutation(async ({ input }) => {
    await writeSettings(input)
  }),
  setSettingsEntry: baseProcedure
    .input(
      z.object({
        key: settingsSchema.keyof(),
        value: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      return await updateSettingsEntry(input.key, input.value)
    }),
})
