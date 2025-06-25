export function AppStepper({ items, current }: { items: { title: string; id: string }[]; current?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3 p-6">
      {items.map((item, index) => {
        const currentIndex = items.findIndex((i) => i.id === current)
        return (
          <AppStepperItem
            key={item.id}
            title={item.title}
            status={currentIndex === index ? 'current' : currentIndex > index ? 'done' : 'todo'}
          />
        )
      })}
    </div>
  )
}

export function AppStepperItem({ title, status }: { title: string; status: 'done' | 'current' | 'todo' }) {
  return (
    <div data-status={status} className="flex items-center gap-2">
      <div className="flex size-3 items-center justify-center">
        <div
          data-status={status}
          className="size-2 rounded-full bg-muted-foreground/50 data-[status=current]:size-3 data-[status=current]:bg-primary data-[status=done]:bg-primary"
        />
      </div>
      <div
        data-status={status}
        className="text-sm text-muted-foreground data-[status=current]:font-semibold data-[status=current]:text-primary data-[status=done]:text-primary"
      >
        {title}
      </div>
    </div>
  )
}
