import {
  ComponentProps,
  Fragment,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useDebouncedCallback, useOs } from '@mantine/hooks'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CommandLoading } from 'cmdk'
import { ArrowUpIcon, ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon, XCircleIcon, XIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { commandScore } from '@/lib/command-score'
import { createSafeContext } from '@/lib/create-safe-context'
import { readableSize } from '@/lib/file'
import { type FileItem } from '@/lib/server-file'
import { cn } from '@/lib/utils'
import { DebouncedSpinner } from '@/components/base/debounced-spinner'
import { EasyTooltip } from '@/components/base/easy-tooltip'
import { useEnvContext } from '@/components/env-provider'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTRPCClient } from '@/trpc/client'

import { getDirectoryName, getFileDirectory, getPathParts, joinPathParts, normalizeDirPath } from './file-utils'

interface FileSelectorProps {
  path?: string
  onSelected?: (path: string) => void
  // Filter function for file items
  filter?: (item: FileItem) => boolean
  // Whether to filter the directory, default is false
  filterDirectory?: boolean
  children?: ReactNode
  defaultDirectory?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showSize?: boolean
}

const FileSelectorContext = createSafeContext<{
  // File path selected by the user
  filePath: string | undefined
  setFilePath: (path: string) => void
  filter?: (item: FileItem) => boolean
  filterDirectory: boolean
  showSize: boolean
}>()

const CurrentDirectoryContext = createSafeContext<{
  // Current directory path
  currentDirectory: string
  setCurrentDirectory: (path: string) => void
  // Current selection path
  peekPath: string
  setPeekPath: (path: string) => void
}>()

const DialogContext = createSafeContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>()

export function FileSelector({
  path,
  onSelected,
  filter,
  filterDirectory = false,
  children,
  defaultDirectory,
  open: controlledOpen,
  onOpenChange,
  showSize = true,
}: FileSelectorProps) {
  const { home } = useEnvContext()

  const [currentDirectory, setCurrentDirectory] = useState(defaultDirectory || getFileDirectory(path) || home)
  const [peekPath, setPeekPath] = useState('')

  const [_open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    onChange: onOpenChange,
  })
  const open = !!_open

  const [filePath, setFilePath] = useControllableState<string>({
    prop: path,
    onChange: onSelected,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <FileSelectorContext.Provider value={{ filePath, setFilePath, filter, filterDirectory, showSize }}>
        {children}
        <DialogContent
          className="p-0 **:focus-visible:outline-0 [&>button]:hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>选择文件</DialogTitle>
            <DialogDescription>文件选择器</DialogDescription>
          </DialogHeader>
          <CurrentDirectoryContext.Provider value={{ currentDirectory, setCurrentDirectory, peekPath, setPeekPath }}>
            <DialogContext.Provider value={{ open, setOpen }}>
              <FileSelectorList />
            </DialogContext.Provider>
          </CurrentDirectoryContext.Provider>
        </DialogContent>
      </FileSelectorContext.Provider>
    </Dialog>
  )
}

const FileSelectorListContext = createSafeContext<{
  setInputPath: (path: string, opts?: { isDirectory?: boolean }) => void
  ensureQueryFiles: (directory: string) => Promise<FileItem[]>
  navigateToFirstItem: (items: FileItem[]) => void
}>()

function FileSelectorList() {
  const platform = useOs()

  const { filePath, setFilePath, filter, filterDirectory, showSize } = FileSelectorContext.useContext()
  const { setCurrentDirectory, currentDirectory, peekPath, setPeekPath } = CurrentDirectoryContext.useContext()
  const { open, setOpen } = DialogContext.useContext()

  const queryClient = useQueryClient()
  const trpc = useTRPCClient()

  const filesQueryOptions = useCallback(
    (opts: { directory: string; enabled?: boolean }) =>
      queryOptions({
        queryKey: ['directory', opts.directory],
        queryFn: async ({ signal }) => trpc.file.readDirectory.query(opts.directory, { signal }),
        placeholderData: keepPreviousData,
        enabled: opts.enabled,
      }),
    [trpc],
  )

  const {
    data: items = [],
    isPending,
    isFetching,
  } = useQuery(
    filesQueryOptions({
      directory: currentDirectory,
      enabled: open,
    }),
  )

  const listRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 32,
    paddingStart: 4,
    paddingEnd: 4,
    scrollPaddingStart: 4,
    scrollPaddingEnd: 4,
    overscan: 5,
    initialOffset: () => {
      const peekIndex = items.findIndex((item) => item.path === peekPath)
      if (peekIndex === -1) return 0
      return peekIndex * 32 + 4
    },
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const clearRef = useRef<ClearRef>(null)
  const setInputPath = useCallback((path: string, opts: { isDirectory?: boolean } = {}) => {
    const { isDirectory = true } = opts
    if (inputRef.current) {
      inputRef.current.value = isDirectory ? normalizeDirPath(path) : path
      clearRef.current?.resetClearState(!!inputRef.current.value)
    }
  }, [])

  const ensureQueryFiles = useCallback(
    (directory: string) => queryClient.ensureQueryData(filesQueryOptions({ directory })),
    [filesQueryOptions, queryClient],
  )

  // 当导航至上级目录或进入指定目录时，导航到第一个项目。
  // When navigating to the parent directory or entering a specified directory, navigate to the first item.
  const navigateToFirstItem = useCallback(
    (items: FileItem[]) => {
      if (items.length > 0) {
        virtualizer.scrollToOffset(0)
        setPeekPath(items[0].path)
      }
    },
    [setPeekPath, virtualizer],
  )

  // 导航到上级目录。
  // Navigate to parent directory.
  const navigateToParent = useCallback(
    async ({ closeWhenRoot = false } = {}) => {
      const parentPath = await trpc.file.getParentDirectoryPath.query(currentDirectory)
      if (closeWhenRoot && currentDirectory === parentPath) setOpen(false)

      setCurrentDirectory(parentPath)
      setInputPath(parentPath)
      const items = await ensureQueryFiles(parentPath)
      navigateToFirstItem(items)
    },
    [trpc, currentDirectory, ensureQueryFiles, navigateToFirstItem, setCurrentDirectory, setInputPath, setOpen],
  )

  // 使用命令评分算法获取最相关的项目。
  // Get the most relevant item using the command scoring algorithm.
  const getBestMatch = useCallback((query: string, items: FileItem[]) => {
    const itemsWithScore = items.map((item, index) => ({
      ...item,
      score: commandScore(item.path, query),
      index,
    }))
    return itemsWithScore.reduce((best, item) => {
      if (item.score > best.score) {
        return item
      }
      return best
    }, itemsWithScore[0])
  }, [])

  // 导航至最相关的项目
  // Navigate to the most relevant item
  const navigateToMatchItem = useCallback(
    (path: string, items: FileItem[]) => {
      const result = getBestMatch(path, items)
      virtualizer.scrollToIndex(result.index, { align: 'start' })
      setPeekPath(result.path)
    },
    [getBestMatch, setPeekPath, virtualizer],
  )

  // 根据输入路径是否为目录，导航到相关项目。当输入路径为目录时，导航到目录。当输入路径为文件/部分文件名时，导航到文件所在目录并选中最相关的文件。
  // Navigate to the relevant item based on whether the input path is a directory.
  // When the input path is a directory, navigate to the directory.
  // When the input path is a file/partial filename, navigate to the directory where the file is located and select the most relevant file.
  const navigateToItem = useCallback(
    (opts: { path: string; items: FileItem[]; isDirectory: boolean }) => {
      const { path, items, isDirectory } = opts
      if (isDirectory) {
        navigateToFirstItem(items)
      } else {
        navigateToMatchItem(path, items)
      }
    },
    [navigateToFirstItem, navigateToMatchItem],
  )

  // 在文本框输入时，导航至相关项目。
  // When entering a path in the text box, navigate to the relevant directory.
  const checkAndNavigateToDirectory = useCallback(
    async (path: string) => {
      if (!path) return
      const { directory, dirExists, isDirectory } = await trpc.file.checkPath.query(path)
      if (directory === currentDirectory) {
        navigateToItem({ path, items, isDirectory })
        return
      }
      if (dirExists) {
        setCurrentDirectory(directory)
        const items = await ensureQueryFiles(directory)
        setTimeout(() => navigateToItem({ path, items, isDirectory }))
      }
    },
    [trpc, currentDirectory, ensureQueryFiles, items, navigateToItem, setCurrentDirectory],
  )

  const handleInput = useDebouncedCallback(checkAndNavigateToDirectory, 100)

  const isItemValid = useCallback(
    (item: FileItem) => {
      return (item.type === 'file' || filterDirectory) && filter ? filter(item) : true
    },
    [filter, filterDirectory],
  )

  const handleSelect = useCallback(
    async (item: FileItem) => {
      if (item.type === 'directory') {
        setCurrentDirectory(item.path)
        setInputPath(item.path)
        const items = await ensureQueryFiles(item.path)
        navigateToFirstItem(items)
        return
      }
      if (isItemValid(item)) {
        setFilePath(item.path)
        setOpen(false)
      }
    },
    [ensureQueryFiles, isItemValid, navigateToFirstItem, setCurrentDirectory, setFilePath, setInputPath, setOpen],
  )

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const navigate = async () => {
        e.preventDefault()
        const selectedItem = items.find((item) => item.path === peekPath)
        if (selectedItem) await handleSelect(selectedItem)
      }

      match(e.key)
        .with('Enter', 'Tab', async () => {
          await navigate()
        })
        .with('Escape', async () => {
          const metaKey = platform === 'ios' || platform === 'macos' ? e.metaKey : e.ctrlKey
          if (metaKey) {
            setOpen(false)
            return
          }
          await navigateToParent({ closeWhenRoot: true })
        })
        .with('ArrowRight', async () => {
          if (!inputRef.current) return
          const inputElement = inputRef.current
          if (inputElement.selectionEnd != null && inputElement.selectionEnd !== inputElement.value.length) {
            return
          }
          await navigate()
        })
        .with('ArrowLeft', async () => {
          if (!inputRef.current) return
          const inputElement = inputRef.current
          if (inputElement.selectionStart != null && inputElement.selectionStart !== 0) {
            return
          }
          await navigateToParent()
        })
    },
    [handleSelect, items, navigateToParent, peekPath, platform, setOpen],
  )

  return (
    <Command
      shouldFilter={false}
      value={peekPath}
      onValueChange={(path) => setPeekPath(path)}
      onKeyDown={handleKeyDown}
    >
      <FileSelectorListContext.Provider value={{ setInputPath, ensureQueryFiles, navigateToFirstItem }}>
        <div className="flex flex-col items-stretch">
          <div className="flex w-full items-center gap-2 p-1">
            <TooltipButton
              onClick={() => navigateToParent()}
              tooltip={{
                content: (
                  <div className="flex items-center gap-1">
                    <span>返回上级</span>
                    <kbd className="text-secondary-foreground/70">Esc</kbd>
                  </div>
                ),
              }}
            >
              <ArrowUpIcon />
            </TooltipButton>
            <h3 className="flex flex-1 items-center gap-1.5 text-sm font-medium [&_svg]:size-4">
              <FolderOpenIcon className="text-info" />
              {currentDirectory === '/' ? '根目录' : getDirectoryName(currentDirectory)}
              <DebouncedSpinner show={isFetching} />
            </h3>
            <DialogClose asChild>
              <TooltipButton
                tooltip={{
                  content: (
                    <div className="flex items-center gap-1.5">
                      <span>关闭</span>
                      <kbd className="text-secondary-foreground/70">
                        {platform === 'ios' || platform === 'macos' ? '⌘Esc' : 'Ctrl+Esc'}
                      </kbd>
                    </div>
                  ),
                }}
              >
                <XIcon />
              </TooltipButton>
            </DialogClose>
          </div>
          <div className="border-b p-1 pt-0">
            <ClearableInput
              autoFocus
              ref={inputRef}
              clearRef={clearRef}
              defaultValue={normalizeDirPath(currentDirectory)}
              className=""
              placeholder="输入路径..."
              onChange={(e) => handleInput(e.target.value)}
              onClear={() => setInputPath('', { isDirectory: false })}
              onBlur={(e) => e.target.focus()}
            />
          </div>
        </div>
        <CommandList ref={listRef} className="h-[600px] max-h-none w-full overflow-auto">
          {isPending && <CommandLoading className="py-6 text-center text-sm">加载中...</CommandLoading>}
          {!isPending && <CommandEmpty>该路径下没有文件或目录</CommandEmpty>}
          <CommandGroup className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index]
              return (
                <CommandItem
                  key={item.path}
                  value={item.path}
                  data-checked={item.path === filePath ? '' : undefined}
                  data-invalid={!isItemValid(item) ? '' : undefined}
                  className={cn(
                    'absolute inset-x-1 top-0',
                    `data-checked:bg-primary data-checked:text-primary-foreground data-checked:[&_svg]:stroke-primary-foreground data-checked:data-[selected=true]:bg-primary/90 data-checked:data-[selected=true]:text-primary-foreground`,
                    'data-invalid:opacity-50',
                  )}
                  onSelect={() => handleSelect(item)}
                  style={{ height: virtualItem.size, transform: `translateY(${virtualItem.start}px)` }}
                >
                  {item.type === 'directory' ? (
                    <FolderIcon className="stroke-info" />
                  ) : (
                    <FileIcon className="stroke-muted-foreground" />
                  )}
                  <span className="truncate">{item.name}</span>
                  {showSize && item.size !== undefined && (
                    <span className="ml-auto shrink-0 text-xs opacity-50">{readableSize(item.size)}</span>
                  )}
                  {item.type === 'directory' && <ChevronRightIcon className="ml-auto shrink-0" />}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
        <PathBar />
      </FileSelectorListContext.Provider>
    </Command>
  )
}

export function FileSelectorTrigger({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" {...props}>
        {children}
      </Button>
    </DialogTrigger>
  )
}

export function FileSelectorValue({
  className,
  placeholder,
  ...props
}: ComponentProps<'div'> & {
  placeholder?: string
}) {
  const { filePath } = FileSelectorContext.useContext()
  return (
    <div className={cn('text-sm', !filePath && 'text-muted-foreground', className)} {...props}>
      {filePath || placeholder}
    </div>
  )
}

function PathBar({ className, ...props }: ComponentProps<'div'>) {
  const { currentDirectory, setCurrentDirectory } = CurrentDirectoryContext.useContext()
  const { setInputPath, ensureQueryFiles, navigateToFirstItem } = FileSelectorListContext.useContext()
  const parts = getPathParts(currentDirectory)

  return (
    <div
      className={cn(
        'text-foreground/70 scrollbar-none flex items-center gap-0.5 overflow-auto border-t p-1.5 text-xs',
        className,
      )}
      {...props}
    >
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          <button
            tabIndex={-1}
            className="hover:text-accent-foreground hover:bg-accent -m-1 shrink-0 rounded-sm p-1"
            onClick={async () => {
              const target = joinPathParts(parts, index + 1)
              setCurrentDirectory(target)
              setInputPath(target)
              const items = await ensureQueryFiles(target)
              navigateToFirstItem(items)
            }}
          >
            {part}
          </button>
          <div className="last:hidden">
            <ChevronRightIcon className="size-3" />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function TooltipButton({
  className,
  tooltip,
  ...props
}: ComponentProps<typeof Button> & {
  tooltip?: ComponentProps<typeof EasyTooltip>
}) {
  return (
    <EasyTooltip {...tooltip} asChild>
      <Button
        tabIndex={-1}
        variant="ghost"
        size="icon"
        className={cn('size-7 p-0 [&_svg]:size-3.5', className)}
        {...props}
      />
    </EasyTooltip>
  )
}

type ClearRef = {
  resetClearState: (hasValue: boolean) => void
}

function ClearableInput({
  className,
  defaultValue,
  onChange,
  onClear,
  clearRef,
  ...props
}: ComponentProps<typeof Input> & {
  onClear: () => void
  clearRef?: RefObject<ClearRef | null>
}) {
  const [hasValue, setHasValue] = useState(!!defaultValue)

  useImperativeHandle(clearRef, () => ({
    resetClearState: (v) => setHasValue(v),
  }))

  return (
    <div className={cn('relative', className)}>
      <Input
        defaultValue={defaultValue}
        onChange={(e) => {
          setHasValue(!!e.target.value)
          onChange?.(e)
        }}
        className="border-border/50 bg-muted/50 hover:bg-accent hover:border-accent-foreground/25 h-8 rounded-sm pr-7 transition-colors focus-visible:bg-transparent focus-visible:ring-0"
        {...props}
      />
      {hasValue && (
        <TooltipButton
          className="absolute top-1/2 right-0.5 size-6 -translate-y-1/2"
          tooltip={{ content: '清空输入' }}
          onClick={() => onClear()}
        >
          <XCircleIcon />
        </TooltipButton>
      )}
    </div>
  )
}

export type { FileItem }
