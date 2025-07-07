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

import { readFileSync, writeFileSync } from 'node:fs'

import superjson from 'superjson'

import { isPersistInstallState, isPersistModelState, isPersistState, isWriteState } from '@/lib/env/store'
import { ModelStoreState } from '@/stores/model-store'

import { GlobalState } from './global-store'
import { InstallStoreState } from './install-store'

function saveDataToFile<T>(file: string, data: T) {
  if (!isWriteState) return
  const text = superjson.stringify(data)
  writeFileSync(file, text, 'utf-8')
}

function loadDataFromFile<T>(file: string, enabled = isPersistState) {
  if (!enabled) return undefined
  try {
    const stringData = readFileSync(file, 'utf-8')
    return superjson.parse<T>(stringData)
  } catch {
    return undefined
  }
}

let globalState: GlobalState | undefined = undefined
const globalStatePersistFile = '.global-store.json'

export function setGlobalData(data: GlobalState) {
  globalState = data
  saveDataToFile(globalStatePersistFile, data)
}

export function loadGlobalData() {
  return globalState ?? loadDataFromFile<GlobalState>(globalStatePersistFile)
}

let installState: InstallStoreState | undefined = undefined
const installStatePersistFile = '.install-store.json'

export function setInstallData(data: InstallStoreState) {
  installState = data
  saveDataToFile(installStatePersistFile, data)
}

export function loadInstallData() {
  return installState ?? loadDataFromFile<InstallStoreState>(installStatePersistFile, isPersistInstallState)
}

let modelState: ModelStoreState | undefined = undefined
const modelStatePersistFile = '.model-store.json'

export function setModelData(data: ModelStoreState) {
  modelState = data
  saveDataToFile(modelStatePersistFile, data)
}

export function loadModelData() {
  return modelState ?? loadDataFromFile<ModelStoreState>(modelStatePersistFile, isPersistModelState)
}
