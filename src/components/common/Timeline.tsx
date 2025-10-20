type TimelineEvent = {
  date: string
  time: string
  author: string
  title: string
  details?: string[]
}

interface Props {
  events: TimelineEvent[]
}

export function Timeline({ events }: Props) {
  return (
    <div className="relative space-y-5 pl-4">
      {events.map((event, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-gray-400" />

          {index !== events.length - 1 && (
            <div className="absolute -left-3 h-[calc(100%+1.5rem)] w-px bg-gray-300 top-3" />
          )}

          <div className="pl-3">
            <div className="text-xs text-gray">
              {event.date} às {event.time} por {event.author}
            </div>
            <h3 className="mt-1.5 text-sm font-medium text-gray-800">
              {event.title}
            </h3>
            {event.details && event.details.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                {event.details.map((detail, detailIndex) => (
                  <li key={detailIndex}>• {detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
