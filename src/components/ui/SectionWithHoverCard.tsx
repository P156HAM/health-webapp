import React from 'react'
import { HoverCard, HoverCardTrigger } from './hover-card'
import { ClockIcon } from '@radix-ui/react-icons'

interface SectionWithHoverCardProps {
  data: any
  title: string
  type?: string
}
function SectionWithHoverCard({ data, title, type }: SectionWithHoverCardProps) {
  return (
    <div className="">
      {data !== 'No Data' && (
        <div className="w-full px-4 py-4 border hover:border-zinc-200 hover:shadow-sm rounded-md text-black group">
          <HoverCard>
            <HoverCardTrigger>
              <div>
                <div className="flex flex-row">
                  {type && type === 'SRS' && <ClockIcon className="w-4 h-4 mr-2 group-hover:text-blue-600" />}
                  <p className="text-sm font-normal mb-8 leading-tight group-hover:text-blue-600">{title}</p>
                </div>
                {type === 'SRS' ? (
                  <p className="text-sm text-black hover:text-black font-normal">{data}</p>
                ) : (
                  <p className="text-xl font-normal">{data}</p>
                )}
              </div>
            </HoverCardTrigger>
          </HoverCard>
        </div>
      )
      }
      {
        data === 'No Data' && (
          <div className="w-full px-4 py-4 border border-zinc-200 bg-zinc-200 hover:shadow-sm rounded-md text-black/65 hover:text-black/75">
            <HoverCard>
              <HoverCardTrigger>
                <div className="">
                  <div className="flex flex-row justify-between">
                    <p className="text-sm font-normal mb-8">{title}</p>
                    <div className="h-2 w-2 rounded-full"></div>
                  </div>
                  <p className="text-lg font-normal">{data}</p>
                </div>
              </HoverCardTrigger>
            </HoverCard>
          </div>
        )
      }
    </div >
  )
}

export default SectionWithHoverCard
