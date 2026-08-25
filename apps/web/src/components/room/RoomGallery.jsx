import Placeholder from '../Placeholder'

const defaultGallery = ['room', 'pool', 'room', 'room']

export default function RoomGallery({ room, gallery = defaultGallery }) {
  return (
    <>
      <Placeholder kind={room.kind} className="h-64 w-full rounded-3xl sm:h-96" iconClassName="size-16" />
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-4">
        {gallery.map((k, i) => (
          <div key={i} className="relative">
            <Placeholder kind={k} className="h-20 w-full rounded-xl sm:h-24" iconClassName="size-6" />
            {i === gallery.length - 1 && (
              <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/50 text-sm font-bold text-white">+5</span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
