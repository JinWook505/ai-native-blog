import Image from 'next/image'
import { author } from 'app/lib/author'

export function AuthorProfile() {
  return (
    <div className="flex items-center gap-4 mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <Image
        src={author.avatar}
        alt={author.name}
        width={64}
        height={64}
        className="rounded-full"
      />
      <div>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {author.name}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {author.bio}
        </p>
      </div>
    </div>
  )
}
